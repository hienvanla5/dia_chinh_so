import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  EnterpriseAccount,
  EnterpriseStaffPermission,
  EnterpriseStaffMember,
  EnterpriseProjectParcel,
  EnterpriseLoginRequest,
  EnterpriseLoginResponse,
  AssignEnterpriseStaffRequest,
  AssignEnterpriseStaffResponse,
} from '@diachinhso/shared';

@Injectable()
export class EnterpriseIdpService {
  private readonly logger = new Logger(EnterpriseIdpService.name);

  // Danh mục tài khoản doanh nghiệp mẫu (Mock Sandbox)
  private enterprises: EnterpriseAccount[] = [
    {
      id: 'ENT-0101234567',
      taxId: '0101234567',
      enterpriseName: 'Tập đoàn Đầu tư Địa ốc Thủ Đô',
      representativeName: 'Hoàng Minh Đức',
      representativeCitizenId: '001085000123',
      headquartersAddress: 'Số 18, Phố Tràng Tiền, TP. Hà Nội',
      phoneNumber: '02439876543',
      email: 'phapche@thudoland.vn',
      digitalCertificateSerial: 'CA-ENT-THUDO-8899',
      projectParcels: [
        {
          parcelId: 'PAR-HN-001',
          nationalCode: '01-001-015-0010',
          projectName: 'Khu Đô Thị Sinh Thái Sông Hồng',
          areaM2: 45000,
          purposeCode: 'TMD',
          location: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
          landAllocationDecision: 'QĐ-1245/QĐ-UBND ngày 12/03/2024',
          landUseTerm: 'Thời hạn giao đất: Đến 12/03/2074 (50 năm)',
          certificateNumber: 'GCN-DN-2024-001',
          status: 'ALLOCATED',
        },
        {
          parcelId: 'PAR-HN-002',
          nationalCode: '01-002-008-0055',
          projectName: 'Tòa Nhà Phức Hợp Văn Phòng Thương Mại Thủ Đô',
          areaM2: 12000,
          purposeCode: 'SKC',
          location: 'TP. Hà Nội',
          landAllocationDecision: 'QĐ-889/QĐ-UBND ngày 05/08/2023',
          landUseTerm: 'Thời hạn thuê đất trả tiền một lần: Đến 05/08/2063',
          certificateNumber: 'GCN-DN-2023-045',
          status: 'LEASED',
        },
      ],
      staffMembers: [
        {
          id: 'STF-001',
          fullName: 'Phan Thu Thảo',
          citizenId: '001192000888',
          email: 'thao.pt@thudoland.vn',
          phoneNumber: '0912988776',
          department: 'Ban Pháp chế & Phát triển Dự án',
          position: 'Trưởng ban Pháp chế',
          permissions: [
            EnterpriseStaffPermission.SUBMIT_DOSSIER,
            EnterpriseStaffPermission.VIEW_PARCELS,
            EnterpriseStaffPermission.SUPPLEMENT_DOCS,
          ],
          status: 'ACTIVE',
          assignedAt: '2026-01-10T08:00:00.000Z',
        },
        {
          id: 'STF-002',
          fullName: 'Vũ Tuấn Kiệt',
          citizenId: '001195000999',
          email: 'kiet.vt@thudoland.vn',
          phoneNumber: '0912988777',
          department: 'Phòng Tài chính Kế toán',
          position: 'Chuyên viên Kế toán Thuế',
          permissions: [
            EnterpriseStaffPermission.VIEW_PARCELS,
            EnterpriseStaffPermission.MANAGE_PAYMENTS,
          ],
          status: 'ACTIVE',
          assignedAt: '2026-02-15T09:30:00.000Z',
        },
      ],
    },
    {
      id: 'ENT-0309876543',
      taxId: '0309876543',
      enterpriseName: 'Công ty Cổ phần Đầu tư Phát triển Sài Gòn Xanh',
      representativeName: 'Trần Thị Mai',
      representativeCitizenId: '079188000456',
      headquartersAddress: 'Số 68, Đường Nguyễn Huệ, TP. Hồ Chí Minh',
      phoneNumber: '02838221144',
      email: 'contact@saigonxanh.com.vn',
      digitalCertificateSerial: 'CA-ENT-SGX-7766',
      projectParcels: [
        {
          parcelId: 'PAR-HCM-001',
          nationalCode: '79-001-020-0088',
          projectName: 'Khu Công Viên Công Nghệ Cao Sài Gòn Xanh',
          areaM2: 80000,
          purposeCode: 'SKX',
          location: 'Xã/Phường Bến Nghé, TP. Hồ Chí Minh',
          landAllocationDecision: 'QĐ-3344/QĐ-UBND ngày 20/11/2022',
          landUseTerm: 'Đến 20/11/2072',
          certificateNumber: 'GCN-DN-2022-112',
          status: 'ALLOCATED',
        },
      ],
      staffMembers: [],
    },
  ];

