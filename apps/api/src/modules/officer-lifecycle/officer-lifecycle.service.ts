import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  UserRole,
  OfficerAccountStatus,
  DeactivationReasonType,
  OfficerAccountItem,
  DeactivateOfficerAccountRequest,
  DeactivateOfficerAccountResponse,
  TransferDossiersRequest,
  TransferDossiersResponse,
  ReactivateOfficerAccountRequest,
  ReactivateOfficerAccountResponse,
  DeactivationInfo,
} from '@diachinhso/shared';

@Injectable()
export class OfficerLifecycleService {
  private readonly logger = new Logger(OfficerLifecycleService.name);

  // Danh mục cán bộ công vụ mẫu đại diện các cấp hành chính
  private officers: OfficerAccountItem[] = [
    {
      id: 'OFF-HN-001',
      officerCode: 'CB-HN-001',
      username: 'nguyen.van.a.dc',
      fullName: 'Nguyễn Văn An',
      email: 'an.nv@hanoi.gov.vn',
      phoneNumber: '0912345678',
      role: UserRole.COMMUNE_OFFICER,
      administrativeUnitCode: 'XA_HANG_BAC',
      administrativeUnitName: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
      department: 'Bộ phận Địa chính - Xây dựng cơ sở',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 4,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'OFF-HN-002',
      officerCode: 'CB-HN-002',
      username: 'tran.thi.b.dc',
      fullName: 'Trần Thị Bích',
      email: 'bich.tt@hanoi.gov.vn',
      phoneNumber: '0912345679',
      role: UserRole.COMMUNE_OFFICER,
      administrativeUnitCode: 'XA_HANG_BAC',
      administrativeUnitName: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
      department: 'Bộ phận Địa chính - Xây dựng cơ sở',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 2,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'OFF-HN-VPDK-001',
      officerCode: 'CB-HN-VPDK-001',
      username: 'le.van.c.dkdd',
      fullName: 'Lê Văn Cường',
      email: 'cuong.lv@hanoi.gov.vn',
      phoneNumber: '0912345680',
      role: UserRole.LAND_REGISTRAR,
      administrativeUnitCode: 'TINH_HN',
      administrativeUnitName: 'Thành phố Hà Nội',
      department: 'Văn phòng Đăng ký Đất đai - Phòng Đăng ký và Cấp GCN',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 6,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'OFF-HN-VPDK-002',
      officerCode: 'CB-HN-VPDK-002',
      username: 'pham.thi.d.dkdd',
      fullName: 'Phạm Thị Dung',
      email: 'dung.pt@hanoi.gov.vn',
      phoneNumber: '0912345681',
      role: UserRole.LAND_REGISTRAR,
      administrativeUnitCode: 'TINH_HN',
      administrativeUnitName: 'Thành phố Hà Nội',
      department: 'Văn phòng Đăng ký Đất đai - Phòng Thẩm định hồ sơ',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 1,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'OFF-HCM-001',
      officerCode: 'CB-HCM-001',
      username: 'hoang.van.e.dc',
      fullName: 'Hoàng Văn Em',
      email: 'em.hv@tphcm.gov.vn',
      phoneNumber: '0987654321',
      role: UserRole.COMMUNE_OFFICER,
      administrativeUnitCode: 'XA_BEN_NGHE',
      administrativeUnitName: 'Xã/Phường Bến Nghé, TP. Hồ Chí Minh',
      department: 'Bộ phận Tiếp nhận và Trả kết quả địa chính',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 5,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'OFF-HCM-002',
      officerCode: 'CB-HCM-002',
      username: 'dang.thi.f.dc',
      fullName: 'Đặng Thị Phương',
      email: 'phuong.dt@tphcm.gov.vn',
      phoneNumber: '0987654322',
      role: UserRole.COMMUNE_OFFICER,
      administrativeUnitCode: 'XA_BEN_NGHE',
      administrativeUnitName: 'Xã/Phường Bến Nghé, TP. Hồ Chí Minh',
      department: 'Bộ phận Địa chính - Xây dựng cơ sở',
      status: OfficerAccountStatus.ACTIVE,
      pendingDossierCount: 3,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    },
    {
      id: 'OFF-NB-001',
      officerCode: 'CB-NB-001',
      username: 'do.van.g.dc',
      fullName: 'Đỗ Văn Giang',
      email: 'giang.dv@ninhbinh.gov.vn',
      phoneNumber: '0933333333',
      role: UserRole.COMMUNE_OFFICER,
      administrativeUnitCode: 'XA_VAN_GIANG',
      administrativeUnitName: 'Xã/Phường Vân Giang, Tỉnh Ninh Bình',
      department: 'Bộ phận Địa chính',
      status: OfficerAccountStatus.TRANSFERRED,
      pendingDossierCount: 0,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      deactivationInfo: {
        decisionNumber: 'QĐ-2026/112/UBND-NB',
        decisionDate: '2026-10-15',
        issuingAuthority: 'UBND Tỉnh Ninh Bình',
        reasonType: DeactivationReasonType.TRANSFER,
        reasonDetail: 'Điều động cán bộ sang Trung tâm Phát triển Quỹ đất tỉnh',
        deactivatedAt: '2026-10-15T08:30:00.000Z',
        deactivatedByAdminId: 'ADMIN-SYS-001',
        transfereeOfficerId: 'OFF-NB-002',
        transfereeOfficerName: 'Vũ Thị Hoa',
        reassignedDossierCount: 7,
        auditHash: '3ab789d2c145e68f00112233445566778899aabbccddeeff0011223344556677',
      },
    },
  ];

