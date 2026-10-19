# dia_chinh_so

## ĐỊA CHÍNH SỐ (Sổ Đỏ Số & Cơ Sở Dữ Liệu Thửa Đất Thời Gian Thực)

Nền tảng quản lý thông tin địa chính, vòng đời thửa đất và biến động quyền sử dụng đất minh bạch, tích hợp bản đồ số GIS chuẩn hệ quy chiếu quốc gia VN-2000 và mã định danh thửa đất quốc gia.

### Căn cứ pháp lý & kỹ thuật
- **Luật Đất đai số 31/2024/QH15** (hiệu lực từ 01/08/2024).
- **Đề án 06/QĐ-TTg** của Thủ tướng Chính phủ về chuyển đổi số quốc gia.
- **Nghị định số 101/2024/NĐ-CP** về điều tra cơ bản, đăng ký, cấp Giấy chứng nhận và Hệ thống thông tin đất đai.
- **Nghị định số 102/2024/NĐ-CP** quy định chi tiết thi hành một số điều của Luật Đất đai.

### Công nghệ cốt lõi (Tech Stack)
- **Frontend**: Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS, Shadcn UI, MapLibre GL JS (VN-2000 GIS Engine).
- **Backend**: NestJS (TypeScript), PostGIS spatial engine, Redis Distributed Lock 90 min (Redlock), Digital Signing PAdES & Dynamic QR code.
- **Database & Storage**: PostgreSQL 16 + PostGIS 3.4, Redis 7, MinIO S3 Object Storage.
- **Architecture**: Monorepo (`pnpm workspaces`) phân tách `apps/web`, `apps/api`, `packages/shared`.
