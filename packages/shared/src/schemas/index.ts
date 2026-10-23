import { LandOriginType,
  PropertyOnLandType,
  ConstructionGrade,
  NationalSyncStatus,
  NationalSyncEventType, LandUseTermType, ExpiryWarningStatus } from '../types';
import { z } from 'zod';
import { UserRole, ParcelLegalStatus, LandPurposeCode, FluctuationType, DossierStatus, AdministrativeLevel, JurisdictionAction, DigitalSignatureProvider, SignatureStandard, OcspCertificateStatus, SessionStatus, SensitiveOperationType, OfficerAccountStatus, DeactivationReasonType, DelegationScope, DelegationStatus, EnterpriseStaffPermission } from '../types';

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


// Schemas Quản lý phiên làm việc & Xác thực 2FA nâng cao (DCS-01-CN-005)
export const StepUp2FaChallengeSchema = z.object({
  sessionId: z.string().min(1, 'Mã phiên làm việc không được để trống'),
  operation: z.nativeEnum(SensitiveOperationType, { errorMap: () => ({ message: 'Thao tác nhạy cảm không hợp lệ' }) }),
  targetEntityId: z.string().min(1, 'Mã đối tượng mục tiêu không được để trống'),
});

export const VerifyStepUp2FaSchema = z.object({
  challengeId: z.string().min(1, 'Mã yêu cầu xác thực 2FA không được để trống'),
  sessionId: z.string().min(1, 'Mã phiên làm việc không được để trống'),
  code: z.string().length(6, 'Mã xác thực 2FA phải gồm đúng 6 chữ số').regex(/^\d{6}$/, 'Mã 2FA chỉ chứa ký tự số'),
});

export const UnlockSessionSchema = z.object({
  sessionId: z.string().min(1, 'Mã phiên làm việc không được để trống'),
  unlockCode: z.string().min(4, 'Mã mở khóa phiên tối thiểu 4 ký tự'),
});

export const TerminateSessionSchema = z.object({
  sessionId: z.string().min(1, 'Mã phiên làm việc không được để trống'),
  reason: z.string().optional(),
});

export type StepUp2FaChallengeInput = z.infer<typeof StepUp2FaChallengeSchema>;
export type VerifyStepUp2FaInput = z.infer<typeof VerifyStepUp2FaSchema>;
export type UnlockSessionInput = z.infer<typeof UnlockSessionSchema>;
export type TerminateSessionInput = z.infer<typeof TerminateSessionSchema>;


// ==========================================
// Schemas Khóa và vô hiệu hóa tài khoản công vụ khi điều chuyển công tác (DCS-01-CN-006)
// ==========================================

export const DeactivateOfficerAccountSchema = z.object({
  officerId: z.string().min(1, 'Mã tài khoản cán bộ không được để trống'),
  decisionNumber: z.string().min(3, 'Số quyết định hành chính tối thiểu 3 ký tự'),
  decisionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày quyết định phải theo định dạng YYYY-MM-DD'),
  issuingAuthority: z.string().min(3, 'Cơ quan ban hành quyết định tối thiểu 3 ký tự'),
  reasonType: z.nativeEnum(DeactivationReasonType, { errorMap: () => ({ message: 'Loại căn cứ thu hồi quyền không hợp lệ' }) }),
  reasonDetail: z.string().min(5, 'Lý do thu hồi quyền tối thiểu 5 ký tự'),
  transfereeOfficerId: z.string().optional(),
});

export const TransferDossiersSchema = z.object({
  fromOfficerId: z.string().min(1, 'Mã cán bộ bàn giao không được để trống'),
  toOfficerId: z.string().min(1, 'Mã cán bộ tiếp nhận không được để trống'),
  dossierIds: z.array(z.string()).optional(),
  reason: z.string().min(5, 'Lý do chuyển giao hồ sơ tối thiểu 5 ký tự'),
});

export const ReactivateOfficerAccountSchema = z.object({
  officerId: z.string().min(1, 'Mã tài khoản cán bộ không được để trống'),
  decisionNumber: z.string().min(3, 'Số quyết định tiếp nhận / khôi phục tối thiểu 3 ký tự'),
  reinstatementReason: z.string().min(5, 'Lý do khôi phục quyền công vụ tối thiểu 5 ký tự'),
});

