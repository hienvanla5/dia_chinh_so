import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { JurisdictionService } from './jurisdiction.service';
import {
  UserRole,
  AdministrativeLevel,
  JurisdictionAction,
} from '@diachinhso/shared';

describe('JurisdictionService [DCS-01-CN-003]', () => {
  let service: JurisdictionService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(true),
      }),
    };

    service = new JurisdictionService(mockDb);
  });

  it('nên khởi tạo dịch vụ thành công', () => {
    expect(service).toBeDefined();
  });

  describe('Cây phân cấp hành chính 3 cấp (Hierarchy)', () => {
    it('lấy danh mục 3 cấp Tỉnh - Huyện - Xã chuẩn hóa', async () => {
      const hierarchy = await service.getHierarchy();
      expect(hierarchy.totalUnits).toBeGreaterThan(0);
      expect(hierarchy.provinces.length).toBeGreaterThan(0);

      const hanoi = hierarchy.provinces.find((p) => p.code === 'TINH_HN');
      expect(hanoi).toBeDefined();
      expect(hanoi?.districts.length).toBeGreaterThan(0);

      const baDinh = hanoi?.districts.find((d) => d.code === 'HUYEN_BD');
      expect(baDinh).toBeDefined();
      expect(baDinh?.communes.length).toBeGreaterThan(0);

      const congVi = baDinh?.communes.find((c) => c.code === 'XA_CONG_VI');
      expect(congVi).toBeDefined();
      expect(congVi?.name).toBe('Phường Cống Vị');
    });
  });

  describe('DCS-01-CN-003-TC-01: Luồng thành công', () => {
    it('Quản trị viên cấu hình chính sách phân quyền cấp Huyện thành công', async () => {
      const result = await service.configurePolicy({
        role: UserRole.LAND_REGISTRAR,
        level: AdministrativeLevel.DISTRICT,
        unitCode: 'HUYEN_HK',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
          JurisdictionAction.APPROVE,
        ],
        description: 'Văn phòng Đăng ký Đất đai Hoàn Kiếm',
      });

      expect(result.success).toBe(true);
      expect(result.policy.unitCode).toBe('HUYEN_HK');
      expect(result.policy.unitName).toBe('Quận Hoàn Kiếm');
      expect(result.policy.allowedActions).toContain(JurisdictionAction.APPROVE);
      expect(result.auditHash).toBeDefined();
      expect(result.auditHash).toHaveLength(64);
    });

    it('Đánh giá quyền thành công: Cán bộ cấp Xã thao tác trên đúng địa bàn quản lý', async () => {
      const evalResult = await service.evaluatePermission({
        userRole: UserRole.COMMUNE_OFFICER,
        userUnitCode: 'XA_CONG_VI',
        action: JurisdictionAction.READ,
        targetUnitCode: 'XA_CONG_VI',
      });

      expect(evalResult.granted).toBe(true);
      expect(evalResult.userLevel).toBe(AdministrativeLevel.COMMUNE);
      expect(evalResult.targetLevel).toBe(AdministrativeLevel.COMMUNE);
      expect(evalResult.auditHash).toHaveLength(64);
    });

    it('Đánh giá quyền thành công: Cán bộ cấp Huyện thẩm định hồ sơ xã trực thuộc', async () => {
      const evalResult = await service.evaluatePermission({
        userRole: UserRole.LAND_REGISTRAR,
        userUnitCode: 'HUYEN_BD',
        action: JurisdictionAction.APPROVE,
        targetUnitCode: 'XA_CONG_VI', // Cống Vị trực thuộc Ba Đình
      });

      expect(evalResult.granted).toBe(true);
      expect(evalResult.userLevel).toBe(AdministrativeLevel.DISTRICT);
      expect(evalResult.targetLevel).toBe(AdministrativeLevel.COMMUNE);
      expect(evalResult.auditHash).toBeDefined();
    });

    it('Đánh giá quyền thành công: Quản trị viên hệ thống có toàn quyền trên mọi đơn vị', async () => {
      const evalResult = await service.evaluatePermission({
        userRole: UserRole.ADMIN,
        userUnitCode: 'TINH_HN',
        action: JurisdictionAction.DELETE,
        targetUnitCode: 'XA_BEN_NGHE', // TP.HCM
      });

      expect(evalResult.granted).toBe(true);
      expect(evalResult.auditHash).toBeDefined();
    });
  });

  describe('DCS-01-CN-003-TC-02: Dữ liệu không hợp lệ', () => {
    it('từ chối khi danh sách thao tác được phép bị rỗng', async () => {
      await expect(
        service.configurePolicy({
          role: UserRole.COMMUNE_OFFICER,
          level: AdministrativeLevel.COMMUNE,
          unitCode: 'XA_CONG_VI',
          allowedActions: [] as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi mã đơn vị hành chính không tồn tại trong danh mục 3 cấp', async () => {
      await expect(
        service.configurePolicy({
          role: UserRole.COMMUNE_OFFICER,
          level: AdministrativeLevel.COMMUNE,
          unitCode: 'DON_VI_KHONG_TON_TAI_999',
          allowedActions: [JurisdictionAction.READ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi cấp hành chính không tương thích với đơn vị (Cấp xã nhưng chọn Tỉnh)', async () => {
      await expect(
        service.configurePolicy({
          role: UserRole.COMMUNE_OFFICER,
          level: AdministrativeLevel.COMMUNE,
          unitCode: 'TINH_HN', // Hà Nội là cấp PROVINCE, không phải COMMUNE
          allowedActions: [JurisdictionAction.READ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối đánh giá khi mã đơn vị của người dùng không tồn tại', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'MA_SAI_123',
          action: JurisdictionAction.READ,
          targetUnitCode: 'XA_CONG_VI',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối đánh giá khi mã đơn vị dữ liệu mục tiêu không tồn tại', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.READ,
          targetUnitCode: 'MA_TARGET_SAI_999',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-003-TC-03: Ràng buộc nghiệp vụ QTD-16', () => {
    it('chặn ngay lập tức khi cán bộ xã thao tác trên địa bàn xã khác cùng huyện', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.UPDATE,
          targetUnitCode: 'XA_LIEU_GIAI', // Liễu Giai khác Cống Vị
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn ngay lập tức khi cán bộ xã thao tác trên địa bàn quận khác', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.READ,
          targetUnitCode: 'XA_TRANG_TIEN', // Tràng Tiền thuộc Hoàn Kiếm
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn cán bộ huyện khi thao tác trên địa bàn huyện khác', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.LAND_REGISTRAR,
          userUnitCode: 'HUYEN_BD', // Ba Đình
          action: JurisdictionAction.APPROVE,
          targetUnitCode: 'XA_TRANG_TIEN', // Tràng Tiền thuộc Hoàn Kiếm
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DCS-01-CN-003-TC-04: Kiểm toán & Đồng bộ', () => {
    it('sinh mã băm SHA-256 bất biến khi cấu hình chính sách phân quyền', async () => {
      const result = await service.configurePolicy({
        role: UserRole.NOTARY_BANK,
        level: AdministrativeLevel.DISTRICT,
        unitCode: 'HUYEN_CG',
        allowedActions: [JurisdictionAction.READ],
      });

      expect(result.auditHash).toBeDefined();
      expect(result.auditHash).toMatch(/^[a-f0-9]{64}$/);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('ghi nhận nhật ký kiểm toán vi phạm khi phát hiện vượt quyền địa giới (QTD-16)', async () => {
      try {
        await service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.DELETE,
          targetUnitCode: 'XA_BEN_NGHE',
        });
      } catch (err: any) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(mockDb.insert).toHaveBeenCalled();
      }
    });
  });
});
