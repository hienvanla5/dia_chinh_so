import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SessionSecurityService } from './session-security.service';
import {
  SessionStatus,
  SensitiveOperationType,
} from '@diachinhso/shared';

describe('SessionSecurityService (DCS-01-CN-005)', () => {
  let service: SessionSecurityService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(true),
      }),
    };

    service = new SessionSecurityService(mockDb);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // TC-01: LUỒNG THÀNH CÔNG (QUẢN LÝ PHIÊN & XÁC THỰC 2FA NÂNG CAO)
  // =========================================================================
  describe('DCS-01-CN-005-TC-01: Luồng thành công', () => {
    it('Mở khóa màn hình làm việc bằng mã hợp lệ, làm mới thời hạn phiên 15 phút', async () => {
      const result = await service.unlockSession({
        sessionId: 'SES-HN-REGISTRAR-002', // Phiên đang LOCKED
        unlockCode: '123456',
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('SES-HN-REGISTRAR-002');
      expect(result.status).toBe(SessionStatus.ACTIVE);
      expect(result.refreshedExpiry).toBeDefined();
      expect(result.auditHash).toHaveLength(64); // SHA-256
    });

    it('Yêu cầu thử thách 2FA bước nâng cao cho thao tác ký duyệt Sổ Đỏ Số', async () => {
      const challenge = await service.requestStepUpChallenge({
        sessionId: 'SES-HN-ADMIN-001',
        operation: SensitiveOperationType.APPROVE_CERTIFICATE,
        targetEntityId: 'DOC-2026-CERT-001',
      });

      expect(challenge.challengeId).toMatch(/^CHL_/);
      expect(challenge.operation).toBe(SensitiveOperationType.APPROVE_CERTIFICATE);
      expect(challenge.method).toBe('TOTP');
      expect(challenge.expiresInSeconds).toBe(300); // 5 phút
      expect(challenge.mockOtp).toBe('123456');
    });

    it('Xác nhận mã 2FA nâng cao thành công, cấp stepUpToken có hiệu lực 5 phút', async () => {
      // 1. Tạo thử thách 2FA
      const challenge = await service.requestStepUpChallenge({
        sessionId: 'SES-HN-ADMIN-001',
        operation: SensitiveOperationType.ALTER_PARCEL_BOUNDARY,
        targetEntityId: 'PARCEL-01001-0012',
      });

      // 2. Xác thực mã 2FA
      const verifyRes = await service.verifyStepUp2Fa({
        challengeId: challenge.challengeId,
        sessionId: 'SES-HN-ADMIN-001',
        code: '123456',
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.stepUpToken).toMatch(/^STEPUP_/);
      expect(verifyRes.operation).toBe(SensitiveOperationType.ALTER_PARCEL_BOUNDARY);
      expect(verifyRes.expiresAt).toBeDefined();
      expect(verifyRes.auditHash).toHaveLength(64);
    });

    it('Khóa màn hình làm việc thủ công hoặc sau 15 phút không tương tác', async () => {
      const session = await service.lockScreen('SES-HN-ADMIN-001');
      expect(session.status).toBe(SessionStatus.LOCKED);
    });

    it('Chấm dứt phiên làm việc từ xa an toàn', async () => {
      const result = await service.terminateSession({
        sessionId: 'SES-HN-ADMIN-001',
        reason: 'Cán bộ đăng xuất phiên làm việc',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe(SessionStatus.TERMINATED);
      expect(result.auditHash).toBeDefined();
    });
  });

  // =========================================================================
  // TC-02: DỮ LIỆU KHÔNG HỢP LỆ (VALIDATION)
  // =========================================================================
  describe('DCS-01-CN-005-TC-02: Dữ liệu không hợp lệ', () => {
    it('Từ chối khi sessionId rỗng khi mở khóa', async () => {
      await expect(
        service.unlockSession({
          sessionId: '',
          unlockCode: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối khi mã 2FA sai định dạng (chứa chữ cái hoặc không đủ 6 số)', async () => {
      await expect(
        service.verifyStepUp2Fa({
          challengeId: 'CHL_TEST',
          sessionId: 'SES-HN-ADMIN-001',
          code: '12AB56',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối khi challengeId không tồn tại', async () => {
      await expect(
        service.verifyStepUp2Fa({
          challengeId: 'CHL_NON_EXISTENT',
          sessionId: 'SES-HN-ADMIN-001',
          code: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối tái sử dụng mã 2FA đã qua sử dụng (Single-use challenge token)', async () => {
      const challenge = await service.requestStepUpChallenge({
        sessionId: 'SES-HN-ADMIN-001',
        operation: SensitiveOperationType.BULK_DATA_EXPORT,
        targetEntityId: 'EXPORT-ALL-PROVINCE',
      });

      // Lần 1: Thành công
      await service.verifyStepUp2Fa({
        challengeId: challenge.challengeId,
        sessionId: 'SES-HN-ADMIN-001',
        code: '123456',
      });

      // Lần 2: Cố tình dùng lại -> Bị chặn
      await expect(
        service.verifyStepUp2Fa({
          challengeId: challenge.challengeId,
          sessionId: 'SES-HN-ADMIN-001',
          code: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // TC-03: RÀNG BUỘC NGHIỆP VỤ & QUY TẮC AN TOÀN THÔNG TIN (QTD-22)
  // =========================================================================
  describe('DCS-01-CN-005-TC-03: Ràng buộc nghiệp vụ (QTD-22)', () => {
    it('Khóa phiên tự động khi nhập sai mã mở khóa quá 3 lần liên tiếp (QTD-22)', async () => {
      // Lần 1: Sai
      await expect(
        service.unlockSession({ sessionId: 'SES-HN-REGISTRAR-002', unlockCode: '999999' }),
      ).rejects.toThrow(BadRequestException);

      // Lần 2: Sai
      await expect(
        service.unlockSession({ sessionId: 'SES-HN-REGISTRAR-002', unlockCode: '999999' }),
      ).rejects.toThrow(BadRequestException);

      // Lần 3: Sai -> Kích hoạt QTD-22 khóa phiên
      await expect(
        service.unlockSession({ sessionId: 'SES-HN-REGISTRAR-002', unlockCode: '999999' }),
      ).rejects.toThrow(ForbiddenException);

      // Kiểm tra trạng thái phiên sau khi bị khóa
      const sessions = await service.getActiveSessions();
      const lockedSession = sessions.find((s) => s.id === 'SES-HN-REGISTRAR-002');
      expect(lockedSession?.status).toBe(SessionStatus.SUSPENDED_SECURITY);
    });

    it('Từ chối mở khóa khi phiên đã bị tạm khóa an ninh thông tin', async () => {
      await expect(
        service.unlockSession({
          sessionId: 'SES-SUSPICIOUS-003', // Phiên đang SUSPENDED_SECURITY
          unlockCode: '123456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Chặn thao tác nhạy cảm và tạm khóa phiên khi phát hiện IP bất thường ngoài mạng công vụ (QTD-22)', async () => {
      await expect(
        service.requestStepUpChallenge(
          {
            sessionId: 'SES-SUSPICIOUS-003',
            operation: SensitiveOperationType.APPROVE_CERTIFICATE,
            targetEntityId: 'DOC-TEST',
          },
          { ipAddress: '198.51.100.99' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Tạm khóa phiên khi nhập sai mã 2FA nâng cao quá 3 lần liên tiếp (QTD-22)', async () => {
      const challenge = await service.requestStepUpChallenge({
        sessionId: 'SES-HN-ADMIN-001',
        operation: SensitiveOperationType.REVOKE_DOCUMENT,
        targetEntityId: 'DOC-REVOKE-001',
      });

      // Lần 1: Sai
      await expect(
        service.verifyStepUp2Fa({ challengeId: challenge.challengeId, sessionId: 'SES-HN-ADMIN-001', code: '000000' }),
      ).rejects.toThrow(BadRequestException);

      // Lần 2: Sai
      await expect(
        service.verifyStepUp2Fa({ challengeId: challenge.challengeId, sessionId: 'SES-HN-ADMIN-001', code: '000000' }),
      ).rejects.toThrow(BadRequestException);

      // Lần 3: Sai -> Kích hoạt QTD-22
      await expect(
        service.verifyStepUp2Fa({ challengeId: challenge.challengeId, sessionId: 'SES-HN-ADMIN-001', code: '000000' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // TC-04: KIỂM TOÁN SHA-256 & CẢNH BÁO AN NINH THÔNG TIN
  // =========================================================================
  describe('DCS-01-CN-005-TC-04: Kiểm toán & Cảnh báo an ninh', () => {
    it('Lấy danh sách cảnh báo vi phạm an ninh thông tin (QTD-22) đầy đủ chi tiết', async () => {
      const alerts = await service.getSecurityAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].violationType).toBe('IP_NOT_IN_WHITELIST');
      expect(alerts[0].auditHash).toHaveLength(64);
    });

    it('Tra cứu danh sách các phiên làm việc đang hoạt động thành công', async () => {
      const sessions = await service.getActiveSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(3);
      expect(sessions.some((s) => s.status === SessionStatus.ACTIVE)).toBe(true);
      expect(sessions.some((s) => s.status === SessionStatus.LOCKED)).toBe(true);
    });
  });
});
