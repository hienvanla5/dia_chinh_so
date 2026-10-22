import { z } from 'zod';
import { UserRole, ParcelLegalStatus, LandPurposeCode, FluctuationType, DossierStatus, AdministrativeLevel, JurisdictionAction, DigitalSignatureProvider, SignatureStandard, OcspCertificateStatus } from '../types';

// Schema xác thực Mock CCCD / Sandbox IdP
export const CitizenAuthSchema = z.object({
  citizenId: z.string().length(12, 'Số CCCD phải gồm đúng 12 chữ số').regex(/^\d{12}$/, 'CCCD chỉ chứa ký tự số'),
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  otpCode: z.string().length(6, 'Mã OTP gồm 6 chữ số').optional(),
});

// Schema yêu cầu gửi mã OTP công dân (DCS-01-CN-001)
export const CitizenSendOtpSchema = z.object({
  citizenId: z.string().length(12, 'Số CCCD phải gồm đúng 12 chữ số').regex(/^\d{12}$/, 'CCCD chỉ chứa ký tự số'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ (10 chữ số bắt đầu bằng 0 hoặc +84)'),
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').optional(),
});

// Schema xác thực mã OTP đăng nhập công dân (DCS-01-CN-001)
export const CitizenVerifyOtpSchema = z.object({
  citizenId: z.string().length(12, 'Số CCCD phải gồm đúng 12 chữ số').regex(/^\d{12}$/, 'CCCD chỉ chứa ký tự số'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  otpCode: z.string().length(6, 'Mã OTP phải gồm đúng 6 chữ số').regex(/^\d{6}$/, 'Mã OTP chỉ chứa ký tự số'),
});

// Schema đăng nhập Cán bộ nghiệp vụ (Email / Password hoặc CCCD)
export const OfficerLoginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  role: z.nativeEnum(UserRole),
});

// Schema đăng nhập SSO tài khoản công vụ kèm MFA (DCS-01-CN-002)
export const OfficerSsoLoginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập công vụ tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu công vụ tối thiểu 6 ký tự'),
  mfaCode: z.string().length(6, 'Mã xác thực MFA phải gồm đúng 6 chữ số').regex(/^\d{6}$/, 'Mã MFA chỉ chứa ký tự số'),
  role: z.nativeEnum(UserRole),
  administrativeUnitCode: z.string().min(2, 'Mã đơn vị hành chính tối thiểu 2 ký tự').optional(),
});

// Schema tọa độ đỉnh ranh giới VN-2000
export const VertexVN2000Schema = z.object({
  pointIndex: z.number().int().positive(),
  x: z.number(), // Tọa độ X (Bắc)
  y: z.number(), // Tọa độ Y (Đông)
});

// Schema tạo mới / cập nhật thửa đất
export const CreateParcelSchema = z.object({
  communeId: z.string().min(1, 'Mã xã/phường không được để trống'),
  sheetNumber: z.number().int().positive('Số tờ bản đồ phải là số nguyên dương'),
  parcelNumber: z.number().int().positive('Số thửa đất phải là số nguyên dương'),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
  purposeCode: z.nativeEnum(LandPurposeCode),
  address: z.string().min(5, 'Địa chỉ tối thiểu 5 ký tự'),
  verticesVN2000: z.array(VertexVN2000Schema).min(3, 'Thửa đất phải có tối thiểu 3 đỉnh tọa độ'),
  ownerIds: z.array(z.string()).default([]),
});

// Schema khóa giao dịch phòng ngừa công chứng / thế chấp trùng
export const CreateTransactionLockSchema = z.object({
  parcelId: z.string().uuid('ID thửa đất không hợp lệ'),
  organizationName: z.string().min(3, 'Tên tổ chức công chứng / ngân hàng không được để trống'),
  durationMinutes: z.number().int().min(15).max(180).default(90), // Mặc định 90 phút
});

// Schema nộp hồ sơ biến động đất đai
export const CreateDossierSchema = z.object({
  parcelId: z.string().uuid('ID thửa đất không hợp lệ'),
  fluctuationType: z.nativeEnum(FluctuationType),
  applicantName: z.string().min(2, 'Họ tên người nộp không được để trống'),
  applicantCitizenId: z.string().length(12, 'Số CCCD người nộp gồm 12 chữ số'),
  applicantPhone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  documentUrls: z.array(z.string().url('URL tệp đính kèm không hợp lệ')).min(1, 'Cần ít nhất 1 tệp tài liệu'),
  notes: z.string().optional(),
});

