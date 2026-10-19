# ĐỊA CHÍNH SỐ (Sổ Đỏ Số & Cơ Sở Dữ Liệu Thửa Đất Thời Gian Thực)

> Nền tảng quản lý thông tin địa chính, vòng đời thửa đất và biến động quyền sử dụng đất minh bạch, tích hợp bản đồ số GIS chuẩn hệ quy chiếu quốc gia VN-2000, mã định danh thửa đất quốc gia và cơ chế Khóa giao dịch thời gian thực (Real-time Transaction Lock).

---

## 1. Căn Cứ Pháp Lý & Thực Tế
- **Luật Đất đai số 31/2024/QH15** (Hiệu lực thi hành từ 01/08/2024).
- **Đề án 06/QĐ-TTg** của Thủ tướng Chính phủ về chuyển đổi số quốc gia.
- **Nghị định số 101/2024/NĐ-CP** về điều tra cơ bản, đăng ký, cấp Giấy chứng nhận và Hệ thống thông tin đất đai đa mục tiêu.
- **Nghị định số 102/2024/NĐ-CP** quy định chi tiết thi hành một số điều của Luật Đất đai.

---

## 2. Bài Toán Trọng Tâm Giải Quyết
1. **Chống Thế chấp & Công chứng trùng lặp (Double Pledging)**: Sử dụng Redis Atomic Lock (TTL 90 phút) khóa trạng thái thửa đất ngay khi phiên công chứng/tín dụng bắt đầu, ngăn chặn việc 1 thửa đất bị thế chấp đồng thời ở nhiều tổ chức tín dụng.
2. **Chống Làm giả Giấy chứng nhận (Sổ đỏ giả)**: Mỗi Giấy chứng nhận điện tử (Sổ Đỏ Số) được bảo vệ bằng mã băm mật mã SHA-256 động, chữ ký số cơ quan thẩm quyền và mã QR đối soát tức thì với cơ sở dữ liệu quốc gia.
3. **Minh bạch Ranh giới & Tranh chấp**: Mô hình hóa ranh giới thửa đất theo tọa độ đỉnh chuẩn hệ quy chiếu quốc gia VN-2000, tự động cảnh báo chồng lấn không gian và tích hợp lớp quy hoạch xây dựng.
4. **Dịch vụ công biến động toàn trình**: Người dân nộp hồ sơ, Cán bộ xã xác minh thực địa, Văn phòng ĐKĐĐ thẩm định và cấp đổi kết quả số trực tuyến.

---

## 3. Kiến Trúc Công Nghệ (Tech Stack)

- **Kiến trúc Monorepo**: Quản lý bằng `pnpm workspaces`:
  - `apps/web`: Frontend Next.js 15 (App Router, React 19, Tailwind CSS, Lucide Icons, MapLibre GL).
  - `apps/api`: Backend NestJS 10 (TypeScript, Drizzle ORM, Swagger OpenAPI, Passport JWT, IORedis).
  - `packages/shared`: Thư viện dùng chung chứa TypeScript Types, Zod Schemas và Constants nghiệp vụ.
- **Cơ sở dữ liệu & Không gian**: PostgreSQL 16 + PostGIS 3.4 (Lưu trữ Polygon không gian VN-2000 & WGS-84).
- **Bộ nhớ đệm & Khóa giao dịch**: Redis 7 Cluster (Atomic SET NX EX & Pub/Sub thời gian thực).
- **Lưu trữ tài liệu số**: MinIO S3 Object Storage (Lưu trữ hồ sơ scan, PDF Sổ đỏ số ký PAdES).
- **Kiến trúc Định danh**: Decoupled Citizen Digital Identity IdP (CCCD Sandbox 12 số mô phỏng VNeID cho môi trường dev/staging, sẵn sàng chuyển đổi adapter khi kết nối Production C06).

---

## 4. Cấu Trúc Dự Án (Repository Structure)