  // Danh sách nhật ký kiểm toán điều chuyển
  private auditLogs: Array<{
    id: string;
    action: string;
    officerId: string;
    officerName: string;
    decisionNumber: string;
    reasonType: string;
    transfereeName?: string;
    reassignedDossiers: number;
    auditHash: string;
    performedBy: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.auditLogs.push({
      id: 'AUD-OFF-001',
      action: 'DEACTIVATE_TRANSFER',
      officerId: 'OFF-NB-001',
      officerName: 'Đỗ Văn Giang',
      decisionNumber: 'QĐ-2026/112/UBND-NB',
      reasonType: 'TRANSFER',
      transfereeName: 'Vũ Thị Hoa',
      reassignedDossiers: 7,
      auditHash: '3ab789d2c145e68f00112233445566778899aabbccddeeff0011223344556677',
      performedBy: 'ADMIN-SYS-001',
      timestamp: '2026-10-15T08:30:00.000Z',
    });
  }

  /**
   * Tra cứu danh sách cán bộ công vụ với bộ lọc
   */
  async getOfficers(query?: {
    unitCode?: string;
    role?: UserRole;
    status?: OfficerAccountStatus;
    search?: string;
  }): Promise<OfficerAccountItem[]> {
    let result = [...this.officers];

    if (query?.status) {
      result = result.filter(o => o.status === query.status);
    }
    if (query?.role) {
      result = result.filter(o => o.role === query.role);
    }
    if (query?.unitCode) {
      result = result.filter(o => o.administrativeUnitCode === query.unitCode);
    }
    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      result = result.filter(
        o =>
          o.fullName.toLowerCase().includes(s) ||
          o.username.toLowerCase().includes(s) ||
          o.officerCode.toLowerCase().includes(s) ||
          o.email.toLowerCase().includes(s) ||
          o.administrativeUnitName.toLowerCase().includes(s)
      );
    }

