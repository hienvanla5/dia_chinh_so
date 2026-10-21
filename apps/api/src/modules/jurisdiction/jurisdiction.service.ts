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

  // Danh mục chuẩn hóa Đơn vị hành chính 3 cấp (Tỉnh - Huyện - Xã)
  private readonly administrativeUnits: AdministrativeUnit[] = [
    // Cấp 1: Tỉnh / Thành phố trực thuộc Trung ương
    { code: 'TINH_HN', name: 'Thành phố Hà Nội', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_HCM', name: 'Thành phố Hồ Chí Minh', level: AdministrativeLevel.PROVINCE },
    { code: 'TINH_DN', name: 'Thành phố Đà Nẵng', level: AdministrativeLevel.PROVINCE },

    // Cấp 2: Quận / Huyện
    { code: 'HUYEN_BD', name: 'Quận Ba Đình', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
    { code: 'HUYEN_HK', name: 'Quận Hoàn Kiếm', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
    { code: 'HUYEN_CG', name: 'Quận Cầu Giấy', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HN' },
    { code: 'HUYEN_Q1', name: 'Quận 1', level: AdministrativeLevel.DISTRICT, parentCode: 'TINH_HCM' },

    // Cấp 3: Xã / Phường
    { code: 'XA_CONG_VI', name: 'Phường Cống Vị', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_BD' },
    { code: 'XA_LIEU_GIAI', name: 'Phường Liễu Giai', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_BD' },
    { code: 'XA_KIM_MA', name: 'Phường Kim Mã', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_BD' },
    { code: 'XA_TRANG_TIEN', name: 'Phường Tràng Tiền', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_HK' },
    { code: 'XA_HANG_TRONG', name: 'Phường Hàng Trống', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_HK' },
    { code: 'XA_DICH_VONG', name: 'Phường Dịch Vọng', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_CG' },
    { code: 'XA_BEN_NGHE', name: 'Phường Bến Nghé', level: AdministrativeLevel.COMMUNE, parentCode: 'HUYEN_Q1' },
  ];

  // Lưu trữ ma trận chính sách phân quyền (Bộ nhớ cache / fallback khi chưa có bảng riêng)
  private policies: Map<string, JurisdictionPolicy> = new Map();

  constructor(
    @Optional()
    @Inject(DRIZZLE)
    private readonly db?: any,
  ) {
    this.initDefaultPolicies();
  }

  /**
   * Khởi tạo ma trận phân quyền mặc định
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
        id: 'pol-reg-bd',
        role: UserRole.LAND_REGISTRAR,
        level: AdministrativeLevel.DISTRICT,
        unitCode: 'HUYEN_BD',
        unitName: 'Quận Ba Đình',
        allowedActions: [
          JurisdictionAction.READ,
          JurisdictionAction.CREATE,
          JurisdictionAction.UPDATE,
          JurisdictionAction.APPROVE,
        ],
        description: 'Văn phòng Đăng ký Đất đai cấp Huyện: Đọc, lập, thẩm định và hiệu chỉnh',
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
        description: 'Cán bộ Địa chính cấp Xã: Tra cứu, khai báo và cập nhật hiện trạng địa bàn',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pol-notary-bd',
        role: UserRole.NOTARY_BANK,
        level: AdministrativeLevel.DISTRICT,
        unitCode: 'HUYEN_BD',
        unitName: 'Quận Ba Đình',
        allowedActions: [JurisdictionAction.READ, JurisdictionAction.UPDATE],
        description: 'Công chứng & Ngân hàng: Tra cứu và cập nhật trạng thái thế chấp/khóa',
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
   * Kiểm tra quan hệ trực thuộc trong cây 3 cấp (Parent -> Child)
   */
  isDescendant(parentCode: string, targetCode: string): boolean {
    if (parentCode === targetCode) return true;
    const target = this.findUnit(targetCode);
    if (!target || !target.parentCode) return false;
    if (target.parentCode === parentCode) return true;
    return this.isDescendant(parentCode, target.parentCode);
  }

  /**
   * [DCS-01-CN-003] Lấy danh mục cây phân cấp hành chính 3 cấp
   */
  async getHierarchy() {
    const provinces = this.administrativeUnits.filter(
      (u) => u.level === AdministrativeLevel.PROVINCE,
    );
    const districts = this.administrativeUnits.filter(
      (u) => u.level === AdministrativeLevel.DISTRICT,
    );
    const communes = this.administrativeUnits.filter(
      (u) => u.level === AdministrativeLevel.COMMUNE,
    );

    return {
      totalUnits: this.administrativeUnits.length,
      provinces: provinces.map((p) => ({
        ...p,
        districts: districts
          .filter((d) => d.parentCode === p.code)
          .map((d) => ({
            ...d,
            communes: communes.filter((c) => c.parentCode === d.code),
          })),
      })),
    };
  }

  /**
   * [DCS-01-CN-003] Lấy danh sách ma trận chính sách phân quyền hiện tại
   */
  async getPolicies(): Promise<JurisdictionPolicy[]> {
    return Array.from(this.policies.values());
  }

  /**
   * [DCS-01-CN-003] Cấu hình / Cập nhật ma trận phân quyền RBAC 3 cấp (Quản trị viên)
   */
  async configurePolicy(
    dto: ConfigureJurisdictionPolicyRequest,
    meta?: { username?: string; ipAddress?: string },
  ) {
    // 1. Kiểm tra validation bằng Zod (TC-02)
    const parsed = ConfigureJurisdictionPolicySchema.safeParse(dto);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu cấu hình phân quyền không hợp lệ: ${errorDetails}`);
    }

    const { role, level, unitCode, allowedActions, description } = parsed.data;

    // 2. Kiểm tra tính hợp lệ của mã đơn vị hành chính (TC-02)
    const unit = this.findUnit(unitCode);
    if (!unit) {
      throw new BadRequestException(
        `Đơn vị hành chính với mã '${unitCode}' không tồn tại trong hệ thống phân cấp 3 cấp`,
      );
    }

    // Kiểm tra cấp hành chính tương thích
    if (unit.level !== level) {
      throw new BadRequestException(
        `Cấp hành chính '${level}' không tương thích với đơn vị '${unit.name}' (thuộc cấp ${unit.level})`,
      );
    }

    // 3. Cập nhật hoặc lưu chính sách mới (TC-01)
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

    // 4. Sinh mã băm SHA-256 nhật ký kiểm toán bất biến (AC-04 / TC-04)
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

    // 5. Ghi nhật ký vào CSDL nếu có kết nối (TC-04)
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
      message: 'Cấu hình ma trận phân quyền cấp hành chính thành công',
      policy: newPolicy,
      auditHash,
    };
  }

  /**
   * [DCS-01-CN-003] Đánh giá thẩm quyền truy cập dữ liệu địa chính theo thẩm quyền 3 cấp (QTD-16)
   */
  async evaluatePermission(
    dto: EvaluatePermissionRequest,
    meta?: { ipAddress?: string },
  ): Promise<EvaluatePermissionResponse> {
    // 1. Kiểm tra validation bằng Zod (TC-02)
    const parsed = EvaluatePermissionSchema.safeParse(dto);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => i.message).join('; ');
      throw new BadRequestException(`Dữ liệu đánh giá thẩm quyền không hợp lệ: ${errorDetails}`);
    }

    const { userRole, userUnitCode, action, targetUnitCode } = parsed.data;

    // 2. Tìm thông tin đơn vị hành chính
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

    // 3. Đánh giá nguyên tắc thẩm quyền địa giới theo QTD-16 (TC-03)
    let isWithinJurisdiction = false;

    if (userRole === UserRole.ADMIN) {
      // Quản trị viên hệ thống có toàn quyền trên mọi đơn vị
      isWithinJurisdiction = true;
    } else if (userUnit.level === AdministrativeLevel.PROVINCE) {
      // Cấp Tỉnh có thẩm quyền đối với Tỉnh đó và mọi Huyện, Xã trực thuộc
      isWithinJurisdiction = this.isDescendant(userUnit.code, targetUnit.code);
    } else if (userUnit.level === AdministrativeLevel.DISTRICT) {
      // Cấp Huyện có thẩm quyền đối với Huyện đó và các Xã/Phường trực thuộc
      isWithinJurisdiction =
        targetUnit.code === userUnit.code || targetUnit.parentCode === userUnit.code;
    } else if (userUnit.level === AdministrativeLevel.COMMUNE) {
      // Cấp Xã chỉ có thẩm quyền duy nhất trong phạm vi đúng Xã/Phường đó
      isWithinJurisdiction = targetUnit.code === userUnit.code;
    }

    // 4. Nếu vi phạm địa giới hành chính (QTD-16) -> Chặn và ghi nhật ký vi phạm (TC-03, TC-04)
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

    // 5. Kiểm tra quyền thao tác (CRUD action) theo chính sách ma trận
    const policy = this.policies.get(`${userRole}_${userUnitCode}`);
    if (policy && !policy.allowedActions.includes(action)) {
      throw new ForbiddenException(
        `Thao tác '${action}' không được cấp quyền cho vai trò ${userRole} tại đơn vị ${userUnit.name}`,
      );
    }

    // 6. Luồng thành công (TC-01, TC-04)
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
