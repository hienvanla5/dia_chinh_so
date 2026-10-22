import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  UserRole,
  DelegationScope,
  DelegationStatus,
  DelegationDocument,
  CreateDelegationRequest,
  CreateDelegationResponse,
  RevokeDelegationRequest,
  RevokeDelegationResponse,
  VerifyDelegationAccessRequest,
  VerifyDelegationAccessResponse,
} from '@diachinhso/shared';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);

  // Danh mục cán bộ lãnh đạo & cấp phó
  private officers = [
    {
      id: 'OFF-HN-VPDK-LEAD',
      fullName: 'Trần Đình Trọng',
      title: 'Giám đốc Văn phòng Đăng ký Đất đai',
      role: UserRole.LAND_REGISTRAR,
      unitCode: 'TINH_HN',
    },
    {
      id: 'OFF-HN-VPDK-001',
      fullName: 'Lê Văn Cường',
      title: 'Phó Giám đốc Văn phòng Đăng ký Đất đai',
      role: UserRole.LAND_REGISTRAR,
      unitCode: 'TINH_HN',
    },
    {
      id: 'OFF-HN-VPDK-002',
      fullName: 'Phạm Thị Dung',
      title: 'Trưởng phòng Thẩm định và Cấp Giấy chứng nhận',
      role: UserRole.LAND_REGISTRAR,
      unitCode: 'TINH_HN',
    },
    {
      id: 'OFF-HCM-VPDK-LEAD',
      fullName: 'Nguyễn Văn Minh',
      title: 'Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
      role: UserRole.LAND_REGISTRAR,
      unitCode: 'TINH_HCM',
    },
    {
      id: 'OFF-HCM-VPDK-001',
      fullName: 'Đỗ Quốc Tuấn',
      title: 'Phó Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
      role: UserRole.LAND_REGISTRAR,
      unitCode: 'TINH_HCM',
    },
  ];

  // Danh sách các văn bản ủy quyền điện tử
  private delegations: DelegationDocument[] = [
    {
      id: 'DEL-2026-001',
      documentNumber: 'QĐ-UQ-2026/015/VPDKDD-HN',
      title: 'Ủy quyền giải quyết và ký số phê duyệt Giấy chứng nhận quyền sử dụng đất trong thời gian Giám đốc đi công tác thực địa',
      delegatorId: 'OFF-HN-VPDK-LEAD',
      delegatorName: 'Trần Đình Trọng',
      delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
      delegateeId: 'OFF-HN-VPDK-001',
      delegateeName: 'Lê Văn Cường',
      delegateeTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai',
      signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
      scope: DelegationScope.APPROVE_CERTIFICATE,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      status: DelegationStatus.ACTIVE,
      notes: 'Ủy quyền ký phê duyệt hồ sơ địa chính và ký số GCN điện tử',
      auditHash: '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'DEL-2026-002',
      documentNumber: 'QĐ-UQ-2026/009/VPDKDD-HCM',
      title: 'Ủy quyền ký xác nhận trích lục địa chính và hồ sơ chuyển nhượng',
      delegatorId: 'OFF-HCM-VPDK-LEAD',
      delegatorName: 'Nguyễn Văn Minh',
      delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
      delegateeId: 'OFF-HCM-VPDK-001',
      delegateeName: 'Đỗ Quốc Tuấn',
      delegateeTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
      signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
      scope: DelegationScope.SIGN_TRANSFER,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: DelegationStatus.EXPIRED,
      notes: 'Đã hoàn thành thời hạn ủy quyền',
      auditHash: '4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
  ];

  // Nhật ký kiểm toán bất biến
  private auditLogs: Array<{
    id: string;
    action: string;
    delegationId: string;
    performedBy: string;
    details: string;
    auditHash: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.auditLogs.push({
      id: 'AUD-DEL-001',
      action: 'CREATE_DELEGATION',
      delegationId: 'DEL-2026-001',
      performedBy: 'Trần Đình Trọng',
      details: 'Ban hành văn bản ủy quyền QĐ-UQ-2026/015/VPDKDD-HN cho Phó Giám đốc Lê Văn Cường ký thay',
      auditHash: '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
      timestamp: this.delegations[0].createdAt,
    });
  }

  /**
   * Cập nhật tự động trạng thái hết hạn cho các văn bản ủy quyền
   */
  private updateStatusLifecycle() {
    const now = new Date().getTime();
    for (const d of this.delegations) {
      if (d.status === DelegationStatus.REVOKED) continue;
      const start = new Date(d.startDate).getTime();
      const end = new Date(d.endDate).getTime();

      if (now < start) {
        d.status = DelegationStatus.PENDING;
      } else if (now > end) {
        d.status = DelegationStatus.EXPIRED;
      } else {
        d.status = DelegationStatus.ACTIVE;
      }
    }
  }

  /**
   * Lấy danh sách văn bản ủy quyền
   */
  async getDelegations(query?: { status?: DelegationStatus; delegateeId?: string }): Promise<DelegationDocument[]> {
    this.updateStatusLifecycle();
    let result = [...this.delegations];

    if (query?.status) {
      result = result.filter(d => d.status === query.status);
    }
    if (query?.delegateeId) {
      result = result.filter(d => d.delegateeId === query.delegateeId);
    }

    return result;
  }

  /**
   * Lấy chi tiết một văn bản ủy quyền
   */
  async getDelegationById(id: string): Promise<DelegationDocument> {
    this.updateStatusLifecycle();
    const delegation = this.delegations.find(d => d.id === id || d.documentNumber === id);
    if (!delegation) {
      throw new NotFoundException(`Không tìm thấy văn bản ủy quyền với mã '${id}'`);
    }
    return delegation;
  }

  /**
   * Tạo văn bản ủy quyền điện tử có thời hạn
   */
  async createDelegation(
    req: CreateDelegationRequest,
    delegatorUser: { id: string; fullName: string; role: UserRole }
  ): Promise<CreateDelegationResponse> {
    // 1. Kiểm tra thẩm quyền Lãnh đạo Văn phòng ĐKĐĐ hoặc Quản trị viên (AC-03, QTD-05, QTD-28)
    if (delegatorUser.role !== UserRole.LAND_REGISTRAR && delegatorUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Lãnh đạo Văn phòng Đăng ký Đất đai mới có thẩm quyền ban hành văn bản ủy quyền giải quyết hồ sơ');
    }

    // 2. Validation dữ liệu (AC-02)
    if (!req.documentNumber || !req.title || !req.delegateeId || !req.startDate || !req.endDate) {
      throw new BadRequestException('Vui lòng nhập đầy đủ số văn bản, trích yếu, cán bộ nhận ủy quyền và khoảng thời gian');
    }

    const start = new Date(req.startDate).getTime();
    const end = new Date(req.endDate).getTime();
    if (isNaN(start) || isNaN(end) || start >= end) {
      throw new BadRequestException('Thời điểm kết thúc ủy quyền phải sau thời điểm bắt đầu');
    }

    // 3. Kiểm tra cán bộ nhận ủy quyền
    if (req.delegateeId === delegatorUser.id) {
      throw new BadRequestException('Cán bộ nhận ủy quyền không thể trùng với người ủy quyền');
    }

    const delegatee = this.officers.find(o => o.id === req.delegateeId);
    if (!delegatee) {
      throw new NotFoundException(`Không tìm thấy hồ sơ cán bộ nhận ủy quyền với mã '${req.delegateeId}'`);
    }

    // 4. Sinh mã băm SHA-256 bất biến kiểm toán (AC-04)
    const createdAt = new Date().toISOString();
    const payload = `${req.documentNumber}|${req.title}|${delegatorUser.id}|${delegatee.id}|${req.scope}|${req.startDate}|${req.endDate}|${createdAt}`;
    const auditHash = crypto.createHash('sha256').update(payload).digest('hex');

    const now = Date.now();
    let initialStatus = DelegationStatus.ACTIVE;
    if (now < start) initialStatus = DelegationStatus.PENDING;
    if (now > end) initialStatus = DelegationStatus.EXPIRED;

    const newDelegation: DelegationDocument = {
      id: `DEL-${Date.now()}`,
      documentNumber: req.documentNumber,
      title: req.title,
      delegatorId: delegatorUser.id,
      delegatorName: delegatorUser.fullName || 'Lãnh đạo Văn phòng ĐKĐĐ',
      delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
      delegateeId: delegatee.id,
      delegateeName: delegatee.fullName,
      delegateeTitle: delegatee.title,
      signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
      scope: req.scope,
      startDate: req.startDate,
      endDate: req.endDate,
      status: initialStatus,
      notes: req.notes,
      auditHash,
      createdAt,
    };

    this.delegations.unshift(newDelegation);

    // Ghi nhật ký kiểm toán
    this.auditLogs.unshift({
      id: `AUD-DEL-${Date.now()}`,
      action: 'CREATE_DELEGATION',
      delegationId: newDelegation.id,
      performedBy: delegatorUser.fullName || delegatorUser.id,
      details: `Ban hành văn bản ủy quyền ${req.documentNumber} cho ${delegatee.fullName} (${delegatee.title}) ký thay`,
      auditHash,
      timestamp: createdAt,
    });

    this.logger.log(`Đã ban hành văn bản ủy quyền '${req.documentNumber}' thành công. Audit Hash: ${auditHash}`);

    return {
      success: true,
      delegation: newDelegation,
      auditHash,
      message: `Đã thiết lập văn bản ủy quyền '${req.documentNumber}' thành công`,
    };
  }

  /**
   * Thu hồi văn bản ủy quyền trước thời hạn
   */
  async revokeDelegation(
    req: RevokeDelegationRequest,
    user: { id: string; fullName: string; role: UserRole }
  ): Promise<RevokeDelegationResponse> {
    if (user.role !== UserRole.LAND_REGISTRAR && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Lãnh đạo Văn phòng ĐKĐĐ mới có quyền thu hồi văn bản ủy quyền');
    }

    const delegation = await this.getDelegationById(req.delegationId);
    if (delegation.status === DelegationStatus.REVOKED) {
      throw new ConflictException(`Văn bản ủy quyền '${delegation.documentNumber}' đã bị thu hồi trước đó`);
    }

    const revokedAt = new Date().toISOString();
    const auditHash = crypto
      .createHash('sha256')
      .update(`${delegation.id}|REVOKED|${req.reason}|${user.id}|${revokedAt}`)
      .digest('hex');

    delegation.status = DelegationStatus.REVOKED;
    delegation.revocationReason = req.reason;
    delegation.revokedAt = revokedAt;
    delegation.revokedBy = user.fullName || user.id;

    this.auditLogs.unshift({
      id: `AUD-DEL-${Date.now()}`,
      action: 'REVOKE_DELEGATION',
      delegationId: delegation.id,
      performedBy: user.fullName || user.id,
      details: `Thu hồi văn bản ủy quyền ${delegation.documentNumber}. Lý do: ${req.reason}`,
      auditHash,
      timestamp: revokedAt,
    });

    return {
      success: true,
      delegationId: delegation.id,
      revokedAt,
      auditHash,
      message: `Đã thu hồi văn bản ủy quyền '${delegation.documentNumber}' trước thời hạn`,
    };
  }

  /**
   * Xác thực thẩm quyền ủy quyền của cán bộ khi thực hiện ký duyệt
   */
  async verifyDelegationAccess(req: VerifyDelegationAccessRequest): Promise<VerifyDelegationAccessResponse> {
    this.updateStatusLifecycle();
    const now = Date.now();

    const activeDelegation = this.delegations.find(
      d =>
        d.delegateeId === req.officerId &&
        d.status === DelegationStatus.ACTIVE &&
        (d.scope === DelegationScope.ALL_DOSSIERS || d.scope === req.requiredScope) &&
        new Date(d.startDate).getTime() <= now &&
        new Date(d.endDate).getTime() >= now
    );

    if (activeDelegation) {
      return {
        hasDelegation: true,
        delegation: activeDelegation,
        signingTitle: activeDelegation.signingPrefix,
        message: `Cán bộ có văn bản ủy quyền hợp lệ '${activeDelegation.documentNumber}' để ký thay Giám đốc`,
      };
    }

    return {
      hasDelegation: false,
      signingTitle: 'CÁN BỘ ĐỊA CHÍNH',
      message: 'Không tìm thấy văn bản ủy quyền ký thay đang có hiệu lực cho nghiệp vụ này',
    };
  }

  /**
   * Lấy danh sách nhật ký kiểm toán
   */
  async getAuditLogs() {
    return this.auditLogs;
  }
}
