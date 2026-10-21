import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  UserRole,
  AdministrativeLevel,
  JurisdictionAction,
  AdministrativeUnit,
  JurisdictionPolicy,
  ConfigureJurisdictionPolicyRequest,
  EvaluatePermissionRequest,
  EvaluatePermissionResponse,
  ConfigureJurisdictionPolicySchema,
  EvaluatePermissionSchema,
} from '@diachinhso/shared';
import { DRIZZLE } from '../../database/drizzle.provider';
import { auditLogs } from '../../database/schema';
import * as crypto from 'crypto';

@Injectable()
export class JurisdictionService {
  private readonly logger = new Logger(JurisdictionService.name);

  // Danh mục 34 Tỉnh / Thành phố theo nghị định mới: 23 Tỉnh/TP sáp nhập và 11 Tỉnh/TP giữ nguyên
  private readonly administrativeUnits: AdministrativeUnit[] = [
    // === I. 23 TỈNH, THÀNH PHỐ HÌNH THÀNH SAU SÁP NHẬP ===
    { code: 'TINH_TUYENQUANG', name: 'Tỉnh Tuyên Quang', level: AdministrativeLevel.PROVINCE, formerUnits: ['Tuyên Quang', 'Hà Giang'] },
    { code: 'TINH_LAOCAI', name: 'Tỉnh Lào Cai', level: AdministrativeLevel.PROVINCE, formerUnits: ['Lào Cai', 'Yên Bái'] },
    { code: 'TINH_THAINGUYEN', name: 'Tỉnh Thái Nguyên', level: AdministrativeLevel.PROVINCE, formerUnits: ['Thái Nguyên', 'Bắc Kạn'] },
    { code: 'TINH_PHUTHO', name: 'Tỉnh Phú Thọ', level: AdministrativeLevel.PROVINCE, formerUnits: ['Phú Thọ', 'Vĩnh Phúc', 'Hòa Bình'] },
    { code: 'TINH_BACNINH', name: 'Tỉnh Bắc Ninh', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bắc Ninh', 'Bắc Giang'] },
    { code: 'TINH_HUNGYEN', name: 'Tỉnh Hưng Yên', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hưng Yên', 'Thái Bình'] },
    { code: 'TINH_HP', name: 'Thành phố Hải Phòng', level: AdministrativeLevel.PROVINCE, formerUnits: ['TP. Hải Phòng', 'Hải Dương'] },
    { code: 'TINH_NINHBINH', name: 'Tỉnh Ninh Bình', level: AdministrativeLevel.PROVINCE, formerUnits: ['Ninh Bình', 'Hà Nam', 'Nam Định'] },
    { code: 'TINH_QUANGTRI', name: 'Tỉnh Quảng Trị', level: AdministrativeLevel.PROVINCE, formerUnits: ['Quảng Trị', 'Quảng Bình'] },
    { code: 'TINH_DN', name: 'Thành phố Đà Nẵng', level: AdministrativeLevel.PROVINCE, formerUnits: ['TP. Đà Nẵng', 'Quảng Nam'] },
    { code: 'TINH_QUANGNGAI', name: 'Tỉnh Quảng Ngãi', level: AdministrativeLevel.PROVINCE, formerUnits: ['Quảng Ngãi', 'Kon Tum'] },
    { code: 'TINH_GIALAI', name: 'Tỉnh Gia Lai', level: AdministrativeLevel.PROVINCE, formerUnits: ['Gia Lai', 'Bình Định'] },
    { code: 'TINH_KHANHHOA', name: 'Tỉnh Khánh Hòa', level: AdministrativeLevel.PROVINCE, formerUnits: ['Khánh Hòa', 'Ninh Thuận'] },
    { code: 'TINH_LAMDONG', name: 'Tỉnh Lâm Đồng', level: AdministrativeLevel.PROVINCE, formerUnits: ['Lâm Đồng', 'Đắk Nông', 'Bình Thuận'] },
    { code: 'TINH_DAKLAK', name: 'Tỉnh Đắk Lắk', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đắk Lắk', 'Phú Yên'] },
    { code: 'TINH_HCM', name: 'Thành phố Hồ Chí Minh', level: AdministrativeLevel.PROVINCE, formerUnits: ['TP. Hồ Chí Minh', 'Bình Dương', 'Bà Rịa - Vũng Tàu'] },
    { code: 'TINH_DONGNAI', name: 'Thành phố Đồng Nai', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đồng Nai', 'Bình Phước'] },
    { code: 'TINH_TAYNINH', name: 'Tỉnh Tây Ninh', level: AdministrativeLevel.PROVINCE, formerUnits: ['Tây Ninh', 'Long An'] },
    { code: 'TINH_CT', name: 'Thành phố Cần Thơ', level: AdministrativeLevel.PROVINCE, formerUnits: ['TP. Cần Thơ', 'Sóc Trăng', 'Hậu Giang'] },
    { code: 'TINH_VINHLONG', name: 'Tỉnh Vĩnh Long', level: AdministrativeLevel.PROVINCE, formerUnits: ['Vĩnh Long', 'Bến Tre', 'Trà Vinh'] },
    { code: 'TINH_DONGTHAP', name: 'Tỉnh Đồng Tháp', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đồng Tháp', 'Tiền Giang'] },
    { code: 'TINH_CAMAU', name: 'Tỉnh Cà Mau', level: AdministrativeLevel.PROVINCE, formerUnits: ['Cà Mau', 'Bạc Liêu'] },
    { code: 'TINH_ANGIANG', name: 'Tỉnh An Giang', level: AdministrativeLevel.PROVINCE, formerUnits: ['An Giang', 'Kiên Giang'] },

    // === II. 11 TỈNH, THÀNH PHỐ GIỮ NGUYÊN (KHÔNG SÁP NHẬP) ===
    { code: 'TINH_HN', name: 'Thành phố Hà Nội', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_HUE', name: 'Thành phố Huế', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_LAICHAU', name: 'Tỉnh Lai Châu', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_DIENBIEN', name: 'Tỉnh Điện Biên', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_SONLA', name: 'Tỉnh Sơn La', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_LANGSON', name: 'Tỉnh Lạng Sơn', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_QUANGNINH', name: 'Tỉnh Quảng Ninh', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_THANHHOA', name: 'Tỉnh Thanh Hóa', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_NGHEAN', name: 'Tỉnh Nghệ An', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_HATINH', name: 'Tỉnh Hà Tĩnh', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_CAOBANG', name: 'Tỉnh Cao Bằng', level: AdministrativeLevel.PROVINCE },

    // Alias hỗ trợ tương thích ngược mã cũ
    { code: 'TINH_HABAC', name: 'Tỉnh Bắc Ninh (Bắc Ninh - Bắc Giang)', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bắc Ninh', 'Bắc Giang'] },

    // === CÁC XÃ / PHƯỜNG TRỰC THUỘC TRỰC TIẾP CẤP TỈNH (CẤP 2 - CƠ SỞ) ===
    // Trực thuộc Thành phố Hà Nội
    { code: 'XA_CONG_VI', name: 'Phường Cống Vị', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
    { code: 'XA_LIEU_GIAI', name: 'Phường Liễu Giai', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
    { code: 'XA_KIM_MA', name: 'Phường Kim Mã', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
    { code: 'XA_TRANG_TIEN', name: 'Phường Tràng Tiền', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
    { code: 'XA_HANG_TRONG', name: 'Phường Hàng Trống', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
    { code: 'XA_DICH_VONG', name: 'Phường Dịch Vọng', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },

    // Trực thuộc Thành phố Hồ Chí Minh
    { code: 'XA_BEN_NGHE', name: 'Phường Bến Nghé', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HCM' },
    { code: 'XA_BEN_THANH', name: 'Phường Bến Thành', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HCM' },

    // Trực thuộc Thành phố Đà Nẵng
    { code: 'XA_HAI_CHAU', name: 'Phường Hải Châu', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_DN' },

    // Trực thuộc Thành phố Hải Phòng
    { code: 'XA_HONG_BANG', name: 'Phường Hồng Bàng', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HP' },

    // Trực thuộc Thành phố Cần Thơ
    { code: 'XA_NINH_KIEU', name: 'Phường Ninh Kiều', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_CT' },

    // Lưu trữ đơn vị quận/huyện phục vụ truy vết lịch sử (Deprecated / Legacy support)
    { code: 'HUYEN_BD', name: 'Khu vực Ba Đình (Lịch sử)', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
    { code: 'HUYEN_HK', name: 'Khu vực Hoàn Kiếm (Lịch sử)', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
    { code: 'HUYEN_CG', name: 'Khu vực Cầu Giấy (Lịch sử)', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
  ];

  // Lưu trữ ma trận chính sách phân quyền
  private policies: Map<string, JurisdictionPolicy> = new Map();

  constructor(
    @Optional()
    @Inject(DRIZZLE)
    private readonly db?: any,
  ) {
    this.initDefaultPolicies();
  }

  /**
   * Khởi tạo ma trận phân quyền mặc định theo mô hình 2 cấp tinh gọn
   */
  private initDefaultPolicies() {
    const defaultPolicies: JurisdictionPolicy[] = [
      {
        id: 'pol-admin-hn',
        role: UserRole.ADMIN,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_HN',
        unitName: 'Thành phố Hà Nội',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
          JurisdictionAction.APPROVE,
          JurisdictionAction.DELETE,
        ],
        description: 'Toàn quyền cấu hình và quản trị trên toàn đơn vị Tỉnh/Thành phố',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pol-reg-hn',
        role: UserRole.LAND_REGISTRAR,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_HN',
        unitName: 'Thành phố Hà Nội',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
          JurisdictionAction.APPROVE,
        ],
        description: 'Văn phòng Đăng ký Đất đai cấp Tỉnh: Quản lý, thẩm định trực tiếp hồ sơ cấp cơ sở',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pol-off-cv',
        role: UserRole.COMMUNE_OFFICER,
        level: AdministrativeLevel.COMMUNE,
        unitCode: 'XA_CONG_VI',
        unitName: 'Phường Cống Vị',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
        ],
        description: 'Cán bộ Địa chính cấp Cơ sở: Tra cứu, khai báo và cập nhật hiện trạng địa bàn',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pol-notary-hn',
        role: UserRole.NOTARY_BANK,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_HN',
        unitName: 'Thành phố Hà Nội',
        allowedActions: [JurisdictionAction.READ, JurisdictionAction.UPDATE],
        description: 'Công chứng & Ngân hàng: Tra cứu và cập nhật trạng thái thế chấp/khóa liên xã',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pol-insp-hn',
        role: UserRole.INSPECTOR,
        level: AdministrativeLevel.PROVINCE,
        unitCode: 'TINH_HN',
        unitName: 'Thành phố Hà Nội',
        allowedActions: [JurisdictionAction.READ],
        description: 'Thanh tra & Quy hoạch: Tra cứu giám sát toàn diện dữ liệu cấp Tỉnh',
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const pol of defaultPolicies) {
      this.policies.set(`${pol.role}_${pol.unitCode}`, pol);
    }
  }

  /**
   * Tra cứu đơn vị hành chính theo mã
   */
  findUnit(code: string): AdministrativeUnit | undefined {
    return this.administrativeUnits.find((u) => u.code === code);
  }

  /**
   * Kiểm tra quan hệ trực thuộc trong mô hình 2 cấp tinh gọn (Tỉnh -> Xã/Phường)
   */
  isDescendant(parentCode: string, targetCode: string): boolean {
    if (parentCode === targetCode) return true;
    const target = this.findUnit(targetCode);
    if (!target) return false;
    if (target.parentCode === parentCode) return true;

    // Hỗ trợ truy vết ngược nếu target là quận/huyện cũ trực thuộc tỉnh
    if (target.parentCode) {
      return this.isDescendant(parentCode, target.parentCode);
    }
    return false;
  }

  /**
   * Lấy danh mục địa giới hành chính theo mô hình 2 cấp (34 Tỉnh thành và Xã/Phường trực thuộc)
   */
  async getHierarchy() {
    const provinces = this.administrativeUnits.filter(
      (u) => u.level === AdministrativeLevel.PROVINCE && u.code !== 'TINH_HABAC', // Loại bỏ duplicate alias
    );
    const communes = this.administrativeUnits.filter(
      (u) => u.level === AdministrativeLevel.COMMUNE,
    );

    const mergedCount = provinces.filter((p) => p.formerUnits && p.formerUnits.length > 0).length;
    const retainedCount = provinces.filter((p) => !p.formerUnits || p.formerUnits.length === 0).length;

    return {
      model: 'TWO_TIER_CONSOLIDATED',
      description: 'Mô hình chính quyền địa phương 2 cấp tinh gọn (Tỉnh/TP và Xã/Phường)',
      totalProvinces: provinces.length,
      mergedCount,
      retainedCount,
      totalUnits: this.administrativeUnits.length,
      provinces: provinces.map((p) => ({
        ...p,
        communes: communes.filter((c) => c.parentCode === p.code),
      })),
    };
  }

  /**
   * Lấy danh sách ma trận chính sách phân quyền hiện tại
   */
  async getPolicies(): Promise<JurisdictionPolicy[]> {
    return Array.from(this.policies.values());
  }

  /**
   * Cấu hình / Cập nhật ma trận phân quyền RBAC theo mô hình 2 cấp
   */
  async configurePolicy(
    dto: ConfigureJurisdictionPolicyRequest,
    meta?: { username?: string; ipAddress?: string },
  ) {
    const parsed = ConfigureJurisdictionPolicySchema.safeParse(dto);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu cấu hình phân quyền không hợp lệ: ${errorDetails}`);
    }

    const { role, level, unitCode, allowedActions, description } = parsed.data;

    // Kiểm tra tính hợp lệ của mã đơn vị hành chính
    const unit = this.findUnit(unitCode);
    if (!unit) {
      throw new BadRequestException(
        `Đơn vị hành chính với mã '${unitCode}' không tồn tại trong hệ thống`,
      );
    }

    // Kiểm tra cấp hành chính tương thích
    if (unit.level !== level) {
      throw new BadRequestException(
        `Cấp hành chính '${level}' không tương thích với đơn vị '${unit.name}' (thuộc cấp ${unit.level})`,
      );
    }

    const policyKey = `${role}_${unitCode}`;
    const existing = this.policies.get(policyKey);
    const policyId = existing ? existing.id : `pol-${Date.now()}`;

    const newPolicy: JurisdictionPolicy = {
      id: policyId,
      role,
      level,
      unitCode,
      unitName: unit.name,
      allowedActions,
      description: description || `Chính sách phân quyền cấp ${level} cho vai trò ${role}`,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(policyKey, newPolicy);

    // Sinh mã băm SHA-256 nhật ký kiểm toán bất biến
    const auditPayload = {
      action: 'CONFIGURE_JURISDICTION_POLICY',
      policyId,
      role,
      level,
      unitCode,
      allowedActions,
      configuredBy: meta?.username || 'SYSTEM_ADMIN',
      timestamp: new Date().toISOString(),
      ipAddress: meta?.ipAddress || '127.0.0.1',
    };

    const auditHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(auditPayload))
      .digest('hex');

    if (this.db) {
      try {
        await this.db.insert(auditLogs).values({
          userId: meta?.username || 'SYSTEM_ADMIN',
          userName: meta?.username || 'Quản trị viên Hệ thống',
          role: UserRole.ADMIN,
          action: 'CONFIGURE_JURISDICTION_POLICY',
          entityType: 'JURISDICTION_POLICY',
          entityId: policyId,
          newData: auditPayload,
          hashSha256: auditHash,
          ipAddress: meta?.ipAddress || '127.0.0.1',
        });
      } catch (err: any) {
        this.logger.warn(`Không thể ghi audit log vào CSDL: ${err.message}`);
      }
    }

    return {
      success: true,
      message: 'Cấu hình ma trận phân quyền thành công',
      policy: newPolicy,
      auditHash,
    };
  }

  /**
   * Đánh giá thẩm quyền truy cập dữ liệu địa chính theo thẩm quyền 2 cấp tinh gọn (QTD-16)
   */
  async evaluatePermission(
    dto: EvaluatePermissionRequest,
    meta?: { ipAddress?: string },
  ): Promise<EvaluatePermissionResponse> {
    const parsed = EvaluatePermissionSchema.safeParse(dto);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu đánh giá thẩm quyền không hợp lệ: ${errorDetails}`);
    }

    const { userRole, userUnitCode, action, targetUnitCode } = parsed.data;

    const userUnit = this.findUnit(userUnitCode);
    if (!userUnit) {
      throw new BadRequestException(
        `Đơn vị hành chính của người dùng '${userUnitCode}' không tồn tại trong danh mục`,
      );
    }

    const targetUnit = this.findUnit(targetUnitCode);
    if (!targetUnit) {
      throw new BadRequestException(
        `Đơn vị hành chính dữ liệu mục tiêu '${targetUnitCode}' không tồn tại trong danh mục`,
      );
    }

    // Đánh giá thẩm quyền theo nguyên tắc 2 cấp (QTD-16):
    let isWithinJurisdiction = false;

    if (userRole === UserRole.ADMIN) {
      // Quản trị viên hệ thống có toàn quyền trên 34 tỉnh thành và mọi đơn vị cơ sở
      isWithinJurisdiction = true;
    } else if (userUnit.level === AdministrativeLevel.PROVINCE) {
      // Cấp Tỉnh có thẩm quyền đối với Tỉnh đó và mọi Xã/Phường trực thuộc trực tiếp
      isWithinJurisdiction = this.isDescendant(userUnit.code, targetUnit.code);
    } else if (userUnit.level === AdministrativeLevel.DISTRICT) {
      // Khu vực lịch sử (nếu có): Thẩm quyền đối với chính nó hoặc các xã trực thuộc
      isWithinJurisdiction =
        targetUnit.code === userUnit.code || targetUnit.parentCode === userUnit.code || this.isDescendant(userUnit.parentCode || '', targetUnit.code);
    } else if (userUnit.level === AdministrativeLevel.COMMUNE) {
      // Cấp Cơ sở: Chỉ có thẩm quyền duy nhất trong phạm vi đúng Xã/Phường đó
      isWithinJurisdiction = targetUnit.code === userUnit.code;
    }

    // Nếu vi phạm thẩm quyền địa giới -> Chặn ngay lập tức (QTD-16)
    if (!isWithinJurisdiction) {
      const violationPayload = {
        action: 'JURISDICTION_BOUNDARY_VIOLATION',
        userRole,
        userUnitCode,
        userUnitName: userUnit.name,
        targetUnitCode,
        targetUnitName: targetUnit.name,
        attemptedAction: action,
        timestamp: new Date().toISOString(),
        ipAddress: meta?.ipAddress || '127.0.0.1',
      };

      const violationHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(violationPayload))
        .digest('hex');

      if (this.db) {
        try {
          await this.db.insert(auditLogs).values({
            userId: userRole,
            userName: `Tài khoản ${userRole}`,
            role: userRole,
            action: 'JURISDICTION_BOUNDARY_VIOLATION',
            entityType: 'JURISDICTION_ACCESS',
            entityId: `${userUnitCode}->${targetUnitCode}`,
            newData: violationPayload,
            hashSha256: violationHash,
            ipAddress: meta?.ipAddress || '127.0.0.1',
          });
        } catch (err: any) {
          this.logger.warn(`Không thể ghi log vi phạm vào CSDL: ${err.message}`);
        }
      }

      throw new ForbiddenException(
        `Từ chối thao tác: Vượt quyền địa giới hành chính theo quy định phân cấp quản lý. Đơn vị công tác '${userUnit.name}' không có thẩm quyền trên địa bàn '${targetUnit.name}'.`,
      );
    }

    // Kiểm tra quyền thao tác (CRUD action) theo chính sách ma trận
    const policy = this.policies.get(`${userRole}_${userUnitCode}`);
    if (policy && !policy.allowedActions.includes(action)) {
      throw new ForbiddenException(
        `Thao tác '${action}' không được cấp quyền cho vai trò ${userRole} tại đơn vị ${userUnit.name}`,
      );
    }

    const successPayload = {
      action: 'JURISDICTION_ACCESS_EVALUATED',
      userRole,
      userUnitCode,
      targetUnitCode,
      grantedAction: action,
      timestamp: new Date().toISOString(),
      ipAddress: meta?.ipAddress || '127.0.0.1',
    };

    const auditHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(successPayload))
      .digest('hex');

    if (this.db) {
      try {
        await this.db.insert(auditLogs).values({
          userId: userRole,
          userName: `Tài khoản ${userRole}`,
          role: userRole,
          action: 'JURISDICTION_ACCESS_EVALUATED',
          entityType: 'JURISDICTION_ACCESS',
          entityId: `${userUnitCode}->${targetUnitCode}`,
          newData: successPayload,
          hashSha256: auditHash,
          ipAddress: meta?.ipAddress || '127.0.0.1',
        });
      } catch (err: any) {
        this.logger.warn(`Không thể ghi log thẩm quyền vào CSDL: ${err.message}`);
      }
    }

    return {
      granted: true,
      reason: `Thao tác hợp lệ trong phạm vi thẩm quyền địa giới hành chính được phân công (${userUnit.name} -> ${targetUnit.name})`,
      userLevel: userUnit.level,
      targetLevel: targetUnit.level,
      auditHash,
    };
  }
}
