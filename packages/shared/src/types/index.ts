// 6 Vai trò chính theo quy chuẩn đề án
export enum UserRole {
  COMMUNE_OFFICER = 'COMMUNE_OFFICER',       // VT-01: Cán bộ Địa chính xã/phường
  LAND_REGISTRAR = 'LAND_REGISTRAR',         // VT-02: Văn phòng Đăng ký Đất đai
  LAND_USER = 'LAND_USER',                   // VT-03: Chủ sử dụng đất (Người dân / Doanh nghiệp)
  NOTARY_BANK = 'NOTARY_BANK',               // VT-04: Công chứng viên & Cán bộ Tín dụng Ngân hàng
  INSPECTOR = 'INSPECTOR',                   // VT-05: Thanh tra & Quản lý Quy hoạch
  ADMIN = 'ADMIN',                           // VT-06: Quản trị viên Hệ thống
}

// Trạng thái pháp lý của thửa đất
export enum ParcelLegalStatus {
  AVAILABLE = 'AVAILABLE',     // Bình thường, sẵn sàng giao dịch
  LOCKED = 'LOCKED',           // Đang bị khóa trong phiên công chứng (90 phút)
  MORTGAGED = 'MORTGAGED',     // Đang thế chấp tại tổ chức tín dụng
  DISPUTED = 'DISPUTED',       // Đang có tranh chấp ranh giới / thụ lý hòa giải
  FROZEN = 'FROZEN',           // Bị phong tỏa do lệnh Tòa án / Thi hành án kê biên
  REVOKED = 'REVOKED',         // Đã thu hồi / chuyển vào lịch sử sau khi tách/hợp thửa
}

// Phân loại nhóm đất theo Luật Đất đai 2024
export enum LandGroup {
  AGRICULTURAL = 'AGRICULTURAL',               // Đất nông nghiệp
  NON_AGRICULTURAL = 'NON_AGRICULTURAL',       // Đất phi nông nghiệp
  UNUSED = 'UNUSED',                           // Đất chưa sử dụng
}

// Mã mục đích sử dụng đất tiêu biểu
export enum LandPurposeCode {
  // Đất ở
  ONT = 'ONT', // Đất ở tại nông thôn
  ODT = 'ODT', // Đất ở tại đô thị
  // Đất nông nghiệp
  LUC = 'LUC', // Đất chuyên trồng lúa nước
  LUK = 'LUK', // Đất trồng lúa nước còn lại
  CLN = 'CLN', // Đất trồng cây lâu năm
  HNK = 'HNK', // Đất trồng cây hàng năm khác
  RSX = 'RSX', // Đất rừng sản xuất
  RPH = 'RPH', // Đất rừng phòng hộ
  // Đất phi nông nghiệp khác
  TMD = 'TMD', // Đất thương mại, dịch vụ
  SKC = 'SKC', // Đất cơ sở sản xuất phi nông nghiệp
  DGT = 'DGT', // Đất giao thông
  DNL = 'DNL', // Đất năng lượng
}

// Loại biến động đất đai
export enum FluctuationType {
  TRANSFER = 'TRANSFER',                 // Chuyển nhượng
  DONATION = 'DONATION',                 // Tặng cho
  INHERITANCE = 'INHERITANCE',           // Thừa kế
  SUBDIVISION = 'SUBDIVISION',           // Tách thửa
  MERGE = 'MERGE',                       // Hợp thửa
  PURPOSE_CHANGE = 'PURPOSE_CHANGE',     // Chuyển mục đích sử dụng
  MORTGAGE = 'MORTGAGE',                 // Đăng ký thế chấp
  RELEASE_MORTGAGE = 'RELEASE_MORTGAGE', // Giải chấp
}

// Trạng thái hồ sơ biến động
export enum DossierStatus {
  DRAFT = 'DRAFT',                       // Bản nháp
  SUBMITTED = 'SUBMITTED',               // Đã nộp trực tuyến
  COMMUNE_VERIFIED = 'COMMUNE_VERIFIED', // Xã đã xác minh hiện trạng
  APPRAISED = 'APPRAISED',               // VPĐKĐĐ đã thẩm định
  TAX_PENDING = 'TAX_PENDING',           // Chờ tính thuế / Đã chuyển thuế
  TAX_PAID = 'TAX_PAID',                 // Đã hoàn thành nghĩa vụ thuế
  SIGNED = 'SIGNED',                     // Đã ký số phát hành Sổ Đỏ Số
  COMPLETED = 'COMPLETED',               // Đã trả kết quả vào Ví số
  REJECTED = 'REJECTED',                 // Bị từ chối (có lý do)
}