  // Danh mục nhật ký kiểm toán bất biến
  private auditLogs: Array<{
    id: string;
    action: string;
    enterpriseId: string;
    performedBy: string;
    details: string;
    auditHash: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.auditLogs.push({
      id: 'AUD-ENT-001',
      action: 'ENTERPRISE_REGISTRATION',
      enterpriseId: 'ENT-0101234567',
      performedBy: 'Cổng Định danh Doanh nghiệp Quốc gia',
      details: 'Đồng bộ dữ liệu doanh nghiệp và số hóa 2 thửa đất dự án',
      auditHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      timestamp: '2026-01-10T08:00:00.000Z',
    });
  }

  /**
   * Đăng nhập Cổng Định danh Doanh nghiệp qua MST và Chữ ký số / OTP
   */
  async login(req: EnterpriseLoginRequest): Promise<EnterpriseLoginResponse> {
    if (!req.taxId || !req.authMethod) {
      throw new BadRequestException('Vui lòng nhập mã số thuế và chọn phương thức xác thực');
    }

    if (!/^\d{10}(-\d{3})?$/.test(req.taxId)) {
      throw new BadRequestException('Mã số thuế doanh nghiệp phải gồm 10 hoặc 13 chữ số');
    }

    const enterprise = this.enterprises.find(e => e.taxId === req.taxId);
    if (!enterprise) {
      throw new NotFoundException(`Không tìm thấy thông tin doanh nghiệp với mã số thuế '${req.taxId}' trên Cổng Quốc gia`);
    }

    // Kiểm tra phương thức xác thực
    if (req.authMethod === 'DIGITAL_SIGNATURE') {
      if (!req.digitalSignatureCertSerial && !enterprise.digitalCertificateSerial) {
        throw new UnauthorizedException('Không phát hiện chứng thư số doanh nghiệp hợp lệ');
      }
    } else if (req.authMethod === 'REPRESENTATIVE_OTP') {
      // Mock Sandbox: cho phép OTP 123456 hoặc bất kỳ OTP 6 số
      if (!req.otpCode || req.otpCode.length !== 6) {
        throw new BadRequestException('Mã OTP xác thực người đại diện theo pháp luật phải gồm đúng 6 chữ số');
      }
      if (req.otpCode === '000000') {
        throw new UnauthorizedException('Mã OTP xác thực người đại diện không chính xác');
      }
    }

    const timestamp = new Date().toISOString();
    const auditPayload = `${enterprise.id}|${enterprise.taxId}|${req.authMethod}|${enterprise.representativeCitizenId}|${timestamp}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    // Giả lập Access Token
    const accessToken = `JWT_ENTERPRISE_${Buffer.from(enterprise.id).toString('base64')}_${Date.now()}`;

    this.auditLogs.unshift({
      id: `AUD-ENT-${Date.now()}`,
      action: 'ENTERPRISE_LOGIN',
      enterpriseId: enterprise.id,
      performedBy: enterprise.representativeName,
      details: `Đăng nhập Cổng Định danh Doanh nghiệp qua phương thức ${req.authMethod}`,
      auditHash,
      timestamp,
    });

    this.logger.log(`Doanh nghiệp '${enterprise.enterpriseName}' (MST: ${enterprise.taxId}) đăng nhập thành công. Audit Hash: ${auditHash}`);

    return {
      accessToken,
      enterprise: {
        id: enterprise.id,
        taxId: enterprise.taxId,
        enterpriseName: enterprise.enterpriseName,
        representativeName: enterprise.representativeName,
        headquartersAddress: enterprise.headquartersAddress,
        parcelCount: enterprise.projectParcels.length,
        staffCount: enterprise.staffMembers.length,
      },
      auditHash,
      message: 'Đăng nhập Cổng Định danh Doanh nghiệp thành công',
    };
  }

  /**
   * Tra cứu hồ sơ doanh nghiệp
   */
  async getEnterpriseProfile(enterpriseId: string): Promise<EnterpriseAccount> {
    const enterprise = this.enterprises.find(e => e.id === enterpriseId || e.taxId === enterpriseId);
    if (!enterprise) {
      throw new NotFoundException(`Không tìm thấy hồ sơ doanh nghiệp với mã '${enterpriseId}'`);
    }
    return enterprise;
  }

  /**
   * Lấy danh mục thửa đất dự án doanh nghiệp đang quản lý
   */
  async getProjectParcels(enterpriseId: string): Promise<EnterpriseProjectParcel[]> {
    const enterprise = await this.getEnterpriseProfile(enterpriseId);
    return enterprise.projectParcels;
  }

  /**
   * Phân quyền nhân viên phụ trách hồ sơ dự án đất đai
   */
  async assignStaff(req: AssignEnterpriseStaffRequest): Promise<AssignEnterpriseStaffResponse> {
    if (!req.enterpriseId || !req.fullName || !req.citizenId || !req.email) {
      throw new BadRequestException('Vui lòng nhập đầy đủ họ tên, CCCD và email nhân viên');
    }

    if (!/^\d{12}$/.test(req.citizenId)) {
      throw new BadRequestException('Số CCCD của nhân viên phải gồm đúng 12 chữ số');
    }

    if (!req.permissions || req.permissions.length === 0) {
      throw new BadRequestException('Vui lòng phân công ít nhất một quyền hạn xử lý hồ sơ');
    }

    const enterprise = await this.getEnterpriseProfile(req.enterpriseId);

    // Kiểm tra nhân viên đã tồn tại chưa
    const existingStaff = enterprise.staffMembers.find(s => s.citizenId === req.citizenId);
    if (existingStaff) {
      throw new ConflictException(`Nhân viên với số CCCD '${req.citizenId}' đã được phân quyền trước đó`);
    }

    const assignedAt = new Date().toISOString();
    const payload = `${enterprise.id}|${req.citizenId}|${req.fullName}|${req.permissions.join(',')}|${assignedAt}`;
    const auditHash = crypto.createHash('sha256').update(payload).digest('hex');

    const newStaff: EnterpriseStaffMember = {
      id: `STF-${Date.now()}`,
      fullName: req.fullName,
      citizenId: req.citizenId,
      email: req.email,
      phoneNumber: req.phoneNumber,
      department: req.department,
      position: req.position,
      permissions: req.permissions,
      status: 'ACTIVE',
      assignedAt,
    };

    enterprise.staffMembers.unshift(newStaff);

    this.auditLogs.unshift({
      id: `AUD-ENT-${Date.now()}`,
      action: 'ASSIGN_STAFF',
      enterpriseId: enterprise.id,
      performedBy: enterprise.representativeName,
      details: `Phân quyền nhân viên ${req.fullName} (${req.position}) phụ trách ${req.permissions.length} quyền hạn hồ sơ dự án`,
      auditHash,
      timestamp: assignedAt,
    });

    this.logger.log(`Đã phân quyền cho nhân viên '${req.fullName}' thuộc doanh nghiệp '${enterprise.enterpriseName}'. Audit Hash: ${auditHash}`);

    return {
      success: true,
      staff: newStaff,
      auditHash,
      message: `Đã phân quyền xử lý hồ sơ đất đai cho nhân viên '${req.fullName}' thành công`,
    };
  }

  /**
   * Thu hồi quyền nhân viên
   */
  async removeStaff(enterpriseId: string, staffId: string) {
    const enterprise = await this.getEnterpriseProfile(enterpriseId);
    const index = enterprise.staffMembers.findIndex(s => s.id === staffId);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy nhân viên với mã '${staffId}'`);
    }

    const removed = enterprise.staffMembers.splice(index, 1)[0];
    const timestamp = new Date().toISOString();
    const auditHash = crypto.createHash('sha256').update(`${enterprise.id}|REMOVE_STAFF|${staffId}|${timestamp}`).digest('hex');

    this.auditLogs.unshift({
      id: `AUD-ENT-${Date.now()}`,
      action: 'REMOVE_STAFF',
      enterpriseId: enterprise.id,
      performedBy: enterprise.representativeName,
      details: `Thu hồi quyền hạn nhân viên ${removed.fullName}`,
      auditHash,
      timestamp,
    });

    return {
      success: true,
      message: `Đã thu hồi quyền xử lý hồ sơ của nhân viên '${removed.fullName}'`,
      auditHash,
    };
  }

  /**
   * Lấy danh sách nhật ký kiểm toán
   */
  async getAuditLogs() {
    return this.auditLogs;
  }
}