    return result;
  }

  /**
   * Tra cứu thông tin chi tiết một cán bộ
   */
  async getOfficerById(id: string): Promise<OfficerAccountItem> {
    const officer = this.officers.find(o => o.id === id || o.officerCode === id);
    if (!officer) {
      throw new NotFoundException(`Không tìm thấy hồ sơ cán bộ công vụ với mã định danh '${id}'`);
    }
    return officer;
  }

  /**
   * Tra cứu danh sách cán bộ đủ điều kiện nhận bàn giao hồ sơ
   * Phải cùng đơn vị hoặc cùng cấp, và đang có trạng thái ACTIVE
   */
  async getEligibleTransferees(officerId: string): Promise<OfficerAccountItem[]> {
    const currentOfficer = await this.getOfficerById(officerId);
    return this.officers.filter(
      o =>
        o.id !== currentOfficer.id &&
        o.status === OfficerAccountStatus.ACTIVE &&
        (o.administrativeUnitCode === currentOfficer.administrativeUnitCode || o.role === currentOfficer.role)
    );
  }

  /**
   * Khóa / Vô hiệu hóa tài khoản công vụ khi điều chuyển công tác, kỷ luật, thôi việc
   */
  async deactivateAccount(
    req: DeactivateOfficerAccountRequest,
    adminUser: { id: string; username: string; role: UserRole }
  ): Promise<DeactivateOfficerAccountResponse> {
    // 1. Kiểm tra thẩm quyền quản trị viên hệ thống (AC-03, QTD-16, QTD-22)
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Quản trị viên Hệ thống mới có thẩm quyền khóa hoặc vô hiệu hóa tài khoản công vụ');
    }

    // 2. Chống self-lockout: Quản trị viên không được tự vô hiệu hóa tài khoản của chính mình
    if (req.officerId === adminUser.id) {
      throw new BadRequestException('Quản trị viên không thể tự vô hiệu hóa tài khoản đang đăng nhập của chính mình');
    }

    // 3. Validation dữ liệu đầu vào (AC-02)
    if (!req.officerId || !req.decisionNumber || !req.decisionDate || !req.issuingAuthority || !req.reasonDetail) {
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin quyết định hành chính, ngày ban hành, cơ quan ban hành và lý do');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.decisionDate)) {
      throw new BadRequestException('Định dạng ngày quyết định không hợp lệ (chuẩn YYYY-MM-DD)');
    }

    // 4. Tìm kiếm tài khoản cán bộ
    const officerIndex = this.officers.findIndex(o => o.id === req.officerId || o.officerCode === req.officerId);
    if (officerIndex === -1) {
      throw new NotFoundException(`Không tìm thấy tài khoản cán bộ với mã định danh '${req.officerId}'`);
    }
    const officer = this.officers[officerIndex];

    // Xác định trạng thái mới theo loại lý do
    let newStatus: OfficerAccountStatus;
    switch (req.reasonType) {
      case DeactivationReasonType.TRANSFER:
        newStatus = OfficerAccountStatus.TRANSFERRED;
        break;
      case DeactivationReasonType.DISCIPLINE:
        newStatus = OfficerAccountStatus.SUSPENDED_DISCIPLINE;
        break;
      case DeactivationReasonType.DISMISSAL:
        newStatus = OfficerAccountStatus.DISMISSED;
        break;
      case DeactivationReasonType.RESIGNATION:
        newStatus = OfficerAccountStatus.RESIGNED;
        break;
      default:
        throw new BadRequestException(`Loại căn cứ thu hồi quyền '${req.reasonType}' không hợp lệ`);
    }

    if (officer.status === newStatus) {
      throw new ConflictException(`Tài khoản cán bộ '${officer.fullName}' hiện đã ở trạng thái '${newStatus}'`);
    }

    // 5. Xử lý chuyển giao hồ sơ dở dang nếu có chỉ định cán bộ tiếp nhận
    let transfereeName: string | undefined;
    let reassignedCount = 0;

    if (officer.pendingDossierCount > 0) {
      if (!req.transfereeOfficerId) {
        throw new BadRequestException(
          `Cán bộ hiện đang nắm giữ ${officer.pendingDossierCount} hồ sơ địa chính chưa hoàn tất. Vui lòng chỉ định cán bộ thay thế để tiếp nhận bàn giao trước khi vô hiệu hóa`
        );
      }

      const transferee = this.officers.find(o => o.id === req.transfereeOfficerId || o.officerCode === req.transfereeOfficerId);
      if (!transferee) {
        throw new NotFoundException(`Không tìm thấy cán bộ tiếp nhận với mã định danh '${req.transfereeOfficerId}'`);
      }
      if (transferee.id === officer.id) {
        throw new BadRequestException('Cán bộ nhận bàn giao không thể trùng với cán bộ bị điều chuyển');
      }
      if (transferee.status !== OfficerAccountStatus.ACTIVE) {
        throw new BadRequestException(`Cán bộ tiếp nhận '${transferee.fullName}' đang không ở trạng thái hoạt động công vụ`);
      }

      // Thực hiện chuyển giao số lượng hồ sơ
      reassignedCount = officer.pendingDossierCount;
      transferee.pendingDossierCount += reassignedCount;
      officer.pendingDossierCount = 0;
      transfereeName = transferee.fullName;
    }

    // 6. Chấm dứt phiên làm việc hiện thời (Force Logout)
    const terminatedSessionsCount = 1; // Giả lập chấm dứt mọi token và session active

    // 7. Tạo mã băm SHA-256 nhật ký kiểm toán bất biến (AC-04)
    const deactivatedAt = new Date().toISOString();
    const auditPayload = `${officer.id}|${officer.username}|${newStatus}|${req.decisionNumber}|${req.decisionDate}|${req.issuingAuthority}|${req.reasonType}|${adminUser.id}|${reassignedCount}|${deactivatedAt}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    // 8. Cập nhật thông tin cán bộ
    const deactivationInfo: DeactivationInfo = {
      decisionNumber: req.decisionNumber,
      decisionDate: req.decisionDate,
      issuingAuthority: req.issuingAuthority,
      reasonType: req.reasonType,
      reasonDetail: req.reasonDetail,
      deactivatedAt,
      deactivatedByAdminId: adminUser.id,
      transfereeOfficerId: req.transfereeOfficerId,
      transfereeOfficerName: transfereeName,
      reassignedDossierCount: reassignedCount,
      auditHash,
    };

    officer.status = newStatus;
    officer.deactivationInfo = deactivationInfo;

    // Ghi nhật ký kiểm toán
    this.auditLogs.unshift({
      id: `AUD-OFF-${Date.now()}`,
      action: `DEACTIVATE_${req.reasonType}`,
      officerId: officer.id,
      officerName: officer.fullName,
      decisionNumber: req.decisionNumber,
      reasonType: req.reasonType,
      transfereeName,
      reassignedDossiers: reassignedCount,
      auditHash,
      performedBy: adminUser.username || adminUser.id,
      timestamp: deactivatedAt,
    });

    this.logger.log(
      `Đã vô hiệu hóa tài khoản cán bộ '${officer.fullName}' (${officer.officerCode}) theo quyết định '${req.decisionNumber}'. Trạng thái mới: ${newStatus}. Bàn giao ${reassignedCount} hồ sơ cho '${transfereeName || 'Không có'}'. Audit Hash: ${auditHash}`
    );

    return {
      success: true,
      officerId: officer.id,
      officerName: officer.fullName,
      newStatus,
      terminatedSessionsCount,
      reassignedDossiersCount: reassignedCount,
      transfereeOfficerName: transfereeName,
      auditHash,
      deactivatedAt,
      message: `Đã vô hiệu hóa tài khoản cán bộ công vụ thành công theo quyết định ${req.decisionNumber}`,
    };
  }

  /**
   * Bàn giao hồ sơ địa chính giữa 2 cán bộ
   */
  async transferDossiers(
    req: TransferDossiersRequest,
    adminUser: { id: string; username: string; role: UserRole }
  ): Promise<TransferDossiersResponse> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Quản trị viên Hệ thống mới có quyền chỉ đạo chuyển giao hồ sơ địa chính');
    }

    const fromOfficer = await this.getOfficerById(req.fromOfficerId);
    const toOfficer = await this.getOfficerById(req.toOfficerId);

    if (fromOfficer.id === toOfficer.id) {
      throw new BadRequestException('Cán bộ nhận bàn giao không thể trùng với cán bộ chuyển giao');
    }
    if (toOfficer.status !== OfficerAccountStatus.ACTIVE) {
      throw new BadRequestException(`Cán bộ tiếp nhận '${toOfficer.fullName}' đang không hoạt động`);
    }

    const countToTransfer = req.dossierIds?.length || fromOfficer.pendingDossierCount;
    if (fromOfficer.pendingDossierCount < countToTransfer) {
      throw new BadRequestException('Số lượng hồ sơ yêu cầu chuyển giao vượt quá số hồ sơ cán bộ đang giữ');
    }

    fromOfficer.pendingDossierCount -= countToTransfer;
    toOfficer.pendingDossierCount += countToTransfer;

    const auditHash = crypto
      .createHash('sha256')
      .update(`${fromOfficer.id}|${toOfficer.id}|${countToTransfer}|${req.reason}|${Date.now()}`)
      .digest('hex');

    return {
      success: true,
      fromOfficerId: fromOfficer.id,
      toOfficerId: toOfficer.id,
      toOfficerName: toOfficer.fullName,
      transferredCount: countToTransfer,
      auditHash,
      message: `Đã chuyển giao thành công ${countToTransfer} hồ sơ từ '${fromOfficer.fullName}' sang '${toOfficer.fullName}'`,
    };
  }

  /**
   * Khôi phục tài khoản cán bộ công vụ
   */
  async reactivateAccount(
    req: ReactivateOfficerAccountRequest,
    adminUser: { id: string; username: string; role: UserRole }
  ): Promise<ReactivateOfficerAccountResponse> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Quản trị viên Hệ thống mới có thẩm quyền khôi phục tài khoản công vụ');
    }

    const officer = await this.getOfficerById(req.officerId);
    if (officer.status === OfficerAccountStatus.ACTIVE) {
      throw new ConflictException(`Tài khoản cán bộ '${officer.fullName}' hiện đang hoạt động bình thường`);
    }

    const reactivatedAt = new Date().toISOString();
    const auditHash = crypto
      .createHash('sha256')
      .update(`${officer.id}|ACTIVE|${req.decisionNumber}|${req.reinstatementReason}|${reactivatedAt}`)
      .digest('hex');

    officer.status = OfficerAccountStatus.ACTIVE;
    delete officer.deactivationInfo;

    this.auditLogs.unshift({
      id: `AUD-OFF-${Date.now()}`,
      action: 'REACTIVATE_ACCOUNT',
      officerId: officer.id,
      officerName: officer.fullName,
      decisionNumber: req.decisionNumber,
      reasonType: 'REINSTATEMENT',
      reassignedDossiers: 0,
      auditHash,
      performedBy: adminUser.username || adminUser.id,
      timestamp: reactivatedAt,
    });

    return {
      success: true,
      officerId: officer.id,
      officerName: officer.fullName,
      newStatus: OfficerAccountStatus.ACTIVE,
      reactivatedAt,
      auditHash,
      message: `Đã khôi phục hoạt động cho tài khoản cán bộ '${officer.fullName}' theo quyết định ${req.decisionNumber}`,
    };
  }

  /**
   * Lấy danh sách nhật ký kiểm toán điều chuyển
   */
  async getAuditLogs() {
    return this.auditLogs;
  }
}