```text
DIACHINHSO/
├── apps/
│   ├── api/                           # NestJS Backend API Service
│   │   ├── src/
│   │   │   ├── config/                # Cấu hình môi trường (DB, Redis, JWT)
│   │   │   ├── database/              # Drizzle ORM Schema & Providers
│   │   │   ├── common/                # Redis Module & Interceptors
│   │   │   └── modules/
│   │   │       ├── auth/              # Mock Citizen IdP & Officer Login (JWT/RBAC)
│   │   │       ├── parcel/            # Quản lý Thửa đất & Tọa độ VN-2000
│   │   │       ├── lock/              # Khóa giao dịch thời gian thực 90 phút
│   │   │       ├── certificate/       # Cấp phát & Xác minh Sổ Đỏ Số (QR Hash)
│   │   │       ├── dossier/           # Dịch vụ công biến động đất đai
│   │   │       └── spatial/           # Chuyển đổi tọa độ VN-2000 sang WGS-84
│   │   └── package.json
│   │
│   └── web/                           # Next.js 15 Frontend Web Portal
│       ├── src/
│       │   ├── app/
│       │   │   ├── map/               # Bản đồ số GIS & Chi tiết Thửa đất VN-2000
│       │   │   ├── parcels/           # Tra cứu Thửa đất & Giấy chứng nhận
│       │   │   ├── locks/             # Cổng Khóa giao dịch Công chứng & Ngân hàng
│       │   │   ├── dossiers/          # Cổng Dịch vụ công Biến động đất đai
│       │   │   ├── certificates/      # Cổng Quét mã QR & Đối soát Sổ Đỏ Số
│       │   │   └── login/             # Đăng nhập CCCD Sandbox & Cán bộ
│       │   └── components/            # UI components, Layout, Navbar, Sidebar
│       └── package.json
│
├── packages/
│   └── shared/                        # Shared Package (Types, Zod Schemas, Constants)
│       └── src/
│           ├── types/                 # UserRole, ParcelLegalStatus, LandPurposeCode...
│           ├── schemas/               # Zod validation schemas
│           └── constants/             # VN-2000 SRID, Lock TTL, SLA
│
├── docker-compose.yml                 # PostGIS 16, Redis 7, MinIO S3
├── pnpm-workspace.yaml                # Monorepo Workspace configuration
├── package.json                       # Root script orchestrator
└── tsconfig.base.json                 # Shared TypeScript configuration
```

---

## 5. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu môi trường
- Node.js >= 20.x
- pnpm >= 9.x (hoặc pnpm 12.x)
- Docker & Docker Compose (cho PostGIS & Redis)

### Bước 1: Cài đặt thư viện dependencies
```bash
pnpm install
```

### Bước 2: Khởi chạy hạ tầng dữ liệu nền tảng
```bash
docker compose up -d
```
*(Bao gồm: PostgreSQL 16 + PostGIS tại cổng `5432`, Redis 7 tại cổng `6379`, MinIO S3 tại cổng `9000/9001`)*

### Bước 3: Khởi chạy môi trường phát triển (Development)
```bash
# Chạy đồng thời cả Backend API và Frontend Web
pnpm dev

# Hoặc chạy riêng lẻ từng dịch vụ:
pnpm dev:api    # Chạy NestJS API tại http://localhost:4000
pnpm dev:web    # Chạy Next.js Web tại http://localhost:3000
```

### Bước 4: Kiểm tra và Build toàn bộ dự án
```bash
pnpm build
```

---

## 6. Các Điểm Cuối Dịch Vụ (Service Endpoints)

- **Frontend Portal**: `http://localhost:3000`
- **Bản đồ số GIS VN-2000**: `http://localhost:3000/map`
- **Cổng Khóa giao dịch Công chứng**: `http://localhost:3000/locks`
- **Backend API Gateway**: `http://localhost:4000/api/v1`
- **Swagger OpenAPI Documentation**: `http://localhost:4000/api/docs`
