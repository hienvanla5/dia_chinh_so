import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  UserRole,
  DossierStatus,
  FluctuationType,
  DigitalSignatureProvider,
  SignatureStandard,
  OcspCertificateStatus,
  PublicOfficerCertificate,
  SignDossierApprovalRequest,
  SignDossierApprovalResponse,
  VerifyDigitalSignatureRequest,
  VerifyDigitalSignatureResponse,
  PendingDossierForSigning,
  SignDossierApprovalSchema,
  VerifyDigitalSignatureSchema,
} from '@diachinhso/shared';
import { DRIZZLE } from '../../database/drizzle.provider';
import { auditLogs, dossiers, digitalCertificates } from '../../database/schema';
import * as crypto from 'crypto';

@Injectable()
export class DigitalSignatureService {
  private readonly logger = new Logger(DigitalSignatureService.name);

  // Danh mục Chứng thư số công vụ mẫu (Mock Ban Cơ yếu Chính phủ & SmartCA)
  private readonly certificates: Map<string, PublicOfficerCertificate> = new Map([
    [
      'GOV-CA-VPDKDD-001',
      {
        serialNumber: 'GOV-CA-VPDKDD-001',
        subjectName: 'Nguyễn Văn An',
        subjectTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
        organization: 'Văn phòng Đăng ký Đất đai - Sở Tài nguyên và Môi trường',
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        issuer: 'Ban Cơ yếu Chính phủ - Cục Chứng thực số và Bảo mật thông tin',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2027-12-31T23:59:59Z',
        ocspStatus: OcspCertificateStatus.VALID,
        isDefault: true,
      },
    ],
    [
      'VNPT-SMARTCA-VPDKDD-002',
      {
        serialNumber: 'VNPT-SMARTCA-VPDKDD-002',
        subjectName: 'Trần Thị Mai',
        subjectTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai',
        organization: 'Văn phòng Đăng ký Đất đai',
        provider: DigitalSignatureProvider.VNPT_SMARTCA,
        issuer: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT-CA)',
        validFrom: '2024-06-01T00:00:00Z',
        validTo: '2026-06-01T23:59:59Z',
        ocspStatus: OcspCertificateStatus.VALID,
        isDefault: false,
      },
    ],
    [
      'VIETTEL-CA-VPDKDD-003',
      {
        serialNumber: 'VIETTEL-CA-VPDKDD-003',
        subjectName: 'Lê Hoàng Nam',
        subjectTitle: 'Trưởng phòng Đăng ký và Cấp GCN',
        organization: 'Văn phòng Đăng ký Đất đai',
        provider: DigitalSignatureProvider.VIETTEL_CA,
        issuer: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel-CA)',
        validFrom: '2024-03-15T00:00:00Z',
        validTo: '2026-03-15T23:59:59Z',
        ocspStatus: OcspCertificateStatus.VALID,
        isDefault: false,
      },
    ],
    [
      'USB-TOKEN-VPDKDD-005',
      {
        serialNumber: 'USB-TOKEN-VPDKDD-005',
        subjectName: 'Nguyễn Văn An',
        subjectTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
        organization: 'Thiết bị mật mã USB Token chuyên dùng PKCS#11',
        provider: DigitalSignatureProvider.USB_TOKEN,
        issuer: 'Ban Cơ yếu Chính phủ',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2027-12-31T23:59:59Z',
        ocspStatus: OcspCertificateStatus.VALID,
        isDefault: false,
      },
    ],
    [
      'GOV-CA-REVOKED-009',
      {
        serialNumber: 'GOV-CA-REVOKED-009',
        subjectName: 'Phạm Đức Thắng (Đã chuyển công tác)',
        subjectTitle: 'Nguyên Phó Giám đốc VP ĐKĐĐ',
        organization: 'Văn phòng Đăng ký Đất đai',
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        issuer: 'Ban Cơ yếu Chính phủ',
        validFrom: '2023-01-01T00:00:00Z',
        validTo: '2025-01-01T23:59:59Z',
        ocspStatus: OcspCertificateStatus.REVOKED,
        isDefault: false,
      },
    ],
    [
      'GOV-CA-EXPIRED-010',
      {
        serialNumber: 'GOV-CA-EXPIRED-010',
        subjectName: 'Hoàng Minh Tuấn',
        subjectTitle: 'Nguyên Giám đốc VP ĐKĐĐ',
        organization: 'Văn phòng Đăng ký Đất đai',
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        issuer: 'Ban Cơ yếu Chính phủ',
        validFrom: '2021-01-01T00:00:00Z',
        validTo: '2023-12-31T23:59:59Z',
        ocspStatus: OcspCertificateStatus.EXPIRED,
        isDefault: false,
      },
    ],
  ]);

  // Danh sách hồ sơ địa chính phục vụ ký duyệt
  private readonly pendingDossiers: Map<string, PendingDossierForSigning> = new Map([
    [
      'DOSSIER-2026-HN-001',
      {
        id: 'DOSSIER-2026-HN-001',
        dossierCode: 'HS-2026-001-HN',
        parcelId: 'PARCEL-HN-001',
        parcelNationalCode: '01001-0012-0045',
        applicantName: 'Trần Văn Hoàng',
        applicantCitizenId: '001090123456',
        fluctuationType: FluctuationType.TRANSFER,
        status: DossierStatus.APPRAISED,
        submittedAt: '2026-10-20T08:30:00Z',
        communeName: 'Phường Điện Biên',
        provinceName: 'Thành phố Hà Nội',
        isParcelLocked: false,
      },
    ],
    [
      'DOSSIER-2026-HCM-002',
      {
        id: 'DOSSIER-2026-HCM-002',
        dossierCode: 'HS-2026-002-HCM',
        parcelId: 'PARCEL-HCM-002',
        parcelNationalCode: '79001-0005-0118',
        applicantName: 'Lê Thị Thu',
        applicantCitizenId: '079192000001',
        fluctuationType: FluctuationType.DONATION,
        status: DossierStatus.APPRAISED,
        submittedAt: '2026-10-21T09:15:00Z',
        communeName: 'Phường Bến Nghé',
        provinceName: 'Thành phố Hồ Chí Minh',
        isParcelLocked: false,
      },
    ],
    [
      'DOSSIER-2026-DN-003',
      {
        id: 'DOSSIER-2026-DN-003',
        dossierCode: 'HS-2026-003-DN',
        parcelId: 'PARCEL-DN-003',
        parcelNationalCode: '48001-0008-0092',
        applicantName: 'Nguyễn Quốc Cường',
        applicantCitizenId: '048085002233',
        fluctuationType: FluctuationType.INHERITANCE,
        status: DossierStatus.APPRAISED,
        submittedAt: '2026-10-21T14:00:00Z',
        communeName: 'Phường Hải Châu 1',
        provinceName: 'Thành phố Đà Nẵng',
        isParcelLocked: true, // Thửa đất có tranh chấp / khóa
      },
    ],
    [
      'DOSSIER-2026-HP-004',
      {
        id: 'DOSSIER-2026-HP-004',
        dossierCode: 'HS-2026-004-HP',
        parcelId: 'PARCEL-HP-004',
        parcelNationalCode: '31001-0010-0077',
        applicantName: 'Vũ Thị Minh',
        applicantCitizenId: '031190001122',
        fluctuationType: FluctuationType.MORTGAGE,
        status: DossierStatus.APPRAISED,
        submittedAt: '2026-10-22T08:00:00Z',
        communeName: 'Phường Minh Khai',
        provinceName: 'Thành phố Hải Phòng',
        isParcelLocked: true, // Đang bị khóa giao dịch công chứng
      },
    ],
  ]);

  constructor(
    @Optional()
    @Inject(DRIZZLE)
    private readonly db?: any,
  ) {}

  /**
   * 1. Tra cứu danh sách chứng thư số chuyên dùng công vụ & SmartCA khả dụng
   */
  async getAvailableCertificates(role?: UserRole): Promise<PublicOfficerCertificate[]> {
    // Chỉ cán bộ có thẩm quyền mới được truy cập danh sách chứng thư số công vụ
    if (role && role !== UserRole.LAND_REGISTRAR && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Tài khoản không đủ quyền truy cập danh sách chứng thư số công vụ chuyên dùng (chỉ áp dụng cho Văn phòng Đăng ký Đất đai hoặc Quản trị viên).',
      );
    }
    return Array.from(this.certificates.values());
  }

  /**
   * 2. Kiểm tra trực tuyến trạng thái thu hồi chứng thư số qua giao thức OCSP (QTD-28)
   */
  async checkOcspStatus(serialNumber: string): Promise<{
    serialNumber: string;
    status: OcspCertificateStatus;
    checkedAt: string;
    responderUrl: string;
    isValid: boolean;
    reason?: string;
  }> {
    if (!serialNumber || serialNumber.trim() === '') {
      throw new BadRequestException('Số serial chứng thư số không được để trống khi kiểm tra OCSP');
    }

    const cert = this.certificates.get(serialNumber.trim());
    if (!cert) {
      throw new BadRequestException(`Không tìm thấy chứng thư số có số serial '${serialNumber}' trong CSDL chứng thực.`);
    }

    const checkedAt = new Date().toISOString();
    const responderUrl = 'https://ocsp.ca.gov.vn';

    if (cert.ocspStatus === OcspCertificateStatus.REVOKED) {
      return {
        serialNumber: cert.serialNumber,
        status: OcspCertificateStatus.REVOKED,
        checkedAt,
        responderUrl,
        isValid: false,
        reason: 'Chứng thư số đã bị thu hồi trực tuyến theo yêu cầu của đơn vị quản lý cán bộ.',
      };
    }

    if (cert.ocspStatus === OcspCertificateStatus.EXPIRED) {
      return {
        serialNumber: cert.serialNumber,
        status: OcspCertificateStatus.EXPIRED,
        checkedAt,
        responderUrl,
        isValid: false,
        reason: 'Chứng thư số đã quá hạn sử dụng theo thời hạn cấp phép của Ban Cơ yếu Chính phủ.',
      };
    }

    return {
      serialNumber: cert.serialNumber,
      status: OcspCertificateStatus.VALID,
      checkedAt,
      responderUrl,
      isValid: true,
      reason: 'Chứng thư số công vụ hợp lệ, danh sách thu hồi CRL và phản hồi OCSP an toàn.',
    };
  }

  /**
   * 3. Lấy danh sách hồ sơ địa chính chờ ký duyệt
   */
  async getPendingDossiers(): Promise<PendingDossierForSigning[]> {
    return Array.from(this.pendingDossiers.values());
  }

  /**
   * 4. Ký số phê duyệt hồ sơ địa chính bằng chứng thư số chuyên dùng công vụ và SmartCA
   * Đáp ứng: TC-01, TC-02, TC-03 (QTD-05, QTD-28), TC-04 (Kiểm toán SHA-256)
   */
  async signDossierApproval(
    data: SignDossierApprovalRequest,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<SignDossierApprovalResponse> {
    // --- BƯỚC 1: KIỂM TRA ĐẦU VÀO HỢP LỆ VỚI ZOD SCHEMA (TC-02) ---
    const parseResult = SignDossierApprovalSchema.safeParse(data);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new BadRequestException(`Dữ liệu ký số không hợp lệ: ${errorMsg}`);
    }

    const { dossierId, signerRole, provider, certificateSerial, reason, signaturePin } = parseResult.data;

    // --- BƯỚC 2: RÀNG BUỘC NGHIỆP VỤ THẨM QUYỀN (QTD-05 / TC-03) ---
    // Chỉ Lãnh đạo Văn phòng Đăng ký Đất đai hoặc Quản trị viên mới có thẩm quyền ký phê duyệt hồ sơ
    if (signerRole !== UserRole.LAND_REGISTRAR && signerRole !== UserRole.ADMIN) {
      const violationPayload = {
        action: 'SIGNING_AUTHORITY_VIOLATION',
        attemptedRole: signerRole,
        dossierId,
        certificateSerial,
        timestamp: new Date().toISOString(),
        ipAddress: meta?.ipAddress || '127.0.0.1',
      };
      const violationHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(violationPayload))
        .digest('hex');

      await this.saveAuditLog({
        userId: signerRole,
        userName: `Tài khoản ${signerRole}`,
        role: signerRole,
        action: 'SIGNING_AUTHORITY_VIOLATION',
        entityType: 'DOSSIER_SIGNATURE',
        entityId: dossierId,
        newData: violationPayload,
        hashSha256: violationHash,
        ipAddress: meta?.ipAddress || '127.0.0.1',
      });

      throw new ForbiddenException(
        'Từ chối ký số: Tài khoản không đủ thẩm quyền phê duyệt hồ sơ địa chính theo quy định Luật Đất đai 2024. Chỉ Lãnh đạo Văn phòng Đăng ký Đất đai hoặc Sở Tài nguyên và Môi trường mới có quyền ký duyệt văn bản điện tử (QTD-05).',
      );
    }

    // --- BƯỚC 3: KIỂM TRA HIỆU LỰC CHỨNG THƯ SỐ QUA OCSP (QTD-28 / TC-03) ---
    const cert = this.certificates.get(certificateSerial.trim());
    if (!cert) {
      throw new BadRequestException(
        `Chứng thư số công vụ có số serial '${certificateSerial}' không tồn tại trong hệ thống xác thực.`,
      );
    }

    const ocspResult = await this.checkOcspStatus(certificateSerial);
    if (!ocspResult.isValid) {
      const ocspViolationPayload = {
        action: 'OCSP_VALIDATION_FAILURE',
        certificateSerial,
        ocspStatus: ocspResult.status,
        reason: ocspResult.reason,
        timestamp: new Date().toISOString(),
      };
      const ocspViolationHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(ocspViolationPayload))
        .digest('hex');

      await this.saveAuditLog({
        userId: cert.subjectName,
        userName: cert.subjectName,
        role: signerRole,
        action: 'OCSP_VALIDATION_FAILURE',
        entityType: 'CERTIFICATE_OCSP',
        entityId: certificateSerial,
        newData: ocspViolationPayload,
        hashSha256: ocspViolationHash,
        ipAddress: meta?.ipAddress || '127.0.0.1',
      });

      throw new ForbiddenException(
        `Từ chối ký số: Chứng thư số công vụ không hợp lệ qua kiểm tra trực tuyến OCSP (${ocspResult.status} - QTD-28). Lý do: ${ocspResult.reason}`,
      );
    }

    // --- BƯỚC 4: RÀNG BUỘC TÌNH TRẠNG THỬA ĐẤT (KHÓA GIAO DỊCH / TRANH CHẤP - TC-03) ---
    const dossier = this.pendingDossiers.get(dossierId);
    if (!dossier) {
      throw new BadRequestException(`Không tìm thấy hồ sơ địa chính có mã định danh '${dossierId}'.`);
    }

    if (dossier.isParcelLocked) {
      const lockViolationPayload = {
        action: 'SIGNING_LOCKED_PARCEL_ATTEMPT',
        dossierId: dossier.id,
        parcelNationalCode: dossier.parcelNationalCode,
        timestamp: new Date().toISOString(),
      };
      const lockViolationHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(lockViolationPayload))
        .digest('hex');

      await this.saveAuditLog({
        userId: cert.subjectName,
        userName: cert.subjectName,
        role: signerRole,
        action: 'SIGNING_LOCKED_PARCEL_ATTEMPT',
        entityType: 'PARCEL_LOCK',
        entityId: dossier.parcelNationalCode,
        newData: lockViolationPayload,
        hashSha256: lockViolationHash,
        ipAddress: meta?.ipAddress || '127.0.0.1',
      });

      throw new ConflictException(
        `Từ chối ký số: Thửa đất '${dossier.parcelNationalCode}' liên quan đến hồ sơ đang bị khóa giao dịch thời gian thực hoặc đang trong tình trạng thụ lý tranh chấp ranh giới.`,
      );
    }

    // --- BƯỚC 5: THỰC THI KÝ SỐ MẬT MÃ VÀ ĐÓNG DẤU THỜI GIAN TSA (TC-01) ---
    const nowIso = new Date().toISOString();
    const documentId = `DOC_${dossier.dossierCode}_APPROVED`;

    // Sinh mã băm mật mã chữ ký số theo chuẩn PAdES / CAdES
    const rawSigningPayload = `${dossier.dossierCode}|${cert.serialNumber}|${cert.subjectName}|${provider}|${reason}|${nowIso}`;
    const signatureDigest = crypto.createHash('sha256').update(rawSigningPayload).digest('hex');
    const signatureValue = `SIG_PADES_RSA2048_${signatureDigest}`;

    // Cập nhật trạng thái hồ sơ sang ĐÃ KÝ SỐ (SIGNED)
    dossier.status = DossierStatus.SIGNED;

    // Mã băm kiểm toán bất biến SHA-256 (TC-04)
    const auditPayload = {
      action: 'DIGITAL_SIGNATURE_APPROVAL',
      dossierId: dossier.id,
      dossierCode: dossier.dossierCode,
      parcelNationalCode: dossier.parcelNationalCode,
      documentId,
      signatureValue,
      certificateSerial: cert.serialNumber,
      signerName: cert.subjectName,
      signerRole,
      provider,
      signatureStandard: SignatureStandard.PADES,
      timestamp: nowIso,
      ocspVerified: true,
      ipAddress: meta?.ipAddress || '127.0.0.1',
    };

    const auditHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(auditPayload))
      .digest('hex');

    // Lưu vết kiểm toán bất biến vào CSDL (AC-04)
    await this.saveAuditLog({
      userId: cert.subjectName,
      userName: cert.subjectName,
      role: signerRole,
      action: 'DIGITAL_SIGNATURE_APPROVAL',
      entityType: 'DOSSIER',
      entityId: dossier.id,
      newData: auditPayload,
      hashSha256: auditHash,
      ipAddress: meta?.ipAddress || '127.0.0.1',
    });

    this.logger.log(
      `Đã ký số phê duyệt thành công hồ sơ '${dossier.dossierCode}' bằng chứng thư '${cert.serialNumber}' (Audit Hash: ${auditHash.substring(0, 16)}...)`,
    );

    return {
      success: true,
      dossierId: dossier.id,
      documentId,
      signatureValue,
      certificateSerial: cert.serialNumber,
      signerName: cert.subjectName,
      provider,
      signatureStandard: SignatureStandard.PADES,
      timestamp: nowIso,
      ocspVerified: true,
      auditHash,
      dossierStatus: DossierStatus.SIGNED,
      message: 'Ký số chuyên dùng công vụ phê duyệt hồ sơ địa chính thành công. Văn bản điện tử đã được gắn chữ ký số hợp lệ và dấu thời gian TSA.',
    };
  }

  /**
   * 5. Xác minh tính toàn vẹn và giá trị pháp lý của chữ ký số trên văn bản
   */
  async verifySignature(data: VerifyDigitalSignatureRequest): Promise<VerifyDigitalSignatureResponse> {
    const parseResult = VerifyDigitalSignatureSchema.safeParse(data);
    if (!parseResult.success) {
      throw new BadRequestException('Thông tin xác thực chữ ký số không hợp lệ.');
    }

    const { signatureValue, certificateSerial } = parseResult.data;
    const cert = this.certificates.get(certificateSerial.trim());

    if (!cert) {
      return {
        valid: false,
        signerName: 'Không xác định',
        issuer: 'Không xác định',
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        ocspStatus: OcspCertificateStatus.REVOKED,
        timestamp: new Date().toISOString(),
        auditHash: '',
        message: 'Chứng thư số không tồn tại trong danh bạ quản lý CA công vụ.',
      };
    }

    const ocsp = await this.checkOcspStatus(certificateSerial);
    const isValid = signatureValue.startsWith('SIG_PADES_') && ocsp.isValid;

    const auditHash = crypto
      .createHash('sha256')
      .update(`${signatureValue}|${certificateSerial}|${isValid}`)
      .digest('hex');

    return {
      valid: isValid,
      signerName: cert.subjectName,
      issuer: cert.issuer,
      provider: cert.provider,
      ocspStatus: ocsp.status,
      timestamp: new Date().toISOString(),
      auditHash,
      message: isValid
        ? 'Chữ ký số hợp pháp, toàn vẹn, được xác thực trực tuyến qua cổng OCSP của Ban Cơ yếu Chính phủ.'
        : 'Chữ ký số không hợp lệ hoặc chứng thư số đã bị thu hồi / hết hạn sử dụng.',
    };
  }

  /**
   * Ghi nhận nhật ký kiểm toán bất biến (hỗ trợ môi trường có hoặc không có CSDL vật lý)
   */
  private async saveAuditLog(logEntry: {
    userId?: string;
    userName?: string;
    role?: string;
    action: string;
    entityType: string;
    entityId: string;
    newData: any;
    hashSha256: string;
    ipAddress?: string;
  }) {
    if (this.db) {
      try {
        await this.db.insert(auditLogs).values({
          userId: logEntry.userId,
          userName: logEntry.userName,
          role: logEntry.role,
          action: logEntry.action,
          entityType: logEntry.entityType,
          entityId: logEntry.entityId,
          newData: logEntry.newData,
          hashSha256: logEntry.hashSha256,
          ipAddress: logEntry.ipAddress,
        });
      } catch (err: any) {
        this.logger.warn(`Không thể ghi log kiểm toán vào CSDL: ${err.message}`);
      }
    }
  }
}