// Trạng thái khóa giao dịch thời gian thực
export enum TransactionLockStatus {
  ACTIVE = 'ACTIVE',       // Đang có hiệu lực khóa
  RELEASED = 'RELEASED',   // Đã giải phóng khóa chủ động
  TIMED_OUT = 'TIMED_OUT', // Tự động mở khóa do hết thời gian chờ (90 phút)
}

// Cấu trúc tọa độ đỉnh ranh giới VN-2000
export interface VertexVN2000 {
  pointIndex: number;
  x: number; // Tọa độ X (Bắc - mét)
  y: number; // Tọa độ Y (Đông - mét)
}

// Mô hình Thửa đất
export interface Parcel {
  id: string;
  nationalCode: string;        // Mã định danh thửa đất quốc gia (15 ký tự)
  communeId: string;
  sheetNumber: number;         // Số tờ bản đồ
  parcelNumber: number;        // Số thứ tự thửa đất
  area: number;                // Diện tích (m2)
  purposeCode: LandPurposeCode;
  address: string;
  legalStatus: ParcelLegalStatus;
  verticesVN2000: VertexVN2000[];
  geojsonBoundary: any;        // Polygon GeoJSON chuẩn WGS84 phục vụ render web
  ownerIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Mô hình Sổ Đỏ Số (Giấy chứng nhận điện tử)
export interface DigitalCertificate {
  id: string;
  parcelId: string;
  certificateNumber: string;   // Số phát hành GCN
  serialNumber: string;        // Số seri điện tử
  qrHash: string;              // Chuỗi băm mật mã SHA-256
  digitalSignature: string;    // Chữ ký số Lãnh đạo
  signerName: string;
  signerTitle: string;
  pdfUrl: string;
  status: 'ACTIVE' | 'REVOKED';
  issuedAt: string;
}

// Phiên Khóa giao dịch thời gian thực
export interface TransactionLock {
  id: string;
  parcelId: string;
  nationalCode: string;
  lockedByUserId: string;
  lockedByUserName: string;
  organizationName: string;   // Tên Văn phòng công chứng / Ngân hàng
  sessionToken: string;
  status: TransactionLockStatus;
  lockedAt: string;
  expiresAt: string;           // Thời điểm hết hạn (mặc định +90 phút)
  durationMinutes: number;
}

// Định danh công dân & Xác thực OTP (DCS-01-CN-001)
export interface CitizenSendOtpRequest {
  citizenId: string;
  phoneNumber: string;
  fullName?: string;
}

export interface CitizenSendOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  mockOtp?: string; // Môi trường Mock Sandbox Dev/Staging
}

export interface CitizenVerifyOtpRequest {
  citizenId: string;
  phoneNumber: string;
  otpCode: string;
}

export interface CitizenAuthResponse {
  accessToken: string;
  user: {
    id: string;
    citizenId: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
  };
  auditHash: string; // Mã băm SHA-256 nhật ký kiểm toán bất biến
  walletSummary?: {
    parcelCount: number;
    certificateCount: number;
  };
}

// Đăng nhập SSO tài khoản công vụ cho cán bộ ngành (DCS-01-CN-002)
export interface OfficerSsoLoginRequest {
  username: string;
  password: string;
  mfaCode: string;
  role: UserRole;
  administrativeUnitCode?: string;
}

export interface OfficerSsoLoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    department?: string;
    administrativeUnitCode: string;
    administrativeUnitName: string;
  };
  auditHash: string;
  sessionExpiry: string;
}

// Phân quyền truy cập dữ liệu địa chính theo mô hình chính quyền địa phương 2 cấp tinh gọn (Bãi bỏ cấp trung gian Quận/Huyện)
export enum AdministrativeLevel {
  PROVINCE = 'PROVINCE', // Cấp Tỉnh / Thành phố trực thuộc Trung ương (Cấp 1)
  COMMUNE = 'COMMUNE',   // Cấp Cơ sở: Xã / Phường / Thị trấn (Cấp 2 - Trực thuộc trực tiếp Tỉnh/TP)
  DISTRICT = 'DISTRICT', // Cấp Quận / Huyện (Đã bãi bỏ theo nghị định mới - lưu trữ phục vụ dữ liệu lịch sử)
}