export type DeactivateOfficerAccountInput = z.infer<typeof DeactivateOfficerAccountSchema>;
export type TransferDossiersInput = z.infer<typeof TransferDossiersSchema>;
export type ReactivateOfficerAccountInput = z.infer<typeof ReactivateOfficerAccountSchema>;


// ==========================================
// Schemas Cấu hình chính sách mật khẩu và chống tấn công dò quét (DCS-01-CN-007)
// ==========================================

export const UpdatePasswordPolicySchema = z.object({
  minLength: z.number().int().min(8, 'Độ dài tối thiểu của mật khẩu không được nhỏ hơn 8 ký tự').max(32, 'Độ dài tối đa của mật khẩu không được vượt quá 32 ký tự'),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  passwordExpiryDays: z.number().int().min(15, 'Thời hạn đổi mật khẩu tối thiểu 15 ngày').max(365, 'Thời hạn đổi mật khẩu tối đa 365 ngày'),
  preventPasswordReuseCount: z.number().int().min(1, 'Số mật khẩu cũ không được tái sử dụng tối thiểu là 1').max(24, 'Tối đa lưu 24 mật khẩu cũ'),
  maxFailedAttempts: z.number().int().min(3, 'Số lần đăng nhập sai tối đa từ 3 đến 10 lần').max(10, 'Số lần đăng nhập sai tối đa không quá 10 lần'),
  lockoutDurationMinutes: z.number().int().min(5, 'Thời gian khóa tối thiểu 5 phút').max(1440, 'Thời gian khóa tối đa 1440 phút (24 giờ)'),
  trustedIpRanges: z.array(z.string()).optional(),
});

export const ValidatePasswordSchema = z.object({
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  username: z.string().optional(),
});

export const UnblockIpSchema = z.object({
  ipAddress: z.string().min(7, 'Địa chỉ IP không hợp lệ'),
  reason: z.string().min(5, 'Lý do mở khóa địa chỉ IP tối thiểu 5 ký tự'),
});

export type UpdatePasswordPolicyInput = z.infer<typeof UpdatePasswordPolicySchema>;
export type ValidatePasswordInput = z.infer<typeof ValidatePasswordSchema>;
export type UnblockIpInput = z.infer<typeof UnblockIpSchema>;


// ==========================================
// Schemas Quản lý ủy quyền giải quyết hồ sơ địa chính có thời hạn (DCS-01-CN-008)
// ==========================================

export const CreateDelegationSchema = z.object({
  documentNumber: z.string().min(3, 'Số văn bản ủy quyền tối thiểu 3 ký tự'),
  title: z.string().min(5, 'Trích yếu văn bản ủy quyền tối thiểu 5 ký tự'),
  delegateeId: z.string().min(1, 'Mã cán bộ được ủy quyền không được để trống'),
  scope: z.nativeEnum(DelegationScope, { errorMap: () => ({ message: 'Phạm vi ủy quyền không hợp lệ' }) }),
  startDate: z.string().min(10, 'Thời điểm bắt đầu ủy quyền không được để trống'),
  endDate: z.string().min(10, 'Thời điểm kết thúc ủy quyền không được để trống'),
  notes: z.string().optional(),
});

export const RevokeDelegationSchema = z.object({
  delegationId: z.string().min(1, 'Mã văn bản ủy quyền không được để trống'),
  reason: z.string().min(5, 'Lý do thu hồi ủy quyền tối thiểu 5 ký tự'),
});

export const VerifyDelegationAccessSchema = z.object({
  officerId: z.string().min(1, 'Mã cán bộ không được để trống'),
  requiredScope: z.nativeEnum(DelegationScope, { errorMap: () => ({ message: 'Phạm vi thẩm quyền yêu cầu không hợp lệ' }) }),
});

export type CreateDelegationInput = z.infer<typeof CreateDelegationSchema>;
export type RevokeDelegationInput = z.infer<typeof RevokeDelegationSchema>;
export type VerifyDelegationAccessInput = z.infer<typeof VerifyDelegationAccessSchema>;


