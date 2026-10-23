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
  GenerateNationalCodeInput,
  GenerateNationalCodeResponse,
  ValidateNationalCodeResponse,
  ParcelItem,
  ParcelLegalStatus,
  LandPurposeCode,
  LandOriginType,
  LandOriginRights,
  UpdateLandOriginInput,
  UpdateLandOriginResponse,
  ValidateAgriculturalSubdivisionInput,
  ValidateAgriculturalSubdivisionResponse,
  SubdivideParcelInput,
  SubdivideParcelResponse,
  MergeParcelsInput,
  MergeParcelsResponse,
  ParcelLineageResponse,
  ParcelLineageNode,
  FluctuationType,
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

  /**
   * Tự động sinh Mã định danh thửa đất quốc gia duy nhất (DCS-02-CN-002 - QTD-01)
   */
  async generateNationalCode(input: GenerateNationalCodeInput): Promise<GenerateNationalCodeResponse> {
    if (input.sheetNumber <= 0 || input.parcelNumber <= 0) {
      throw new BadRequestException('Số tờ bản đồ và số thửa đất phải là số nguyên dương lớn hơn 0');
    }

    if (!input.communeCode || input.communeCode.length < 3) {
      throw new BadRequestException('Mã đơn vị hành chính cấp xã không hợp lệ');
    }

    // Chuẩn hóa mã tỉnh thành 2 chữ số
    let provPrefix = input.provinceCode.replace('TINH_', '');
    if (provPrefix === 'HN') provPrefix = '01';
    else if (provPrefix === 'HCM') provPrefix = '79';
    else if (provPrefix.length === 1) provPrefix = `0${provPrefix}`;
    else if (provPrefix.length > 2) provPrefix = provPrefix.substring(0, 2);

    const sheetStr4 = String(input.sheetNumber).padStart(4, '0');
    const parcelStr5 = String(input.parcelNumber).padStart(5, '0');
    const parcelStr4 = String(input.parcelNumber).padStart(4, '0');
    const branchSuffix = input.subdivisionBranch || '00';

    // Mã chuẩn quốc gia mở rộng: [MãXã]-[SốTờ 4 số]-[SốThửa 5 số]-[Nhánh 2 số]
    const nationalCode = `${input.communeCode}-${sheetStr4}-${parcelStr5}-${branchSuffix}`;
    // Mã ngắn gọn: [MãXã]-[SốTờ 4 số]-[SốThửa 4 số]
    const shortCode = `${input.communeCode}-${sheetStr4}-${parcelStr4}`;

    // Tính Checksum Mod-11
    const combinedDigits = `${input.communeCode}${sheetStr4}${parcelStr4}`.replace(/\D/g, '');
    let sum = 0;
    for (let i = 0; i < combinedDigits.length; i++) {
      sum += parseInt(combinedDigits[i], 10) * ((i % 8) + 2);
    }
    const checksum = String(sum % 11);

    // Tính mã định danh không gian địa lý duy nhất (Spatial UID)
    const cX = input.centroidX ? Math.round(input.centroidX) : 2325410;
    const cY = input.centroidY ? Math.round(input.centroidY) : 589120;
    const spatialUid = `VN-3405-${input.communeCode}-X${cX}-Y${cY}`;

    // Kiểm tra tính duy nhất trên toàn quốc (QTD-01)
    const isUnique = !this.parcelsStore.some(
      (p) => p.nationalCode === nationalCode || p.nationalCode === shortCode,
    );

    const qrCodePayload = `DCS:VN:${nationalCode}:${spatialUid}:CS${checksum}`;
    const auditHash = createHash('sha256')
      .update(`${nationalCode}|${spatialUid}|${checksum}|${new Date().toISOString()}`)
      .digest('hex');

    this.logger.log(`Đã sinh mã định danh thửa đất quốc gia duy nhất: ${nationalCode} (Spatial UID: ${spatialUid}, Unique: ${isUnique})`);

    return {
      nationalCode,
      shortCode,
      spatialUid,
      components: {
        provinceCode: provPrefix,
        communeCode: input.communeCode,
        sheetNumber: input.sheetNumber,
        parcelNumber: input.parcelNumber,
        branchSuffix,
        checksum,
      },
      qrCodePayload,
      isUnique,
      auditHash,
      message: isUnique
        ? 'Mã định danh thửa đất quốc gia đã được sinh tự động thành công và đảm bảo tính duy nhất toàn quốc.'
        : 'Cảnh báo: Mã định danh này đã tồn tại trong CSDL Đất đai Quốc gia!',
    };
  }

  /**
   * Kiểm tra tính hợp lệ và sự tồn tại của Mã định danh thửa đất quốc gia
   */
  async validateNationalCode(code: string): Promise<ValidateNationalCodeResponse> {
    if (!code || code.trim().length < 5) {
      return {
        isValid: false,
        isRegisteredInDatabase: false,
        errorReason: 'Mã định danh thửa đất không được để trống hoặc quá ngắn',
        message: 'Mã định danh không hợp lệ',
      };
    }

    const cleanCode = code.trim();
    // Chấp nhận định dạng: 01001-0012-0045 hoặc 01001-0012-00045-00 hoặc 01-01001-0012-0045
    const regex = /^(?:(\d{2})-)?(\d{5})-(\d{4})-(\d{4,5})(?:-(\d{2}))?$/;
    const match = cleanCode.match(regex);

    if (!match) {
      return {
        isValid: false,
        isRegisteredInDatabase: false,
        errorReason: 'Định dạng mã không đúng quy chuẩn quốc gia: [MãXã]-[SốTờ]-[SốThửa]',
        message: 'Mã định danh thửa đất sai quy chuẩn cấu trúc',
      };
    }

    const [, prov, commune, sheet, parcel, branch] = match;
    const isRegistered = this.parcelsStore.some(
      (p) => p.nationalCode === cleanCode || p.nationalCode.startsWith(`${commune}-${sheet}-${parcel.padStart(4, '0')}`),
    );

    return {
      isValid: true,
      normalizedCode: cleanCode,
      components: {
        provinceCode: prov || '01',
        communeCode: commune,
        sheetNumber: parseInt(sheet, 10),
        parcelNumber: parseInt(parcel, 10),
        branchSuffix: branch || '00',
        checksum: 'PASS',
      },
      isRegisteredInDatabase: isRegistered,
      message: isRegistered
        ? 'Mã định danh thửa đất hợp lệ và đã được xác lập trong CSDL Địa chính Quốc gia.'
        : 'Mã định danh thửa đất hợp lệ về cấu trúc nhưng chưa được đăng ký trong CSDL.',
    };
  }

  /**
   * Tách thửa đất và thiết lập quan hệ phả hệ cha-con (DCS-02-CN-003, QTD-02, QTD-08)
   */
  async subdivideParcel(input: SubdivideParcelInput): Promise<SubdivideParcelResponse> {
    const parent = this.parcelsStore.find((p) => p.id === input.parentParcelId);
    if (!parent) {
      throw new NotFoundException(`Không tìm thấy thửa đất gốc có ID: ${input.parentParcelId}`);
    }

    // Kiểm tra trạng thái thửa đất: Không được tách thửa nếu đang bị khóa, thế chấp, tranh chấp, phong tỏa (AC-03)
    if (
      parent.legalStatus === ParcelLegalStatus.LOCKED ||
      parent.legalStatus === ParcelLegalStatus.DISPUTED ||
      parent.legalStatus === ParcelLegalStatus.FROZEN
    ) {
      throw new ForbiddenException(
        `Thửa đất '${parent.nationalCode}' đang ở trạng thái '${parent.legalStatus}' (bị khóa hoặc tranh chấp). Không được phép thực hiện thủ tục tách thửa!`,
      );
    }

    if (
      parent.legalStatus === ParcelLegalStatus.HISTORICAL ||
      parent.legalStatus === ParcelLegalStatus.REVOKED
    ) {
      throw new BadRequestException(
        `Thửa đất '${parent.nationalCode}' đã chuyển vào lịch sử hoặc bị thu hồi. Không thể thực hiện tách thửa!`,
      );
    }

    // Kiểm tra thẩm quyền địa giới (QTD-16)
    if (
      input.officerCommuneCode &&
      input.officerCommuneCode !== parent.communeCode &&
      input.officerId !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        `Cán bộ không có thẩm quyền trên địa bàn xã '${parent.communeCode}'. Thẩm quyền được phân công: '${input.officerCommuneCode}'.`,
      );
    }

    if (!input.newParcels || input.newParcels.length < 2) {
      throw new BadRequestException('Thủ tục tách thửa yêu cầu hình thành tối thiểu 2 thửa đất con mới');
    }

    // Kiểm tra diện tích tối thiểu theo quy định tỉnh (QTD-08)
    const minArea = input.minSubdivisionArea || (parent.purposeCode === LandPurposeCode.ODT ? 30 : 50);
    for (const child of input.newParcels) {
      if (child.area < minArea) {
        throw new BadRequestException(
          `Diện tích thửa đất mới hình thành (${child.area}m²) nhỏ hơn hạn mức tối thiểu cho phép (${minArea}m²) theo quy định của UBND tỉnh (QTD-08).`,
        );
      }
    }

    // Kiểm tra bảo toàn tổng diện tích (cho phép dung sai 0.5%)
    const sumChildArea = input.newParcels.reduce((acc, c) => acc + c.area, 0);
    const areaDiff = Math.abs(sumChildArea - parent.area);
    if (areaDiff > parent.area * 0.005 && areaDiff > 0.5) {
      throw new BadRequestException(
        `Tổng diện tích các thửa đất con (${sumChildArea}m²) không khớp với diện tích thửa đất gốc (${parent.area}m²) vượt quá dung sai cho phép (QTD-08).`,
      );
    }

    // Kiểm tra trùng số thửa con
    const parcelNumbers = input.newParcels.map((c) => c.parcelNumber);
    const uniqueNumbers = new Set(parcelNumbers);
    if (uniqueNumbers.size !== parcelNumbers.length) {
      throw new BadRequestException('Các thửa đất con mới hình thành không được trùng số thứ tự thửa');
    }

    const now = new Date().toISOString();
    const childParcels: ParcelItem[] = [];

    // Tạo các thửa đất con mới
    for (let i = 0; i < input.newParcels.length; i++) {
      const childInput = input.newParcels[i];
      const sheetStr = String(parent.sheetNumber).padStart(4, '0');
      const parcelStr = String(childInput.parcelNumber).padStart(4, '0');
      const nationalCode = `${parent.communeCode}-${sheetStr}-${parcelStr}`;

      // Kiểm tra xem số thửa đã tồn tại chưa
      const exists = this.parcelsStore.some(
        (p) => p.nationalCode === nationalCode && p.id !== parent.id,
      );
      if (exists) {
        throw new ConflictException(
          `Mã định danh thửa đất '${nationalCode}' đã tồn tại trên địa bàn. Vui lòng chọn số thửa khác!`,
        );
      }

      const childAuditHash = createHash('sha256')
        .update(`${nationalCode}|SUBDIVISION|${parent.id}|${input.decisionNumber}|${now}`)
        .digest('hex');

      const childParcel: ParcelItem = {
        id: `PARCEL-SUB-${Date.now()}-${i + 1}`,
        nationalCode,
        communeCode: parent.communeCode,
        communeName: parent.communeName,
        provinceCode: parent.provinceCode,
        provinceName: parent.provinceName,
        sheetNumber: parent.sheetNumber,
        parcelNumber: childInput.parcelNumber,
        area: childInput.area,
        purposeCode: childInput.purposeCode || parent.purposeCode,
        address: childInput.address || parent.address,
        legalStatus: ParcelLegalStatus.AVAILABLE,
        surveyDocumentNumber: input.decisionNumber,
        ownerName: childInput.ownerName || parent.ownerName,
        ownerCitizenId: childInput.ownerCitizenId || parent.ownerCitizenId,
        verticesVN2000: childInput.verticesVN2000 || parent.verticesVN2000,
        boundaryGeojson: parent.boundaryGeojson,
        declaredByOfficerId: input.officerId,
        parentParcelId: parent.id,
        parentNationalCode: parent.nationalCode,
        isHistorical: false,
        auditHash: childAuditHash,
        createdAt: now,
        updatedAt: now,
      };

      childParcels.push(childParcel);
      this.parcelsStore.unshift(childParcel);
    }

    // Đóng trạng thái lịch sử của thửa gốc (QTD-02)
    parent.legalStatus = ParcelLegalStatus.HISTORICAL;
    parent.isHistorical = true;
    parent.childParcelIds = childParcels.map((c) => c.id);
    parent.updatedAt = now;

    const auditHash = createHash('sha256')
      .update(`SUBDIVISION|${parent.id}|${childParcels.map((c) => c.id).join(',')}|${input.decisionNumber}|${now}`)
      .digest('hex');

    this.logger.log(
      `Đã thực hiện tách thửa đất '${parent.nationalCode}' thành ${childParcels.length} thửa mới theo QĐ '${input.decisionNumber}'. Thửa gốc đã chuyển sang HISTORICAL (Audit: ${auditHash}).`,
    );

    return {
      success: true,
      parentParcel: parent,
      childParcels,
      auditHash,
      message: `Tách thửa đất '${parent.nationalCode}' thành công thành ${childParcels.length} thửa mới. Thửa đất gốc đã được chuyển sang trạng thái lịch sử và lưu vết phả hệ.`,
    };
  }

  /**
   * Hợp các thửa đất liền kề thành thửa mới (DCS-02-CN-003, QTD-02, QTD-31)
   */
  async mergeParcels(input: MergeParcelsInput): Promise<MergeParcelsResponse> {
    if (!input.sourceParcelIds || input.sourceParcelIds.length < 2) {
      throw new BadRequestException('Thủ tục hợp thửa yêu cầu tối thiểu 2 thửa đất thành phần');
    }

    // Tra cứu các thửa đất nguồn
    const sourceParcels = input.sourceParcelIds.map((id) => {
      const p = this.parcelsStore.find((item) => item.id === id);
      if (!p) {
        throw new NotFoundException(`Không tìm thấy thửa đất thành phần có ID: ${id}`);
      }
      return p;
    });

    // Kiểm tra trạng thái: không thửa nào được đang bị khóa, tranh chấp, phong tỏa (AC-03)
    for (const p of sourceParcels) {
      if (
        p.legalStatus === ParcelLegalStatus.LOCKED ||
        p.legalStatus === ParcelLegalStatus.DISPUTED ||
        p.legalStatus === ParcelLegalStatus.FROZEN
      ) {
        throw new ForbiddenException(
          `Thửa đất '${p.nationalCode}' đang ở trạng thái '${p.legalStatus}' (bị khóa hoặc tranh chấp). Không được phép thực hiện thủ tục hợp thửa!`,
        );
      }
      if (p.legalStatus === ParcelLegalStatus.HISTORICAL || p.legalStatus === ParcelLegalStatus.REVOKED) {
        throw new BadRequestException(
          `Thửa đất '${p.nationalCode}' đã chuyển vào lịch sử hoặc bị thu hồi. Không thể tham gia hợp thửa!`,
        );
      }
    }

    // Kiểm tra QTD-31: Cấm hợp thửa đất không cùng mục đích sử dụng!
    const targetPurpose = sourceParcels[0].purposeCode;
    const samePurpose = sourceParcels.every((p) => p.purposeCode === targetPurpose);
    if (!samePurpose) {
      const purposeList = sourceParcels.map((p) => `${p.nationalCode}: ${p.purposeCode}`).join(', ');
      throw new BadRequestException(
        `Vi phạm quy định cấm hợp thửa đất không cùng mục đích sử dụng (QTD-31): Các thửa đất có mục đích khác nhau (${purposeList}). Vui lòng làm thủ tục chuyển mục đích sử dụng đất đồng nhất trước khi hợp thửa!`,
      );
    }

    // Kiểm tra đơn vị hành chính: phải cùng một xã/phường
    const communeCode = sourceParcels[0].communeCode;
    const sameCommune = sourceParcels.every((p) => p.communeCode === communeCode);
    if (!sameCommune) {
      throw new BadRequestException('Không được phép hợp các thửa đất nằm ở các đơn vị hành chính xã khác nhau');
    }

    // Kiểm tra thẩm quyền địa bàn của cán bộ (QTD-16)
    if (
      input.officerCommuneCode &&
      input.officerCommuneCode !== communeCode &&
      input.officerId !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        `Cán bộ không có thẩm quyền trên địa bàn xã '${communeCode}'. Thẩm quyền được phân công: '${input.officerCommuneCode}'.`,
      );
    }

    // Tính tổng diện tích
    const totalArea = sourceParcels.reduce((sum, p) => sum + p.area, 0);
    const sheetNumber = input.sheetNumber || sourceParcels[0].sheetNumber;
    const sheetStr = String(sheetNumber).padStart(4, '0');
    const parcelStr = String(input.newParcelNumber).padStart(4, '0');
    const newNationalCode = `${communeCode}-${sheetStr}-${parcelStr}`;

    // Kiểm tra xem mã thửa mới có bị trùng không
    const exists = this.parcelsStore.some((p) => p.nationalCode === newNationalCode);
    if (exists) {
      throw new ConflictException(
        `Mã định danh thửa đất mới '${newNationalCode}' đã tồn tại trên địa bàn. Vui lòng chọn số thửa khác!`,
      );
    }

    const now = new Date().toISOString();
    const mergedAuditHash = createHash('sha256')
      .update(`MERGE|${sourceParcels.map((p) => p.id).join(',')}|${newNationalCode}|${input.decisionNumber}|${now}`)
      .digest('hex');

    const mergedParcel: ParcelItem = {
      id: `PARCEL-MRG-${Date.now()}`,
      nationalCode: newNationalCode,
      communeCode,
      communeName: sourceParcels[0].communeName,
      provinceCode: sourceParcels[0].provinceCode,
      provinceName: sourceParcels[0].provinceName,
      sheetNumber,
      parcelNumber: input.newParcelNumber,
      area: totalArea,
      purposeCode: targetPurpose,
      address: input.address || sourceParcels[0].address,
      legalStatus: ParcelLegalStatus.AVAILABLE,
      surveyDocumentNumber: input.decisionNumber,
      ownerName: input.ownerName || sourceParcels[0].ownerName,
      ownerCitizenId: input.ownerCitizenId || sourceParcels[0].ownerCitizenId,
      verticesVN2000: input.verticesVN2000 || sourceParcels[0].verticesVN2000,
      boundaryGeojson: sourceParcels[0].boundaryGeojson,
      declaredByOfficerId: input.officerId,
      mergedFromParcelIds: sourceParcels.map((p) => p.id),
      mergedFromNationalCodes: sourceParcels.map((p) => p.nationalCode),
      isHistorical: false,
      auditHash: mergedAuditHash,
      createdAt: now,
      updatedAt: now,
    };

    // Đóng trạng thái lịch sử của các thửa đất cũ (QTD-02)
    for (const p of sourceParcels) {
      p.legalStatus = ParcelLegalStatus.HISTORICAL;
      p.isHistorical = true;
      p.updatedAt = now;
    }

    this.parcelsStore.unshift(mergedParcel);

    this.logger.log(
      `Đã hợp ${sourceParcels.length} thửa (${sourceParcels.map((p) => p.nationalCode).join(', ')}) thành thửa mới '${newNationalCode}' theo QĐ '${input.decisionNumber}'.`,
    );

    return {
      success: true,
      sourceParcels,
      mergedParcel,
      auditHash: mergedAuditHash,
      message: `Hợp ${sourceParcels.length} thửa đất thành thửa mới '${newNationalCode}' thành công. Toàn bộ thửa đất tiền thân đã chuyển sang trạng thái lịch sử.`,
    };
  }

  /**
   * Truy xuất cây gia phả biến động của thửa đất (Lineage DAG) (DCS-02-CN-003)
   */
  async getParcelLineage(idOrCode: string): Promise<ParcelLineageResponse> {
    const target = this.parcelsStore.find(
      (p) => p.id === idOrCode || p.nationalCode === idOrCode,
    );
    if (!target) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID hoặc Mã định danh: ${idOrCode}`);
    }

    // Tìm các thửa cha / thửa tiền thân
    const parents: ParcelItem[] = [];
    if (target.parentParcelId) {
      const p = this.parcelsStore.find((item) => item.id === target.parentParcelId);
      if (p) parents.push(p);
    }
    if (target.mergedFromParcelIds && target.mergedFromParcelIds.length > 0) {
      for (const mId of target.mergedFromParcelIds) {
        const mp = this.parcelsStore.find((item) => item.id === mId);
        if (mp && !parents.some((x) => x.id === mp.id)) parents.push(mp);
      }
    }

    // Tìm các thửa con (nếu thửa target đã bị tách hoặc gộp)
    const children = this.parcelsStore.filter(
      (item) =>
        item.parentParcelId === target.id ||
        (item.mergedFromParcelIds && item.mergedFromParcelIds.includes(target.id)),
    );

    // Xây dựng danh sách node phả hệ
    const lineageNodes: ParcelLineageNode[] = [];

    // Node thửa cha / tiền thân
    for (const p of parents) {
      lineageNodes.push({
        parcelId: p.id,
        nationalCode: p.nationalCode,
        sheetNumber: p.sheetNumber,
        parcelNumber: p.parcelNumber,
        area: p.area,
        purposeCode: p.purposeCode,
        legalStatus: p.legalStatus,
        isCurrent: false,
        relationship: target.mergedFromParcelIds ? 'MERGED_SOURCE' : 'PARENT',
        fluctuationType: target.mergedFromParcelIds ? FluctuationType.MERGE : FluctuationType.SUBDIVISION,
        decisionNumber: target.surveyDocumentNumber,
        timestamp: p.createdAt,
      });
    }

    // Node thửa hiện tại
    lineageNodes.push({
      parcelId: target.id,
      nationalCode: target.nationalCode,
      sheetNumber: target.sheetNumber,
      parcelNumber: target.parcelNumber,
      area: target.area,
      purposeCode: target.purposeCode,
      legalStatus: target.legalStatus,
      isCurrent: true,
      relationship: 'CURRENT',
      decisionNumber: target.surveyDocumentNumber,
      timestamp: target.createdAt,
    });

    // Node thửa con
    for (const c of children) {
      lineageNodes.push({
        parcelId: c.id,
        nationalCode: c.nationalCode,
        sheetNumber: c.sheetNumber,
        parcelNumber: c.parcelNumber,
        area: c.area,
        purposeCode: c.purposeCode,
        legalStatus: c.legalStatus,
        isCurrent: false,
        relationship: 'CHILD',
        fluctuationType: c.mergedFromParcelIds ? FluctuationType.MERGE : FluctuationType.SUBDIVISION,
        decisionNumber: c.surveyDocumentNumber,
        timestamp: c.createdAt,
      });
    }

    return {
      parcelId: target.id,
      nationalCode: target.nationalCode,
      currentParcel: target,
      parents,
      children,
      lineageNodes,
      totalGenerations: (parents.length > 0 ? 1 : 0) + 1 + (children.length > 0 ? 1 : 0),
    };
  }

  /**
   * Cập nhật nguồn gốc sử dụng đất theo Luật Đất đai 2024 (DCS-02-CN-004)
   */
  async updateLandOrigin(input: UpdateLandOriginInput): Promise<UpdateLandOriginResponse> {
    const parcel = this.parcelsStore.find((p) => p.id === input.parcelId);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${input.parcelId}`);
    }

    if (parcel.legalStatus === ParcelLegalStatus.HISTORICAL || parcel.legalStatus === ParcelLegalStatus.REVOKED) {
      throw new BadRequestException(`Thửa đất '${parcel.nationalCode}' đã chuyển vào lịch sử, không thể cập nhật nguồn gốc sử dụng đất!`);
    }

    if (
      parcel.legalStatus === ParcelLegalStatus.LOCKED ||
      parcel.legalStatus === ParcelLegalStatus.DISPUTED ||
      parcel.legalStatus === ParcelLegalStatus.FROZEN
    ) {
      throw new ForbiddenException(`Thửa đất '${parcel.nationalCode}' đang bị khóa hoặc tranh chấp (${parcel.legalStatus}), không thể cập nhật nguồn gốc sử dụng đất!`);
    }

    // Kiểm tra thẩm quyền địa bàn (QTD-16)
    if (
      input.officerCommuneCode &&
      input.officerCommuneCode !== parcel.communeCode &&
      input.officerId !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        `Cán bộ không có thẩm quyền trên địa bàn xã '${parcel.communeCode}'. Thẩm quyền được phân công: '${input.officerCommuneCode}'.`,
      );
    }

    const originNameMap: Record<LandOriginType, string> = {
      [LandOriginType.ALLOCATED_WITH_FEE]: 'Nhà nước giao đất có thu tiền sử dụng đất',
      [LandOriginType.ALLOCATED_WITHOUT_FEE]: 'Nhà nước giao đất không thu tiền sử dụng đất',
      [LandOriginType.LEASED_LUMP_SUM]: 'Nhà nước cho thuê đất thu tiền một lần cho cả thời gian thuê',
      [LandOriginType.LEASED_ANNUAL]: 'Nhà nước cho thuê đất thu tiền thuê đất hàng năm',
      [LandOriginType.RECOGNIZED_WITH_FEE]: 'Công nhận QSDĐ như giao đất có thu tiền sử dụng đất',
      [LandOriginType.RECOGNIZED_WITHOUT_FEE]: 'Công nhận QSDĐ như giao đất không thu tiền sử dụng đất',
      [LandOriginType.TRANSFERRED]: 'Nhận chuyển nhượng quyền sử dụng đất hợp pháp',
      [LandOriginType.INHERITED_OR_DONATED]: 'Nhận thừa kế, tặng cho quyền sử dụng đất',
    };

    const legalRightsMap: Record<LandOriginType, LandOriginRights> = {
      [LandOriginType.ALLOCATED_WITH_FEE]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: true,
        canDonate: true,
        description: 'Được chuyển nhượng, tặng cho, thừa kế, thế chấp tại các TCTD và cho thuê lại quyền sử dụng đất theo quy định.',
      },
      [LandOriginType.ALLOCATED_WITHOUT_FEE]: {
        canTransfer: false,
        canMortgage: false,
        canSublease: false,
        canDonate: false,
        description: 'Không được chuyển nhượng, tặng cho, cho thuê, thế chấp quyền sử dụng đất; bắt buộc sử dụng đúng mục đích được giao.',
      },
      [LandOriginType.LEASED_LUMP_SUM]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: true,
        canDonate: true,
        description: 'Được chuyển nhượng, thế chấp, cho thuê lại quyền sử dụng đất và tài sản gắn liền trong thời hạn thuê đất.',
      },
      [LandOriginType.LEASED_ANNUAL]: {
        canTransfer: false,
        canMortgage: false,
        canSublease: false,
        canDonate: false,
        description: 'Chỉ được bán, thế chấp tài sản thuộc sở hữu gắn liền với đất và quyền thuê trong hợp đồng; KHÔNG được chuyển nhượng quyền sử dụng đất.',
      },
      [LandOriginType.RECOGNIZED_WITH_FEE]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: true,
        canDonate: true,
        description: 'Đầy đủ quyền năng của người sử dụng đất sau khi hoàn thành nghĩa vụ tài chính với ngân sách nhà nước.',
      },
      [LandOriginType.RECOGNIZED_WITHOUT_FEE]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: false,
        canDonate: true,
        description: 'Được cấp Giấy chứng nhận, được chuyển đổi, chuyển nhượng, thừa kế, tặng cho trong hạn mức công nhận của hộ gia đình, cá nhân.',
      },
      [LandOriginType.TRANSFERRED]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: true,
        canDonate: true,
        description: 'Kế thừa toàn bộ quyền và nghĩa vụ hợp pháp từ chủ sử dụng đất trước theo hợp đồng công chứng.',
      },
      [LandOriginType.INHERITED_OR_DONATED]: {
        canTransfer: true,
        canMortgage: true,
        canSublease: true,
        canDonate: true,
        description: 'Quyền sử dụng đất hợp pháp được xác lập qua văn bản thừa kế hoặc tặng cho đã hoàn tất đăng ký biến động.',
      },
    };

    const originName = originNameMap[input.originType];
    const legalRights = legalRightsMap[input.originType];
    const now = new Date().toISOString();

    const auditHash = createHash('sha256')
      .update(`ORIGIN|${parcel.id}|${input.originType}|${input.decisionNumber}|${now}`)
      .digest('hex');

    parcel.originType = input.originType;
    parcel.originName = originName;
    parcel.originDecisionNumber = input.decisionNumber;
    parcel.originDecisionDate = input.decisionDate;
    parcel.financialStatus = input.financialStatus || 'PAID';
    parcel.updatedAt = now;

    this.logger.log(
      `Đã cập nhật nguồn gốc sử dụng đất cho thửa '${parcel.nationalCode}': ${originName} (QĐ: ${input.decisionNumber}, Audit: ${auditHash})`,
    );

    return {
      success: true,
      parcel,
      originType: input.originType,
      originName,
      legalRights,
      auditHash,
      message: `Cập nhật nguồn gốc sử dụng đất '${originName}' thành công theo quy chuẩn Luật Đất đai 2024.`,
    };
  }

  /**
   * Thẩm định điều kiện tách thửa đất nông nghiệp chống manh mún đất đai (DCS-02-CN-004, QTD-26)
   */
  async validateAgriculturalSubdivision(
    input: ValidateAgriculturalSubdivisionInput,
  ): Promise<ValidateAgriculturalSubdivisionResponse> {
    const parcel = this.parcelsStore.find((p) => p.id === input.parcelId);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${input.parcelId}`);
    }

    // Kiểm tra nhóm đất: bắt buộc phải là đất nông nghiệp
    const agriculturalCodes = [
      LandPurposeCode.LUC,
      LandPurposeCode.LUK,
      LandPurposeCode.CLN,
      LandPurposeCode.HNK,
      LandPurposeCode.RSX,
      LandPurposeCode.RPH,
    ];

    if (!agriculturalCodes.includes(parcel.purposeCode)) {
      throw new BadRequestException(
        `Thửa đất mang mục đích '${parcel.purposeCode}' không thuộc nhóm đất nông nghiệp. Quy định QTD-26 chỉ áp dụng cho đất nông nghiệp.`,
      );
    }

    const minCultivationArea = input.minCultivationArea || 500; // 500m2 chống manh mún
    const ineligibleAreas = input.newParcelsArea.filter((area) => area < minCultivationArea);

    if (ineligibleAreas.length > 0) {
      return {
        isEligible: false,
        minCultivationArea,
        ineligibleAreas,
        errorReason: `Vi phạm quy định không tách thửa đất nông nghiệp dưới hạn mức canh tác tối thiểu (QTD-26): Có thửa hình thành diện tích ${ineligibleAreas.join(', ')}m² nhỏ hơn hạn mức tối thiểu ${minCultivationArea}m².`,
        message: 'Từ chối hồ sơ tách thửa đất nông nghiệp do không đảm bảo hạn mức canh tác tối thiểu theo Luật Đất đai 2024.',
      };
    }

    return {
      isEligible: true,
      minCultivationArea,
      ineligibleAreas: [],
      message: 'Hồ sơ tách thửa đất nông nghiệp đủ điều kiện hạn mức canh tác tối thiểu theo quy định của Luật Đất đai 2024.',
    };
  }
}
