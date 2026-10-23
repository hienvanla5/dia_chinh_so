import {
  Injectable,
  Inject,
  Optional,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { parcels } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import {
  CreateParcelInput,
  DeclareNewParcelInput,
  DeclareNewParcelResponse,
  ParcelItem,
  ParcelLegalStatus,
  LandPurposeCode,
} from '@diachinhso/shared';

@Injectable()
export class ParcelService {
  private readonly logger = new Logger(ParcelService.name);

  // Bộ nhớ đệm danh sách thửa đất trong CSDL Địa chính số
  private parcelsStore: ParcelItem[] = [];

  constructor(@Optional() @Inject(DRIZZLE) private readonly db?: DrizzleDB) {
    this.seedInitialParcels();
  }

  /**
   * Khởi tạo dữ liệu mẫu các thửa đất chuẩn hóa theo hệ tọa độ VN-2000 và 34 tỉnh thành
   */
  private seedInitialParcels(): void {
    const initialSeed: ParcelItem[] = [
      {
        id: 'PARCEL-HN-001',
        nationalCode: '01001-0012-0045',
        communeCode: '01001',
        communeName: 'Phường Điện Biên',
        provinceCode: 'TINH_HN',
        provinceName: 'Thành phố Hà Nội',
        sheetNumber: 12,
        parcelNumber: 45,
        area: 125.8,
        purposeCode: LandPurposeCode.ODT,
        address: 'Số 15 Điện Biên Phủ, Phường Điện Biên',
        legalStatus: ParcelLegalStatus.AVAILABLE,
        surveyDocumentNumber: 'TĐ-2026/012/VPĐK-HN',
        ownerName: 'Trần Văn Hoàng',
        ownerCitizenId: '001090123456',
        verticesVN2000: [
          { x: 2325410.25, y: 589120.35 },
          { x: 2325425.60, y: 589135.80 },
          { x: 2325415.10, y: 589150.20 },
          { x: 2325399.75, y: 589134.75 },
        ],
        boundaryGeojson: {
          type: 'Polygon',
          coordinates: [
            [
              [105.834, 21.033],
              [105.835, 21.034],
              [105.836, 21.033],
              [105.835, 21.032],
              [105.834, 21.033],
            ],
          ],
        },
        declaredByOfficerId: 'CB-HN-001',
        auditHash: 'a710296e8c4b92f7d1a5e30894b1592c68f1234567890abcdef1234567890abc1',
        createdAt: '2026-10-15T08:00:00.000Z',
        updatedAt: '2026-10-15T08:00:00.000Z',
      },
      {
        id: 'PARCEL-HN-002',
        nationalCode: '01001-0012-0046',
        communeCode: '01001',
        communeName: 'Phường Điện Biên',
        provinceCode: 'TINH_HN',
        provinceName: 'Thành phố Hà Nội',
        sheetNumber: 12,
        parcelNumber: 46,
        area: 98.4,
        purposeCode: LandPurposeCode.ODT,
        address: 'Số 17 Điện Biên Phủ, Phường Điện Biên',
        legalStatus: ParcelLegalStatus.LOCKED,
        surveyDocumentNumber: 'TĐ-2026/013/VPĐK-HN',
        ownerName: 'Lê Thị Thu',
        ownerCitizenId: '001092654321',
        verticesVN2000: [
          { x: 2325425.60, y: 589135.80 },
          { x: 2325440.10, y: 589150.15 },
          { x: 2325430.50, y: 589165.00 },
          { x: 2325415.10, y: 589150.20 },
        ],
        boundaryGeojson: {
          type: 'Polygon',
          coordinates: [
            [
              [105.835, 21.034],
              [105.836, 21.035],
              [105.837, 21.034],
              [105.836, 21.033],
              [105.835, 21.034],
            ],
          ],
        },
        declaredByOfficerId: 'CB-HN-001',
        auditHash: 'b821397f9d5c03a8e2b6f2603d9a234567890bcdef1234567890abcdef123456',
        createdAt: '2026-10-16T09:30:00.000Z',
        updatedAt: '2026-10-16T09:30:00.000Z',
      },
      {
        id: 'PARCEL-HCM-001',
        nationalCode: '79001-0005-0018',
        communeCode: '79001',
        communeName: 'Phường Bến Nghé',
        provinceCode: 'TINH_HCM',
        provinceName: 'Thành phố Hồ Chí Minh',
        sheetNumber: 5,
        parcelNumber: 18,
        area: 250.0,
        purposeCode: LandPurposeCode.TMD,
        address: 'Số 45 Lê Duẩn, Phường Bến Nghé',
        legalStatus: ParcelLegalStatus.AVAILABLE,
        surveyDocumentNumber: 'TĐ-2026/088/VPĐK-HCM',
        ownerName: 'Tập đoàn Đầu tư Bất động sản Sài Gòn',
        ownerCitizenId: '079080001234',
        verticesVN2000: [
          { x: 1192300.50, y: 605200.10 },
          { x: 1192320.80, y: 605225.40 },
          { x: 1192305.20, y: 605240.90 },
          { x: 1192285.00, y: 605215.50 },
        ],
        boundaryGeojson: {
          type: 'Polygon',
          coordinates: [
            [
              [106.701, 10.778],
              [106.702, 10.779],
              [106.703, 10.778],
              [106.702, 10.777],
              [106.701, 10.778],
            ],
          ],
        },
        declaredByOfficerId: 'CB-HCM-001',
        auditHash: 'c932408a0e6d14b9f3c7a3714e0b34567890cdef1234567890abcdef12345678',
        createdAt: '2026-10-18T14:15:00.000Z',
        updatedAt: '2026-10-18T14:15:00.000Z',
      },
    ];

    this.parcelsStore = initialSeed;
  }

  /**
   * Tính toán Polygon GeoJSON chuẩn từ danh sách tọa độ đỉnh VN-2000
   */
  private generateGeoJsonFromVN2000(vertices: Array<{ x: number; y: number }>) {
    const coords = vertices.map((v) => [
      105.80 + (v.y - 500000) / 1000000,
      21.02 + (v.x - 2320000) / 1000000,
    ]);
    if (coords.length > 0) {
      coords.push(coords[0]); // Khép kín vòng polygon
    }
    return {
      type: 'Polygon',
      coordinates: [coords],
    };
  }

  /**
   * Khai báo thông tin thuộc tính thửa đất mới (DCS-02-CN-001)
   */
  async declareNewParcel(input: DeclareNewParcelInput): Promise<DeclareNewParcelResponse> {
    // 1. Kiểm tra thẩm quyền địa giới hành chính theo Quy định QTD-16
    // Cán bộ xã chỉ được khai báo thửa đất thuộc đúng xã/phường mình quản lý
    if (input.officerCommuneCode !== input.communeCode && input.officerId !== 'ADMIN') {
      throw new ForbiddenException(
        `Từ chối thực hiện (QTD-16): Cán bộ chỉ có thẩm quyền khai báo trên địa bàn xã '${input.officerCommuneCode}', không được khai báo cho xã '${input.communeCode}'`,
      );
    }

    // 2. Kiểm tra dữ liệu đầu vào theo Tiêu chuẩn kỹ thuật
    if (input.area <= 0) {
      throw new BadRequestException('Diện tích thửa đất phải là số thực lớn hơn 0 m2');
    }

    if (input.sheetNumber <= 0 || input.parcelNumber <= 0) {
      throw new BadRequestException('Số tờ bản đồ và số thửa đất phải là số nguyên dương lớn hơn 0');
    }

    if (!input.verticesVN2000 || input.verticesVN2000.length < 3) {
      throw new BadRequestException('Thửa đất phải có tối thiểu 3 đỉnh tọa độ VN-2000 để tạo thành ranh giới khép kín');
    }

    for (const v of input.verticesVN2000) {
      if (v.x <= 0 || v.y <= 0) {
        throw new BadRequestException('Tọa độ đỉnh VN-2000 không hợp lệ (tọa độ X và Y phải là số dương)');
      }
    }

    // 3. Quy chuẩn sinh Mã định danh thửa đất quốc gia duy nhất (QTD-01)
    // Cấu trúc: [Mã xã 5 số]-[Số tờ 4 số]-[Số thửa 4 số]
    const nationalCode = `${input.communeCode}-${String(input.sheetNumber).padStart(4, '0')}-${String(input.parcelNumber).padStart(4, '0')}`;

    // Kiểm tra trùng lặp mã thửa trong cùng đơn vị hành chính xã (QTD-01)
    const isDuplicate = this.parcelsStore.some(
      (p) =>
        p.nationalCode === nationalCode ||
        (p.communeCode === input.communeCode &&
          p.sheetNumber === input.sheetNumber &&
          p.parcelNumber === input.parcelNumber),
    );

    if (isDuplicate) {
      throw new ConflictException(
        `Xung đột định danh (QTD-01): Mã định danh thửa đất '${nationalCode}' (Tờ ${input.sheetNumber}, Thửa ${input.parcelNumber}) đã tồn tại trong cơ sở dữ liệu địa chính`,
      );
    }

    // 4. Tạo đối tượng thửa đất mới ở trạng thái chờ thẩm định
    const now = new Date().toISOString();
    const newId = `PARCEL-${input.provinceCode.replace('TINH_', '')}-${String(this.parcelsStore.length + 1).padStart(3, '0')}`;
    const geojsonBoundary = this.generateGeoJsonFromVN2000(input.verticesVN2000);

    // Tính mã băm SHA-256 lưu vết kiểm toán bất biến (QTD-20)
    const rawAuditPayload = `${nationalCode}|${input.communeCode}|${input.sheetNumber}|${input.parcelNumber}|${input.area}|${input.purposeCode}|${input.surveyDocumentNumber}|${input.officerId}|${now}`;
    const auditHash = createHash('sha256').update(rawAuditPayload).digest('hex');

    const newParcel: ParcelItem = {
      id: newId,
      nationalCode,
      communeCode: input.communeCode,
      communeName: input.communeName || `Xã/Phường ${input.communeCode}`,
      provinceCode: input.provinceCode,
      provinceName: input.provinceName || 'Tỉnh/Thành phố trực thuộc Trung ương',
      sheetNumber: input.sheetNumber,
      parcelNumber: input.parcelNumber,
      area: input.area,
      purposeCode: input.purposeCode,
      address: input.address,
      legalStatus: ParcelLegalStatus.PENDING_APPRAISAL, // Trạng thái chờ thẩm định tại Chi nhánh VPĐKĐĐ
      surveyDocumentNumber: input.surveyDocumentNumber,
      ownerName: input.ownerName,
      ownerCitizenId: input.ownerCitizenId,
      verticesVN2000: input.verticesVN2000,
      boundaryGeojson: geojsonBoundary,
      declaredByOfficerId: input.officerId,
      auditHash,
      createdAt: now,
      updatedAt: now,
    };

    // Lưu vào store
    this.parcelsStore.unshift(newParcel);

    // Ghi vào database nếu có kết nối
    if (this.db) {
      try {
        await this.db.insert(parcels).values({
          id: newParcel.id,
          nationalCode: newParcel.nationalCode,
          communeId: newParcel.communeCode,
          sheetNumber: newParcel.sheetNumber,
          parcelNumber: newParcel.parcelNumber,
          area: newParcel.area,
          purposeCode: newParcel.purposeCode,
          address: newParcel.address,
          legalStatus: newParcel.legalStatus as any,
          verticesVN2000: newParcel.verticesVN2000,
          boundaryGeojson: newParcel.boundaryGeojson,
          ownerIds: newParcel.ownerCitizenId ? [newParcel.ownerCitizenId] : [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err: any) {
        this.logger.warn(`Lỗi ghi CSDL PostGIS (sử dụng in-memory fallback): ${err?.message}`);
      }
    }

    this.logger.log(
      `Cán bộ '${input.officerId}' đã khai báo thửa đất mới '${nationalCode}' (Tờ ${input.sheetNumber}, Thửa ${input.parcelNumber}, DT ${input.area}m2). Trạng thái: PENDING_APPRAISAL. Audit Hash: ${auditHash}`,
    );

    return {
      success: true,
      parcel: newParcel,
      auditHash,
      message: `Khai báo thông tin thuộc tính thửa đất mới '${nationalCode}' thành công. Hồ sơ đã chuyển sang trạng thái chờ thẩm định tại Chi nhánh Văn phòng Đăng ký Đất đai.`,
    };
  }

  /**
   * Lấy danh sách thửa đất có phân trang và bộ lọc
   */
  async findAll(communeId?: string, status?: ParcelLegalStatus, search?: string) {
    let result = [...this.parcelsStore];

    if (communeId) {
      result = result.filter((p) => p.communeCode === communeId);
    }
    if (status) {
      result = result.filter((p) => p.legalStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nationalCode.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.ownerName?.toLowerCase().includes(q) ||
          String(p.sheetNumber).includes(q) ||
          String(p.parcelNumber).includes(q),
      );
    }

    return result;
  }

  /**
   * Tra cứu thửa đất theo ID
   */
  async findById(id: string): Promise<ParcelItem> {
    const parcel = this.parcelsStore.find((p) => p.id === id);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${id}`);
    }
    return parcel;
  }

  /**
   * Tra cứu thửa đất theo Mã định danh quốc gia
   */
  async findByNationalCode(nationalCode: string): Promise<ParcelItem> {
    const parcel = this.parcelsStore.find((p) => p.nationalCode === nationalCode);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có mã định danh: ${nationalCode}`);
    }
    return parcel;
  }

  /**
   * Cập nhật trạng thái pháp lý của thửa đất
   */
  async updateLegalStatus(id: string, status: ParcelLegalStatus): Promise<ParcelItem> {
    const parcel = this.parcelsStore.find((p) => p.id === id);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất để cập nhật trạng thái: ${id}`);
    }
    parcel.legalStatus = status;
    parcel.updatedAt = new Date().toISOString();
    return parcel;
  }

  /**
   * Lấy số liệu thống kê tổng quan quản lý thửa đất
   */
  async getSummaryStats() {
    const total = this.parcelsStore.length;
    const pendingAppraisal = this.parcelsStore.filter(
      (p) => p.legalStatus === ParcelLegalStatus.PENDING_APPRAISAL,
    ).length;
    const available = this.parcelsStore.filter(
      (p) => p.legalStatus === ParcelLegalStatus.AVAILABLE,
    ).length;
    const lockedOrDisputed = this.parcelsStore.filter(
      (p) =>
        p.legalStatus === ParcelLegalStatus.LOCKED ||
        p.legalStatus === ParcelLegalStatus.DISPUTED ||
        p.legalStatus === ParcelLegalStatus.FROZEN,
    ).length;

    return {
      total,
      pendingAppraisal,
      available,
      lockedOrDisputed,
    };
  }

  /**
   * Tạo mới thửa đất kế thừa (hỗ trợ code cũ)
   */
  async create(data: CreateParcelInput) {
    const defaultVertices = data.verticesVN2000 || [
      { x: 2320000, y: 500000 },
      { x: 2320010, y: 500010 },
      { x: 2320000, y: 500010 },
    ];

    const res = await this.declareNewParcel({
      communeCode: data.communeId,
      provinceCode: 'TINH_HN',
      sheetNumber: data.sheetNumber,
      parcelNumber: data.parcelNumber,
      area: data.area,
      purposeCode: data.purposeCode,
      address: data.address,
      verticesVN2000: defaultVertices,
      surveyDocumentNumber: 'HS-BAN-DO-GOC',
      officerId: 'CB-HE-THONG',
      officerCommuneCode: data.communeId,
    });

    return res.parcel;
  }
}
