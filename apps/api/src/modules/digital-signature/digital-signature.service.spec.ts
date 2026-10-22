import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DigitalSignatureService } from './digital-signature.service';
import {
  UserRole,
  DigitalSignatureProvider,
  DossierStatus,
  OcspCertificateStatus,
  SignatureStandard,
} from '@diachinhso/shared';

describe('DigitalSignatureService (DCS-01-CN-004)', () => {
  let service: DigitalSignatureService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(true),
      }),
    };

    service = new DigitalSignatureService(mockDb);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // TC-01: LUỒNG THÀNH CÔNG (KÝ SỐ CÔNG VỤ VÀ SMARTCA HỢP LỆ)
  // =========================================================================
  describe('DCS-01-CN-004-TC-01: Luồng thành công', () => {
    it('Lãnh đạo Văn phòng ĐKĐĐ ký số phê duyệt hồ sơ bằng Ban Cơ yếu Chính phủ', async () => {
      const result = await service.signDossierApproval({
        dossierId: 'DOSSIER-2026-HN-001',
        signerRole: UserRole.LAND_REGISTRAR,
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        certificateSerial: 'GOV-CA-VPDKDD-001',
        reason: 'Phê duyệt hồ sơ đăng ký biến động chuyển nhượng quyền sử dụng đất',
        signaturePin: '123456',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.dossierId).toBe('DOSSIER-2026-HN-001');
      expect(result.signerName).toBe('Nguyễn Văn An');
      expect(result.certificateSerial).toBe('GOV-CA-VPDKDD-001');
      expect(result.signatureStandard).toBe(SignatureStandard.PADES);
      expect(result.signatureValue).toMatch(/^SIG_PADES_RSA2048_/);
      expect(result.timestamp).toBeDefined();
      expect(result.ocspVerified).toBe(true);
      expect(result.dossierStatus).toBe(DossierStatus.SIGNED);
      expect(result.auditHash).toHaveLength(64); // Chuẩn mã băm SHA-256 (64 ký tự hex)
    });

    it('Lãnh đạo ký số phê duyệt hồ sơ bằng VNPT SmartCA thành công', async () => {
      const result = await service.signDossierApproval({
        dossierId: 'DOSSIER-2026-HCM-002',
        signerRole: UserRole.LAND_REGISTRAR,
        provider: DigitalSignatureProvider.VNPT_SMARTCA,
        certificateSerial: 'VNPT-SMARTCA-VPDKDD-002',
        reason: 'Phê duyệt tặng cho quyền sử dụng đất hợp pháp',
        signaturePin: '888888',
      });

      expect(result.success).toBe(true);
      expect(result.signerName).toBe('Trần Thị Mai');
      expect(result.provider).toBe(DigitalSignatureProvider.VNPT_SMARTCA);
      expect(result.ocspVerified).toBe(true);
      expect(result.dossierStatus).toBe(DossierStatus.SIGNED);
      expect(result.auditHash).toBeDefined();
    });

    it('Quản trị viên (ADMIN) có quyền ký duyệt phát hành', async () => {
      const result = await service.signDossierApproval({
        dossierId: 'DOSSIER-2026-HN-001',
        signerRole: UserRole.ADMIN,
        provider: DigitalSignatureProvider.VIETTEL_CA,
        certificateSerial: 'VIETTEL-CA-VPDKDD-003',
        reason: 'Quản trị viên ký số ban hành quyết định hành chính',
      });

      expect(result.success).toBe(true);
      expect(result.signerName).toBe('Lê Hoàng Nam');
    });
  });

  // =========================================================================
  // TC-02: DỮ LIỆU KHÔNG HỢP LỆ (VALIDATION)
  // =========================================================================
  describe('DCS-01-CN-004-TC-02: Dữ liệu không hợp lệ', () => {
    it('Từ chối khi thiếu trường dossierId (mã hồ sơ rỗng)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: '',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Phê duyệt hồ sơ biến động',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối khi số serial chứng thư số quá ngắn hoặc rỗng', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: '123',
          reason: 'Phê duyệt hồ sơ địa chính',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối khi lý do phê duyệt quá ngắn (< 5 ký tự)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Ký',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Từ chối khi hồ sơ không tồn tại trong hệ thống', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-KHONG-TON-TAI-999',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Phê duyệt cấp đổi giấy chứng nhận',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // TC-03: RÀNG BUỘC NGHIỆP VỤ (QTD-05, QTD-28)
  // =========================================================================
  describe('DCS-01-CN-004-TC-03: Ràng buộc nghiệp vụ (QTD-05, QTD-28)', () => {
    it('Chặn ngay lập tức khi Cán bộ xã (COMMUNE_OFFICER) cố ký duyệt phê duyệt (vi phạm QTD-05)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.COMMUNE_OFFICER,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Cán bộ xã cố tình ký số phê duyệt hồ sơ',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Chặn khi Chủ sử dụng đất (LAND_USER) cố ký duyệt (vi phạm QTD-05)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.LAND_USER,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Người dân tự ý phê duyệt hồ sơ',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Chặn thao tác khi chứng thư số công vụ đã bị thu hồi trực tuyến qua OCSP (vi phạm QTD-28)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-REVOKED-009',
          reason: 'Cán bộ đã chuyển công tác cố tình sử dụng chứng thư cũ',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Chặn thao tác khi chứng thư số công vụ đã quá niên hạn / hết hạn (vi phạm QTD-28)', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-HN-001',
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-EXPIRED-010',
          reason: 'Ký số bằng chứng thư số đã hết hiệu lực',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Chặn ký số khi thửa đất đang có tranh chấp ranh giới hoặc bị khóa giao dịch', async () => {
      await expect(
        service.signDossierApproval({
          dossierId: 'DOSSIER-2026-DN-003', // Thửa đất có tranh chấp
          signerRole: UserRole.LAND_REGISTRAR,
          provider: DigitalSignatureProvider.GOVERNMENT_CA,
          certificateSerial: 'GOV-CA-VPDKDD-001',
          reason: 'Cố tình ký duyệt hồ sơ khi đất đang thụ lý tranh chấp',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =========================================================================
  // TC-04: KIỂM TOÁN SHA-256 & XÁC MINH CHỮ KÝ SỐ
  // =========================================================================
  describe('DCS-01-CN-004-TC-04: Kiểm toán & Xác minh chữ ký số', () => {
    it('Kiểm tra trực tuyến giao thức OCSP trả về trạng thái chi tiết', async () => {
      const ocspValid = await service.checkOcspStatus('GOV-CA-VPDKDD-001');
      expect(ocspValid.status).toBe(OcspCertificateStatus.VALID);
      expect(ocspValid.isValid).toBe(true);

      const ocspRevoked = await service.checkOcspStatus('GOV-CA-REVOKED-009');
      expect(ocspRevoked.status).toBe(OcspCertificateStatus.REVOKED);
      expect(ocspRevoked.isValid).toBe(false);

      const ocspExpired = await service.checkOcspStatus('GOV-CA-EXPIRED-010');
      expect(ocspExpired.status).toBe(OcspCertificateStatus.EXPIRED);
      expect(ocspExpired.isValid).toBe(false);
    });

    it('Xác minh chữ ký số hợp lệ kèm mã băm kiểm toán', async () => {
      // 1. Ký số thành công
      const signRes = await service.signDossierApproval({
        dossierId: 'DOSSIER-2026-HN-001',
        signerRole: UserRole.LAND_REGISTRAR,
        provider: DigitalSignatureProvider.GOVERNMENT_CA,
        certificateSerial: 'GOV-CA-VPDKDD-001',
        reason: 'Phê duyệt cấp đổi Giấy chứng nhận quyền sử dụng đất số',
      });

      // 2. Xác minh chữ ký
      const verifyRes = await service.verifySignature({
        signatureValue: signRes.signatureValue,
        certificateSerial: signRes.certificateSerial,
      });

      expect(verifyRes.valid).toBe(true);
      expect(verifyRes.signerName).toBe('Nguyễn Văn An');
      expect(verifyRes.ocspStatus).toBe(OcspCertificateStatus.VALID);
      expect(verifyRes.auditHash).toBeDefined();
    });

    it('Xác minh thất bại khi chữ ký số bị sửa đổi hoặc giả mạo', async () => {
      const verifyRes = await service.verifySignature({
        signatureValue: 'CHU_KY_GIA_MAO_KHONG_DUNG_DINH_DANG',
        certificateSerial: 'GOV-CA-VPDKDD-001',
      });

      expect(verifyRes.valid).toBe(false);
    });

    it('Tra cứu danh sách chứng thư số chuyên dùng công vụ thành công', async () => {
      const certs = await service.getAvailableCertificates(UserRole.LAND_REGISTRAR);
      expect(certs.length).toBeGreaterThan(0);
      expect(certs.some((c) => c.provider === DigitalSignatureProvider.GOVERNMENT_CA)).toBe(true);
      expect(certs.some((c) => c.provider === DigitalSignatureProvider.VNPT_SMARTCA)).toBe(true);
    });
  });
});