// Schema thẩm định hồ sơ (Cán bộ xã / VPĐKĐĐ)
export const ReviewDossierSchema = z.object({
  dossierId: z.string().uuid(),
  status: z.nativeEnum(DossierStatus),
  comments: z.string().min(1, 'Nội dung ý kiến xử lý không được để trống'),
});

export type CitizenAuthInput = z.infer<typeof CitizenAuthSchema>;
export type CitizenSendOtpInput = z.infer<typeof CitizenSendOtpSchema>;
export type CitizenVerifyOtpInput = z.infer<typeof CitizenVerifyOtpSchema>;
export type OfficerLoginInput = z.infer<typeof OfficerLoginSchema>;
export type OfficerSsoLoginInput = z.infer<typeof OfficerSsoLoginSchema>;
export type CreateParcelInput = z.infer<typeof CreateParcelSchema>;
export type CreateTransactionLockInput = z.infer<typeof CreateTransactionLockSchema>;
export type CreateDossierInput = z.infer<typeof CreateDossierSchema>;
export type ReviewDossierInput = z.infer<typeof ReviewDossierSchema>;

// Schema cấu hình chính sách phân quyền địa giới 3 cấp (DCS-01-CN-003)
export const ConfigureJurisdictionPolicySchema = z.object({
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Vai trò người dùng không hợp lệ' }) }),
  level: z.nativeEnum(AdministrativeLevel, { errorMap: () => ({ message: 'Cấp hành chính không hợp lệ trong 3 cấp' }) }),
  unitCode: z.string().min(2, 'Mã đơn vị hành chính tối thiểu 2 ký tự'),
  allowedActions: z.array(z.nativeEnum(JurisdictionAction, { errorMap: () => ({ message: 'Thao tác không hợp lệ' }) }))
    .min(1, 'Danh sách quyền thao tác không được rỗng'),
  description: z.string().optional(),
});

// Schema đánh giá thẩm quyền truy cập dữ liệu địa giới (DCS-01-CN-003)
export const EvaluatePermissionSchema = z.object({
  userRole: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Vai trò người dùng không hợp lệ' }) }),
  userUnitCode: z.string().min(2, 'Mã đơn vị hành chính của người dùng không được để trống'),
  action: z.nativeEnum(JurisdictionAction, { errorMap: () => ({ message: 'Thao tác nghiệp vụ không hợp lệ' }) }),
  targetUnitCode: z.string().min(2, 'Mã đơn vị hành chính dữ liệu mục tiêu không được để trống'),
});

export type ConfigureJurisdictionPolicyInput = z.infer<typeof ConfigureJurisdictionPolicySchema>;
export type EvaluatePermissionInput = z.infer<typeof EvaluatePermissionSchema>;


// Schemas ký số chuyên dùng công vụ & SmartCA (DCS-01-CN-004)
export const SignDossierApprovalSchema = z.object({
  dossierId: z.string().min(1, 'Mã hồ sơ địa chính không được để trống'),
  signerRole: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Vai trò người ký không hợp lệ' }) }),
  provider: z.nativeEnum(DigitalSignatureProvider, { errorMap: () => ({ message: 'Nhà cung cấp chữ ký số không hợp lệ' }) }),
  certificateSerial: z.string().min(6, 'Số serial chứng thư số công vụ tối thiểu 6 ký tự'),
  reason: z.string().min(5, 'Lý do / Nội dung phê duyệt tối thiểu 5 ký tự'),
  signaturePin: z.string().min(4, 'Mã PIN bảo mật chữ ký số tối thiểu 4 ký tự').optional(),
  signerName: z.string().optional(),
  documentHash: z.string().optional(),
});

export const VerifyDigitalSignatureSchema = z.object({
  signatureValue: z.string().min(10, 'Chuỗi chữ ký số không hợp lệ'),
  certificateSerial: z.string().min(6, 'Số serial chứng thư số không hợp lệ'),
  documentHash: z.string().optional(),
});

export type SignDossierApprovalInput = z.infer<typeof SignDossierApprovalSchema>;
export type VerifyDigitalSignatureInput = z.infer<typeof VerifyDigitalSignatureSchema>;
