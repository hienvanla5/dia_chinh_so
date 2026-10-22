import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  UserRole,
  PasswordPolicyConfig,
  BlockedIpItem,
  UpdatePasswordPolicyRequest,
  ValidatePasswordRequest,
  ValidatePasswordResponse,
  UnblockIpRequest,
  UnblockIpResponse,
} from '@diachinhso/shared';

@Injectable()
export class PasswordPolicyService {
  private readonly logger = new Logger(PasswordPolicyService.name);

  // Cấu hình chính sách mật khẩu hệ thống hiện hành
  private policy: PasswordPolicyConfig = {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventPasswordReuseCount: 5,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 30,
    trustedIpRanges: ['10.0.0.0/8', '192.168.1.0/24', '172.16.0.0/12'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedBy: 'ADMIN-SYS-001',
    auditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  };

  // Danh sách các địa chỉ IP bị khóa tự động do brute-force
  private blockedIps: BlockedIpItem[] = [
    {
      id: 'BLK-IP-001',
      ipAddress: '203.0.113.45',
      failedAttempts: 6,
      targetedUsername: 'nguyen.van.a.dc',
      blockedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      reason: 'Đăng nhập sai quá 5 lần liên tiếp trong 3 phút (Tấn công Brute-force)',
      isPermanent: false,
      auditHash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
    },
    {
      id: 'BLK-IP-002',
      ipAddress: '198.51.100.88',
      failedAttempts: 12,
      targetedUsername: 'admin.hanoi@diachinh.gov.vn',
      blockedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 1400).toISOString(),
      reason: 'Dò quét tài khoản Quản trị viên từ địa chỉ IP nước ngoài',
      isPermanent: true,
      auditHash: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b8c7d6e5f4a3b2c1d0e9f8a7b',
    },
  ];

  // Theo dõi số lần đăng nhập sai theo IP trong bộ nhớ tạm
  private failedAttemptsMap = new Map<string, { count: number; lastAttempt: number; targetedUser: string }>();

  // Nhật ký kiểm toán thay đổi cấu hình bảo mật
  private auditLogs: Array<{
    id: string;
    action: string;
    performedBy: string;
    details: string;
    auditHash: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.auditLogs.push({
      id: 'AUD-POL-001',
      action: 'UPDATE_PASSWORD_POLICY',
      performedBy: 'ADMIN-SYS-001',
      details: 'Khởi tạo cấu hình chính sách bảo mật mật khẩu cấp độ công vụ tiêu chuẩn OWASP ASVS',
      auditHash: this.policy.auditHash,
      timestamp: this.policy.updatedAt,
    });
  }

  /**
   * Lấy cấu hình chính sách mật khẩu hiện hành
   */
  async getPolicy(): Promise<PasswordPolicyConfig> {
    return { ...this.policy };
  }

  /**
   * Cập nhật chính sách mật khẩu và chống brute-force
   */
  async updatePolicy(
    req: UpdatePasswordPolicyRequest,
    adminUser: { id: string; username: string; role: UserRole }
  ): Promise<PasswordPolicyConfig> {
    // 1. Kiểm tra thẩm quyền Quản trị viên (AC-03, QTD-22)
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Quản trị viên Hệ thống mới có thẩm quyền điều chỉnh chính sách mật khẩu công vụ');
    }

    // 2. Validation dữ liệu đầu vào (AC-02)
    if (req.minLength < 8 || req.minLength > 32) {
      throw new BadRequestException('Độ dài tối thiểu của mật khẩu phải từ 8 đến 32 ký tự');
    }
    if (req.passwordExpiryDays < 15 || req.passwordExpiryDays > 365) {
      throw new BadRequestException('Thời hạn đổi mật khẩu phải từ 15 đến 365 ngày');
    }
    if (req.maxFailedAttempts < 3 || req.maxFailedAttempts > 10) {
      throw new BadRequestException('Số lần đăng nhập sai tối đa cho phép phải từ 3 đến 10 lần');
    }
    if (req.lockoutDurationMinutes < 5 || req.lockoutDurationMinutes > 1440) {
      throw new BadRequestException('Thời gian khóa tài khoản & chặn IP phải từ 5 đến 1440 phút');
    }

