import { OfficerLifecycleService } from './officer-lifecycle.service';
import {
  UserRole,
  OfficerAccountStatus,
  DeactivationReasonType,
} from '@diachinhso/shared';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('OfficerLifecycleService (DCS-01-CN-006)', () => {
  let service: OfficerLifecycleService;

  const mockAdminUser = {
    id: 'ADMIN-SYS-001',
    username: 'quantri.hethong',
    role: UserRole.ADMIN,
  };

  const mockNonAdminUser = {
    id: 'OFF-HN-VPDK-001',
    username: 'le.van.c.dkdd',
    role: UserRole.LAND_REGISTRAR,
  };

  beforeEach(() => {
    service = new OfficerLifecycleService();
  });

  describe('DCS-01-CN-006-TC-01: Luồng thành công', () => {
    it('quản trị viên thực hiện vô hiệu hóa tài khoản cán bộ kèm chuyển giao hồ sơ dở dang thành công', async () => {
      // OFF-HN-001 có 4 hồ sơ dở dang, bàn giao cho OFF-HN-002
      const result = await service.deactivateAccount(
        {
          officerId: 'OFF-HN-001',
          decisionNumber: 'QĐ-2026/088/UBND-HN',
          decisionDate: '2026-10-22',
          issuingAuthority: 'UBND Thành phố Hà Nội',
          reasonType: DeactivationReasonType.TRANSFER,
          reasonDetail: 'Điều động công tác sang Sở Xây dựng theo đề án luân chuyển vị trí',
          transfereeOfficerId: 'OFF-HN-002',
        },
        mockAdminUser
      );

      expect(result.success).toBe(true);
      expect(result.officerId).toBe('OFF-HN-001');
      expect(result.newStatus).toBe(OfficerAccountStatus.TRANSFERRED);
      expect(result.reassignedDossiersCount).toBe(4);
      expect(result.transfereeOfficerName).toBe('Trần Thị Bích');
      expect(result.auditHash).toBeDefined();
      expect(result.auditHash.length).toBe(64); // SHA-256 length

      // Kiểm tra trạng thái cán bộ cũ sau khi cập nhật
      const updatedOfficer = await service.getOfficerById('OFF-HN-001');
      expect(updatedOfficer.status).toBe(OfficerAccountStatus.TRANSFERRED);
      expect(updatedOfficer.pendingDossierCount).toBe(0);
      expect(updatedOfficer.deactivationInfo).toBeDefined();
      expect(updatedOfficer.deactivationInfo?.decisionNumber).toBe('QĐ-2026/088/UBND-HN');
      expect(updatedOfficer.deactivationInfo?.auditHash).toBe(result.auditHash);

      // Kiểm tra cán bộ tiếp nhận đã nhận thêm 4 hồ sơ (từ 2 -> 6)
      const transferee = await service.getOfficerById('OFF-HN-002');
      expect(transferee.pendingDossierCount).toBe(6);
    });

    it('vô hiệu hóa tài khoản do kỷ luật đình chỉ công tác thành công', async () => {
      const result = await service.deactivateAccount(
        {
          officerId: 'OFF-HCM-001',
          decisionNumber: 'QĐ-KL-2026/012/SNV',
          decisionDate: '2026-10-20',
          issuingAuthority: 'Sở Nội vụ TP. Hồ Chí Minh',
          reasonType: DeactivationReasonType.DISCIPLINE,
          reasonDetail: 'Tạm đình chỉ công tác 90 ngày để phục vụ thanh tra nghiệp vụ',
          transfereeOfficerId: 'OFF-HCM-002',
        },
        mockAdminUser
      );

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(OfficerAccountStatus.SUSPENDED_DISCIPLINE);
      expect(result.terminatedSessionsCount).toBe(1);
    });
  });

  describe('DCS-01-CN-006-TC-02: Dữ liệu không hợp lệ', () => {
    it('từ chối khi thiếu số quyết định hành chính', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-001',
            decisionNumber: '',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP Hà Nội',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Lý do công tác',
            transfereeOfficerId: 'OFF-HN-002',
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi định dạng ngày quyết định không hợp lệ', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '22-10-2026', // Sai định dạng (phải YYYY-MM-DD)
            issuingAuthority: 'UBND TP Hà Nội',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Lý do công tác',
            transfereeOfficerId: 'OFF-HN-002',
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi loại căn cứ thu hồi quyền không hợp lệ', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP Hà Nội',
            reasonType: 'INVALID_REASON' as any,
            reasonDetail: 'Lý do công tác',
            transfereeOfficerId: 'OFF-HN-002',
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-006-TC-03: Ràng buộc nghiệp vụ (QTD-16, QTD-22, Self-lockout)', () => {
    it('chặn người dùng không có vai trò Quản trị viên (ADMIN) thực hiện vô hiệu hóa', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP Hà Nội',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Lý do công tác',
          },
          mockNonAdminUser as any
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn Quản trị viên tự vô hiệu hóa tài khoản của chính mình (chống self-lockout)', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'ADMIN-SYS-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND',
            reasonType: DeactivationReasonType.RESIGNATION,
            reasonDetail: 'Xin nghỉ việc',
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi cán bộ đang nắm hồ sơ dở dang nhưng không chỉ định cán bộ bàn giao', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-VPDK-001', // có 6 hồ sơ dở dang
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'Sở TN&MT',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Điều động',
            // transfereeOfficerId bỏ trống
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi chỉ định cán bộ tiếp nhận không tồn tại hoặc không ACTIVE', async () => {
      // OFF-NB-001 đã TRANSFERRED
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-HN-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Điều chuyển',
            transfereeOfficerId: 'OFF-NB-001', // Đang TRANSFERRED không hoạt động
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi tài khoản cán bộ mục tiêu không tồn tại', async () => {
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-KHONG-TON-TAI',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Điều chuyển',
          },
          mockAdminUser
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('từ chối khi tài khoản đã ở trạng thái mục tiêu (Conflict)', async () => {
      // OFF-NB-001 đã có status là TRANSFERRED
      await expect(
        service.deactivateAccount(
          {
            officerId: 'OFF-NB-001',
            decisionNumber: 'QĐ-123',
            decisionDate: '2026-10-22',
            issuingAuthority: 'UBND TP',
            reasonType: DeactivationReasonType.TRANSFER,
            reasonDetail: 'Điều chuyển',
          },
          mockAdminUser
        )
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('DCS-01-CN-006-TC-04: Kiểm toán & Khôi phục tài khoản', () => {
    it('ghi nhận nhật ký kiểm toán bất biến SHA-256 khi điều chuyển tài khoản', async () => {
      const result = await service.deactivateAccount(
        {
          officerId: 'OFF-HN-001',
          decisionNumber: 'QĐ-TEST-004',
          decisionDate: '2026-10-22',
          issuingAuthority: 'UBND TP Hà Nội',
          reasonType: DeactivationReasonType.TRANSFER,
          reasonDetail: 'Kiểm toán hệ thống',
          transfereeOfficerId: 'OFF-HN-002',
        },
        mockAdminUser
      );

      const logs = await service.getAuditLogs();
      const latestLog = logs[0];

      expect(latestLog).toBeDefined();
      expect(latestLog.officerId).toBe('OFF-HN-001');
      expect(latestLog.decisionNumber).toBe('QĐ-TEST-004');
      expect(latestLog.auditHash).toBe(result.auditHash);
    });

    it('cho phép khôi phục tài khoản đã bị điều chuyển / tạm đình chỉ khi có quyết định mới', async () => {
      // OFF-NB-001 đang TRANSFERRED, khôi phục lại
      const result = await service.reactivateAccount(
        {
          officerId: 'OFF-NB-001',
          decisionNumber: 'QĐ-2026/999/UBND-NB-TIEP-NHAN',
          reinstatementReason: 'Quyết định tiếp nhận cán bộ trở lại vị trí công tác',
        },
        mockAdminUser
      );

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(OfficerAccountStatus.ACTIVE);

      const officer = await service.getOfficerById('OFF-NB-001');
      expect(officer.status).toBe(OfficerAccountStatus.ACTIVE);
      expect(officer.deactivationInfo).toBeUndefined();
    });

    it('lọc danh sách cán bộ hợp lệ và tìm kiếm từ khóa', async () => {
      const activeOfficers = await service.getOfficers({ status: OfficerAccountStatus.ACTIVE });
      expect(activeOfficers.length).toBeGreaterThan(0);
      expect(activeOfficers.every(o => o.status === OfficerAccountStatus.ACTIVE)).toBe(true);

      const searchResult = await service.getOfficers({ search: 'Hà Nội' });
      expect(searchResult.length).toBeGreaterThan(0);
    });

    it('trả về danh sách cán bộ đủ điều kiện nhận bàn giao', async () => {
      const eligible = await service.getEligibleTransferees('OFF-HN-001');
      expect(eligible.length).toBeGreaterThan(0);
      expect(eligible.every(o => o.status === OfficerAccountStatus.ACTIVE)).toBe(true);
      expect(eligible.some(o => o.id === 'OFF-HN-001')).toBe(false);
    });
  });
});
