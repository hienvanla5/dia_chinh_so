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
  LandOriginType,
  LandUseTermType,
  PropertyOnLandType,
  ConstructionGrade,
  ExpiryWarningStatus,
  OwnerFluctuationType,
  OwnerFluctuationStatus,
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


describe('ParcelService [DCS-02-CN-003] Quản lý vòng đời thửa đất: Tách thửa và hợp thửa', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-003-TC-01: Luồng thành công - Tách thửa, Hợp thửa và Cây gia phả (Lineage)', () => {
    it('phải tách thửa thành công, chuyển thửa gốc sang HISTORICAL và sinh các thửa con hợp lệ', async () => {
      // PARCEL-HN-001 có diện tích 125.8m2, Tờ 12, Thửa 45, Xã 01001, ODT, AVAILABLE
      const res = await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-TÁCH-2026/01/UBND',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
        newParcels: [
          {
            parcelNumber: 101,
            area: 60.0,
            address: 'Số 15A Điện Biên Phủ, Phường Điện Biên',
            ownerName: 'Trần Văn Hoàng (Cha)',
          },
          {
            parcelNumber: 102,
            area: 65.8,
            address: 'Số 15B Điện Biên Phủ, Phường Điện Biên',
            ownerName: 'Trần Văn Long (Con)',
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.parentParcel.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
      expect(res.parentParcel.isHistorical).toBe(true);
      expect(res.parentParcel.childParcelIds).toHaveLength(2);
      expect(res.childParcels).toHaveLength(2);

      // Thửa con 1
      expect(res.childParcels[0].parentParcelId).toBe('PARCEL-HN-001');
      expect(res.childParcels[0].nationalCode).toBe('01001-0012-0101');
      expect(res.childParcels[0].area).toBe(60.0);
      expect(res.childParcels[0].legalStatus).toBe(ParcelLegalStatus.AVAILABLE);

      // Thửa con 2
      expect(res.childParcels[1].parentParcelId).toBe('PARCEL-HN-001');
      expect(res.childParcels[1].nationalCode).toBe('01001-0012-0102');
      expect(res.childParcels[1].area).toBe(65.8);

      // Mã băm kiểm toán
      expect(res.auditHash).toHaveLength(64);
    });

    it('phải hợp thửa thành công các thửa đất liền kề cùng mục đích và đóng lịch sử các thửa tiền thân', async () => {
      // Khai báo 2 thửa ODT liền kề trên xã 01001
      const p1 = await service.declareNewParcel({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 30,
        parcelNumber: 1,
        area: 70.0,
        purposeCode: LandPurposeCode.ODT,
        address: 'Số 1 Phố Hàng Chuối',
        verticesVN2000: [{ x: 2325000, y: 589000 }, { x: 2325010, y: 589010 }, { x: 2325000, y: 589010 }],
        surveyDocumentNumber: 'HS-TD-01',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });
      await service.updateLegalStatus(p1.parcel.id, ParcelLegalStatus.AVAILABLE);

      const p2 = await service.declareNewParcel({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 30,
        parcelNumber: 2,
        area: 80.0,
        purposeCode: LandPurposeCode.ODT,
        address: 'Số 3 Phố Hàng Chuối',
        verticesVN2000: [{ x: 2325010, y: 589000 }, { x: 2325020, y: 589010 }, { x: 2325010, y: 589010 }],
        surveyDocumentNumber: 'HS-TD-02',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });
      await service.updateLegalStatus(p2.parcel.id, ParcelLegalStatus.AVAILABLE);

      // Thực hiện hợp thửa
      const mergeRes = await service.mergeParcels({
        sourceParcelIds: [p1.parcel.id, p2.parcel.id],
        newParcelNumber: 99,
        sheetNumber: 30,
        decisionNumber: 'QĐ-HỢP-2026/02/UBND',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
        ownerName: 'Công ty Cổ phần Thương mại Thủ Đô',
      });

      expect(mergeRes.success).toBe(true);
      expect(mergeRes.mergedParcel.area).toBe(150.0);
      expect(mergeRes.mergedParcel.nationalCode).toBe('01001-0030-0099');
      expect(mergeRes.mergedParcel.mergedFromParcelIds).toContain(p1.parcel.id);
      expect(mergeRes.mergedParcel.mergedFromParcelIds).toContain(p2.parcel.id);

      // Các thửa tiền thân phải chuyển sang HISTORICAL (QTD-02)
      const old1 = await service.findById(p1.parcel.id);
      const old2 = await service.findById(p2.parcel.id);
      expect(old1.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
      expect(old2.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
    });

    it('phải truy xuất chính xác cây gia phả biến động (Lineage DAG)', async () => {
      // Tách PARCEL-HN-001
      const subRes = await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-TÁCH-2026/01/UBND',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
        newParcels: [
          { parcelNumber: 201, area: 60.0 },
          { parcelNumber: 202, area: 65.8 },
        ],
      });

      const childId = subRes.childParcels[0].id;
      const lineage = await service.getParcelLineage(childId);

      expect(lineage.parcelId).toBe(childId);
      expect(lineage.parents).toHaveLength(1);
      expect(lineage.parents[0].id).toBe('PARCEL-HN-001');
      expect(lineage.lineageNodes.some((n) => n.relationship === 'PARENT')).toBe(true);
      expect(lineage.lineageNodes.some((n) => n.relationship === 'CURRENT')).toBe(true);
    });
  });

  describe('DCS-02-CN-003-TC-02: Dữ liệu không hợp lệ & Ràng buộc diện tích (QTD-08)', () => {
    it('phải từ chối tách thửa nếu danh sách thửa con ít hơn 2 thửa', async () => {
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001',
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HN-001',
          newParcels: [{ parcelNumber: 101, area: 125.8 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu có thửa con nhỏ hơn hạn mức tối thiểu (QTD-08)', async () => {
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001',
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HN-001',
          newParcels: [
            { parcelNumber: 101, area: 25.0 }, // Nhỏ hơn 30m2 ODT
            { parcelNumber: 102, area: 100.8 },
          ],
        }),
      ).rejects.toThrow(/nhỏ hơn hạn mức tối thiểu/);
    });

    it('phải từ chối nếu tổng diện tích các thửa con không khớp với thửa gốc', async () => {
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001',
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HN-001',
          newParcels: [
            { parcelNumber: 101, area: 50.0 },
            { parcelNumber: 102, area: 50.0 }, // Tổng 100m2 != 125.8m2
          ],
        }),
      ).rejects.toThrow(/không khớp với diện tích thửa đất gốc/);
    });

    it('phải từ chối nếu các thửa con trùng số thứ tự thửa', async () => {
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001',
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HN-001',
          newParcels: [
            { parcelNumber: 101, area: 60.0 },
            { parcelNumber: 101, area: 65.8 }, // Trùng 101
          ],
        }),
      ).rejects.toThrow(/không được trùng số thứ tự thửa/);
    });
  });

  describe('DCS-02-CN-003-TC-03: Ràng buộc nghiệp vụ (QTD-02, QTD-16, QTD-31, Lock)', () => {
    it('phải từ chối hợp thửa nếu các thửa đất không cùng mục đích sử dụng (QTD-31)', async () => {
      // PARCEL-HN-001 (ODT) và PARCEL-HCM-001 (TMD)
      await expect(
        service.mergeParcels({
          sourceParcelIds: ['PARCEL-HN-001', 'PARCEL-HCM-001'],
          newParcelNumber: 999,
          decisionNumber: 'QĐ-2026/05',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(/QTD-31/);
    });

    it('phải chặn cán bộ ngoài địa bàn thẩm quyền thực hiện tách thửa (QTD-16)', async () => {
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001', // Thuộc xã 01001
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HCM-001',
          officerCommuneCode: '79001', // Cán bộ thuộc xã 79001
          newParcels: [
            { parcelNumber: 101, area: 60.0 },
            { parcelNumber: 102, area: 65.8 },
          ],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải chặn tách thửa khi thửa đất đang ở trạng thái LOCKED hoặc DISPUTED', async () => {
      // PARCEL-HN-002 đang ở trạng thái LOCKED
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-002',
          decisionNumber: 'QĐ-2026/01',
          officerId: 'CB-HN-001',
          officerCommuneCode: '01001',
          newParcels: [
            { parcelNumber: 105, area: 49.0 },
            { parcelNumber: 106, area: 49.4 },
          ],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải từ chối tách thửa đối với thửa đất đã chuyển sang HISTORICAL (QTD-02)', async () => {
      // Tách PARCEL-HN-001 lần 1
      await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-2026/01',
        officerId: 'ADMIN',
        newParcels: [
          { parcelNumber: 111, area: 60.0 },
          { parcelNumber: 112, area: 65.8 },
        ],
      });

      // Cố gắng tách tiếp thửa PARCEL-HN-001 (đã là HISTORICAL)
      await expect(
        service.subdivideParcel({
          parentParcelId: 'PARCEL-HN-001',
          decisionNumber: 'QĐ-2026/02',
          officerId: 'ADMIN',
          newParcels: [
            { parcelNumber: 113, area: 60.0 },
            { parcelNumber: 114, area: 65.8 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-02-CN-003-TC-04: Toàn vẹn & Bất biến lịch sử CSDL (QTD-02)', () => {
    it('thửa đất gốc sau khi tách vẫn tồn tại trong CSDL và tra cứu được', async () => {
      await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-2026/01',
        officerId: 'ADMIN',
        newParcels: [
          { parcelNumber: 121, area: 60.0 },
          { parcelNumber: 122, area: 65.8 },
        ],
      });

      const parentInDb = await service.findById('PARCEL-HN-001');
      expect(parentInDb).toBeDefined();
      expect(parentInDb.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
      expect(parentInDb.isHistorical).toBe(true);
    });
  });
});


describe('ParcelService [DCS-02-CN-004] Quản lý nguồn gốc sử dụng đất theo Luật Đất đai 2024', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-004-TC-01: Luồng thành công - Phân loại nguồn gốc đất và xác định quyền năng', () => {
    it('phải cập nhật nguồn gốc Nhà nước giao đất có thu tiền sử dụng đất và kích hoạt đầy đủ quyền chuyển nhượng/thế chấp', async () => {
      const res = await service.updateLandOrigin({
        parcelId: 'PARCEL-HN-001',
        originType: LandOriginType.ALLOCATED_WITH_FEE,
        decisionNumber: 'QĐ-GIAO-2026/088/UBND-HN',
        decisionDate: '2026-05-15',
        grantingAuthority: 'UBND Thành phố Hà Nội',
        financialStatus: 'PAID',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      expect(res.success).toBe(true);
      expect(res.originType).toBe(LandOriginType.ALLOCATED_WITH_FEE);
      expect(res.originName).toBe('Nhà nước giao đất có thu tiền sử dụng đất');
      expect(res.legalRights.canTransfer).toBe(true);
      expect(res.legalRights.canMortgage).toBe(true);
      expect(res.parcel.originType).toBe(LandOriginType.ALLOCATED_WITH_FEE);
      expect(res.auditHash).toHaveLength(64);
    });

    it('phải giới hạn quyền chuyển nhượng quyền sử dụng đất khi thuê đất trả tiền hàng năm (LEASED_ANNUAL)', async () => {
      const res = await service.updateLandOrigin({
        parcelId: 'PARCEL-HCM-001',
        originType: LandOriginType.LEASED_ANNUAL,
        decisionNumber: 'QĐ-THUÊ-2026/012/UBND-HCM',
        decisionDate: '2026-06-20',
        grantingAuthority: 'UBND Thành phố Hồ Chí Minh',
        financialStatus: 'ANNUAL_PAYMENT',
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.legalRights.canTransfer).toBe(false);
      expect(res.legalRights.canMortgage).toBe(false);
      expect(res.legalRights.description.toLowerCase()).toContain('không được chuyển nhượng quyền sử dụng đất');
    });

    it('phải thẩm định hợp lệ khi tách thửa đất nông nghiệp đạt hạn mức canh tác tối thiểu (>= 500m2)', async () => {
      // Khai báo một thửa đất nông nghiệp LUC diện tích 1500m2
      const agriParcel = await service.declareNewParcel({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 50,
        parcelNumber: 888,
        area: 1500.0,
        purposeCode: LandPurposeCode.LUC,
        address: 'Khu đồng Bãi Cát, Xã Điện Biên',
        verticesVN2000: [{ x: 2325000, y: 589000 }, { x: 2325050, y: 589050 }, { x: 2325000, y: 589050 }],
        surveyDocumentNumber: 'HS-LUC-2026',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      const res = await service.validateAgriculturalSubdivision({
        parcelId: agriParcel.parcel.id,
        newParcelsArea: [700.0, 800.0],
        minCultivationArea: 500.0,
      });

      expect(res.isEligible).toBe(true);
      expect(res.ineligibleAreas).toHaveLength(0);
      expect(res.message).toContain('đủ điều kiện');
    });
  });

  describe('DCS-02-CN-004-TC-02: Dữ liệu không hợp lệ & Validation', () => {
    it('phải từ chối thẩm định đất nông nghiệp trên thửa đất phi nông nghiệp (ODT)', async () => {
      await expect(
        service.validateAgriculturalSubdivision({
          parcelId: 'PARCEL-HN-001', // Thửa đất ODT
          newParcelsArea: [60.0, 65.8],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải ném NotFoundException khi cập nhật nguồn gốc thửa đất không tồn tại', async () => {
      await expect(
        service.updateLandOrigin({
          parcelId: 'PARCEL-NOT-FOUND',
          originType: LandOriginType.TRANSFERRED,
          decisionNumber: 'QĐ-01',
          decisionDate: '2026-01-01',
          grantingAuthority: 'UBND',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DCS-02-CN-004-TC-03: Ràng buộc nghiệp vụ (QTD-26, QTD-16, Lock)', () => {
    it('phải từ chối tách thửa đất nông nghiệp dưới hạn mức canh tác tối thiểu (QTD-26)', async () => {
      const agriParcel = await service.declareNewParcel({
        communeCode: '01001',
        provinceCode: 'TINH_HN',
        sheetNumber: 55,
        parcelNumber: 777,
        area: 900.0,
        purposeCode: LandPurposeCode.CLN,
        address: 'Vườn cây lâu năm Xã Điện Biên',
        verticesVN2000: [{ x: 2325000, y: 589000 }, { x: 2325030, y: 589030 }, { x: 2325000, y: 589030 }],
        surveyDocumentNumber: 'HS-CLN-2026',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      const res = await service.validateAgriculturalSubdivision({
        parcelId: agriParcel.parcel.id,
        newParcelsArea: [450.0, 450.0], // Cả hai thửa đều < 500m2
        minCultivationArea: 500.0,
      });

      expect(res.isEligible).toBe(false);
      expect(res.ineligibleAreas).toContain(450.0);
      expect(res.errorReason).toContain('QTD-26');
    });

    it('phải chặn cán bộ ngoài địa bàn quản lý cập nhật nguồn gốc sử dụng đất (QTD-16)', async () => {
      await expect(
        service.updateLandOrigin({
          parcelId: 'PARCEL-HN-001', // Thuộc xã 01001
          originType: LandOriginType.ALLOCATED_WITH_FEE,
          decisionNumber: 'QĐ-01',
          decisionDate: '2026-01-01',
          grantingAuthority: 'UBND',
          officerId: 'CB-HCM-001',
          officerCommuneCode: '79001', // Cán bộ thuộc xã 79001
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải chặn cập nhật nguồn gốc trên thửa đất đang bị khóa hoặc tranh chấp', async () => {
      // PARCEL-HN-002 đang LOCKED
      await expect(
        service.updateLandOrigin({
          parcelId: 'PARCEL-HN-002',
          originType: LandOriginType.ALLOCATED_WITH_FEE,
          decisionNumber: 'QĐ-01',
          decisionDate: '2026-01-01',
          grantingAuthority: 'UBND',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DCS-02-CN-004-TC-04: Kiểm toán & Toàn vẹn', () => {
    it('phải gắn mã băm SHA-256 bất biến khi cập nhật nguồn gốc đất', async () => {
      const res = await service.updateLandOrigin({
        parcelId: 'PARCEL-HN-001',
        originType: LandOriginType.RECOGNIZED_WITH_FEE,
        decisionNumber: 'QĐ-CN-2026/099/UBND',
        decisionDate: '2026-07-01',
        grantingAuthority: 'UBND Quận Ba Đình',
        officerId: 'ADMIN',
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.parcel.originDecisionNumber).toBe('QĐ-CN-2026/099/UBND');
    });
  });
});


describe('ParcelService [DCS-02-CN-005] Quản lý thời hạn sử dụng đất và cảnh báo sắp hết hạn', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-005-TC-01: Luồng thành công', () => {
    it('phải cập nhật thời hạn ổn định lâu dài (STABLE_LONG_TERM) thành công', async () => {
      const res = await service.updateLandTerm({
        parcelId: 'PARCEL-HN-001',
        termType: LandUseTermType.STABLE_LONG_TERM,
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      expect(res.success).toBe(true);
      expect(res.termType).toBe(LandUseTermType.STABLE_LONG_TERM);
      expect(res.expiryDate).toBeUndefined();
      expect(res.warningStatus).toBe(ExpiryWarningStatus.VALID);
      expect(res.parcel.termType).toBe(LandUseTermType.STABLE_LONG_TERM);
    });

    it('phải tính toán chính xác ngày hết hạn khi cung cấp ngày bắt đầu và số năm thời hạn', async () => {
      const res = await service.updateLandTerm({
        parcelId: 'PARCEL-HN-001',
        termType: LandUseTermType.DEFINITE,
        startDate: '2020-05-15',
        durationYears: 50,
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.termType).toBe(LandUseTermType.DEFINITE);
      expect(res.expiryDate).toBe('2070-05-15');
      expect(res.warningStatus).toBe(ExpiryWarningStatus.VALID);
      expect(res.daysRemaining).toBeGreaterThan(10000);
    });

    it('phải xác định trạng thái cảnh báo khẩn cấp CRITICAL_3M khi hạn còn dưới 90 ngày', async () => {
      // Đặt ngày hết hạn 45 ngày nữa
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 45);
      const expiryStr = nearFuture.toISOString().split('T')[0];

      const res = await service.updateLandTerm({
        parcelId: 'PARCEL-HCM-001',
        termType: LandUseTermType.DEFINITE,
        expiryDate: expiryStr,
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.warningStatus).toBe(ExpiryWarningStatus.CRITICAL_3M);
      expect(res.daysRemaining).toBeLessThanOrEqual(90);
      expect(res.daysRemaining).toBeGreaterThan(0);
    });

    it('phải quét được danh sách thửa đất sắp hết hạn sử dụng và phân loại tóm tắt chính xác', async () => {
      // PARCEL-HCM-001 và PARCEL-HCM-002 đã được seed có thời hạn trong vòng 60 ngày
      const res = await service.getExpiringParcels({ daysThreshold: 180 });

      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.items.length).toBe(res.total);
      expect(res.summary).toBeDefined();
      expect(typeof res.summary.criticalCount).toBe('number');
      expect(res.items[0].legalExtensionGuidance).toContain('Điều 172 Luật Đất đai 2024');
    });

    it('phải gửi thông báo cảnh báo hết hạn thành công qua SMS và APP_PUSH cho chủ sở hữu', async () => {
      const res = await service.notifyExpiry({
        parcelId: 'PARCEL-HCM-001',
        channels: ['SMS', 'APP_PUSH'],
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.sentChannels).toEqual(['SMS', 'APP_PUSH']);
      expect(res.notificationContent).toContain('Điều 172 Luật Đất đai 2024');
      expect(res.auditHash).toHaveLength(64);
      expect(res.notifiedAt).toBeDefined();
    });
  });

  describe('DCS-02-CN-005-TC-02: Dữ liệu không hợp lệ', () => {
    it('phải từ chối nếu đất có thời hạn nhưng thiếu cả ngày hết hạn và số năm thời hạn', async () => {
      await expect(
        service.updateLandTerm({
          parcelId: 'PARCEL-HN-001',
          termType: LandUseTermType.DEFINITE,
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu ngày bắt đầu sử dụng không hợp lệ', async () => {
      await expect(
        service.updateLandTerm({
          parcelId: 'PARCEL-HN-001',
          termType: LandUseTermType.DEFINITE,
          startDate: 'ngay-khong-hop-le',
          durationYears: 50,
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối gửi thông báo cảnh báo nếu thửa đất không thuộc loại có thời hạn', async () => {
      // Đặt PARCEL-HN-001 thành STABLE_LONG_TERM
      await service.updateLandTerm({
        parcelId: 'PARCEL-HN-001',
        termType: LandUseTermType.STABLE_LONG_TERM,
        officerId: 'ADMIN',
      });

      await expect(
        service.notifyExpiry({
          parcelId: 'PARCEL-HN-001',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải báo lỗi không tìm thấy khi ID thửa đất không tồn tại', async () => {
      await expect(
        service.updateLandTerm({
          parcelId: 'PARCEL-KHONG-TON-TAI',
          termType: LandUseTermType.STABLE_LONG_TERM,
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DCS-02-CN-005-TC-03: Ràng buộc nghiệp vụ & Thẩm quyền (QTD-16, QTD-27)', () => {
    it('phải từ chối khi cán bộ xã khác vi phạm thẩm quyền địa giới hành chính (QTD-16)', async () => {
      await expect(
        service.updateLandTerm({
          parcelId: 'PARCEL-HN-001', // communeCode: '01001'
          termType: LandUseTermType.STABLE_LONG_TERM,
          officerId: 'CB-COMMUNE-999',
          officerCommuneCode: '79001', // Khác 01001
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải từ chối cập nhật thời hạn khi thửa đất đang bị khóa giao dịch (QTD-27 / AC-03)', async () => {
      await expect(
        service.updateLandTerm({
          parcelId: 'PARCEL-HN-002', // Trạng thái LOCKED
          termType: LandUseTermType.STABLE_LONG_TERM,
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối gửi thông báo khi thửa đất đang bị khóa giao dịch', async () => {
      await expect(
        service.notifyExpiry({
          parcelId: 'PARCEL-HN-002', // Trạng thái LOCKED
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-02-CN-005-TC-04: Kiểm toán & Toàn vẹn (AC-04)', () => {
    it('phải gắn mã băm SHA-256 bất biến khi cập nhật thời hạn sử dụng đất', async () => {
      const res = await service.updateLandTerm({
        parcelId: 'PARCEL-HN-001',
        termType: LandUseTermType.STABLE_LONG_TERM,
        officerId: 'ADMIN',
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.parcel.auditHash).toBe(res.auditHash);
    });

    it('phải gắn mã băm SHA-256 bất biến khi phát thông báo cảnh báo hết hạn', async () => {
      const res = await service.notifyExpiry({
        parcelId: 'PARCEL-HCM-001',
        channels: ['SMS'],
        officerId: 'ADMIN',
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
    });
  });
});


describe('ParcelService [DCS-02-CN-006] Quản lý tài sản gắn liền với đất trên thửa', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-006-TC-01: Luồng thành công', () => {
    it('phải đăng ký tài sản nhà ở riêng lẻ gắn liền với đất thành công', async () => {
      const res = await service.createPropertyOnLand({
        parcelId: 'PARCEL-HN-001',
        assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
        name: 'Nhà ở riêng lẻ 2 tầng mái thái',
        constructionArea: 90.0,
        floorArea: 180.0,
        structure: 'Khung bê tông cốt thép, mái ngói',
        grade: ConstructionGrade.GRADE_3,
        floorsCount: 2,
        completionYear: 2023,
        ownershipTerm: 'Lâu dài',
        completionCertificateNumber: 'GP-HC-2023/045/SXD-HN',
        completionCertificateDate: '2023-08-15',
        ownerName: 'Trần Văn Hoàng',
        ownerCitizenId: '001090123456',
        officerId: 'CB-HN-001',
        officerCommuneCode: '01001',
      });

      expect(res.success).toBe(true);
      expect(res.property).toBeDefined();
      expect(res.property.id).toMatch(/^PROP-/);
      expect(res.property.name).toBe('Nhà ở riêng lẻ 2 tầng mái thái');
      expect(res.property.status).toBe('ACTIVE');
      expect(res.auditHash).toHaveLength(64);
    });

    it('phải ghi nhận đồng sở hữu vợ chồng theo QTD-25 Luật Đất đai 2024', async () => {
      const res = await service.createPropertyOnLand({
        parcelId: 'PARCEL-HN-001',
        assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
        name: 'Biệt thự phố song lập',
        constructionArea: 100.0,
        floorArea: 300.0,
        structure: 'Bê tông cốt thép toàn khối',
        grade: ConstructionGrade.GRADE_2,
        floorsCount: 3,
        ownerName: 'Trần Văn Hoàng',
        ownerCitizenId: '001090123456',
        isJointSpouseOwnership: true,
        spouseName: 'Vũ Thị Mai',
        spouseCitizenId: '001192556677',
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.property.isJointSpouseOwnership).toBe(true);
      expect(res.property.spouseName).toBe('Vũ Thị Mai');
      expect(res.property.spouseCitizenId).toBe('001192556677');
    });

    it('phải lấy được danh sách tài sản gắn liền với đất theo ID thửa đất', async () => {
      // PARCEL-HN-001 đã có tài sản PROP-HN-001 trong dữ liệu mẫu
      const res = await service.getPropertiesByParcelId('PARCEL-HN-001');

      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.parcelId).toBe('PARCEL-HN-001');
      expect(res.properties.length).toBe(res.total);
      expect(res.properties[0].id).toBe('PROP-HN-001');
    });

    it('phải lấy được chi tiết tài sản theo propertyId', async () => {
      const prop = await service.getPropertyById('PROP-HN-001');
      expect(prop).toBeDefined();
      expect(prop.id).toBe('PROP-HN-001');
      expect(prop.parcelId).toBe('PARCEL-HN-001');
    });

    it('phải ghi nhận phá dỡ / xóa tài sản thành công và chuyển trạng thái DEMOLISHED', async () => {
      const res = await service.deletePropertyOnLand('PARCEL-HN-001', 'PROP-HN-001', 'ADMIN');
      expect(res.success).toBe(true);
      expect(res.auditHash).toHaveLength(64);

      const prop = await service.getPropertyById('PROP-HN-001');
      expect(prop.status).toBe('DEMOLISHED');
    });
  });

  describe('DCS-02-CN-006-TC-02: Dữ liệu không hợp lệ', () => {
    it('phải từ chối nếu diện tích xây dựng vượt quá diện tích thửa đất', async () => {
      // PARCEL-HN-001 diện tích 125.8 m2, nhập 150 m2
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-HN-001',
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Công trình vượt diện tích',
          constructionArea: 150.0,
          floorArea: 300.0,
          structure: 'Bê tông cốt thép',
          grade: ConstructionGrade.GRADE_3,
          ownerName: 'Trần Văn Hoàng',
          ownerCitizenId: '001090123456',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu đánh dấu đồng sở hữu vợ chồng nhưng thiếu thông tin người phối ngẫu (QTD-25)', async () => {
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-HN-001',
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Nhà ở gia đình',
          constructionArea: 80.0,
          floorArea: 160.0,
          structure: 'Gạch',
          grade: ConstructionGrade.GRADE_4,
          ownerName: 'Trần Văn Hoàng',
          ownerCitizenId: '001090123456',
          isJointSpouseOwnership: true,
          // Thiếu spouseName và spouseCitizenId
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu số CCCD vợ/chồng trùng với CCCD của chủ sở hữu', async () => {
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-HN-001',
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Nhà ở gia đình',
          constructionArea: 80.0,
          floorArea: 160.0,
          structure: 'Gạch',
          grade: ConstructionGrade.GRADE_4,
          ownerName: 'Trần Văn Hoàng',
          ownerCitizenId: '001090123456',
          isJointSpouseOwnership: true,
          spouseName: 'Vũ Thị Mai',
          spouseCitizenId: '001090123456', // Trùng
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải báo lỗi không tìm thấy khi ID thửa đất không tồn tại', async () => {
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-KHONG-TON-TAI',
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Nhà không có đất',
          constructionArea: 50.0,
          floorArea: 100.0,
          structure: 'Gạch',
          grade: ConstructionGrade.GRADE_4,
          ownerName: 'Nguyễn Văn A',
          ownerCitizenId: '001090123456',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DCS-02-CN-006-TC-03: Ràng buộc nghiệp vụ (QTD-16, QTD-25, Lock)', () => {
    it('phải từ chối khi cán bộ ngoài địa bàn vi phạm thẩm quyền địa giới hành chính (QTD-16)', async () => {
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-HN-001', // communeCode: '01001'
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Nhà ở',
          constructionArea: 60.0,
          floorArea: 120.0,
          structure: 'Bê tông',
          grade: ConstructionGrade.GRADE_3,
          ownerName: 'Trần Văn Hoàng',
          ownerCitizenId: '001090123456',
          officerId: 'CB-COMMUNE-999',
          officerCommuneCode: '79001', // Không khớp 01001
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải từ chối đăng ký tài sản khi thửa đất đang bị khóa giao dịch', async () => {
      await expect(
        service.createPropertyOnLand({
          parcelId: 'PARCEL-HN-002', // Trạng thái LOCKED
          assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
          name: 'Nhà ở trên đất khóa',
          constructionArea: 50.0,
          floorArea: 100.0,
          structure: 'Bê tông',
          grade: ConstructionGrade.GRADE_3,
          ownerName: 'Lê Thị Thu',
          ownerCitizenId: '001092654321',
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-02-CN-006-TC-04: Kiểm toán & Toàn vẹn (AC-04)', () => {
    it('phải gắn mã băm SHA-256 bất biến khi tạo tài sản', async () => {
      const res = await service.createPropertyOnLand({
        parcelId: 'PARCEL-HN-001',
        assetType: PropertyOnLandType.INDIVIDUAL_HOUSE,
        name: 'Nhà ở kiểm toán',
        constructionArea: 70.0,
        floorArea: 140.0,
        structure: 'Bê tông',
        grade: ConstructionGrade.GRADE_3,
        ownerName: 'Trần Văn Hoàng',
        ownerCitizenId: '001090123456',
        officerId: 'ADMIN',
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.property.auditHash).toBe(res.auditHash);
    });
  });
});


describe('ParcelService [DCS-02-CN-009] Hiển thị lược sử biến động thửa đất dạng cây gia phả', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-009-TC-01: Luồng thành công - Lấy cây phả hệ đầy đủ', () => {
    it('phải trích xuất được đồ thị cây gia phả biến động (nodes, edges, generations, timeline) cho thửa đất tách', async () => {
      // 1. Thực hiện tách thửa PARCEL-HN-001 (125.8 m2) thành 2 thửa con (62.9 m2 mỗi thửa)
      const subRes = await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-TÁCH-2026/01/UBND',
        officerId: 'CB-VPDK-001',
        officerCommuneCode: '01001',
        newParcels: [
          {
            parcelNumber: 451,
            area: 62.9,
            ownerName: 'Trần Văn Hoàng (Nhánh A)',
            ownerCitizenId: '001090123456',
          },
          {
            parcelNumber: 452,
            area: 62.9,
            ownerName: 'Trần Thị Mai (Nhánh B)',
            ownerCitizenId: '001090654321',
          },
        ],
      });

      const child451 = subRes.childParcels.find((p) => p.parcelNumber === 451);
      expect(child451).toBeDefined();

      const tree = await service.getPedigreeTree(child451!.id);

      expect(tree).toBeDefined();
      expect(tree.parcelId).toBe(child451!.id);
      expect(tree.rootNodeId).toBe('PARCEL-HN-001');
      expect(tree.totalGenerations).toBe(2);
      expect(tree.totalNodes).toBeGreaterThanOrEqual(3);
      expect(tree.edges.length).toBeGreaterThanOrEqual(2);
      expect(tree.timeline.length).toBeGreaterThanOrEqual(2);
      expect(tree.auditHash).toHaveLength(64);

      // Kiểm tra nút CURRENT
      const currentNode = tree.nodes.find((n) => n.id === child451!.id);
      expect(currentNode).toBeDefined();
      expect(currentNode?.role).toBe('CURRENT');
      expect(currentNode?.generation).toBe(1);

      // Kiểm tra nút ROOT
      const rootNode = tree.nodes.find((n) => n.id === 'PARCEL-HN-001');
      expect(rootNode).toBeDefined();
      expect(rootNode?.role).toBe('ROOT');
      expect(rootNode?.generation).toBe(0);
      expect(rootNode?.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
    });

    it('phải trích xuất được cây gia phả cho thửa đất đơn lẻ chưa biến động', async () => {
      const tree = await service.getPedigreeTree('PARCEL-HN-002');

      expect(tree).toBeDefined();
      expect(tree.totalGenerations).toBe(1);
      expect(tree.totalNodes).toBe(1);
      expect(tree.nodes[0].role).toBe('CURRENT');
      expect(tree.timeline.length).toBe(1);
      expect(tree.timeline[0].eventType).toBe('INITIAL_REGISTRATION');
    });
  });

  describe('DCS-02-CN-009-TC-02: Dữ liệu không hợp lệ & Validation', () => {
    it('phải ném NotFoundException khi tra cứu ID hoặc Mã định danh không tồn tại', async () => {
      await expect(service.getPedigreeTree('PARCEL-UNKNOWN-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DCS-02-CN-009-TC-03: Ràng buộc nghiệp vụ QTD-02 (Bất biến lịch sử CSDL)', () => {
    it('thửa đất gốc sau biến động phải giữ nguyên trong cây với trạng thái HISTORICAL không bị xóa', async () => {
      // Tách thửa trước để PARCEL-HN-001 chuyển sang HISTORICAL
      await service.subdivideParcel({
        parentParcelId: 'PARCEL-HN-001',
        decisionNumber: 'QĐ-TÁCH-2026/02/UBND',
        officerId: 'CB-VPDK-001',
        officerCommuneCode: '01001',
        newParcels: [
          { parcelNumber: 451, area: 62.9, ownerName: 'Nhánh A', ownerCitizenId: '001090123456' },
          { parcelNumber: 452, area: 62.9, ownerName: 'Nhánh B', ownerCitizenId: '001090654321' },
        ],
      });

      const tree = await service.getPedigreeTree('PARCEL-HN-001');

      expect(tree).toBeDefined();
      const node = tree.nodes.find((n) => n.id === 'PARCEL-HN-001');
      expect(node).toBeDefined();
      expect(node?.legalStatus).toBe(ParcelLegalStatus.HISTORICAL);
    });
  });

  describe('DCS-02-CN-009-TC-04: Toàn vẹn & Mã băm kiểm toán SHA-256', () => {
    it('mỗi nút trong cây và toàn bộ đồ thị phải có mã băm SHA-256 xác thực', async () => {
      const tree = await service.getPedigreeTree('PARCEL-HN-001');

      expect(tree.auditHash).toMatch(/^[a-f0-9]{64}$/);
      for (const node of tree.nodes) {
        expect(node.auditHash).toMatch(/^[a-f0-9]{64}$/);
      }
      for (const evt of tree.timeline) {
        expect(evt.auditHash).toMatch(/^[a-f0-9]{64}$/);
      }
    });
  });
});


describe('ParcelService [DCS-02-CN-010] Cập nhật biến động thông tin chủ sở hữu qua Cổng Dịch vụ công số hóa', () => {
  let service: ParcelService;

  beforeEach(() => {
    service = new ParcelService();
  });

  describe('DCS-02-CN-010-TC-01: Luồng thành công - Chỉnh lý thông tin nhân thân & Chuyển quyền', () => {
    it('phải tiếp nhận hồ sơ đính chính thông tin CCCD và địa chỉ thường trú thành công', async () => {
      const res = await service.submitOwnerFluctuation({
        parcelId: 'PARCEL-HN-001',
        fluctuationType: OwnerFluctuationType.IDENTITY_CORRECTION,
        applicantCitizenId: '001090123456',
        newOwnerName: 'Trần Văn Hoàng (Đã chuẩn hóa)',
        newCitizenId: '001090123456',
        newAddress: 'Số 12A Phố Hoàng Hoa Thám, Phường Điện Biên',
        newPhone: '0912345678',
        notes: 'Đính chính theo thẻ CCCD gắn chip mới',
      });

      expect(res.success).toBe(true);
      expect(res.dossier.dossierCode).toMatch(/^DVC-BD-2026-/);
      expect(res.dossier.status).toBe(OwnerFluctuationStatus.APPROVED);
      expect(res.updatedParcel.ownerName).toBe('Trần Văn Hoàng (Đã chuẩn hóa)');
      expect(res.updatedParcel.ownerCitizenId).toBe('001090123456');
      expect(res.auditHash).toHaveLength(64);

      // Tra cứu lại lịch sử chủ sở hữu
      const history = await service.getOwnerHistory('PARCEL-HN-001');
      expect(history.totalRecords).toBeGreaterThanOrEqual(1);
      expect(history.history[0].newOwnerName).toBe('Trần Văn Hoàng (Đã chuẩn hóa)');
    });

    it('phải ghi nhận đồng sở hữu vợ chồng đứng tên cả hai theo quy định QTD-25', async () => {
      const res = await service.submitOwnerFluctuation({
        parcelId: 'PARCEL-HN-001',
        fluctuationType: OwnerFluctuationType.MARRIAGE_ADDITION,
        applicantCitizenId: '001090123456',
        newOwnerName: 'Trần Văn Hoàng',
        newCitizenId: '001090123456',
        isJointSpouse: true,
        spouseName: 'Nguyễn Thị Hồng',
        spouseCitizenId: '001095678901',
        documentNumber: 'GĐKKH-2026/088/UBND',
        notes: 'Bổ sung tên vợ theo giấy chứng nhận kết hôn',
      });

      expect(res.success).toBe(true);
      expect(res.dossier.isJointSpouse).toBe(true);
      expect(res.updatedParcel.ownerName).toBe('Trần Văn Hoàng và Nguyễn Thị Hồng');
      expect(res.dossier.spouseName).toBe('Nguyễn Thị Hồng');
    });

    it('phải tiếp nhận hồ sơ nhận chuyển nhượng quyền sử dụng đất sang chủ mới', async () => {
      const res = await service.submitOwnerFluctuation({
        parcelId: 'PARCEL-HN-001',
        fluctuationType: OwnerFluctuationType.OWNER_TRANSFER,
        applicantCitizenId: '001088999888',
        newOwnerName: 'Phạm Đức Thành',
        newCitizenId: '001088999888',
        newPhone: '0988776655',
        documentNumber: 'HĐ-CN-2026/123/CC',
        notes: 'Hợp đồng chuyển nhượng công chứng số 123/CC',
      });

      expect(res.success).toBe(true);
      expect(res.updatedParcel.ownerName).toBe('Phạm Đức Thành');
      expect(res.updatedParcel.ownerCitizenId).toBe('001088999888');
    });
  });

  describe('DCS-02-CN-010-TC-02: Dữ liệu không hợp lệ & Validation', () => {
    it('phải từ chối nếu số CCCD người nộp không đúng 12 chữ số (QTD-07)', async () => {
      await expect(
        service.submitOwnerFluctuation({
          parcelId: 'PARCEL-HN-001',
          fluctuationType: OwnerFluctuationType.IDENTITY_CORRECTION,
          applicantCitizenId: '12345',
          newOwnerName: 'Trần Văn Hoàng',
          newCitizenId: '001090123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu khai báo đồng sở hữu vợ chồng nhưng thiếu thông tin người phối ngẫu (QTD-25)', async () => {
      await expect(
        service.submitOwnerFluctuation({
          parcelId: 'PARCEL-HN-001',
          fluctuationType: OwnerFluctuationType.MARRIAGE_ADDITION,
          applicantCitizenId: '001090123456',
          newOwnerName: 'Trần Văn Hoàng',
          newCitizenId: '001090123456',
          isJointSpouse: true,
          spouseName: '',
          spouseCitizenId: '001095678901',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu số CCCD của vợ/chồng trùng với số CCCD của chủ sở hữu', async () => {
      await expect(
        service.submitOwnerFluctuation({
          parcelId: 'PARCEL-HN-001',
          fluctuationType: OwnerFluctuationType.MARRIAGE_ADDITION,
          applicantCitizenId: '001090123456',
          newOwnerName: 'Trần Văn Hoàng',
          newCitizenId: '001090123456',
          isJointSpouse: true,
          spouseName: 'Trần Thị Vợ',
          spouseCitizenId: '001090123456', // Trùng CCCD
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải báo lỗi không tìm thấy khi ID thửa đất không tồn tại', async () => {
      await expect(
        service.submitOwnerFluctuation({
          parcelId: 'PARCEL-UNKNOWN-999',
          fluctuationType: OwnerFluctuationType.IDENTITY_CORRECTION,
          applicantCitizenId: '001090123456',
          newOwnerName: 'Trần Văn Hoàng',
          newCitizenId: '001090123456',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DCS-02-CN-010-TC-03: Ràng buộc nghiệp vụ (QTD-07, Thửa đất bị khóa)', () => {
    it('phải từ chối biến động chủ sở hữu khi thửa đất đang bị khóa giao dịch (LOCKED)', async () => {
      await expect(
        service.submitOwnerFluctuation({
          parcelId: 'PARCEL-HN-002', // Trạng thái LOCKED
          fluctuationType: OwnerFluctuationType.OWNER_TRANSFER,
          applicantCitizenId: '001090123456',
          newOwnerName: 'Người mua mới',
          newCitizenId: '001099888777',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DCS-02-CN-010-TC-04: Toàn vẹn & Mã băm kiểm toán SHA-256', () => {
    it('phải gắn mã băm SHA-256 bất biến khi tiếp nhận hồ sơ biến động', async () => {
      const res = await service.submitOwnerFluctuation({
        parcelId: 'PARCEL-HN-001',
        fluctuationType: OwnerFluctuationType.DONATION,
        applicantCitizenId: '001090123456',
        newOwnerName: 'Trần Quốc Tuấn (Con trai)',
        newCitizenId: '001098765432',
        notes: 'Hợp đồng tặng cho quyền sử dụng đất',
      });

      expect(res.auditHash).toMatch(/^[a-f0-9]{64}$/);
      expect(res.dossier.auditHash).toBe(res.auditHash);
      expect(res.updatedParcel.auditHash).toBe(res.auditHash);
    });
  });
});