    // 3. Tính toán mã băm kiểm toán SHA-256 bất biến (AC-04)
    const updatedAt = new Date().toISOString();
    const payload = `${req.minLength}|${req.requireUppercase}|${req.requireLowercase}|${req.requireNumbers}|${req.requireSpecialChars}|${req.passwordExpiryDays}|${req.maxFailedAttempts}|${req.lockoutDurationMinutes}|${adminUser.id}|${updatedAt}`;
    const auditHash = crypto.createHash('sha256').update(payload).digest('hex');

    // 4. Lưu chính sách mới
    this.policy = {
      ...req,
      trustedIpRanges: req.trustedIpRanges || this.policy.trustedIpRanges,
      updatedAt,
      updatedBy: adminUser.username || adminUser.id,
      auditHash,
    };

    // 5. Ghi nhật ký kiểm toán
    this.auditLogs.unshift({
      id: `AUD-POL-${Date.now()}`,
      action: 'UPDATE_PASSWORD_POLICY',
      performedBy: adminUser.username || adminUser.id,
      details: `Cập nhật chính sách mật khẩu: minLength=${req.minLength}, maxFailedAttempts=${req.maxFailedAttempts}, lockoutMinutes=${req.lockoutDurationMinutes}`,
      auditHash,
      timestamp: updatedAt,
    });

    this.logger.log(`Chính sách mật khẩu công vụ đã được cập nhật bởi ${adminUser.username}. Audit Hash: ${auditHash}`);