export enum JurisdictionAction {
  READ = 'READ',       // Tra cứu / Xem thông tin địa chính
  CREATE = 'CREATE',   // Khai báo / Tạo mới thửa đất, hồ sơ
  UPDATE = 'UPDATE',   // Cập nhật / Hiệu chỉnh biến động
  APPROVE = 'APPROVE', // Phê duyệt / Thẩm định hồ sơ
  DELETE = 'DELETE',   // Xóa / Thu hồi thửa đất, hồ sơ
}

export interface AdministrativeUnit {
  code: string;
  name: string;
  level: AdministrativeLevel;
  parentCode?: string;
  formerUnits?: string[];
}

export interface MergedProvinceInfo {
  code: string;
  name: string;
  formerUnits: string[];
  region: string;
}

export interface JurisdictionPolicy {
  id: string;
  role: UserRole;
  level: AdministrativeLevel;
  unitCode: string;
  unitName: string;
  allowedActions: JurisdictionAction[];
  description?: string;
  updatedAt: string;
}

export interface ConfigureJurisdictionPolicyRequest {
  role: UserRole;
  level: AdministrativeLevel;
  unitCode: string;
  allowedActions: JurisdictionAction[];
  description?: string;
}

export interface EvaluatePermissionRequest {
  userRole: UserRole;
  userUnitCode: string;
  action: JurisdictionAction;
  targetUnitCode: string;
}

export interface EvaluatePermissionResponse {
  granted: boolean;
  reason: string;
  userLevel: AdministrativeLevel;
  targetLevel: AdministrativeLevel;
  auditHash: string;
}


// Tích hợp chứng thư số chuyên dùng công vụ và SmartCA (DCS-01-CN-004)
export enum DigitalSignatureProvider {
  GOVERNMENT_CA = 'GOVERNMENT_CA', // Ban Cơ yếu Chính phủ (Chuyên dùng công vụ)
  VNPT_SMARTCA = 'VNPT_SMARTCA',   // VNPT SmartCA
  VIETTEL_CA = 'VIETTEL_CA',       // Viettel-CA Cloud
  FPT_SMARTCA = 'FPT_SMARTCA',     // FPT SmartCA
  USB_TOKEN = 'USB_TOKEN',         // Thiết bị mật mã phần cứng USB Token PKCS#11
}

export enum SignatureStandard {
  PADES = 'PADES', // Chuẩn ký tài liệu PDF (PDF Advanced Electronic Signatures)
  CADES = 'CADES', // Chuẩn ký thông điệp dữ liệu số (CMS Advanced Electronic Signatures)
  XADES = 'XADES', // Chuẩn ký XML (XML Advanced Electronic Signatures)
}

export enum OcspCertificateStatus {
  VALID = 'VALID',     // Chứng thư số còn hiệu lực và tin cậy
  REVOKED = 'REVOKED', // Đã bị thu hồi hoặc vô hiệu hóa bởi cơ quan CA
  EXPIRED = 'EXPIRED', // Đã hết hạn sử dụng
}

export interface PublicOfficerCertificate {
  serialNumber: string;
  subjectName: string;
  subjectTitle: string;
  organization: string;
  provider: DigitalSignatureProvider;
  issuer: string;
  validFrom: string;
  validTo: string;
  ocspStatus: OcspCertificateStatus;
  isDefault?: boolean;
}

export interface SignDossierApprovalRequest {
  dossierId: string;
  signerRole: UserRole;
  provider: DigitalSignatureProvider;
  certificateSerial: string;
  reason: string;
  signaturePin?: string;
  signerName?: string;
  documentHash?: string;
}

export interface SignDossierApprovalResponse {
  success: boolean;
  dossierId: string;
  documentId: string;
  signatureValue: string;
  certificateSerial: string;
  signerName: string;
  provider: DigitalSignatureProvider;
  signatureStandard: SignatureStandard;
  timestamp: string; // RFC 3161 TSA
  ocspVerified: boolean;
  auditHash: string;
  dossierStatus: DossierStatus;
  message: string;
}

