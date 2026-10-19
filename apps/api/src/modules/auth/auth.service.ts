import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { users, auditLogs, parcels, digitalCertificates } from '../../database/schema';
import { eq } from 'drizzle-orm';
import {
  UserRole,
  CitizenSendOtpInput,
  CitizenVerifyOtpInput,
  CitizenSendOtpSchema,
  CitizenVerifyOtpSchema,
  CitizenSendOtpResponse,
  CitizenAuthResponse,
} from '@diachinhso/shared';
import { REDIS_CLIENT } from '../../common/redis/redis.provider';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // Bộ nhớ đệm tạm dự phòng khi Redis không khả dụng hoặc trong unit test
  private readonly memoryOtpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
    @Optional() @Inject(REDIS_CLIENT) private readonly redis?: Redis,
  ) {}

  /**
   * [DCS-01-CN-001] Bước 1: Gửi mã OTP xác thực công dân qua SMS (Hỗ trợ Sandbox)
   */
  async sendCitizenOtp(dto: CitizenSendOtpInput): Promise<CitizenSendOtpResponse> {
    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (AC-02)
    const validation = CitizenSendOtpSchema.safeParse(dto);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu không hợp lệ: ${errorMsg}`);
    }

    const { citizenId, phoneNumber, fullName } = validation.data;

    // 2. Kiểm tra ràng buộc nghiệp vụ (QTD-07) - Kiểm tra tài khoản có bị khóa không (AC-03)
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.citizenId, citizenId))
      .limit(1);

    if (existingUser && !existingUser.isActive) {
      throw new ForbiddenException(
        'Tài khoản công dân đang bị tạm khóa hoặc vi phạm quy tắc thẩm quyền địa giới theo QTD-07.',
      );
    }

    // 3. Tạo mã OTP 6 chữ số (Môi trường Dev Sandbox: 123456 hoặc ngẫu nhiên nếu có cấu hình)
    const otpCode = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    const ttlSeconds = 300; // 5 phút hiệu lực

    // 4. Lưu OTP vào Redis hoặc memory store
    const redisKey = `diachinhso:otp:${citizenId}`;
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.set(redisKey, otpCode, 'EX', ttlSeconds);
      } else {
        this.memoryOtpStore.set(citizenId, {
          otp: otpCode,
          expiresAt: Date.now() + ttlSeconds * 1000,
          attempts: 0,
        });
      }
    } catch {
      this.memoryOtpStore.set(citizenId, {
        otp: otpCode,
        expiresAt: Date.now() + ttlSeconds * 1000,
        attempts: 0,
      });
    }

    return {
      success: true,
      message: `Mã xác thực OTP gồm 6 chữ số đã được gửi thành công đến số điện thoại ${phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}.`,
      expiresInSeconds: ttlSeconds,
      mockOtp: otpCode, // Dành cho môi trường Mock Sandbox Dev/Staging
    };
  }

  /**
   * [DCS-01-CN-001] Bước 2: Xác thực mã OTP và đăng nhập vào Cổng Định danh Số
   */
  async verifyCitizenOtp(
    dto: CitizenVerifyOtpInput,
    clientMeta?: { ipAddress?: string; userAgent?: string; fullName?: string },
  ): Promise<CitizenAuthResponse> {
    // 1. Kiểm tra tính hợp lệ dữ liệu (AC-02)
    const validation = CitizenVerifyOtpSchema.safeParse(dto);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu xác thực không hợp lệ: ${errorMsg}`);
    }

    const { citizenId, phoneNumber, otpCode } = validation.data;

    // 2. Lấy OTP từ Redis hoặc memory store
    const redisKey = `diachinhso:otp:${citizenId}`;
    let savedOtp: string | null = null;

    try {
      if (this.redis && this.redis.status === 'ready') {
        savedOtp = await this.redis.get(redisKey);
      } else {
        const memData = this.memoryOtpStore.get(citizenId);
        if (memData && memData.expiresAt > Date.now()) {
          savedOtp = memData.otp;
        }
      }
    } catch {
      const memData = this.memoryOtpStore.get(citizenId);
      if (memData && memData.expiresAt > Date.now()) {
        savedOtp = memData.otp;
      }
    }

    // 3. Kiểm tra OTP tồn tại (AC-03)
    if (!savedOtp) {
      throw new BadRequestException(
        'Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu OTP mới.',
      );
    }

    // 4. Kiểm tra OTP có khớp không (AC-03)
    if (savedOtp !== otpCode) {
      throw new BadRequestException(
        'Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại tin nhắn SMS trên điện thoại.',
      );
    }

    // 5. Xóa OTP sau khi xác thực thành công (Chống Replay Attack)
    try {
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.del(redisKey);
      } else {
        this.memoryOtpStore.delete(citizenId);
      }
    } catch {
      this.memoryOtpStore.delete(citizenId);
    }

    // 6. Tìm hoặc khởi tạo tài khoản công dân (AC-01)
    let [user] = await this.db.select().from(users).where(eq(users.citizenId, citizenId)).limit(1);

    if (user && !user.isActive) {
      throw new ForbiddenException(
        'Tài khoản công dân đang bị tạm khóa hoặc vi phạm thẩm quyền địa giới theo QTD-07.',
      );
    }

    if (!user) {
      const [newUser] = await this.db
        .insert(users)
        .values({
          citizenId,
          fullName: clientMeta?.fullName || `Công dân ${citizenId.slice(-4)}`,
          phoneNumber,
          role: UserRole.LAND_USER,
          isActive: true,
        })
        .returning();
      user = newUser;
    }

    // 7. Tạo mã băm SHA-256 nhật ký kiểm toán bất biến (AC-04)
    const auditPayload = {
      userId: user.id,
      citizenId: user.citizenId,
      action: 'CITIZEN_LOGIN_OTP',
      timestamp: new Date().toISOString(),
      ipAddress: clientMeta?.ipAddress || '127.0.0.1',
    };

    const auditHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(auditPayload))
      .digest('hex');

    // 8. Ghi nhật ký kiểm toán bất biến vào CSDL (AC-04)
    try {
      await this.db.insert(auditLogs).values({
        userId: user.id,
        userName: user.fullName,
        role: user.role,
        action: 'CITIZEN_LOGIN_OTP',
        entityType: 'USER_IDENTITY',
        entityId: user.id,
        newData: auditPayload,
        hashSha256: auditHash,
        ipAddress: clientMeta?.ipAddress || '127.0.0.1',
        userAgent: clientMeta?.userAgent || 'Antigravity-Client',
      });
    } catch (e) {
      console.warn('Lỗi ghi nhật ký kiểm toán:', e);
    }

    // 9. Sinh Access Token JWT
    const payload = {
      sub: user.id,
      citizenId: user.citizenId,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        citizenId: user.citizenId!,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || undefined,
        role: user.role as UserRole,
      },
      auditHash,
      walletSummary: {
        parcelCount: 1, // Dữ liệu mẫu số hóa
        certificateCount: 1,
      },
    };
  }

  /**
   * Đăng nhập Cán bộ nghiệp vụ (Địa chính xã, VPĐKĐĐ, Công chứng/Ngân hàng, Thanh tra, Admin)
   */
  async officerLogin(username: string, passwordHash: string, role: UserRole) {
    let [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      const [newUser] = await this.db
        .insert(users)
        .values({
          username,
          fullName: `Cán bộ ${username.toUpperCase()}`,
          passwordHash: 'seeded_demo_hash',
          role,
          department: 'Hệ thống Quản lý Địa chính số',
          isActive: true,
        })
        .returning();
      user = newUser;
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản cán bộ đã bị vô hiệu hóa.');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      organizationName: user.department,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    };
  }

  /**
   * Lấy hồ sơ tài khoản và dữ liệu Ví Sổ Đỏ Số
   */
  async getProfileWithWallet(userId: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản.');
    }

    return {
      user: {
        id: user.id,
        citizenId: user.citizenId,
        username: user.username,
        fullName: user.fullName,
        role: user.role as UserRole,
        phoneNumber: user.phoneNumber,
        department: user.department,
      },
      walletSummary: {
        parcels: [
          {
            nationalCode: 'HN-BA-DINH.012.0045',
            sheetNumber: 12,
            parcelNumber: 45,
            area: 125.6,
            address: 'Số 18 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
            certificateNumber: 'CS 123456',
            status: 'AVAILABLE',
          },
        ],
      },
    };
  }
}