    return { ...this.policy };
  }

  /**
   * Đánh giá và kiểm tra tính hợp lệ của mật khẩu theo chính sách hiện hành
   */
  async validatePassword(req: ValidatePasswordRequest): Promise<ValidatePasswordResponse> {
    const { password, username } = req;
    const errors: string[] = [];
    let score = 0;

    if (!password) {
      return {
        valid: false,
        score: 0,
        strength: 'VERY_WEAK',
        errors: ['Mật khẩu không được để trống'],
      };
    }

    // 1. Kiểm tra độ dài
    if (password.length >= this.policy.minLength) {
      score += 25;
      if (password.length >= 14) score += 10;
    } else {
      errors.push(`Mật khẩu phải có độ dài tối thiểu ${this.policy.minLength} ký tự (hiện có ${password.length})`);
    }

    // 2. Chữ hoa
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else if (this.policy.requireUppercase) {
      errors.push('Mật khẩu phải chứa ít nhất một ký tự chữ in hoa (A-Z)');
    }

    // 3. Chữ thường
    if (/[a-z]/.test(password)) {
      score += 15;
    } else if (this.policy.requireLowercase) {
      errors.push('Mật khẩu phải chứa ít nhất một ký tự chữ in thường (a-z)');
    }

    // 4. Chữ số
    if (/\d/.test(password)) {
      score += 15;
    } else if (this.policy.requireNumbers) {
      errors.push('Mật khẩu phải chứa ít nhất một chữ số (0-9)');
    }

    // 5. Ký tự đặc biệt
    if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\]/.test(password)) {
      score += 20;
    } else if (this.policy.requireSpecialChars) {
      errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*...)');
    }

    // 6. Không chứa tên đăng nhập
    if (username && username.length >= 3 && password.toLowerCase().includes(username.toLowerCase())) {
      errors.push('Mật khẩu không được chứa tên đăng nhập của cán bộ');
      score = Math.max(0, score - 20);
    }

    // Xác định mức độ mạnh
    let strength: 'VERY_WEAK' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
    if (score >= 90 && errors.length === 0) {
      strength = 'VERY_STRONG';
    } else if (score >= 75 && errors.length === 0) {
      strength = 'STRONG';
    } else if (score >= 50) {
      strength = 'MEDIUM';
    } else if (score >= 30) {
      strength = 'WEAK';
    } else {
      strength = 'VERY_WEAK';
    }

    return {
      valid: errors.length === 0,
      score: Math.min(100, score),
      strength,
      errors,
    };
  }

  /**
   * Ghi nhận lần thử đăng nhập thất bại và tự động khóa IP nếu vượt ngưỡng (Chống brute-force)
   */
  async recordFailedLoginAttempt(
    ipAddress: string,
    username: string
  ): Promise<{ blocked: boolean; attemptsRemaining: number; blockedUntil?: string }> {
    const existing = this.failedAttemptsMap.get(ipAddress) || { count: 0, lastAttempt: Date.now(), targetedUser: username };
    existing.count += 1;
    existing.lastAttempt = Date.now();
    existing.targetedUser = username;
    this.failedAttemptsMap.set(ipAddress, existing);

    if (existing.count >= this.policy.maxFailedAttempts) {
      const blockedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + this.policy.lockoutDurationMinutes * 60 * 1000).toISOString();
      const auditHash = crypto
        .createHash('sha256')
        .update(`${ipAddress}|${username}|${existing.count}|${blockedAt}|${expiresAt}`)
        .digest('hex');

      const blockedItem: BlockedIpItem = {
        id: `BLK-IP-${Date.now()}`,
        ipAddress,
        failedAttempts: existing.count,
        targetedUsername: username,
        blockedAt,
        expiresAt,
        reason: `Đăng nhập sai ${existing.count} lần liên tiếp (Tự động kích hoạt chống tấn công brute-force)`,
        isPermanent: false,
        auditHash,
      };

      this.blockedIps.unshift(blockedItem);
      this.failedAttemptsMap.delete(ipAddress);

      this.logger.warn(`Đã khóa tạm thời địa chỉ IP '${ipAddress}' trong ${this.policy.lockoutDurationMinutes} phút do vượt ngưỡng thử sai.`);

      return {
        blocked: true,
        attemptsRemaining: 0,
        blockedUntil: expiresAt,
      };
    }

    return {
      blocked: false,
      attemptsRemaining: this.policy.maxFailedAttempts - existing.count,
    };
  }

  /**
   * Danh sách địa chỉ IP đang bị khóa
   */
  async getBlockedIps(): Promise<BlockedIpItem[]> {
    const now = new Date().getTime();
    return this.blockedIps.filter(item => item.isPermanent || new Date(item.expiresAt).getTime() > now);
  }

  /**
   * Mở khóa địa chỉ IP thủ công bởi Quản trị viên
   */
  async unblockIp(
    req: UnblockIpRequest,
    adminUser: { id: string; username: string; role: UserRole }
  ): Promise<UnblockIpResponse> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Quản trị viên Hệ thống mới có quyền mở khóa địa chỉ IP');
    }

    const index = this.blockedIps.findIndex(b => b.ipAddress === req.ipAddress);
    if (index === -1) {
      throw new NotFoundException(`Địa chỉ IP '${req.ipAddress}' không nằm trong danh sách đang bị khóa`);
    }

    this.blockedIps.splice(index, 1);
    this.failedAttemptsMap.delete(req.ipAddress);

    const unblockedAt = new Date().toISOString();
    const auditHash = crypto
      .createHash('sha256')
      .update(`${req.ipAddress}|${req.reason}|${adminUser.id}|${unblockedAt}`)
      .digest('hex');

    this.auditLogs.unshift({
      id: `AUD-POL-${Date.now()}`,
      action: 'UNBLOCK_IP',
      performedBy: adminUser.username || adminUser.id,
      details: `Mở khóa địa chỉ IP ${req.ipAddress}. Lý do: ${req.reason}`,
      auditHash,
      timestamp: unblockedAt,
    });

    return {
      success: true,
      ipAddress: req.ipAddress,
      unblockedAt,
      auditHash,
      message: `Đã mở khóa thành công địa chỉ IP '${req.ipAddress}'`,
    };
  }

  /**
   * Danh sách nhật ký kiểm toán bảo mật
   */
  async getAuditLogs() {
    return this.auditLogs;
  }
}