export interface VerifyDigitalSignatureRequest {
  signatureValue: string;
  certificateSerial: string;
  documentHash?: string;
}

export interface VerifyDigitalSignatureResponse {
  valid: boolean;
  signerName: string;
  issuer: string;
  provider: DigitalSignatureProvider;
  ocspStatus: OcspCertificateStatus;
  timestamp: string;
  auditHash: string;
  message: string;
}

export interface PendingDossierForSigning {
  id: string;
  dossierCode: string;
  parcelId: string;
  parcelNationalCode: string;
  applicantName: string;
  applicantCitizenId: string;
  fluctuationType: FluctuationType;
  status: DossierStatus;
  submittedAt: string;
  communeName: string;
  provinceName: string;
  isParcelLocked: boolean;
}


// Quản lý phiên làm việc và bảo mật xác thực 2FA (DCS-01-CN-005)
export enum SessionStatus {
  ACTIVE = 'ACTIVE',                         // Đang hoạt động bình thường
  LOCKED = 'LOCKED',                         // Tạm khóa màn hình sau 15 phút không tương tác
  TERMINATED = 'TERMINATED',                 // Đã đăng xuất / Kết thúc phiên an toàn
  SUSPENDED_SECURITY = 'SUSPENDED_SECURITY', // Bị tạm khóa an ninh thông tin (QTD-22)
}

export enum SensitiveOperationType {
  APPROVE_CERTIFICATE = 'APPROVE_CERTIFICATE',     // Ký số phê duyệt cấp Sổ Đỏ Số
  ALTER_PARCEL_BOUNDARY = 'ALTER_PARCEL_BOUNDARY', // Hiệu chỉnh tọa độ ranh giới thửa đất
  BULK_DATA_EXPORT = 'BULK_DATA_EXPORT',           // Trích xuất dữ liệu CSDL thửa đất hàng loạt
  REVOKE_DOCUMENT = 'REVOKE_DOCUMENT',             // Thu hồi Giấy chứng nhận / Hủy hồ sơ
}

export interface UserSession {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  deviceInfo: string;
  ipAddress: string;
  isTrustedIp: boolean;
  status: SessionStatus;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  inactivityTimeoutSeconds: number; // Mặc định 900 giây (15 phút)
}

export interface StepUp2FaChallengeRequest {
  sessionId: string;
  operation: SensitiveOperationType;
  targetEntityId: string;
}

export interface StepUp2FaChallengeResponse {
  challengeId: string;
  operation: SensitiveOperationType;
  method: 'TOTP' | 'SMS_OTP';
  expiresInSeconds: number;
  maskedPhone?: string;
  mockOtp?: string;
}

export interface VerifyStepUp2FaRequest {
  challengeId: string;
  sessionId: string;
  code: string;
}

export interface VerifyStepUp2FaResponse {
  success: boolean;
  stepUpToken: string;
  operation: SensitiveOperationType;
  expiresAt: string;
  auditHash: string;
  message: string;
}

export interface UnlockSessionRequest {
  sessionId: string;
  unlockCode: string;
}

export interface UnlockSessionResponse {
  success: boolean;
  sessionId: string;
  status: SessionStatus;
  refreshedExpiry: string;
  auditHash: string;
  message: string;
}

export interface TerminateSessionRequest {
  sessionId: string;
  reason?: string;
}

export interface TerminateSessionResponse {
  success: boolean;
  sessionId: string;
  status: SessionStatus;
  auditHash: string;
  message: string;
}

export interface SecurityViolationAlert {
  id: string;
  sessionId: string;
  username: string;
  ipAddress: string;
  violationType: 'IP_NOT_IN_WHITELIST' | 'RATE_LIMIT_EXCEEDED' | 'FAILED_2FA_ATTEMPTS';
  description: string;
  timestamp: string;
  auditHash: string;
}


// ==========================================
// Khóa và vô hiệu hóa tài khoản công vụ khi điều chuyển công tác (DCS-01-CN-006)
// ==========================================

