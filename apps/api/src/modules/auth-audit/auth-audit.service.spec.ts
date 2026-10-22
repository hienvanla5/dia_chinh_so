import { Test, TestingModule } from '@nestjs/testing';
import { AuthAuditService } from './auth-audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AuthAuditService [DCS-01-CN-010]', () => {
  let service: AuthAuditService;

  beforeEach(async () => {
    service = new AuthAuditService();
  });

  describe('DCS-01-CN-010-TC-01: Luồng thành công - Giám sát nhật ký và cảnh báo SOC', () => {
    it('phải truy vấn danh sách nhật ký xác thực có phân trang và lọc theo trạng thái', async () => {
      const result = await service.queryAuditLogs({
        page: 1,
        limit: 10,
      });

      expect(result.logs.length).toBeGreaterThanOrEqual(6);
      expect(result.total).toBeGreaterThanOrEqual(6);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);

      // Mỗi log phải có đầy đủ thuộc tính và mã băm SHA-256
      const firstLog = result.logs[0];
      expect(firstLog.id).toBeDefined();
      expect(firstLog.clientIp).toBeDefined();
      expect(firstLog.previousHash).toBeDefined();
      expect(firstLog.auditHash).toHaveLength(64);
    });

    it('phải lọc nhật ký xác thực theo vai trò và cờ dị thường (isAnomaly)', async () => {
      const anomalies = await service.queryAuditLogs({
        isAnomaly: true,
      });

      expect(anomalies.logs.length).toBeGreaterThanOrEqual(3);
      anomalies.logs.forEach(log => {
        expect(log.isAnomaly).toBe(true);
        expect(log.anomalyType).toBeDefined();
      });
    });

    it('phải truy vấn danh mục cảnh báo an ninh và lọc theo mức độ nghiêm trọng', async () => {
      const criticalAlerts = await service.queryAnomalyAlerts({
        severity: 'CRITICAL',
      });

      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
      const impossibleTravel = criticalAlerts.find(a => a.detectionType === 'IMPOSSIBLE_TRAVEL');
      expect(impossibleTravel).toBeDefined();
      expect(impossibleTravel?.isAccountLocked).toBe(true);
      expect(impossibleTravel?.status).toBe('NEW');
    });

    it('phải cung cấp số liệu thống kê trung tâm SOC chính xác', async () => {
      const stats = await service.getAuditStats();

      expect(stats.totalEventsCount).toBeGreaterThanOrEqual(6);
      expect(stats.anomaliesCount).toBeGreaterThanOrEqual(3);
      expect(stats.activeAlertsCount).toBeGreaterThanOrEqual(3);
      expect(stats.criticalAlertsCount).toBeGreaterThanOrEqual(1);
      expect(stats.chainIntegrityStatus).toBe('VERIFIED');
      expect(stats.latestBlockHash).toHaveLength(64);
    });
  });

  describe('DCS-01-CN-010-TC-02: Dữ liệu không hợp lệ & Xử lý ngoại lệ', () => {
    it('phải ném NotFoundException khi xử lý mã cảnh báo an ninh không tồn tại', async () => {
      await expect(
        service.resolveAnomalyAlert({
          alertId: 'ALT-NON-EXISTENT',
          action: 'RESOLVE_LOCK',
          notes: 'Xác nhận khóa tài khoản giả mạo',
          resolvedBy: 'quantri.hethong',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DCS-01-CN-010-TC-03: Ràng buộc nghiệp vụ & Phát hiện dị thường (QTD-22)', () => {
    it('phải phát hiện di chuyển bất khả thi (Impossible Travel) và tự động khóa tài khoản khi khoảng cách lớn trong thời gian ngắn', async () => {
      // Giả lập cán bộ 'CB-HN-002' đăng nhập thành công tại Hà Nội
      const firstLogin = await service.simulateAuthEvent({
        actorId: 'CB-HN-002',
        actorName: 'Trần Văn Mạnh',
        actorRole: 'LAND_REGISTRAR',
        authMethod: 'OFFICER_SSO',
        clientIp: '10.15.20.150',
        province: 'Thành phố Hà Nội',
        isSuccess: true,
      });

      expect(firstLogin.isAnomaly).toBe(false);
      expect(firstLogin.log.status).toBe('SUCCESS');

      // Ngay sau đó (trong vòng dưới 60 phút) cùng tài khoản đăng nhập từ TP. Hồ Chí Minh
      const secondLogin = await service.simulateAuthEvent({
        actorId: 'CB-HN-002',
        actorName: 'Trần Văn Mạnh',
        actorRole: 'LAND_REGISTRAR',
        authMethod: 'OFFICER_SSO',
        clientIp: '42.112.50.99',
        province: 'Thành phố Hồ Chí Minh',
        isSuccess: true,
      });

      expect(secondLogin.isAnomaly).toBe(true);
      expect(secondLogin.log.anomalyType).toBe('IMPOSSIBLE_TRAVEL');
      expect(secondLogin.log.status).toBe('BLOCKED');
      expect(secondLogin.alert).toBeDefined();
      expect(secondLogin.alert?.severity).toBe('CRITICAL');
      expect(secondLogin.alert?.isAccountLocked).toBe(true);
    });

    it('phải phát hiện đăng nhập ngoài giờ hành chính (Off-hours Access) đối với tài khoản cán bộ', async () => {
      const nightLogin = await service.simulateAuthEvent({
        actorId: 'CB-COMMUNE-003',
        actorName: 'Hoàng Văn Sơn',
        actorRole: 'COMMUNE_OFFICER',
        authMethod: 'OFFICER_SSO',
        clientIp: '10.20.30.40',
        province: 'Tỉnh Ninh Bình',
        isSuccess: true,
        isOfficeHours: false, // Ban đêm
      });

      expect(nightLogin.isAnomaly).toBe(true);
      expect(nightLogin.log.anomalyType).toBe('OFF_HOURS_ACCESS');
      expect(nightLogin.log.status).toBe('CHALLENGED');
      expect(nightLogin.alert?.severity).toBe('MEDIUM');
      expect(nightLogin.alert?.requiresStepUpVerification).toBe(true);
    });

    it('phải phát hiện và chặn truy cập từ mạng ngoài công vụ (Untrusted Network - QTD-22) đối với cán bộ', async () => {
      const publicIpLogin = await service.simulateAuthEvent({
        actorId: 'CB-COMMUNE-004',
        actorName: 'Vũ Thị Lan',
        actorRole: 'COMMUNE_OFFICER',
        authMethod: 'OFFICER_SSO',
        clientIp: '203.162.0.100', // IP ngoài mạng công vụ chuyên dùng
        province: 'Thành phố Hải Phòng',
        isSuccess: true,
        isOfficeHours: true,
      });

      expect(publicIpLogin.isAnomaly).toBe(true);
      expect(publicIpLogin.log.anomalyType).toBe('UNTRUSTED_NETWORK');
      expect(publicIpLogin.log.status).toBe('BLOCKED');
      expect(publicIpLogin.alert?.severity).toBe('HIGH');
      expect(publicIpLogin.alert?.isAccountLocked).toBe(true);
    });
  });

  describe('DCS-01-CN-010-TC-04: Tính bất biến và liên kết chuỗi băm kiểm toán (QTD-20)', () => {
    it('phải xác minh chuỗi băm kiểm toán bất biến đạt tính toàn vẹn 100%', async () => {
      const verification = await service.verifyAuditChain();

      expect(verification.isValid).toBe(true);
      expect(verification.totalLogs).toBeGreaterThanOrEqual(6);
      expect(verification.brokenLogId).toBeUndefined();
      expect(verification.latestHash).toHaveLength(64);
    });

    it('phải phát hiện giả mạo dữ liệu hoặc đứt gãy chuỗi băm khi có can thiệp bất hợp pháp', async () => {
      // Giả lập kẻ tấn công can thiệp sửa trực tiếp trạng thái của khối 2
      const logs = (service as any).auditLogs;
      const originalStatus = logs[1].status;
      logs[1].status = 'BLOCKED'; // Sửa dữ liệu

      const tamperedCheck = await service.verifyAuditChain();
      expect(tamperedCheck.isValid).toBe(false);
      expect(tamperedCheck.brokenLogId).toBe('LOG-2026-0002');
      expect(tamperedCheck.message).toContain('Phát hiện giả mạo dữ liệu');

      // Khôi phục lại dữ liệu ban đầu
      logs[1].status = originalStatus;
      const restoredCheck = await service.verifyAuditChain();
      expect(restoredCheck.isValid).toBe(true);
    });

    it('phải xử lý cảnh báo an ninh và lưu vết mã băm kiểm toán (Resolve Alert)', async () => {
      const alerts = await service.queryAnomalyAlerts({});
      const targetAlert = alerts[0];

      const resolution = await service.resolveAnomalyAlert({
        alertId: targetAlert.id,
        action: 'RESOLVE_LOCK',
        notes: 'Đã xác minh qua điện thoại, tài khoản có dấu hiệu bị lộ mật khẩu, tiến hành khóa',
        resolvedBy: 'truongphong.anm',
      });

      expect(resolution.success).toBe(true);
      expect(resolution.alert.status).toBe('RESOLVED');
      expect(resolution.alert.isAccountLocked).toBe(true);
      expect(resolution.auditHash).toHaveLength(64);
    });
  });
});
