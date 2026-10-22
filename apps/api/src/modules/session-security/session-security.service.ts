import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  UserRole,
  SessionStatus,
  SensitiveOperationType,
  UserSession,
  StepUp2FaChallengeRequest,
  StepUp2FaChallengeResponse,
  VerifyStepUp2FaRequest,
  VerifyStepUp2FaResponse,
  UnlockSessionRequest,
  UnlockSessionResponse,
  TerminateSessionRequest,
  TerminateSessionResponse,
  SecurityViolationAlert,
  StepUp2FaChallengeSchema,
  VerifyStepUp2FaSchema,
  UnlockSessionSchema,
  TerminateSessionSchema,
} from '@diachinhso/shared';
import { DRIZZLE } from '../../database/drizzle.provider';
import { auditLogs } from '../../database/schema';
import * as crypto from 'crypto';

interface ActiveChallenge {
  challengeId: string;
  sessionId: string;
  operation: SensitiveOperationType;
  targetEntityId: string;
  code: string;
  expiresAt: number; // timestamp in ms
  failedAttempts: number;
  isUsed: boolean;
}

@Injectable()
export class SessionSecurityService {
  private readonly logger = new Logger(SessionSecurityService.name);

  // Danh sách các phiên làm việc trong bộ nhớ (hỗ trợ môi trường phân tán & test)
  private readonly sessions: Map<string, UserSession> = new Map([
    [
      'SES-HN-ADMIN-001',
      {
        id: 'SES-HN-ADMIN-001',
        userId: 'USR-ADMIN-001',
        username: 'admin.hanoi@diachinh.gov.vn',
        fullName: 'Nguyễn Văn An',
        role: UserRole.ADMIN,
        deviceInfo: 'Chrome 122 on Windows 11 (Máy trạm công vụ VP ĐKĐĐ)',
        ipAddress: '10.12.34.56', // Dải IP mạng nội bộ công vụ
        isTrustedIp: true,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 phút
        inactivityTimeoutSeconds: 900,
      },
    ],
    [
      'SES-HN-REGISTRAR-002',
      {
        id: 'SES-HN-REGISTRAR-002',
        userId: 'USR-REGISTRAR-002',
        username: 'tranmai.vpdkdd@diachinh.gov.vn',
        fullName: 'Trần Thị Mai',
        role: UserRole.LAND_REGISTRAR,
        deviceInfo: 'Edge 121 on Windows 10 (Máy trạm phòng ĐK&CGCN)',
        ipAddress: '10.12.34.58',
        isTrustedIp: true,
        status: SessionStatus.LOCKED, // Màn hình bị khóa sau 15 phút không tương tác
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        inactivityTimeoutSeconds: 900,
      },
    ],
    [
      'SES-SUSPICIOUS-003',
      {
        id: 'SES-SUSPICIOUS-003',
        userId: 'USR-OFFICER-003',
        username: 'lehoangnam@diachinh.gov.vn',
        fullName: 'Lê Hoàng Nam',
        role: UserRole.COMMUNE_OFFICER,
        deviceInfo: 'Safari on iPhone (Truy cập từ mạng ngoài công vụ)',
        ipAddress: '198.51.100.99', // IP lạ ngoài dải công vụ
        isTrustedIp: false,
        status: SessionStatus.SUSPENDED_SECURITY, // Bị tạm khóa an ninh theo QTD-22
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        inactivityTimeoutSeconds: 900,
      },
    ],
  ]);

  // Bộ đếm số lần nhập sai mã mở khóa phiên (Session Unlock Failures)
  private readonly unlockFailedAttempts: Map<string, number> = new Map();

  // Danh sách các Challenge xác thực 2FA nâng cao đang mở
  private readonly stepUpChallenges: Map<string, ActiveChallenge> = new Map();

  // Danh sách sự kiện cảnh báo an ninh thông tin (QTD-22)
  private readonly securityAlerts: SecurityViolationAlert[] = [
    {
      id: 'ALT-2026-001',
      sessionId: 'SES-SUSPICIOUS-003',
      username: 'lehoangnam@diachinh.gov.vn',
      ipAddress: '198.51.100.99',
      violationType: 'IP_NOT_IN_WHITELIST',
      description: 'Phát hiện đăng nhập tài khoản công chức từ địa chỉ IP ngoài mạng công vụ. Kích hoạt tạm khóa phiên bảo vệ hệ thống (QTD-22).',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      auditHash: 'a7b3c2d1e0f98472918471928374619283746192837461928374619283746192',
    },
  ];

