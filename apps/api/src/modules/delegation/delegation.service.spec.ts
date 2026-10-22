import { DelegationService } from './delegation.service';
import { UserRole, DelegationScope, DelegationStatus } from '@diachinhso/shared';
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('DelegationService (DCS-01-CN-008)', () => {
  let service: DelegationService;

  const mockLeaderUser = {
    id: 'OFF-HN-VPDK-LEAD',
    fullName: 'Trần Đình Trọng',
    role: UserRole.LAND_REGISTRAR,
  };

  const mockCommuneUser = {
    id: 'OFF-HN-001',
    fullName: 'Nguyễn Văn An',
    role: UserRole.COMMUNE_OFFICER,
  };

  beforeEach(() => {
    service = new DelegationService();
  });

  describe('DCS-01-CN-008-TC-01: Luồng thành công', () => {
    it('lãnh đạo ban hành văn bản ủy quyền có thời hạn cho cấp phó ký thay thành công', async () => {
      const startDate = new Date(Date.now() - 1000 * 60).toISOString();
      const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

      const result = await service.createDelegation(
        {
          documentNumber: 'QĐ-UQ-2026/088/VPDKDD-HN',
          title: 'Ủy quyền giải quyết hồ sơ cấp GCN trong thời gian Giám đốc họp Trung ương',
          delegateeId: 'OFF-HN-VPDK-001',
          scope: DelegationScope.APPROVE_CERTIFICATE,
          startDate,
          endDate,
          notes: 'Ký thay phê duyệt hồ sơ địa chính và sổ đỏ số',
        },
        mockLeaderUser
      );

      expect(result.success).toBe(true);
      expect(result.delegation).toBeDefined();
      expect(result.delegation.documentNumber).toBe('QĐ-UQ-2026/088/VPDKDD-HN');
      expect(result.delegation.delegateeName).toBe('Lê Văn Cường');
      expect(result.delegation.signingPrefix).toBe('KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC');
      expect(result.delegation.status).toBe(DelegationStatus.ACTIVE);
      expect(result.auditHash).toBeDefined();
      expect(result.auditHash.length).toBe(64);

      // Kiểm tra xác thực thẩm quyền khi cấp phó ký duyệt
      const access = await service.verifyDelegationAccess({
        officerId: 'OFF-HN-VPDK-001',
        requiredScope: DelegationScope.APPROVE_CERTIFICATE,
      });

      expect(access.hasDelegation).toBe(true);
      expect(access.signingTitle).toBe('KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC');
      expect(access.delegation?.documentNumber).toBe('QĐ-UQ-2026/088/VPDKDD-HN');
    });
  });

  describe('DCS-01-CN-008-TC-02: Dữ liệu không hợp lệ', () => {
    it('từ chối khi ngày kết thúc ủy quyền trước hoặc bằng ngày bắt đầu', async () => {
      const now = new Date().toISOString();
      const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      await expect(
        service.createDelegation(
          {
            documentNumber: 'QĐ-123',
            title: 'Ủy quyền',
            delegateeId: 'OFF-HN-VPDK-001',
            scope: DelegationScope.ALL_DOSSIERS,
            startDate: now,
            endDate: yesterday, // Lỗi: kết thúc trước bắt đầu
          },
          mockLeaderUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi người ủy quyền trùng với người được ủy quyền', async () => {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 1000 * 60 * 60).toISOString();

      await expect(
        service.createDelegation(
          {
            documentNumber: 'QĐ-123',
            title: 'Tự ủy quyền',
            delegateeId: 'OFF-HN-VPDK-LEAD', // Trùng với mockLeaderUser.id
            scope: DelegationScope.ALL_DOSSIERS,
            startDate: start,
            endDate: end,
          },
          mockLeaderUser
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-008-TC-03: Ràng buộc nghiệp vụ (QTD-05, QTD-28)', () => {
    it('chặn cán bộ cấp xã không có thẩm quyền ban hành văn bản ủy quyền của VP ĐKĐĐ', async () => {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 1000 * 60 * 60).toISOString();

      await expect(
        service.createDelegation(
          {
            documentNumber: 'QĐ-123',
            title: 'Ủy quyền trái quyền',
            delegateeId: 'OFF-HN-VPDK-001',
            scope: DelegationScope.ALL_DOSSIERS,
            startDate: start,
            endDate: end,
          },
          mockCommuneUser
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('từ chối khi cán bộ được ủy quyền không tồn tại trong hệ thống', async () => {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 1000 * 60 * 60).toISOString();

      await expect(
        service.createDelegation(
          {
            documentNumber: 'QĐ-123',
            title: 'Ủy quyền người không tồn tại',
            delegateeId: 'OFF-KHONG-CO',
            scope: DelegationScope.ALL_DOSSIERS,
            startDate: start,
            endDate: end,
          },
          mockLeaderUser
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('từ chối thẩm quyền ủy quyền khi văn bản đã hết hạn', async () => {
      // DEL-2026-002 đã hết hạn (endDate trong quá khứ)
      const access = await service.verifyDelegationAccess({
        officerId: 'OFF-HCM-VPDK-001',
        requiredScope: DelegationScope.SIGN_TRANSFER,
      });

      expect(access.hasDelegation).toBe(false);
      expect(access.message).toContain('Không tìm thấy văn bản ủy quyền');
    });
  });

  describe('DCS-01-CN-008-TC-04: Kiểm toán & Thu hồi văn bản ủy quyền', () => {
    it('thu hồi văn bản ủy quyền trước thời hạn thành công kèm mã băm SHA-256', async () => {
      const revokeResult = await service.revokeDelegation(
        {
          delegationId: 'DEL-2026-001',
          reason: 'Giám đốc đã hoàn thành chuyến công tác sớm hơn dự kiến và trở lại làm việc',
        },
        mockLeaderUser
      );

      expect(revokeResult.success).toBe(true);
      expect(revokeResult.delegationId).toBe('DEL-2026-001');
      expect(revokeResult.auditHash).toBeDefined();

      const delegation = await service.getDelegationById('DEL-2026-001');
      expect(delegation.status).toBe(DelegationStatus.REVOKED);
      expect(delegation.revocationReason).toBeDefined();

      // Kiểm tra lại thẩm quyền sau khi thu hồi -> Phải bị từ chối
      const access = await service.verifyDelegationAccess({
        officerId: 'OFF-HN-VPDK-001',
        requiredScope: DelegationScope.APPROVE_CERTIFICATE,
      });
      expect(access.hasDelegation).toBe(false);

      // Kiểm tra nhật ký kiểm toán
      const logs = await service.getAuditLogs();
      expect(logs[0].action).toBe('REVOKE_DELEGATION');
      expect(logs[0].auditHash).toBe(revokeResult.auditHash);
    });

    it('từ chối khi thu hồi một văn bản đã bị thu hồi trước đó (Conflict)', async () => {
      await service.revokeDelegation(
        {
          delegationId: 'DEL-2026-001',
          reason: 'Thu hồi lần 1',
        },
        mockLeaderUser
      );

      await expect(
        service.revokeDelegation(
          {
            delegationId: 'DEL-2026-001',
            reason: 'Thu hồi lần 2',
          },
          mockLeaderUser
        )
      ).rejects.toThrow(ConflictException);
    });
  });
});
