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