export enum OfficerAccountStatus {
  ACTIVE = 'ACTIVE',                             // Đang công tác bình thường
  TRANSFERRED = 'TRANSFERRED',                   // Đã điều chuyển công tác sang đơn vị khác
  SUSPENDED_DISCIPLINE = 'SUSPENDED_DISCIPLINE', // Đình chỉ công tác do kỷ luật
  DISMISSED = 'DISMISSED',                       // Miễn nhiệm chức vụ
  RESIGNED = 'RESIGNED',                         // Thôi việc / Nghỉ hưu
}

export enum DeactivationReasonType {
  TRANSFER = 'TRANSFER',           // Điều chuyển công tác
  DISMISSAL = 'DISMISSAL',         // Miễn nhiệm chức vụ
  DISCIPLINE = 'DISCIPLINE',       // Kỷ luật / Đình chỉ
  RESIGNATION = 'RESIGNATION',     // Thôi việc / Nghỉ chế độ
}

export interface DeactivationInfo {
  decisionNumber: string;          // Số quyết định hành chính (ví dụ: QĐ-2026/045/UBND)
  decisionDate: string;            // Ngày ban hành quyết định (YYYY-MM-DD)
  issuingAuthority: string;        // Cơ quan ban hành quyết định
  reasonType: DeactivationReasonType; // Loại căn cứ thu hồi
  reasonDetail: string;            // Lý do chi tiết
  deactivatedAt: string;           // Thời điểm hệ thống vô hiệu hóa
  deactivatedByAdminId: string;    // Quản trị viên thực hiện
  transfereeOfficerId?: string;    // Cán bộ nhận bàn giao hồ sơ
  transfereeOfficerName?: string;  // Tên cán bộ nhận bàn giao
  reassignedDossierCount: number;  // Số lượng hồ sơ đã chuyển giao
  auditHash: string;               // Mã băm SHA-256 nhật ký kiểm toán bất biến
}

export interface OfficerAccountItem {
  id: string;
  officerCode: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  administrativeUnitCode: string;
  administrativeUnitName: string;
  department: string;
  status: OfficerAccountStatus;
  pendingDossierCount: number;
  lastActiveAt: string;
  deactivationInfo?: DeactivationInfo;
}

export interface DeactivateOfficerAccountRequest {
  officerId: string;
  decisionNumber: string;
  decisionDate: string;
  issuingAuthority: string;
  reasonType: DeactivationReasonType;
  reasonDetail: string;
  transfereeOfficerId?: string;
}

export interface DeactivateOfficerAccountResponse {
  success: boolean;
  officerId: string;
  officerName: string;
  newStatus: OfficerAccountStatus;
  terminatedSessionsCount: number;
  reassignedDossiersCount: number;
  transfereeOfficerName?: string;
  auditHash: string;
  deactivatedAt: string;
  message: string;
}

export interface TransferDossiersRequest {
  fromOfficerId: string;
  toOfficerId: string;
  dossierIds?: string[];
  reason: string;
}

export interface TransferDossiersResponse {
  success: boolean;
  fromOfficerId: string;
  toOfficerId: string;
  toOfficerName: string;
  transferredCount: number;
  auditHash: string;
  message: string;
}

export interface ReactivateOfficerAccountRequest {
  officerId: string;
  decisionNumber: string;
  reinstatementReason: string;
}

export interface ReactivateOfficerAccountResponse {
  success: boolean;
  officerId: string;
  officerName: string;
  newStatus: OfficerAccountStatus;
  reactivatedAt: string;
  auditHash: string;
  message: string;
}


// ==========================================
// Cấu hình chính sách mật khẩu và chống tấn công dò quét (DCS-01-CN-007)
// ==========================================

export interface PasswordPolicyConfig {
  minLength: number;                  // Độ dài tối thiểu (8 - 32 ký tự, mặc định 10)
  requireUppercase: boolean;          // Bắt buộc chứa chữ in hoa (A-Z)
  requireLowercase: boolean;          // Bắt buộc chứa chữ in thường (a-z)
  requireNumbers: boolean;            // Bắt buộc chứa chữ số (0-9)
  requireSpecialChars: boolean;       // Bắt buộc chứa ký tự đặc biệt (!@#$%^&*...)
  passwordExpiryDays: number;         // Thời hạn đổi mật khẩu bắt buộc (ngày, ví dụ 90)
  preventPasswordReuseCount: number;  // Số lượng mật khẩu cũ không được tái sử dụng (ví dụ 5)
  maxFailedAttempts: number;          // Số lần đăng nhập sai tối đa trước khi khóa (ví dụ 5)
  lockoutDurationMinutes: number;     // Thời gian khóa tài khoản & chặn IP (phút, ví dụ 30)
  trustedIpRanges: string[];          // Dải IP công vụ tin cậy (VD: ['10.0.0.0/8', '192.168.1.0/24'])
  updatedAt: string;
  updatedBy: string;
  auditHash: string;
}

