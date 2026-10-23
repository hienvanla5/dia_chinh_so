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
  PENDING_APPRAISAL = 'PENDING_APPRAISAL', // Chờ Chi nhánh VPĐKĐĐ thẩm định thuộc tính
  HISTORICAL = 'HISTORICAL',               // Đã đóng hiệu lực lịch sử sau khi tách/hợp thửa (QTD-02)
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


export enum LandOriginType {
  ALLOCATED_WITH_FEE = 'ALLOCATED_WITH_FEE',         // Nhà nước giao đất có thu tiền sử dụng đất
  ALLOCATED_WITHOUT_FEE = 'ALLOCATED_WITHOUT_FEE',   // Nhà nước giao đất không thu tiền sử dụng đất
  LEASED_LUMP_SUM = 'LEASED_LUMP_SUM',               // Nhà nước cho thuê đất thu tiền một lần cho cả thời gian thuê
  LEASED_ANNUAL = 'LEASED_ANNUAL',                   // Nhà nước cho thuê đất thu tiền thuê đất hàng năm
  RECOGNIZED_WITH_FEE = 'RECOGNIZED_WITH_FEE',       // Công nhận QSDĐ như giao đất có thu tiền sử dụng đất
  RECOGNIZED_WITHOUT_FEE = 'RECOGNIZED_WITHOUT_FEE', // Công nhận QSDĐ như giao đất không thu tiền sử dụng đất
  TRANSFERRED = 'TRANSFERRED',                       // Nhận chuyển nhượng quyền sử dụng đất hợp pháp
  INHERITED_OR_DONATED = 'INHERITED_OR_DONATED',     // Nhận thừa kế, tặng cho quyền sử dụng đất
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
  pointIndex?: number;
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
  expiresIn?: number;
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


// ==========================================
// Đăng nhập và phân quyền tài khoản tổ chức qua Cổng Định danh Doanh nghiệp (DCS-01-CN-009)
// ==========================================

export enum EnterpriseStaffPermission {
  SUBMIT_DOSSIER = 'SUBMIT_DOSSIER',           // Nộp hồ sơ thủ tục đất đai dự án
  VIEW_PARCELS = 'VIEW_PARCELS',               // Tra cứu CSDL thửa đất dự án
  SUPPLEMENT_DOCS = 'SUPPLEMENT_DOCS',         // Bổ sung hồ sơ tài liệu theo yêu cầu
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',         // Nộp phí, lệ phí & nghĩa vụ tài chính đất đai
}

export interface EnterpriseStaffMember {
  id: string;
  fullName: string;
  citizenId: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  permissions: EnterpriseStaffPermission[];
  status: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
}

export interface EnterpriseProjectParcel {
  parcelId: string;
  nationalCode: string;
  projectName: string;
  areaM2: number;
  purposeCode: string;
  location: string;
  landAllocationDecision: string;
  landUseTerm: string;
  certificateNumber?: string;
  status: 'ALLOCATED' | 'LEASED' | 'PENDING_APPROVAL';
}

export interface EnterpriseAccount {
  id: string;
  taxId: string;                        // Mã số thuế doanh nghiệp (10 hoặc 13 số)
  enterpriseName: string;               // Tên doanh nghiệp
  representativeName: string;           // Người đại diện theo pháp luật
  representativeCitizenId: string;      // CCCD người đại diện
  headquartersAddress: string;          // Địa chỉ trụ sở chính
  phoneNumber: string;
  email: string;
  digitalCertificateSerial?: string;
  projectParcels: EnterpriseProjectParcel[];
  staffMembers: EnterpriseStaffMember[];
}

export interface EnterpriseLoginRequest {
  taxId: string;
  authMethod: 'DIGITAL_SIGNATURE' | 'REPRESENTATIVE_OTP';
  digitalSignatureCertSerial?: string;
  otpCode?: string;
}

export interface EnterpriseLoginResponse {
  accessToken: string;
  enterprise: {
    id: string;
    taxId: string;
    enterpriseName: string;
    representativeName: string;
    headquartersAddress: string;
    parcelCount: number;
    staffCount: number;
  };
  auditHash: string;
  message: string;
}

export interface AssignEnterpriseStaffRequest {
  enterpriseId: string;
  fullName: string;
  citizenId: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  permissions: EnterpriseStaffPermission[];
}

export interface AssignEnterpriseStaffResponse {
  success: boolean;
  staff: EnterpriseStaffMember;
  auditHash: string;
  message: string;
}


// ==========================================
// Nhật ký xác thực và phát hiện cảnh báo đăng nhập bất thường (DCS-01-CN-010)
// ==========================================

export type AuthAuditLogStatus = 'SUCCESS' | 'FAILED' | 'CHALLENGED' | 'BLOCKED';

export type AuthMethodType = 'CITIZEN_IDP' | 'OFFICER_SSO' | 'ENTERPRISE_TOKEN' | 'SMART_CA';

export type AnomalyDetectionType = 
  | 'IMPOSSIBLE_TRAVEL'     // Đăng nhập từ vị trí cách xa trong thời gian ngắn (ví dụ: Hà Nội -> TP.HCM trong 15 phút)
  | 'OFF_HOURS_ACCESS'      // Đăng nhập ngoài giờ hành chính (23:00 - 05:00) đối với tài khoản công vụ
  | 'BRUTE_FORCE_BURST'     // Dồn dập thử sai mật khẩu/OTP (>5 lần / 2 phút)
  | 'UNTRUSTED_NETWORK'     // Đăng nhập từ IP/dải mạng ngoài mạng công vụ chuyên dùng CPNET
  | 'SUSPICIOUS_DEVICE';    // Thiết bị truy cập lạ / User-Agent bất thường

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyAlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface AuthAuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  authMethod: AuthMethodType;
  clientIp: string;
  location: {
    province: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  deviceInfo: string;
  status: AuthAuditLogStatus;
  failureReason?: string;
  isAnomaly: boolean;
  anomalyType?: AnomalyDetectionType;
  previousHash: string;
  auditHash: string;
}

export interface AnomalySecurityAlert {
  id: string;
  timestamp: string;
  detectionType: AnomalyDetectionType;
  severity: AnomalySeverity;
  status: AnomalyAlertStatus;
  targetActorId: string;
  targetActorName: string;
  targetActorRole: string;
  clientIp: string;
  detectedLocation: string;
  details: string;
  recommendedAction: string;
  isAccountLocked: boolean;
  isSessionTerminated: boolean;
  requiresStepUpVerification: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  auditHash: string;
}

export interface QueryAuthAuditLogsRequest {
  actorId?: string;
  role?: string;
  status?: AuthAuditLogStatus;
  isAnomaly?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface QueryAnomalyAlertsRequest {
  severity?: AnomalySeverity;
  status?: AnomalyAlertStatus;
  detectionType?: AnomalyDetectionType;
}

export interface ResolveAnomalyAlertRequest {
  alertId: string;
  action: 'RESOLVE_LOCK' | 'DISMISS_FALSE_POSITIVE' | 'REQUIRE_STEP_UP';
  notes: string;
  resolvedBy: string;
}

export interface ResolveAnomalyAlertResponse {
  success: boolean;
  alert: AnomalySecurityAlert;
  auditHash: string;
  message: string;
}

export interface SimulateAuthEventRequest {
  actorId: string;
  actorName: string;
  actorRole: string;
  authMethod: AuthMethodType;
  clientIp: string;
  province: string;
  country?: string;
  deviceInfo?: string;
  isSuccess: boolean;
  isOfficeHours?: boolean;
}

export interface VerifyAuditChainResponse {
  isValid: boolean;
  totalLogs: number;
  brokenLogId?: string;
  latestHash: string;
  message: string;
}


// ==========================================
// Khai báo thông tin thuộc tính thửa đất mới (DCS-02-CN-001)
// ==========================================

export interface DeclareNewParcelRequest {
  communeCode: string;          // Mã xã/phường (ví dụ "01001" - Phường Điện Biên)
  communeName?: string;         // Tên xã/phường
  provinceCode: string;         // Mã tỉnh/thành phố (ví dụ "TINH_HN")
  provinceName?: string;        // Tên tỉnh/thành phố
  sheetNumber: number;          // Số tờ bản đồ (> 0)
  parcelNumber: number;         // Số thửa đất (> 0)
  area: number;                 // Diện tích m2 (> 0)
  purposeCode: LandPurposeCode; // Mã mục đích sử dụng đất
  address: string;              // Địa chỉ thửa đất
  verticesVN2000: VertexVN2000[]; // Tọa độ đỉnh VN-2000 (tối thiểu 3 đỉnh)
  surveyDocumentNumber: string; // Số hiệu văn bản đo đạc / trích đo địa chính
  ownerName?: string;           // Tên chủ sử dụng đất sơ bộ
  ownerCitizenId?: string;      // Số CCCD chủ sử dụng đất (12 số)
  officerId: string;            // Mã định danh cán bộ khai báo
  officerCommuneCode: string;   // Mã xã thuộc thẩm quyền quản lý của cán bộ (QTD-16)
  notes?: string;
}

export interface ParcelItem {
  id: string;
  nationalCode: string;         // Mã định danh thửa đất quốc gia (QTD-01: ví dụ 01001-0012-0045)
  communeCode: string;
  communeName: string;
  provinceCode: string;
  provinceName: string;
  sheetNumber: number;
  parcelNumber: number;
  area: number;
  purposeCode: LandPurposeCode;
  address: string;
  legalStatus: ParcelLegalStatus;
  surveyDocumentNumber: string;
  ownerName?: string;
  ownerCitizenId?: string;
  verticesVN2000: VertexVN2000[];
  boundaryGeojson: any;
  declaredByOfficerId: string;
  auditHash: string;
  parentParcelId?: string;           // ID thửa đất cha (nếu do tách thửa)
  parentNationalCode?: string;       // Mã thửa cha (nếu do tách thửa)
  mergedFromParcelIds?: string[];    // Danh sách ID thửa đất tiền thân (nếu do hợp thửa)
  mergedFromNationalCodes?: string[];// Danh sách Mã thửa tiền thân (nếu do hợp thửa)
  childParcelIds?: string[];         // Danh sách ID các thửa con đã tách
  isHistorical?: boolean;            // Cờ đánh dấu thửa đất đã chuyển vào lịch sử (QTD-02)
  originType?: LandOriginType;       // Nguồn gốc sử dụng đất theo Luật Đất đai 2024
  originName?: string;               // Tên hiển thị nguồn gốc đất
  originDecisionNumber?: string;     // Số quyết định giao/thuê/công nhận
  originDecisionDate?: string;       // Ngày quyết định
  financialStatus?: string;          // Tình trạng nghĩa vụ tài chính
  termType?: LandUseTermType;        // Loại hình thời hạn: Ổn định lâu dài vs Có thời hạn
  termStartDate?: string;            // Ngày bắt đầu sử dụng
  termDurationYears?: number;        // Thời hạn giao/thuê đất (số năm)
  termExpiryDate?: string;           // Ngày hết hạn sử dụng đất
  expiryWarningStatus?: ExpiryWarningStatus; // Trạng thái cảnh báo hết hạn
  lastExpiryNotifiedAt?: string;     // Lần thông báo cảnh báo gần nhất
  createdAt: string;
  updatedAt: string;
}

export interface DeclareNewParcelResponse {
  success: boolean;
  parcel: ParcelItem;
  auditHash: string;
  message: string;
}


// ==========================================
// Sinh Mã định danh thửa đất quốc gia duy nhất (DCS-02-CN-002)
// ==========================================

export interface GenerateNationalCodeRequest {
  provinceCode: string;         // Mã tỉnh (ví dụ "01" hoặc "TINH_HN")
  communeCode: string;          // Mã xã (5 số, ví dụ "01001")
  sheetNumber: number;          // Số tờ bản đồ (> 0)
  parcelNumber: number;         // Số thửa đất (> 0)
  centroidX?: number;           // Tọa độ trọng tâm X VN-2000
  centroidY?: number;           // Tọa độ trọng tâm Y VN-2000
  year?: number;                // Năm hình thành thửa (ví dụ 2026)
  subdivisionBranch?: string;   // Nhánh tách thửa (mặc định "00")
}

export interface NationalCodeComponents {
  provinceCode: string;
  communeCode: string;
  sheetNumber: number;
  parcelNumber: number;
  branchSuffix: string;
  checksum: string;
}

export interface GenerateNationalCodeResponse {
  nationalCode: string;         // Mã định danh quốc gia chuẩn hóa: 01001-0012-00045-00
  shortCode: string;            // Mã định danh ngắn gọn: 01001-0012-0045
  spatialUid: string;           // Mã định danh không gian địa lý: VN-3405-01001-X2325410-Y589120
  components: NationalCodeComponents;
  qrCodePayload: string;        // Chuỗi mã hóa phục vụ in Giấy chứng nhận điện tử
  isUnique: boolean;
  auditHash: string;
  message: string;
}

export interface ValidateNationalCodeRequest {
  code: string;
}

export interface ValidateNationalCodeResponse {
  isValid: boolean;
  normalizedCode?: string;
  components?: NationalCodeComponents;
  isRegisteredInDatabase: boolean;
  errorReason?: string;
  message: string;
}


// ==========================================
// Quản lý vòng đời thửa đất: Tách thửa và hợp thửa (DCS-02-CN-003)
// ==========================================

export interface SubdivideChildParcelItem {
  parcelNumber: number;              // Số thứ tự thửa đất mới (> 0)
  area: number;                      // Diện tích thửa con (m2, >= diện tích tối thiểu QTD-08)
  address?: string;                  // Địa chỉ thửa đất con
  purposeCode?: LandPurposeCode;     // Mã mục đích (mặc định kế thừa từ thửa cha)
  verticesVN2000?: VertexVN2000[];   // Tọa độ đỉnh VN-2000 thửa con
  ownerName?: string;                // Chủ sử dụng đất thừa kế/nhận chuyển nhượng
  ownerCitizenId?: string;           // Số CCCD chủ sử dụng đất mới
}

export interface SubdivideParcelRequest {
  parentParcelId: string;            // ID thửa đất gốc cần tách
  decisionNumber: string;            // Số quyết định / văn bản cho phép tách thửa
  officerId: string;                 // Mã cán bộ thực hiện
  officerCommuneCode?: string;       // Mã xã thẩm quyền của cán bộ (QTD-16)
  minSubdivisionArea?: number;       // Hạn mức diện tích tối thiểu theo quy định tỉnh (QTD-08, mặc định 30m2)
  newParcels: SubdivideChildParcelItem[]; // Danh sách các thửa đất con hình thành (tối thiểu 2 thửa)
  notes?: string;
}

export interface SubdivideParcelResponse {
  success: boolean;
  parentParcel: ParcelItem;          // Thửa gốc đã chuyển sang HISTORICAL (QTD-02)
  childParcels: ParcelItem[];        // Danh sách các thửa con mới được tạo
  auditHash: string;
  message: string;
}

export interface MergeParcelsRequest {
  sourceParcelIds: string[];         // Danh sách ID các thửa đất thành phần cần hợp (tối thiểu 2 thửa)
  newParcelNumber: number;           // Số thứ tự thửa đất gộp mới (> 0)
  sheetNumber?: number;              // Số tờ bản đồ mới (mặc định lấy theo thửa đầu tiên)
  address?: string;                  // Địa chỉ thửa đất hợp nhất
  decisionNumber: string;            // Số văn bản / quyết định cho phép hợp thửa
  officerId: string;                 // Mã cán bộ thực hiện
  officerCommuneCode?: string;       // Thẩm quyền địa giới (QTD-16)
  verticesVN2000?: VertexVN2000[];   // Tọa độ ranh giới thửa đất mới gộp
  ownerName?: string;                // Chủ sử dụng đất sau khi hợp nhất
  ownerCitizenId?: string;           // CCCD chủ sử dụng đất
  notes?: string;
}

export interface MergeParcelsResponse {
  success: boolean;
  sourceParcels: ParcelItem[];       // Các thửa đất cũ đã chuyển sang HISTORICAL (QTD-02)
  mergedParcel: ParcelItem;          // Thửa đất mới hình thành sau hợp thửa
  auditHash: string;
  message: string;
}

export interface ParcelLineageNode {
  parcelId: string;
  nationalCode: string;
  sheetNumber: number;
  parcelNumber: number;
  area: number;
  purposeCode: LandPurposeCode;
  legalStatus: ParcelLegalStatus;
  isCurrent: boolean;
  relationship: 'CURRENT' | 'PARENT' | 'CHILD' | 'ANCESTOR' | 'MERGED_SOURCE';
  fluctuationType?: FluctuationType;
  decisionNumber?: string;
  timestamp: string;
}

export interface ParcelLineageResponse {
  parcelId: string;
  nationalCode: string;
  currentParcel: ParcelItem;
  parents: ParcelItem[];
  children: ParcelItem[];
  lineageNodes: ParcelLineageNode[];
  totalGenerations: number;
}


export interface LandOriginRights {
  canTransfer: boolean;          // Quyền chuyển nhượng QSDĐ
  canMortgage: boolean;          // Quyền thế chấp QSDĐ
  canSublease: boolean;          // Quyền cho thuê, cho thuê lại QSDĐ
  canDonate: boolean;            // Quyền tặng cho QSDĐ
  description: string;           // Diễn giải chính sách pháp lý theo Luật Đất đai 2024
}

export interface UpdateLandOriginRequest {
  parcelId: string;
  originType: LandOriginType;
  decisionNumber: string;        // Số quyết định giao/thuê/công nhận đất
  decisionDate: string;          // Ngày ban hành quyết định (YYYY-MM-DD)
  grantingAuthority: string;     // Cơ quan ban hành (UBND cấp Tỉnh / Huyện / TP)
  financialStatus?: 'PAID' | 'EXEMPTED' | 'ANNUAL_PAYMENT' | 'DEFERRED'; // Tình trạng nghĩa vụ tài chính
  officerId: string;
  officerCommuneCode?: string;
  notes?: string;
}

export interface UpdateLandOriginResponse {
  success: boolean;
  parcel: ParcelItem;
  originType: LandOriginType;
  originName: string;
  legalRights: LandOriginRights;
  auditHash: string;
  message: string;
}

export interface ValidateAgriculturalSubdivisionRequest {
  parcelId: string;
  newParcelsArea: number[];      // Danh sách diện tích các thửa nông nghiệp dự kiến tách
  minCultivationArea?: number;   // Hạn mức canh tác tối thiểu (mặc định 500m2 theo QTD-26)
}

export interface ValidateAgriculturalSubdivisionResponse {
  isEligible: boolean;
  minCultivationArea: number;
  ineligibleAreas: number[];
  errorReason?: string;
  message: string;
}


// ==========================================
// Quản lý thời hạn sử dụng đất và cảnh báo sắp hết hạn (DCS-02-CN-005)
// ==========================================

export enum LandUseTermType {
  STABLE_LONG_TERM = 'STABLE_LONG_TERM', // Sử dụng ổn định lâu dài (vô thời hạn - e.g. Đất ở ODT, ONT)
  DEFINITE = 'DEFINITE',                 // Sử dụng có thời hạn (e.g. Đất nông nghiệp 50 năm, TMD 50-70 năm)
}

export enum ExpiryWarningStatus {
  VALID = 'VALID',                       // Còn hạn an toàn (> 180 ngày)
  EXPIRING_SOON_6M = 'EXPIRING_SOON_6M', // Sắp hết hạn trước 6 tháng (<= 180 ngày)
  CRITICAL_3M = 'CRITICAL_3M',           // Cảnh báo khẩn cấp trước 3 tháng (<= 90 ngày)
  EXPIRED = 'EXPIRED',                   // Đã hết hạn (<= 0 ngày)
}

export interface UpdateLandTermRequest {
  parcelId: string;
  termType: LandUseTermType;
  startDate?: string;                    // Ngày bắt đầu giao/thuê (YYYY-MM-DD)
  durationYears?: number;                // Thời hạn giao đất (năm, ví dụ 50)
  expiryDate?: string;                   // Ngày hết hạn tính toán hoặc chỉ định (YYYY-MM-DD)
  officerId: string;
  officerCommuneCode?: string;
  notes?: string;
}

export interface UpdateLandTermResponse {
  success: boolean;
  parcel: ParcelItem;
  termType: LandUseTermType;
  expiryDate?: string;
  daysRemaining?: number;
  warningStatus: ExpiryWarningStatus;
  auditHash: string;
  message: string;
}

export interface ExpiringParcelItem {
  parcelId: string;
  nationalCode: string;
  sheetNumber: number;
  parcelNumber: number;
  communeCode: string;
  communeName: string;
  purposeCode: LandPurposeCode;
  purposeName: string;
  area: number;
  ownerName: string;
  ownerCitizenId: string;
  ownerPhone?: string;
  termStartDate?: string;
  termExpiryDate: string;
  daysRemaining: number;
  warningStatus: ExpiryWarningStatus;
  legalExtensionGuidance: string;        // Hướng dẫn thủ tục theo Điều 172 Luật Đất đai 2024
  lastNotifiedAt?: string;
}

export interface GetExpiringParcelsQuery {
  daysThreshold?: number;                // Ngưỡng số ngày cảnh báo (mặc định 180 ngày = 6 tháng)
  communeCode?: string;
  warningStatus?: ExpiryWarningStatus;
}

export interface GetExpiringParcelsResponse {
  total: number;
  daysThreshold: number;
  items: ExpiringParcelItem[];
  summary: {
    criticalCount: number;               // Sắp hết hạn < 90 ngày
    warningCount: number;                // Sắp hết hạn < 180 ngày
    expiredCount: number;                // Đã hết hạn
  };
}

export interface NotifyExpiryRequest {
  parcelId: string;
  channels?: ('SMS' | 'APP_PUSH' | 'EMAIL')[];
  officerId?: string;
}

export interface NotifyExpiryResponse {
  success: boolean;
  parcelId: string;
  nationalCode: string;
  ownerName: string;
  ownerPhone?: string;
  sentChannels: string[];
  notificationContent: string;
  auditHash: string;
  notifiedAt: string;
  message: string;
}


// ==========================================
// Quản lý tài sản gắn liền với đất trên thửa (DCS-02-CN-006)
// ==========================================

export enum PropertyOnLandType {
  INDIVIDUAL_HOUSE = 'INDIVIDUAL_HOUSE',     // Nhà ở riêng lẻ (nhà phố, biệt thự)
  APARTMENT = 'APARTMENT',                   // Căn hộ chung cư
  CONSTRUCTION_WORK = 'CONSTRUCTION_WORK',   // Công trình xây dựng khác (nhà xưởng, kho, văn phòng)
  PERENNIAL_TREE = 'PERENNIAL_TREE',         // Cây lâu năm
  PRODUCTION_FOREST = 'PRODUCTION_FOREST',   // Rừng sản xuất là rừng trồng
}

export enum ConstructionGrade {
  GRADE_SPECIAL = 'GRADE_SPECIAL',           // Cấp đặc biệt
  GRADE_1 = 'GRADE_1',                       // Cấp I
  GRADE_2 = 'GRADE_2',                       // Cấp II
  GRADE_3 = 'GRADE_3',                       // Cấp III
  GRADE_4 = 'GRADE_4',                       // Cấp IV
}

export interface PropertyOnLandItem {
  id: string;
  parcelId: string;
  parcelNationalCode: string;
  assetType: PropertyOnLandType;
  name: string;                              // Tên tài sản / công trình
  constructionArea: number;                  // Diện tích xây dựng (m2)
  floorArea: number;                         // Diện tích sàn xây dựng (m2)
  structure: string;                         // Kết cấu chính (Bê tông cốt thép, khung thép...)
  grade: ConstructionGrade;                  // Cấp công trình
  floorsCount?: number;                      // Số tầng
  completionYear?: number;                   // Năm hoàn công
  ownershipTerm?: string;                    // Thời hạn sở hữu
  completionCertificateNumber?: string;      // Số giấy phép hoàn công / quyết định nghiệm thu
  completionCertificateDate?: string;        // Ngày cấp phép hoàn công (YYYY-MM-DD)
  ownerName: string;                         // Tên chủ sở hữu tài sản
  ownerCitizenId: string;                    // Số CCCD chủ sở hữu
  isJointSpouseOwnership: boolean;           // Đồng sở hữu vợ chồng (QTD-25)
  spouseName?: string;                       // Họ tên vợ/chồng đồng sở hữu
  spouseCitizenId?: string;                  // Số CCCD vợ/chồng đồng sở hữu
  status: 'ACTIVE' | 'DEMOLISHED' | 'DISPUTED' | 'LOCKED';
  auditHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyOnLandRequest {
  parcelId: string;
  assetType: PropertyOnLandType;
  name: string;
  constructionArea: number;
  floorArea: number;
  structure: string;
  grade: ConstructionGrade;
  floorsCount?: number;
  completionYear?: number;
  ownershipTerm?: string;
  completionCertificateNumber?: string;
  completionCertificateDate?: string;
  ownerName: string;
  ownerCitizenId: string;
  isJointSpouseOwnership?: boolean;
  spouseName?: string;
  spouseCitizenId?: string;
  officerId: string;
  officerCommuneCode?: string;
  notes?: string;
}

export interface CreatePropertyOnLandResponse {
  success: boolean;
  property: PropertyOnLandItem;
  auditHash: string;
  message: string;
}

export interface GetParcelPropertiesResponse {
  total: number;
  parcelId: string;
  parcelNationalCode: string;
  properties: PropertyOnLandItem[];
}


// ==========================================
// Đồng bộ thời gian thực với CSDL Đất đai Quốc gia (DCS-02-CN-007)
// ==========================================

export enum NationalSyncStatus {
  SYNCED = 'SYNCED',       // Đã đồng bộ thành công về CSDL Quốc gia
  PENDING = 'PENDING',     // Đang trong hàng đợi đồng bộ NDXP
  FAILED = 'FAILED',       // Lỗi kết nối / xác thực (đang chờ retry)
  CONFLICT = 'CONFLICT',   // Phát hiện xung đột phiên bản dữ liệu
}

export enum NationalSyncEventType {
  PARCEL_DECLARED = 'PARCEL_DECLARED',           // Khai báo thửa đất mới
  PARCEL_SUBDIVIDED = 'PARCEL_SUBDIVIDED',       // Tách thửa đất
  PARCEL_MERGED = 'PARCEL_MERGED',               // Hợp thửa đất
  ORIGIN_UPDATED = 'ORIGIN_UPDATED',             // Cập nhật nguồn gốc sử dụng đất
  TERM_UPDATED = 'TERM_UPDATED',                 // Cập nhật thời hạn sử dụng đất
  PROPERTY_REGISTERED = 'PROPERTY_REGISTERED',   // Đăng ký tài sản gắn liền với đất
  TRANSACTION_LOCKED = 'TRANSACTION_LOCKED',     // Khóa giao dịch 90 phút
  TRANSACTION_UNLOCKED = 'TRANSACTION_UNLOCKED', // Mở khóa giao dịch
}

export interface NationalSyncEventItem {
  id: string;
  eventType: NationalSyncEventType;
  parcelId: string;
  parcelNationalCode: string;
  ndxpTransactionId: string;                     // Mã giao dịch Trục liên thông quốc gia NDXP
  status: NationalSyncStatus;
  retryCount: number;
  syncLatencyMs: number;                         // Độ trễ đồng bộ (mili-giây)
  checksumSha256: string;                        // Mã băm kiểm toán chuỗi băm QTD-20
  syncedAt: string;
  errorMessage?: string;
  payloadSummary?: string;
}

export interface TriggerNationalSyncRequest {
  parcelId?: string;
  parcelNationalCode?: string;
  eventType?: NationalSyncEventType;
  officerId: string;
  forceSync?: boolean;
}

export interface TriggerNationalSyncResponse {
  success: boolean;
  event: NationalSyncEventItem;
  ndxpTransactionId: string;
  syncLatencyMs: number;
  auditHash: string;
  message: string;
}

export interface NationalSyncStatsResponse {
  totalEvents: number;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
  syncedRate: number;                            // Tỷ lệ đồng bộ thành công (%)
  averageLatencyMs: number;                      // Độ trễ đồng bộ trung bình (ms)
  lastSyncedAt: string;
  ndxpGatewayStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface QueryNationalSyncEventsRequest {
  status?: NationalSyncStatus;
  eventType?: NationalSyncEventType;
  parcelNationalCode?: string;
  limit?: number;
}
