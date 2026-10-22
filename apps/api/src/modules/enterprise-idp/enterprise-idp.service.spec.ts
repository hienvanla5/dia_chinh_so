import { EnterpriseIdpService } from './enterprise-idp.service';
import { EnterpriseStaffPermission } from '@diachinhso/shared';
import { BadRequestException, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';

describe('EnterpriseIdpService (DCS-01-CN-009)', () => {
  let service: EnterpriseIdpService;

  beforeEach(() => {
    service = new EnterpriseIdpService();
  });

  describe('DCS-01-CN-009-TC-01: Luồng thành công', () => {
    it('doanh nghiệp đăng nhập thành công bằng MST và Chữ ký số điện tử', async () => {
      const result = await service.login({
        taxId: '0101234567',
        authMethod: 'DIGITAL_SIGNATURE',
        digitalSignatureCertSerial: 'CA-ENT-THUDO-8899',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.enterprise).toBeDefined();
      expect(result.enterprise.taxId).toBe('0101234567');
      expect(result.enterprise.enterpriseName).toContain('Tập đoàn Đầu tư Địa ốc Thủ Đô');
      expect(result.enterprise.parcelCount).toBe(2);
      expect(result.auditHash).toBeDefined();
      expect(result.auditHash.length).toBe(64);

      // Kiểm tra danh mục thửa đất dự án mà doanh nghiệp đang được giao/thuê
      const parcels = await service.getProjectParcels('ENT-0101234567');
      expect(parcels.length).toBe(2);
      expect(parcels[0].projectName).toContain('Sông Hồng');
      expect(parcels[0].purposeCode).toBe('TMD');
    });

    it('doanh nghiệp đăng nhập thành công bằng MST và OTP người đại diện', async () => {
      const result = await service.login({
        taxId: '0101234567',
        authMethod: 'REPRESENTATIVE_OTP',
        otpCode: '123456',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.enterprise.taxId).toBe('0101234567');
    });

    it('doanh nghiệp phân quyền thành công nhân viên phụ trách hồ sơ dự án', async () => {
      const assignResult = await service.assignStaff({
        enterpriseId: 'ENT-0101234567',
        fullName: 'Ngô Quốc Bảo',
        citizenId: '001099000777',
        email: 'bao.nq@thudoland.vn',
        phoneNumber: '0988776655',
        department: 'Ban Quản lý Dự án Số 1',
        position: 'Kỹ sư Quy hoạch & Địa chính',
        permissions: [
          EnterpriseStaffPermission.SUBMIT_DOSSIER,
          EnterpriseStaffPermission.VIEW_PARCELS,
        ],
      });

      expect(assignResult.success).toBe(true);
      expect(assignResult.staff.fullName).toBe('Ngô Quốc Bảo');
      expect(assignResult.staff.permissions).toContain(EnterpriseStaffPermission.SUBMIT_DOSSIER);
      expect(assignResult.auditHash).toBeDefined();

      const profile = await service.getEnterpriseProfile('ENT-0101234567');
      expect(profile.staffMembers.some(s => s.citizenId === '001099000777')).toBe(true);
    });
  });

  describe('DCS-01-CN-009-TC-02: Dữ liệu không hợp lệ', () => {
    it('từ chối đăng nhập khi MST không đúng định dạng', async () => {
      await expect(
        service.login({
          taxId: '12345', // Lỗi: quá ngắn
          authMethod: 'DIGITAL_SIGNATURE',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối phân quyền nhân viên khi thiếu CCCD 12 số', async () => {
      await expect(
        service.assignStaff({
          enterpriseId: 'ENT-0101234567',
          fullName: 'Nguyễn Văn Test',
          citizenId: '123', // Lỗi: không đúng 12 số
          email: 'test@thudoland.vn',
          phoneNumber: '0912345678',
          department: 'Phòng Pháp chế',
          position: 'Chuyên viên',
          permissions: [EnterpriseStaffPermission.VIEW_PARCELS],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối phân quyền khi danh sách quyền rỗng', async () => {
      await expect(
        service.assignStaff({
          enterpriseId: 'ENT-0101234567',
          fullName: 'Nguyễn Văn Test',
          citizenId: '001099000555',
          email: 'test@thudoland.vn',
          phoneNumber: '0912345678',
          department: 'Phòng Pháp chế',
          position: 'Chuyên viên',
          permissions: [], // Lỗi: rỗng
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-009-TC-03: Ràng buộc nghiệp vụ (QTD-07 & Thẩm quyền)', () => {
    it('từ chối khi mã số thuế không tồn tại trong CSDL Quốc gia', async () => {
      await expect(
        service.login({
          taxId: '9999999999',
          authMethod: 'DIGITAL_SIGNATURE',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('từ chối đăng nhập khi mã OTP đại diện pháp luật không chính xác', async () => {
      await expect(
        service.login({
          taxId: '0101234567',
          authMethod: 'REPRESENTATIVE_OTP',
          otpCode: '000000', // Giả lập OTP sai
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('từ chối khi phân quyền nhân viên đã tồn tại số CCCD trong doanh nghiệp (Conflict)', async () => {
      // Phan Thu Thảo đã tồn tại với CCCD 001192000888
      await expect(
        service.assignStaff({
          enterpriseId: 'ENT-0101234567',
          fullName: 'Phan Thu Thảo',
          citizenId: '001192000888',
          email: 'thao.pt@thudoland.vn',
          phoneNumber: '0912988776',
          department: 'Ban Pháp chế',
          position: 'Trưởng ban',
          permissions: [EnterpriseStaffPermission.VIEW_PARCELS],
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('DCS-01-CN-009-TC-04: Kiểm toán & Thu hồi quyền', () => {
    it('thu hồi thành công quyền của nhân viên kèm lưu mã băm SHA-256', async () => {
      const result = await service.removeStaff('ENT-0101234567', 'STF-002');
      expect(result.success).toBe(true);
      expect(result.auditHash).toBeDefined();

      const profile = await service.getEnterpriseProfile('ENT-0101234567');
      expect(profile.staffMembers.some(s => s.id === 'STF-002')).toBe(false);

      const logs = await service.getAuditLogs();
      expect(logs[0].action).toBe('REMOVE_STAFF');
      expect(logs[0].auditHash).toBe(result.auditHash);
    });
  });
});
