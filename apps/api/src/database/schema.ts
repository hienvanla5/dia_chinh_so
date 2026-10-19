import { pgTable, uuid, varchar, integer, doublePrecision, jsonb, timestamp, text, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { UserRole, ParcelLegalStatus, LandPurposeCode, FluctuationType, DossierStatus, TransactionLockStatus, VertexVN2000 } from '@diachinhso/shared';

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'COMMUNE_OFFICER',
  'LAND_REGISTRAR',
  'LAND_USER',
  'NOTARY_BANK',
  'INSPECTOR',
  'ADMIN',
] as const);

export const parcelLegalStatusEnum = pgEnum('parcel_legal_status', [
  'AVAILABLE',
  'LOCKED',
  'MORTGAGED',
  'DISPUTED',
  'FROZEN',
  'REVOKED',
] as const);

export const landPurposeEnum = pgEnum('land_purpose_code', [
  'ONT',
  'ODT',
  'LUC',
  'LUK',
  'CLN',
  'HNK',
  'RSX',
  'RPH',
  'TMD',
  'SKC',
  'DGT',
  'DNL',
] as const);

export const fluctuationTypeEnum = pgEnum('fluctuation_type', [
  'TRANSFER',
  'DONATION',
  'INHERITANCE',
  'SUBDIVISION',
  'MERGE',
  'PURPOSE_CHANGE',
  'MORTGAGE',
  'RELEASE_MORTGAGE',
] as const);

export const dossierStatusEnum = pgEnum('dossier_status', [
  'DRAFT',
  'SUBMITTED',
  'COMMUNE_VERIFIED',
  'APPRAISED',
  'TAX_PENDING',
  'TAX_PAID',
  'SIGNED',
  'COMPLETED',
  'REJECTED',
] as const);

export const transactionLockStatusEnum = pgEnum('transaction_lock_status', [
  'ACTIVE',
  'RELEASED',
  'TIMED_OUT',
] as const);

// 1. Bảng Người dùng & Cán bộ
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  citizenId: varchar('citizen_id', { length: 12 }).unique(),
  username: varchar('username', { length: 100 }).unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  email: varchar('email', { length: 255 }),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('LAND_USER'),
  department: varchar('department', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Bảng Thửa đất (Lõi địa chính)
export const parcels = pgTable('parcels', {
  id: uuid('id').defaultRandom().primaryKey(),
  nationalCode: varchar('national_code', { length: 30 }).notNull().unique(), // Mã định danh thửa đất quốc gia
  communeId: varchar('commune_id', { length: 20 }).notNull(),
  sheetNumber: integer('sheet_number').notNull(),
  parcelNumber: integer('parcel_number').notNull(),
  area: doublePrecision('area').notNull(), // Diện tích m2
  purposeCode: landPurposeEnum('purpose_code').notNull(),
  address: text('address').notNull(),
  legalStatus: parcelLegalStatusEnum('legal_status').default('AVAILABLE').notNull(),
  verticesVN2000: jsonb('vertices_vn2000').$type<VertexVN2000[]>().notNull(), // Danh sách đỉnh tọa độ VN-2000
  boundaryGeojson: jsonb('boundary_geojson').notNull(), // Polygon GeoJSON WGS84
  ownerIds: jsonb('owner_ids').$type<string[]>().default([]).notNull(), // Danh sách ID chủ sở hữu
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Bảng Sổ Đỏ Số (Giấy chứng nhận điện tử)
export const digitalCertificates = pgTable('digital_certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  parcelId: uuid('parcel_id').references(() => parcels.id).notNull(),
  certificateNumber: varchar('certificate_number', { length: 50 }).notNull().unique(),
  serialNumber: varchar('serial_number', { length: 50 }).notNull().unique(),
  qrHash: varchar('qr_hash', { length: 255 }).notNull(),
  digitalSignature: text('digital_signature').notNull(),
  signerName: varchar('signer_name', { length: 255 }).notNull(),
  signerTitle: varchar('signer_title', { length: 255 }).notNull(),
  pdfUrl: text('pdf_url').notNull(),
  status: varchar('status', { length: 20 }).default('ACTIVE').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
});

// 4. Bảng Phiên Khóa giao dịch phòng ngừa rủi ro
export const transactionLocks = pgTable('transaction_locks', {
  id: uuid('id').defaultRandom().primaryKey(),
  parcelId: uuid('parcel_id').references(() => parcels.id).notNull(),
  nationalCode: varchar('national_code', { length: 30 }).notNull(),
  lockedByUserId: uuid('locked_by_user_id').references(() => users.id).notNull(),
  lockedByUserName: varchar('locked_by_user_name', { length: 255 }).notNull(),
  organizationName: varchar('organization_name', { length: 255 }).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull(),
  status: transactionLockStatusEnum('status').default('ACTIVE').notNull(),
  lockedAt: timestamp('locked_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  durationMinutes: integer('duration_minutes').default(90).notNull(),
});

// 5. Bảng Hồ sơ dịch vụ công biến động đất đai
export const dossiers = pgTable('dossiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  dossierCode: varchar('dossier_code', { length: 50 }).notNull().unique(),
  parcelId: uuid('parcel_id').references(() => parcels.id).notNull(),
  applicantName: varchar('applicant_name', { length: 255 }).notNull(),
  applicantCitizenId: varchar('applicant_citizen_id', { length: 12 }).notNull(),
  applicantPhone: varchar('applicant_phone', { length: 20 }).notNull(),
  fluctuationType: fluctuationTypeEnum('fluctuation_type').notNull(),
  status: dossierStatusEnum('status').default('SUBMITTED').notNull(),
  documentUrls: jsonb('document_urls').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  assignedOfficerId: uuid('assigned_officer_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Bảng Nhật ký kiểm toán hệ thống (Audit Logs)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 50 }),
  userName: varchar('user_name', { length: 255 }),
  role: varchar('role', { length: 50 }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  hashSha256: varchar('hash_sha256', { length: 64 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
