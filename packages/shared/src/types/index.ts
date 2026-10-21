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