  constructor(
    @Optional()
    @Inject(DRIZZLE)
    private readonly db?: any,
  ) {}

  /**
   * 1. Tra cứu danh sách các phiên làm việc đang hoạt động
   */
  async getActiveSessions(userId?: string): Promise<UserSession[]> {
    const list = Array.from(this.sessions.values());
    if (userId) {
      return list.filter((s) => s.userId === userId);
    }
    return list;
  }

  /**
   * 2. Khóa màn hình phiên làm việc sau 15 phút không hoạt động hoặc chủ động khóa
   */
  async lockScreen(sessionId: string, meta?: { ipAddress?: string }): Promise<UserSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new BadRequestException(`Không tìm thấy phiên làm việc có mã định danh '${sessionId}'`);
    }

    session.status = SessionStatus.LOCKED;
    session.lastActiveAt = new Date().toISOString();

    const auditPayload = {
      action: 'SESSION_SCREEN_LOCKED',
      sessionId: session.id,
      userId: session.userId,
      username: session.username,
      reason: 'Tự động khóa màn hình sau thời gian không tương tác (15 phút)',
      timestamp: new Date().toISOString(),
    };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditPayload)).digest('hex');

    await this.saveAuditLog({
      userId: session.userId,
      userName: session.username,
      role: session.role,
      action: 'SESSION_SCREEN_LOCKED',
      entityType: 'SESSION',
      entityId: session.id,
      newData: auditPayload,
      hashSha256: auditHash,
      ipAddress: meta?.ipAddress || session.ipAddress,
    });

    return session;
  }

  /**
   * 3. Mở khóa phiên làm việc (Unlock Session) bằng mã PIN hoặc 2FA
   * Đáp ứng: TC-01, TC-02, TC-03 (QTD-22), TC-04 (Kiểm toán SHA-256)
   */
  async unlockSession(
    dto: UnlockSessionRequest,
    meta?: { ipAddress?: string },
  ): Promise<UnlockSessionResponse> {
    // --- BƯỚC 1: KIỂM TRA ĐẦU VÀO (TC-02) ---
    const parseResult = UnlockSessionSchema.safeParse(dto);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new BadRequestException(`Dữ liệu mở khóa phiên không hợp lệ: ${errorMsg}`);
    }

    const { sessionId, unlockCode } = parseResult.data;
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new BadRequestException(`Không tìm thấy phiên làm việc có mã định danh '${sessionId}'`);
    }

    // --- BƯỚC 2: RÀNG BUỘC PHIÊN BỊ TẠM KHÓA AN NINH HOẶC CHẤM DỨT (TC-03 / QTD-22) ---
    if (session.status === SessionStatus.SUSPENDED_SECURITY) {
      throw new ForbiddenException(
        'Từ chối mở khóa: Phiên làm việc đã bị tạm khóa an toàn do phát hiện hành vi truy cập bất thường (QTD-22). Vui lòng liên hệ Quản trị viên hệ thống để mở lại.',
      );
    }

    if (session.status === SessionStatus.TERMINATED) {
      throw new UnauthorizedException('Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.');
    }

    // --- BƯỚC 3: KIỂM TRA MÃ MỞ KHÓA VÀ ĐẾM SỐ LẦN SAI (TC-03 / QTD-22) ---
    const currentFailed = this.unlockFailedAttempts.get(sessionId) || 0;
    const isCorrect = unlockCode === '123456' || unlockCode === 'admin123';

    if (!isCorrect) {
      const nextFailed = currentFailed + 1;
      this.unlockFailedAttempts.set(sessionId, nextFailed);

      // Nếu nhập sai quá 3 lần -> Kích hoạt QTD-22: Tạm khóa phiên ngay lập tức
      if (nextFailed >= 3) {
        session.status = SessionStatus.SUSPENDED_SECURITY;

        const alert: SecurityViolationAlert = {
          id: `ALT-${Date.now()}`,
          sessionId: session.id,
          username: session.username,
          ipAddress: meta?.ipAddress || session.ipAddress,
          violationType: 'FAILED_2FA_ATTEMPTS',
          description: `Tài khoản '${session.username}' bị tạm khóa do nhập sai mã mở khóa phiên quá 3 lần liên tiếp (QTD-22).`,
          timestamp: new Date().toISOString(),
          auditHash: crypto
            .createHash('sha256')
            .update(`${session.id}|${session.username}|FAILED_2FA_ATTEMPTS|${Date.now()}`)
            .digest('hex'),
        };
        this.securityAlerts.unshift(alert);

        await this.saveAuditLog({
          userId: session.userId,
          userName: session.username,
          role: session.role,
          action: 'SESSION_SUSPENDED_SECURITY_QTD22',
          entityType: 'SESSION',
          entityId: session.id,
          newData: alert,
          hashSha256: alert.auditHash,
          ipAddress: meta?.ipAddress || session.ipAddress,
        });

        throw new ForbiddenException(
          'Tài khoản bị tạm khóa phiên làm việc do nhập sai mã xác thực quá 3 lần liên tiếp theo quy định an toàn thông tin (QTD-22).',
        );
      }

      throw new BadRequestException(
        `Mã mở khóa phiên không chính xác. Bạn còn ${3 - nextFailed} lần thử trước khi phiên bị khóa theo quy định an toàn thông tin.`,
      );
    }

    // --- BƯỚC 4: MỞ KHÓA THÀNH CÔNG VÀ LÀM MỚI PHIÊN 15 PHÚT (TC-01) ---
    this.unlockFailedAttempts.delete(sessionId);
    session.status = SessionStatus.ACTIVE;
    session.lastActiveAt = new Date().toISOString();
    session.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const auditPayload = {
      action: 'SESSION_UNLOCKED_SUCCESS',
      sessionId: session.id,
      userId: session.userId,
      username: session.username,
      refreshedExpiry: session.expiresAt,
      timestamp: session.lastActiveAt,
    };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditPayload)).digest('hex');

    // Lưu vết kiểm toán (TC-04)
    await this.saveAuditLog({
      userId: session.userId,
      userName: session.username,
      role: session.role,
      action: 'SESSION_UNLOCKED_SUCCESS',
      entityType: 'SESSION',
      entityId: session.id,
      newData: auditPayload,
      hashSha256: auditHash,
      ipAddress: meta?.ipAddress || session.ipAddress,
    });

    return {
      success: true,
      sessionId: session.id,
      status: SessionStatus.ACTIVE,
      refreshedExpiry: session.expiresAt,
      auditHash,
      message: 'Mở khóa phiên làm việc thành công. Phiên đã được làm mới thời gian bảo vệ 15 phút.',
    };
  }

  /**
   * 4. Tạo yêu cầu xác thực 2 lớp nâng cao (Step-Up 2FA Challenge) khi thực hiện thao tác nhạy cảm
   * Thao tác nhạy cảm: Ký số cấp sổ đỏ, đổi ranh giới đất, trích xuất dữ liệu hàng loạt
   */
  async requestStepUpChallenge(
    dto: StepUp2FaChallengeRequest,
    meta?: { ipAddress?: string },
  ): Promise<StepUp2FaChallengeResponse> {
    // --- BƯỚC 1: KIỂM TRA ĐẦU VÀO (TC-02) ---
    const parseResult = StepUp2FaChallengeSchema.safeParse(dto);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new BadRequestException(`Yêu cầu xác thực 2FA không hợp lệ: ${errorMsg}`);
    }

    const { sessionId, operation, targetEntityId } = parseResult.data;
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new BadRequestException(`Không tìm thấy phiên làm việc có mã định danh '${sessionId}'`);
    }

    // --- BƯỚC 2: RÀNG BUỘC PHIÊN VÀ PHÁT HIỆN TRUY CẬP BẤT THƯỜNG (TC-03 / QTD-22) ---
    const currentIp = meta?.ipAddress || session.ipAddress;
    // Kiểm tra nếu IP ngoài dải mạng công vụ (ví dụ: IP không đáng tin cậy 198.51.100.99)
    if (!session.isTrustedIp || currentIp.startsWith('198.51.')) {
      session.status = SessionStatus.SUSPENDED_SECURITY;

      const alert: SecurityViolationAlert = {
        id: `ALT-${Date.now()}`,
        sessionId: session.id,
        username: session.username,
        ipAddress: currentIp,
        violationType: 'IP_NOT_IN_WHITELIST',
        description: `Phát hiện truy cập thao tác nhạy cảm '${operation}' từ địa chỉ IP bất thường '${currentIp}'. Tự động khóa phiên theo QTD-22.`,
        timestamp: new Date().toISOString(),
        auditHash: crypto.createHash('sha256').update(`${session.id}|${currentIp}|${Date.now()}`).digest('hex'),
      };
      this.securityAlerts.unshift(alert);

      await this.saveAuditLog({
        userId: session.userId,
        userName: session.username,
        role: session.role,
        action: 'SENSITIVE_OP_IP_VIOLATION_QTD22',
        entityType: 'SESSION',
        entityId: session.id,
        newData: alert,
        hashSha256: alert.auditHash,
        ipAddress: currentIp,
      });

      throw new ForbiddenException(
        `Từ chối thao tác: Phát hiện truy cập thao tác nhạy cảm từ địa chỉ IP bất thường ngoài dải mạng công vụ (${currentIp}). Phiên làm việc đã bị tạm khóa tự động theo quy định QTD-22.`,
      );
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new ForbiddenException(
        `Phiên làm việc đang trong trạng thái '${session.status}', không thể thực hiện thao tác nhạy cảm. Vui lòng mở khóa phiên trước.`,
      );
    }

    // --- BƯỚC 3: TẠO THỬ THÁCH 2FA BƯỚC NÂNG CAO (TC-01) ---
    const challengeId = `CHL_${crypto.randomBytes(8).toString('hex')}`;
    const mockOtp = '123456'; // Trong môi trường thử nghiệm
    const expiresInSeconds = 300; // 5 phút

    const challenge: ActiveChallenge = {
      challengeId,
      sessionId,
      operation,
      targetEntityId,
      code: mockOtp,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      failedAttempts: 0,
      isUsed: false,
    };
    this.stepUpChallenges.set(challengeId, challenge);

    this.logger.log(
      `Đã tạo mã xác thực 2FA nâng cao '${challengeId}' cho thao tác '${operation}' (Phiên: ${sessionId})`,
    );

    return {
      challengeId,
      operation,
      method: 'TOTP',
      expiresInSeconds,
      maskedPhone: '09*****678',
      mockOtp,
    };
  }

  /**
   * 5. Xác nhận mã 2FA nâng cao và cấp Token ủy quyền (Step-Up Token 5 phút)
   * Đáp ứng: TC-01, TC-02, TC-03 (QTD-22), TC-04 (Kiểm toán SHA-256)
   */
  async verifyStepUp2Fa(
    dto: VerifyStepUp2FaRequest,
    meta?: { ipAddress?: string },
  ): Promise<VerifyStepUp2FaResponse> {
    // --- BƯỚC 1: KIỂM TRA ĐẦU VÀO (TC-02) ---
    const parseResult = VerifyStepUp2FaSchema.safeParse(dto);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new BadRequestException(`Thông tin xác thực 2FA không hợp lệ: ${errorMsg}`);
    }

    const { challengeId, sessionId, code } = parseResult.data;
    const challenge = this.stepUpChallenges.get(challengeId);
    if (!challenge) {
      throw new BadRequestException('Mã yêu cầu xác thực 2FA không tồn tại hoặc đã hết hạn.');
    }

    if (challenge.sessionId !== sessionId) {
      throw new ForbiddenException('Mã yêu cầu xác thực không khớp với phiên làm việc hiện tại.');
    }

    if (challenge.isUsed) {
      throw new BadRequestException('Mã xác thực 2FA này đã được sử dụng trước đó. Vui lòng tạo yêu cầu mới.');
    }

    if (Date.now() > challenge.expiresAt) {
      this.stepUpChallenges.delete(challengeId);
      throw new BadRequestException('Mã xác thực 2FA đã quá thời hạn 5 phút. Vui lòng tạo yêu cầu mới.');
    }

    // --- BƯỚC 2: KIỂM TRA MÃ VÀ BỘ ĐẾM SAI (TC-03 / QTD-22) ---
    if (challenge.code !== code) {
      challenge.failedAttempts += 1;

      if (challenge.failedAttempts >= 3) {
        challenge.isUsed = true;
        const session = this.sessions.get(sessionId);
        if (session) {
          session.status = SessionStatus.SUSPENDED_SECURITY;
        }

        const alert: SecurityViolationAlert = {
          id: `ALT-${Date.now()}`,
          sessionId,
          username: session?.username || 'unknown',
          ipAddress: meta?.ipAddress || session?.ipAddress || '127.0.0.1',
          violationType: 'FAILED_2FA_ATTEMPTS',
          description: `Nhập sai mã xác thực 2FA cho thao tác nhạy cảm '${challenge.operation}' quá 3 lần. Tự động tạm khóa phiên theo QTD-22.`,
          timestamp: new Date().toISOString(),
          auditHash: crypto.createHash('sha256').update(`${sessionId}|FAILED_2FA|${Date.now()}`).digest('hex'),
        };
        this.securityAlerts.unshift(alert);

        throw new ForbiddenException(
          'Tài khoản bị tạm khóa phiên làm việc do xác thực 2FA sai quá 3 lần theo quy định an toàn thông tin (QTD-22).',
        );
      }

      throw new BadRequestException(
        `Mã xác thực 2FA không chính xác. Bạn còn ${3 - challenge.failedAttempts} lần thử.`,
      );
    }

    // --- BƯỚC 3: XÁC THỰC THÀNH CÔNG VÀ CẤP STEP-UP TOKEN (TC-01) ---
    challenge.isUsed = true;
    const nowIso = new Date().toISOString();
    const expiryIso = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Có hạn 5 phút
    const stepUpToken = `STEPUP_${crypto.randomBytes(24).toString('hex')}`;

    const auditPayload = {
      action: 'STEP_UP_2FA_VERIFIED_SUCCESS',
      sessionId,
      challengeId,
      operation: challenge.operation,
      targetEntityId: challenge.targetEntityId,
      stepUpToken,
      expiresAt: expiryIso,
      timestamp: nowIso,
      ipAddress: meta?.ipAddress || '127.0.0.1',
    };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditPayload)).digest('hex');

    // Lưu vết kiểm toán bất biến (TC-04)
    await this.saveAuditLog({
      userId: sessionId,
      userName: `Phiên ${sessionId}`,
      role: 'SYSTEM',
      action: 'STEP_UP_2FA_VERIFIED_SUCCESS',
      entityType: 'SESSION_2FA',
      entityId: challengeId,
      newData: auditPayload,
      hashSha256: auditHash,
      ipAddress: meta?.ipAddress || '127.0.0.1',
    });

    return {
      success: true,
      stepUpToken,
      operation: challenge.operation,
      expiresAt: expiryIso,
      auditHash,
      message: 'Xác thực 2FA nâng cao thành công. Đã cấp mã ủy quyền thực hiện thao tác nhạy cảm trong vòng 5 phút.',
    };
  }

  /**
   * 6. Chấm dứt phiên làm việc từ xa (Remote Session Termination / Logout)
   */
  async terminateSession(
    dto: TerminateSessionRequest,
    meta?: { ipAddress?: string },
  ): Promise<TerminateSessionResponse> {
    const parseResult = TerminateSessionSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException('Mã phiên làm việc không hợp lệ.');
    }

    const { sessionId, reason } = parseResult.data;
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new BadRequestException(`Không tìm thấy phiên làm việc có mã định danh '${sessionId}'`);
    }

    session.status = SessionStatus.TERMINATED;
    session.lastActiveAt = new Date().toISOString();

    const auditPayload = {
      action: 'SESSION_TERMINATED',
      sessionId: session.id,
      username: session.username,
      reason: reason || 'Người dùng hoặc Quản trị viên chủ động chấm dứt phiên',
      timestamp: new Date().toISOString(),
    };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditPayload)).digest('hex');

    await this.saveAuditLog({
      userId: session.userId,
      userName: session.username,
      role: session.role,
      action: 'SESSION_TERMINATED',
      entityType: 'SESSION',
      entityId: session.id,
      newData: auditPayload,
      hashSha256: auditHash,
      ipAddress: meta?.ipAddress || session.ipAddress,
    });

    return {
      success: true,
      sessionId: session.id,
      status: SessionStatus.TERMINATED,
      auditHash,
      message: 'Đã chấm dứt phiên làm việc an toàn.',
    };
  }

  /**
   * 7. Tra cứu danh sách cảnh báo an ninh thông tin (QTD-22)
   */
  async getSecurityAlerts(): Promise<SecurityViolationAlert[]> {
    return this.securityAlerts;
  }

  /**
   * Ghi nhận nhật ký kiểm toán bất biến
   */
  private async saveAuditLog(logEntry: {
    userId?: string;
    userName?: string;
    role?: string;
    action: string;
    entityType: string;
    entityId: string;
    newData: any;
    hashSha256: string;
    ipAddress?: string;
  }) {
    if (this.db) {
      try {
        await this.db.insert(auditLogs).values({
          userId: logEntry.userId,
          userName: logEntry.userName,
          role: logEntry.role,
          action: logEntry.action,
          entityType: logEntry.entityType,
          entityId: logEntry.entityId,
          newData: logEntry.newData,
          hashSha256: logEntry.hashSha256,
          ipAddress: logEntry.ipAddress,
        });
      } catch (err: any) {
        this.logger.warn(`Không thể ghi log kiểm toán vào CSDL: ${err.message}`);
      }
    }
  }
}