export interface BlockedIpItem {
  id: string;
  ipAddress: string;
  failedAttempts: number;
  targetedUsername: string;
  blockedAt: string;
  expiresAt: string;
  reason: string;
  isPermanent: boolean;
  auditHash: string;
}

export interface UpdatePasswordPolicyRequest {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuseCount: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  trustedIpRanges?: string[];
}

export interface ValidatePasswordRequest {
  password: string;
  username?: string;
}

export interface ValidatePasswordResponse {
  valid: boolean;
  score: number; // 0 - 100
  strength: 'VERY_WEAK' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  errors: string[];
}

export interface UnblockIpRequest {
  ipAddress: string;
  reason: string;
}

export interface UnblockIpResponse {
  success: boolean;
  ipAddress: string;
  unblockedAt: string;
  auditHash: string;
  message: string;
}


// ==========================================
// Quản lý ủy quyền giải quyết hồ sơ địa chính có thời hạn (DCS-01-CN-008)
// ==========================================

export enum DelegationScope {
  ALL_DOSSIERS = 'ALL_DOSSIERS',                   // Toàn bộ thẩm quyền giải quyết hồ sơ địa chính
  APPROVE_CERTIFICATE = 'APPROVE_CERTIFICATE',     // Duyệt ký Giấy chứng nhận (Sổ Đỏ Số)
  SIGN_TRANSFER = 'SIGN_TRANSFER',                 // Ký biến động chuyển nhượng / thế chấp
  SIGN_SURVEY_EXTRACT = 'SIGN_SURVEY_EXTRACT',     // Ký trích lục / trích đo bản đồ địa chính
}

export enum DelegationStatus {
  ACTIVE = 'ACTIVE',       // Đang có hiệu lực
  PENDING = 'PENDING',     // Chưa đến thời điểm bắt đầu
  EXPIRED = 'EXPIRED',     // Đã hết thời hạn ủy quyền
  REVOKED = 'REVOKED',     // Thu hồi trước thời hạn
}

export interface DelegationDocument {
  id: string;
  documentNumber: string;               // Số văn bản ủy quyền (VD: QĐ-UQ-2026/015/VPDKDD)
  title: string;                        // Trích yếu văn bản
  delegatorId: string;                  // Cán bộ ủy quyền (Lãnh đạo cấp trưởng)
  delegatorName: string;
  delegatorTitle: string;
  delegateeId: string;                  // Cán bộ được ủy quyền (Cấp phó)
  delegateeName: string;
  delegateeTitle: string;
  signingPrefix: string;                // Tiêu đề ký (Mặc định: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC')
  scope: DelegationScope;               // Phạm vi ủy quyền
  startDate: string;                    // Thời điểm bắt đầu (ISO string)
  endDate: string;                      // Thời điểm kết thúc (ISO string)
  status: DelegationStatus;
  notes?: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  auditHash: string;
  createdAt: string;
}

export interface CreateDelegationRequest {
  documentNumber: string;
  title: string;
  delegateeId: string;
  scope: DelegationScope;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface CreateDelegationResponse {
  success: boolean;
  delegation: DelegationDocument;
  auditHash: string;
  message: string;
}

export interface RevokeDelegationRequest {
  delegationId: string;
  reason: string;
}

export interface RevokeDelegationResponse {
  success: boolean;
  delegationId: string;
  revokedAt: string;
  auditHash: string;
  message: string;
}

export interface VerifyDelegationAccessRequest {
  officerId: string;
  requiredScope: DelegationScope;
}

export interface VerifyDelegationAccessResponse {
  hasDelegation: boolean;
  delegation?: DelegationDocument;
  signingTitle: string;
  message: string;
}
