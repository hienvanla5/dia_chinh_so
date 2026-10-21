import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { JurisdictionService } from './jurisdiction.service';
import {
  UserRole,
  AdministrativeLevel,
  JurisdictionAction,
} from '@diachinhso/shared';

describe('JurisdictionService [Mô hình 2 cấp tinh gọn & CSDL 34 Tỉnh thành]', () => {
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

  describe('Cây phân cấp hành chính 2 cấp tinh gọn (34 Tỉnh thành)', () => {
    it('lấy danh mục 34 Tỉnh / Thành phố (23 tỉnh sáp nhập + 11 tỉnh giữ nguyên)', async () => {
      const hierarchy = await service.getHierarchy();
      expect(hierarchy.model).toBe('TWO_TIER_CONSOLIDATED');
      expect(hierarchy.totalProvinces).toBe(34);
      expect(hierarchy.mergedCount).toBe(23);
      expect(hierarchy.retainedCount).toBe(11);

      // Kiểm tra tỉnh giữ nguyên: Thủ đô Hà Nội
      const hanoi = hierarchy.provinces.find((p) => p.code === 'TINH_HN');
      expect(hanoi).toBeDefined();
      expect(hanoi?.name).toBe('Thành phố Hà Nội');
      expect(hanoi?.communes.length).toBeGreaterThan(0);

      // Kiểm tra xã trực thuộc trực tiếp cấp Tỉnh
      const congVi = hanoi?.communes.find((c) => c.code === 'XA_CONG_VI');
      expect(congVi).toBeDefined();
      expect(congVi?.name).toBe('Phường Cống Vị');
      expect(congVi?.parentCode).toBe('TINH_HN');

      // Kiểm tra các tỉnh sáp nhập tiêu biểu theo danh sách
      const tuyenQuang = hierarchy.provinces.find((p) => p.code === 'TINH_TUYENQUANG');
      expect(tuyenQuang).toBeDefined();
      expect(tuyenQuang?.name).toBe('Tỉnh Tuyên Quang');
      expect(tuyenQuang?.formerUnits).toContain('Tuyên Quang');
      expect(tuyenQuang?.formerUnits).toContain('Hà Giang');

      const phuTho = hierarchy.provinces.find((p) => p.code === 'TINH_PHUTHO');
      expect(phuTho).toBeDefined();
      expect(phuTho?.name).toBe('Tỉnh Phú Thọ');
      expect(phuTho?.formerUnits).toContain('Vĩnh Phúc');
      expect(phuTho?.formerUnits).toContain('Hòa Bình');

      const bacNinh = hierarchy.provinces.find((p) => p.code === 'TINH_BACNINH');
      expect(bacNinh).toBeDefined();
      expect(bacNinh?.name).toBe('Tỉnh Bắc Ninh');
      expect(bacNinh?.formerUnits).toContain('Bắc Giang');

      const vinhLong = hierarchy.provinces.find((p) => p.code === 'TINH_VINHLONG');
      expect(vinhLong).toBeDefined();
      expect(vinhLong?.name).toBe('Tỉnh Vĩnh Long');
      expect(vinhLong?.formerUnits).toContain('Bến Tre');
      expect(vinhLong?.formerUnits).toContain('Trà Vinh');

      // Kiểm tra tỉnh giữ nguyên: Thừa Thiên Huế, Lai Châu, Điện Biên
      const hue = hierarchy.provinces.find((p) => p.code === 'TINH_HUE');
      expect(hue).toBeDefined();
      expect(hue?.name).toBe('Thành phố Huế');

      const laiChau = hierarchy.provinces.find((p) => p.code === 'TINH_LAICHAU');
      expect(laiChau).toBeDefined();
      expect(laiChau?.name).toBe('Tỉnh Lai Châu');
    });
  });

  describe('TC-01: Luồng thành công theo mô hình 2 cấp', () => {
    it('Quản trị viên cấu hình chính sách phân quyền cấp Tỉnh thành công', async () => {
      const result = await service.configurePolicy({
        role: UserRole.LAND_REGISTRAR,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_BACNINH',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
          JurisdictionAction.APPROVE,
        ],
        description: 'Văn phòng Đăng ký Đất đai Tỉnh Bắc Ninh',
      });

      expect(result.success).toBe(true);
      expect(result.policy.unitCode).toBe('TINH_BACNINH');
      expect(result.policy.unitName).toBe('Tỉnh Bắc Ninh');
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

    it('Đánh giá quyền thành công: Cán bộ cấp Tỉnh thẩm định trực tiếp hồ sơ xã/phường trực thuộc', async () => {
      const evalResult = await service.evaluatePermission({
        userRole: UserRole.LAND_REGISTRAR,
        userUnitCode: 'TINH_HN',
        action: JurisdictionAction.APPROVE,
        targetUnitCode: 'XA_CONG_VI',
      });

      expect(evalResult.granted).toBe(true);
      expect(evalResult.userLevel).toBe(AdministrativeLevel.PROVINCE);
      expect(evalResult.targetLevel).toBe(AdministrativeLevel.COMMUNE);
      expect(evalResult.auditHash).toBeDefined();
    });

    it('Đánh giá quyền thành công: Quản trị viên hệ thống có toàn quyền trên 34 tỉnh thành', async () => {
      const evalResult = await service.evaluatePermission({
        userRole: UserRole.ADMIN,
        userUnitCode: 'TINH_HN',
        action: JurisdictionAction.DELETE,
        targetUnitCode: 'XA_BEN_NGHE',
      });

      expect(evalResult.granted).toBe(true);
      expect(evalResult.auditHash).toBeDefined();
    });
  });

  describe('TC-02: Dữ liệu không hợp lệ', () => {
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

    it('từ chối khi mã đơn vị hành chính không tồn tại', async () => {
      await expect(
        service.configurePolicy({
          role: UserRole.COMMUNE_OFFICER,
          level: AdministrativeLevel.COMMUNE,
          unitCode: 'DON_VI_KHONG_TON_TAI_999',
          allowedActions: [JurisdictionAction.READ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi cấp hành chính không tương thích với đơn vị', async () => {
      await expect(
        service.configurePolicy({
          role: UserRole.COMMUNE_OFFICER,
          level: AdministrativeLevel.COMMUNE,
          unitCode: 'TINH_HN',
          allowedActions: [JurisdictionAction.READ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('TC-03: Ràng buộc nghiệp vụ phân cấp địa giới (QTD-16)', () => {
    it('chặn ngay lập tức khi cán bộ xã thao tác trên địa bàn xã khác', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.UPDATE,
          targetUnitCode: 'XA_LIEU_GIAI',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn cán bộ xã khi thao tác trên địa bàn xã thuộc tỉnh khác', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.COMMUNE_OFFICER,
          userUnitCode: 'XA_CONG_VI',
          action: JurisdictionAction.READ,
          targetUnitCode: 'XA_BEN_NGHE',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn cán bộ tỉnh này khi thao tác trên địa bàn tỉnh khác', async () => {
      await expect(
        service.evaluatePermission({
          userRole: UserRole.LAND_REGISTRAR,
          userUnitCode: 'TINH_HN',
          action: JurisdictionAction.APPROVE,
          targetUnitCode: 'XA_BEN_NGHE',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('TC-04: Kiểm toán & Đồng bộ', () => {
    it('sinh mã băm SHA-256 bất biến khi cấu hình chính sách', async () => {
      const result = await service.configurePolicy({
        role: UserRole.NOTARY_BANK,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_DN',
        allowedActions: [JurisdictionAction.READ],
      });

      expect(result.auditHash).toBeDefined();
      expect(result.auditHash).toMatch(/^[a-f0-9]{64}$/);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('ghi nhận nhật ký kiểm toán vi phạm khi phát hiện vượt quyền địa giới', async () => {
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