// ==========================================
// Schemas Đăng nhập và phân quyền tài khoản tổ chức qua Cổng Định danh Doanh nghiệp (DCS-01-CN-009)
// ==========================================

export const EnterpriseLoginSchema = z.object({
  taxId: z.string().regex(/^\d{10}(-\d{3})?$/, 'Mã số thuế doanh nghiệp phải gồm 10 hoặc 13 chữ số'),
  authMethod: z.enum(['DIGITAL_SIGNATURE', 'REPRESENTATIVE_OTP']),
  digitalSignatureCertSerial: z.string().optional(),
  otpCode: z.string().optional(),
});

export const AssignEnterpriseStaffSchema = z.object({
  enterpriseId: z.string().min(1, 'Mã doanh nghiệp không được để trống'),
  fullName: z.string().min(2, 'Họ tên nhân viên tối thiểu 2 ký tự'),
  citizenId: z.string().length(12, 'Số CCCD nhân viên phải gồm đúng 12 chữ số').regex(/^\d{12}$/, 'CCCD chỉ chứa ký tự số'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  department: z.string().min(2, 'Phòng ban công tác tối thiểu 2 ký tự'),
  position: z.string().min(2, 'Chức vụ tối thiểu 2 ký tự'),
  permissions: z.array(z.nativeEnum(EnterpriseStaffPermission, { errorMap: () => ({ message: 'Quyền hạn không hợp lệ' }) }))
    .min(1, 'Phải phân công ít nhất một quyền hạn xử lý hồ sơ'),
});

export type EnterpriseLoginInput = z.infer<typeof EnterpriseLoginSchema>;
export type AssignEnterpriseStaffInput = z.infer<typeof AssignEnterpriseStaffSchema>;


// ==========================================
// Schemas Nhật ký xác thực và phát hiện cảnh báo đăng nhập bất thường (DCS-01-CN-010)
// ==========================================

export const QueryAuthAuditLogsSchema = z.object({
  actorId: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILED', 'CHALLENGED', 'BLOCKED']).optional(),
  isAnomaly: z.boolean().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const QueryAnomalyAlertsSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']).optional(),
  detectionType: z.enum(['IMPOSSIBLE_TRAVEL', 'OFF_HOURS_ACCESS', 'BRUTE_FORCE_BURST', 'UNTRUSTED_NETWORK', 'SUSPICIOUS_DEVICE']).optional(),
});

export const ResolveAnomalyAlertSchema = z.object({
  alertId: z.string().min(1, 'Mã cảnh báo không được để trống'),
  action: z.enum(['RESOLVE_LOCK', 'DISMISS_FALSE_POSITIVE', 'REQUIRE_STEP_UP'], {
    errorMap: () => ({ message: 'Hành động xử lý cảnh báo không hợp lệ' })
  }),
  notes: z.string().min(5, 'Ghi chú xử lý cảnh báo tối thiểu 5 ký tự'),
  resolvedBy: z.string().min(1, 'Người xử lý cảnh báo không được để trống'),
});

export const SimulateAuthEventSchema = z.object({
  actorId: z.string().min(1, 'Mã người dùng không được để trống'),
  actorName: z.string().min(2, 'Tên người dùng tối thiểu 2 ký tự'),
  actorRole: z.string().min(1, 'Vai trò không được để trống'),
  authMethod: z.enum(['CITIZEN_IDP', 'OFFICER_SSO', 'ENTERPRISE_TOKEN', 'SMART_CA']),
  clientIp: z.string().min(7, 'Địa chỉ IP không hợp lệ'),
  province: z.string().min(2, 'Tên tỉnh thành không được để trống'),
  country: z.string().optional(),
  deviceInfo: z.string().optional(),
  isSuccess: z.boolean(),
  isOfficeHours: z.boolean().optional(),
});

export type QueryAuthAuditLogsInput = z.infer<typeof QueryAuthAuditLogsSchema>;
export type QueryAnomalyAlertsInput = z.infer<typeof QueryAnomalyAlertsSchema>;
export type ResolveAnomalyAlertInput = z.infer<typeof ResolveAnomalyAlertSchema>;
export type SimulateAuthEventInput = z.infer<typeof SimulateAuthEventSchema>;


// ==========================================
// Schemas Khai báo thông tin thuộc tính thửa đất mới (DCS-02-CN-001)
// ==========================================

export const DeclareNewParcelSchema = z.object({
  communeCode: z.string().min(1, 'Mã đơn vị hành chính cấp xã không được để trống'),
  communeName: z.string().optional(),
  provinceCode: z.string().min(1, 'Mã tỉnh/thành phố không được để trống'),
  provinceName: z.string().optional(),
  sheetNumber: z.number().int().positive('Số tờ bản đồ phải là số nguyên dương lớn hơn 0'),
  parcelNumber: z.number().int().positive('Số thửa đất phải là số nguyên dương lớn hơn 0'),
  area: z.number().positive('Diện tích thửa đất phải là số thực lớn hơn 0'),
  purposeCode: z.nativeEnum(LandPurposeCode, { errorMap: () => ({ message: 'Mã mục đích sử dụng đất không hợp lệ theo Luật Đất đai 2024' }) }),
  address: z.string().min(5, 'Địa chỉ thửa đất tối thiểu 5 ký tự'),
  verticesVN2000: z.array(
    z.object({
      x: z.number().positive('Tọa độ X (Bắc) VN-2000 phải là số dương hợp lệ'),
      y: z.number().positive('Tọa độ Y (Đông) VN-2000 phải là số dương hợp lệ'),
    })
  ).min(3, 'Thửa đất phải có tối thiểu 3 đỉnh tọa độ để tạo thành ranh giới khép kín'),
  surveyDocumentNumber: z.string().min(3, 'Số hiệu hồ sơ đo đạc / trích đo địa chính tối thiểu 3 ký tự'),
  ownerName: z.string().optional(),
  ownerCitizenId: z.string().regex(/^\d{12}$/, 'Số CCCD chủ sử dụng đất phải gồm đúng 12 chữ số').optional().or(z.literal('')),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().min(1, 'Mã xã của cán bộ không được để trống'),
  notes: z.string().optional(),
});

export type DeclareNewParcelInput = z.infer<typeof DeclareNewParcelSchema>;


// ==========================================
// Schemas Sinh Mã định danh thửa đất quốc gia duy nhất (DCS-02-CN-002)
// ==========================================

export const GenerateNationalCodeSchema = z.object({
  provinceCode: z.string().min(1, 'Mã tỉnh/thành phố không được để trống'),
  communeCode: z.string().min(1, 'Mã xã/phường không được để trống'),
  sheetNumber: z.number().int().positive('Số tờ bản đồ phải là số nguyên dương lớn hơn 0'),
  parcelNumber: z.number().int().positive('Số thửa đất phải là số nguyên dương lớn hơn 0'),
  centroidX: z.number().positive('Tọa độ trọng tâm X VN-2000 phải là số dương').optional(),
  centroidY: z.number().positive('Tọa độ trọng tâm Y VN-2000 phải là số dương').optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  subdivisionBranch: z.string().regex(/^\d{2}$/, 'Hậu tố nhánh tách thửa phải gồm 2 chữ số (ví dụ 00, 01)').optional(),
});

export const ValidateNationalCodeSchema = z.object({
  code: z.string().min(5, 'Mã định danh thửa đất tối thiểu 5 ký tự'),
});

export type GenerateNationalCodeInput = z.infer<typeof GenerateNationalCodeSchema>;
export type ValidateNationalCodeInput = z.infer<typeof ValidateNationalCodeSchema>;


// ==========================================
// Schemas Quản lý vòng đời thửa đất: Tách thửa và hợp thửa (DCS-02-CN-003)
// ==========================================

export const SubdivideChildParcelSchema = z.object({
  parcelNumber: z.number().int().positive('Số thửa con phải là số nguyên dương lớn hơn 0'),
  area: z.number().positive('Diện tích thửa con phải là số dương lớn hơn 0'),
  address: z.string().optional(),
  purposeCode: z.nativeEnum(LandPurposeCode).optional(),
  verticesVN2000: z.array(
    z.object({
      x: z.number().positive(),
      y: z.number().positive(),
    })
  ).optional(),
  ownerName: z.string().optional(),
  ownerCitizenId: z.string().regex(/^\d{12}$/, 'CCCD phải gồm 12 chữ số').optional().or(z.literal('')),
});

export const SubdivideParcelSchema = z.object({
  parentParcelId: z.string().min(1, 'ID thửa đất gốc không được để trống'),
  decisionNumber: z.string().min(3, 'Số quyết định / văn bản cho phép tách thửa tối thiểu 3 ký tự'),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().optional(),
  minSubdivisionArea: z.number().positive('Hạn mức diện tích tối thiểu phải lớn hơn 0').optional(),
  newParcels: z.array(SubdivideChildParcelSchema).min(2, 'Thủ tục tách thửa yêu cầu hình thành tối thiểu 2 thửa đất con mới'),
  notes: z.string().optional(),
});

export const MergeParcelsSchema = z.object({
  sourceParcelIds: z.array(z.string().min(1)).min(2, 'Thủ tục hợp thửa yêu cầu tối thiểu 2 thửa đất thành phần'),
  newParcelNumber: z.number().int().positive('Số thửa đất mới phải là số nguyên dương lớn hơn 0'),
  sheetNumber: z.number().int().positive('Số tờ bản đồ mới phải là số nguyên dương lớn hơn 0').optional(),
  address: z.string().optional(),
  decisionNumber: z.string().min(3, 'Số quyết định / văn bản cho phép hợp thửa tối thiểu 3 ký tự'),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().optional(),
  verticesVN2000: z.array(
    z.object({
      x: z.number().positive(),
      y: z.number().positive(),
    })
  ).optional(),
  ownerName: z.string().optional(),
  ownerCitizenId: z.string().regex(/^\d{12}$/, 'CCCD phải gồm 12 chữ số').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type SubdivideChildParcelInput = z.infer<typeof SubdivideChildParcelSchema>;
export type SubdivideParcelInput = z.infer<typeof SubdivideParcelSchema>;
export type MergeParcelsInput = z.infer<typeof MergeParcelsSchema>;

// ==========================================
// Schemas Quản lý nguồn gốc sử dụng đất (DCS-02-CN-004)
// ==========================================

export const UpdateLandOriginSchema = z.object({
  parcelId: z.string().min(1, 'ID thửa đất không được để trống'),
  originType: z.nativeEnum(LandOriginType, {
    errorMap: () => ({ message: 'Loại nguồn gốc sử dụng đất không hợp lệ theo Luật Đất đai 2024' }),
  }),
  decisionNumber: z.string().min(3, 'Số quyết định giao/thuê đất tối thiểu 3 ký tự'),
  decisionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày quyết định phải theo định dạng YYYY-MM-DD'),
  grantingAuthority: z.string().min(3, 'Cơ quan ban hành quyết định tối thiểu 3 ký tự'),
  financialStatus: z.enum(['PAID', 'EXEMPTED', 'ANNUAL_PAYMENT', 'DEFERRED']).optional(),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().optional(),
  notes: z.string().optional(),
});

export const ValidateAgriculturalSubdivisionSchema = z.object({
  parcelId: z.string().min(1, 'ID thửa đất không được để trống'),
  newParcelsArea: z.array(z.number().positive('Diện tích thửa đất phải là số dương')).min(2, 'Yêu cầu tối thiểu 2 thửa con'),
  minCultivationArea: z.number().positive().optional(),
});

export type UpdateLandOriginInput = z.infer<typeof UpdateLandOriginSchema>;
export type ValidateAgriculturalSubdivisionInput = z.infer<typeof ValidateAgriculturalSubdivisionSchema>;


// ==========================================
// Schemas Quản lý thời hạn sử dụng đất và cảnh báo sắp hết hạn (DCS-02-CN-005)
// ==========================================

export const UpdateLandTermSchema = z.object({
  parcelId: z.string().min(1, 'ID thửa đất không được để trống'),
  termType: z.nativeEnum(LandUseTermType, {
    errorMap: () => ({ message: 'Loại hình thời hạn sử dụng đất không hợp lệ theo Luật Đất đai 2024' }),
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu phải theo định dạng YYYY-MM-DD').optional(),
  durationYears: z.number().int().positive('Thời hạn sử dụng đất (năm) phải là số nguyên dương').optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hết hạn phải theo định dạng YYYY-MM-DD').optional(),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().optional(),
  notes: z.string().optional(),
});

export const GetExpiringParcelsQuerySchema = z.object({
  daysThreshold: z.coerce.number().int().positive().optional(),
  communeCode: z.string().optional(),
  warningStatus: z.nativeEnum(ExpiryWarningStatus).optional(),
});

export const NotifyExpirySchema = z.object({
  parcelId: z.string().min(1, 'ID thửa đất không được để trống'),
  channels: z.array(z.enum(['SMS', 'APP_PUSH', 'EMAIL'])).optional(),
  officerId: z.string().optional(),
});

export type UpdateLandTermInput = z.infer<typeof UpdateLandTermSchema>;
export type GetExpiringParcelsQueryInput = z.infer<typeof GetExpiringParcelsQuerySchema>;
export type NotifyExpiryInput = z.infer<typeof NotifyExpirySchema>;


// ==========================================
// Schemas Quản lý tài sản gắn liền với đất trên thửa (DCS-02-CN-006)
// ==========================================

export const CreatePropertyOnLandSchema = z.object({
  parcelId: z.string().min(1, 'ID thửa đất không được để trống'),
  assetType: z.nativeEnum(PropertyOnLandType, {
    errorMap: () => ({ message: 'Loại tài sản gắn liền với đất không hợp lệ theo Luật Đất đai 2024' }),
  }),
  name: z.string().min(3, 'Tên tài sản/công trình tối thiểu 3 ký tự'),
  constructionArea: z.number().positive('Diện tích xây dựng phải là số dương lớn hơn 0'),
  floorArea: z.number().positive('Diện tích sàn xây dựng phải là số dương lớn hơn 0'),
  structure: z.string().min(2, 'Kết cấu công trình tối thiểu 2 ký tự'),
  grade: z.nativeEnum(ConstructionGrade, {
    errorMap: () => ({ message: 'Cấp công trình xây dựng không hợp lệ' }),
  }),
  floorsCount: z.number().int().positive('Số tầng phải là số nguyên dương').optional(),
  completionYear: z.number().int().min(1900, 'Năm hoàn công tối thiểu 1900').max(2100).optional(),
  ownershipTerm: z.string().optional(),
  completionCertificateNumber: z.string().optional(),
  completionCertificateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hoàn công phải theo định dạng YYYY-MM-DD').optional(),
  ownerName: z.string().min(2, 'Họ tên chủ sở hữu tối thiểu 2 ký tự'),
  ownerCitizenId: z.string().regex(/^\d{12}$/, 'CCCD chủ sở hữu phải gồm đúng 12 chữ số'),
  isJointSpouseOwnership: z.boolean().optional(),
  spouseName: z.string().optional(),
  spouseCitizenId: z.string().regex(/^\d{12}$/, 'CCCD vợ/chồng phải gồm đúng 12 chữ số').optional().or(z.literal('')),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  officerCommuneCode: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePropertyOnLandInput = z.infer<typeof CreatePropertyOnLandSchema>;


// ==========================================
// Schemas Đồng bộ thời gian thực với CSDL Đất đai Quốc gia (DCS-02-CN-007)
// ==========================================

export const TriggerNationalSyncSchema = z.object({
  parcelId: z.string().optional(),
  parcelNationalCode: z.string().optional(),
  eventType: z.nativeEnum(NationalSyncEventType, {
    errorMap: () => ({ message: 'Loại sự kiện biến động đồng bộ không hợp lệ' }),
  }).optional(),
  officerId: z.string().min(1, 'Mã cán bộ thực hiện không được để trống'),
  forceSync: z.boolean().optional(),
});

export const QueryNationalSyncEventsSchema = z.object({
  status: z.nativeEnum(NationalSyncStatus).optional(),
  eventType: z.nativeEnum(NationalSyncEventType).optional(),
  parcelNationalCode: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type TriggerNationalSyncInput = z.infer<typeof TriggerNationalSyncSchema>;
export type QueryNationalSyncEventsInput = z.infer<typeof QueryNationalSyncEventsSchema>;
