import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ParcelService } from './parcel.service';
import {
  LandPurposeCode,
  ParcelLegalStatus,
  DeclareNewParcelInput,
} from '@diachinhso/shared';

describe('ParcelService [DCS-02-CN-001] Khai báo thông tin thuộc tính thửa đất mới', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  const validParcelInput: DeclareNewParcelInput = {
    communeCode: '01001',
    communeName: 'Phường Điện Biên',
    provinceCode: 'TINH_HN',
    provinceName: 'Thành phố Hà Nội',
    sheetNumber: 15,
    parcelNumber: 88,
    area: 150.5,
    purposeCode: LandPurposeCode.ODT,
    address: 'Số 98 Hoàng Diệu, Phường Điện Biên',
    verticesVN2000: [
      { x: 2325500.1, y: 589200.2 },
      { x: 2325515.5, y: 589215.8 },
      { x: 2325505.2, y: 589230.1 },
      { x: 2325490.0, y: 589214.5 },
    ],
    surveyDocumentNumber: 'TĐ-2026/099/VPĐK-HN',
    ownerName: 'Nguyễn Văn Minh',
    ownerCitizenId: '001095112233',
    officerId: 'CB-HN-001',
    officerCommuneCode: '01001',
    notes: 'Khai báo theo hồ sơ đo đạc địa chính chính quy',
  };

  describe('DCS-02-CN-001-TC-01: Luồng thành công - Khai báo thuộc tính thửa đất mới', () => {
    it('phải khai báo thành công thửa đất mới và chuyển sang trạng thái PENDING_APPRAISAL', async () => {
      const response = await service.declareNewParcel(validParcelInput);

      expect(response.success).toBe(true);
      expect(response.parcel).toBeDefined();
      expect(response.parcel.nationalCode).toBe('01001-0015-0088');
      expect(response.parcel.legalStatus).toBe(ParcelLegalStatus.PENDING_APPRAISAL);
      expect(response.parcel.area).toBe(150.5);
      expect(response.parcel.purposeCode).toBe(LandPurposeCode.ODT);
      expect(response.parcel.boundaryGeojson).toBeDefined();
      expect(response.parcel.boundaryGeojson.type).toBe('Polygon');
      expect(response.auditHash).toHaveLength(64);
      expect(response.message).toContain('chờ thẩm định tại Chi nhánh Văn phòng Đăng ký Đất đai');

      // Tra cứu lại trong danh sách
      const found = await service.findByNationalCode('01001-0015-0088');
      expect(found).toBeDefined();
      expect(found.id).toBe(response.parcel.id);
      expect(found.ownerName).toBe('Nguyễn Văn Minh');
    });

    it('phải lấy số liệu thống kê thửa đất chính xác', async () => {
      const initialStats = await service.getSummaryStats();
      const initialTotal = initialStats.total;
      const initialPending = initialStats.pendingAppraisal;

      await service.declareNewParcel({
        ...validParcelInput,
        sheetNumber: 20,
        parcelNumber: 99,
      });

      const updatedStats = await service.getSummaryStats();
      expect(updatedStats.total).toBe(initialTotal + 1);
      expect(updatedStats.pendingAppraisal).toBe(initialPending + 1);
    });
  });

  describe('DCS-02-CN-001-TC-02: Dữ liệu không hợp lệ & Validation', () => {
    it('phải từ chối khi diện tích thửa đất nhỏ hơn hoặc bằng 0', async () => {
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          area: 0,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          area: -50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi số tờ bản đồ hoặc số thửa đất không hợp lệ', async () => {
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          sheetNumber: 0,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          parcelNumber: -1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi danh sách đỉnh tọa độ VN-2000 ít hơn 3 đỉnh', async () => {
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          verticesVN2000: [
            { x: 2325500.1, y: 589200.2 },
            { x: 2325515.5, y: 589215.8 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi tọa độ đỉnh VN-2000 có giá trị âm hoặc bằng 0', async () => {
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          verticesVN2000: [
            { x: -100, y: 589200.2 },
            { x: 2325515.5, y: 589215.8 },
            { x: 2325505.2, y: 589230.1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-02-CN-001-TC-03: Ràng buộc nghiệp vụ (QTD-01 & QTD-16)', () => {
    it('phải chặn cán bộ khi khai báo thửa đất ngoài phạm vi thẩm quyền địa giới (QTD-16)', async () => {
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          communeCode: '01002', // Xã khác
          officerCommuneCode: '01001', // Cán bộ thuộc xã 01001
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải cho phép Quản trị viên (ADMIN) khai báo liên địa giới', async () => {
      const response = await service.declareNewParcel({
        ...validParcelInput,
        communeCode: '01002',
        sheetNumber: 30,
        parcelNumber: 50,
        officerId: 'ADMIN',
        officerCommuneCode: 'ALL',
      });

      expect(response.success).toBe(true);
      expect(response.parcel.nationalCode).toBe('01002-0030-0050');
    });

    it('phải phát hiện và từ chối khi trùng lặp mã thửa trong cùng đơn vị hành chính xã (QTD-01)', async () => {
      // Đã có thửa '01001-0012-0045' trong dữ liệu mẫu ban đầu
      await expect(
        service.declareNewParcel({
          ...validParcelInput,
          communeCode: '01001',
          sheetNumber: 12,
          parcelNumber: 45,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('DCS-02-CN-001-TC-04: Kiểm toán & Toàn vẹn dữ liệu (QTD-20)', () => {
    it('phải gắn mã băm SHA-256 bất biến khi khai báo thửa đất mới', async () => {
      const res = await service.declareNewParcel({
        ...validParcelInput,
        sheetNumber: 40,
        parcelNumber: 77,
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.parcel.auditHash).toBe(res.auditHash);
    });

    it('phải cập nhật trạng thái pháp lý của thửa đất hợp lệ', async () => {
      const created = await service.declareNewParcel({
        ...validParcelInput,
        sheetNumber: 50,
        parcelNumber: 60,
      });

      const updated = await service.updateLegalStatus(
        created.parcel.id,
        ParcelLegalStatus.AVAILABLE,
      );

      expect(updated.legalStatus).toBe(ParcelLegalStatus.AVAILABLE);
    });

    it('phải ném NotFoundException khi tra cứu ID không tồn tại', async () => {
      await expect(service.findById('PARCEL-NON-EXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});


describe('ParcelService [DCS-02-CN-002] Sinh Mã định danh thửa đất quốc gia duy nhất', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-002-TC-01: Luồng thành công - Tự động sinh mã định danh và Spatial UID', () => {
    it('phải sinh thành công mã định danh quốc gia theo chuẩn cấu trúc và Spatial UID', async () => {
      const res = await service.generateNationalCode({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 15,
        parcelNumber: 88,
        centroidX: 2325505.5,
        centroidY: 589215.2,
      });

      expect(res.nationalCode).toBe('01001-0015-00088-00');
      expect(res.shortCode).toBe('01001-0015-0088');
      expect(res.spatialUid).toBe('VN-3405-01001-X2325506-Y589215');
      expect(res.components.communeCode).toBe('01001');
      expect(res.components.sheetNumber).toBe(15);
      expect(res.components.parcelNumber).toBe(88);
      expect(res.components.checksum).toBeDefined();
      expect(res.isUnique).toBe(true);
      expect(res.auditHash).toHaveLength(64);
      expect(res.qrCodePayload).toContain('DCS:VN:01001-0015-00088-00');
    });

    it('phải hỗ trợ hậu tố phân nhánh thời gian khi tách/hợp thửa', async () => {
      const res = await service.generateNationalCode({
        communeCode: '79001',
        provinceCode: 'TINH_HCM',
        sheetNumber: 5,
        parcelNumber: 120,
        subdivisionBranch: '02',
      });

      expect(res.nationalCode).toBe('79001-0005-00120-02');
      expect(res.components.branchSuffix).toBe('02');
    });

    it('phải thẩm tra hợp lệ mã định danh đúng quy chuẩn quốc gia', async () => {
      const res = await service.validateNationalCode('01001-0015-00088-00');

      expect(res.isValid).toBe(true);
      expect(res.components?.communeCode).toBe('01001');
      expect(res.components?.sheetNumber).toBe(15);
      expect(res.components?.parcelNumber).toBe(88);
    });
  });

  describe('DCS-02-CN-002-TC-02: Dữ liệu không hợp lệ & Từ chối định dạng sai', () => {
    it('phải từ chối khi số tờ hoặc số thửa nhỏ hơn hoặc bằng 0', async () => {
      await expect(
        service.generateNationalCode({
          communeCode: '01001',
          provinceCode: 'TINH_HN',
          sheetNumber: 0,
          parcelNumber: 50,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.generateNationalCode({
          communeCode: '01001',
          provinceCode: 'TINH_HN',
          sheetNumber: 10,
          parcelNumber: -5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi mã xã không hợp lệ hoặc rỗng', async () => {
      await expect(
        service.generateNationalCode({
          communeCode: '',
          provinceCode: 'TINH_HN',
          sheetNumber: 10,
          parcelNumber: 20,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải trả về isValid = false khi thẩm tra mã định danh sai định dạng cấu trúc', async () => {
      const resInvalid = await service.validateNationalCode('MA-THUA-KHONG-DUNG-CHUAN');
      expect(resInvalid.isValid).toBe(false);
      expect(resInvalid.errorReason).toBeDefined();

      const resEmpty = await service.validateNationalCode('');
      expect(resEmpty.isValid).toBe(false);
    });
  });

  describe('DCS-02-CN-002-TC-03: Ràng buộc duy nhất toàn quốc (QTD-01)', () => {
    it('phải phát hiện cảnh báo khi mã định danh đã tồn tại trong CSDL', async () => {
      await service.declareNewParcel({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 20,
        parcelNumber: 99,
        area: 120,
        purposeCode: LandPurposeCode.ONT,
        address: 'Số 10 Phố Phan Đình Phùng',
        verticesVN2000: [
          { x: 2325000, y: 589000 },
          { x: 2325010, y: 589010 },
          { x: 2325000, y: 589010 },
        ],
        surveyDocumentNumber: 'HS-2026-99',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      const genRes = await service.generateNationalCode({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 20,
        parcelNumber: 99,
      });

      expect(genRes.isUnique).toBe(false);
      expect(genRes.message).toContain('Cảnh báo');

      const valRes = await service.validateNationalCode('01001-0020-0099');
      expect(valRes.isValid).toBe(true);
      expect(valRes.isRegisteredInDatabase).toBe(true);
    });
  });

  describe('DCS-02-CN-002-TC-04: Toàn vẹn & Mã băm kiểm toán', () => {
    it('phải sinh mã băm SHA-256 nhất quán và mã QR phục vụ tra cứu số hóa', async () => {
      const res = await service.generateNationalCode({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 35,
        parcelNumber: 42,
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.qrCodePayload).toMatch(/^DCS:VN:01001-0035-00042-00:VN-3405-01001-X\d+-Y\d+:CS\d+$/);
    });
  });
});
