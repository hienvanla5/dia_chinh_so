# DANH MỤC KỸ NĂNG TỰ ĐỘNG HÓA (SKILLS.md)

> Hệ thống kỹ năng tự động hóa (Agent Skills) dành cho dự án **Địa Chính Số**, tích hợp với hệ thống Antigravity Customizations.

---

## 1. Kỹ Năng Đang Hoạt Động (Active Skills)

### `user-story-runner`
- **Đường dẫn**: [`.agents/skills/user-story-runner/SKILL.md`](file:///E:/personal_project/DIACHINHSO/.agents/skills/user-story-runner/SKILL.md)
- **Mục đích**: Tự động hóa trọn gói quá trình thực thi bất kỳ User Story nào từ tên hoặc mã Story.
- **Cách kích hoạt**:
  - Gửi mã Story, ví dụ: `DCS-01-CN-001`, `DCS-04-CN-002`, `DCS-02-CN-003`.
  - Gửi tên Story, ví dụ: `"Đăng nhập Cổng Định danh Số"`, `"Tạo mã QR bảo mật động"`.
  - Gửi lệnh: `/story <Mã Story>` hoặc `Triển khai story <Tên Story>`.
- **Quy trình thực thi**:
  1. Đọc đặc tả tại [`user_stories/<STORY_ID>.md`](file:///E:/personal_project/DIACHINHSO/user_stories/).
  2. Triển khai code Shared -> Backend API -> Frontend Web (Tuân thủ nghiêm ngặt Design System tại Bước 2).
  3. Bắt buộc viết Unit Test & Integration Test bao phủ 4 Tiêu chí chấp nhận (ACs).
  4. Chạy kiểm thử tự động, tự sửa lỗi trong vòng lặp kín cho đến khi 100% test case PASS.
  5. **Bắt buộc viết tài liệu API Endpoints** chi tiết vào [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md) (Request, Response, Roles, Error Codes) và cập nhật trạng thái story trong [`user_stories/<STORY_ID>.md`](file:///E:/personal_project/DIACHINHSO/user_stories/).
  6. Kiểm tra `pnpm build` toàn bộ Monorepo.
  7. Commit từng phần theo chuẩn Conventional Commits và push lên GitHub.

---

## 2. Ràng Buộc Kỹ Thuật UI/UX & Design System (Chống 6 Cạm Bẫy của AI)

Khi Agent phát triển bất kỳ giao diện Frontend nào trong `apps/web/`, **BẮT BUỘC** phải tuân thủ 6 nguyên tắc khắc phục cạm bẫy thiết kế thường gặp của AI:

| Vấn đề của AI khi tạo UI | Hậu quả thực tế | Ràng buộc kỹ thuật BẮT BUỘC dành cho Agent |
| :--- | :--- | :--- |
| **1. Thiếu thấu cảm & UX context** | Giao diện rối rắm, không phù hợp tâm lý người dân hay cán bộ hành chính | Phải thiết kế theo đúng Persona của Story: Cán bộ địa chính (mật độ thông tin cao, thao tác nhanh), Người dân (trực quan, dễ hiểu, font chữ rõ ràng, hướng dẫn cụ thể). |
| **2. Giao diện rập khuôn, mất bản sắc** | Nhìn giống template SaaS nước ngoài vô hồn | Phải bám sát bộ nhận diện Quốc gia: Cờ đỏ sao vàng (`vnred-500`, `gold-500`), Xanh công vụ (`primary-900`), Xanh pháp lý (`emerald-600`), chuẩn mực hành chính Việt Nam. |
| **3. Xa rời logic kinh doanh & kỹ thuật** | Nút bấm không có loading, form không có validation, không ánh xạ API | Mọi tương tác gọi API phải có cờ `isLoading`, `disabled`, `aria-busy`, mapping chính xác enum backend (`ParcelLegalStatus`, `DossierStatus`). |
| **4. Bản quyền & icon lộn xộn** | Dùng icon không đồng bộ, sinh layout lạ mắt nhưng khó bảo trì | 100% icon lấy từ thư viện chuẩn `lucide-react`. Dùng đúng kích thước (`h-4 w-4` hoặc `h-5 w-5`), không nhúng SVG ngoài chưa kiểm duyệt. |
| **5. Thiếu nhất quán Design System** | Mỗi trang một kiểu màu, kích thước nút khác nhau, padding tùy tiện | **BẮT BUỘC TÁI SỬ DỤNG 100% COMPONENT** từ `@/components/ui/` và `@/components/layout/`. Tuyệt đối không tự viết thẻ `<button>` hoặc `<input>` trần với class CSS tự chế. |
| **6. Bỏ qua chi tiết nhỏ & UX Writing** | Không có Empty State khi bảng rỗng, thông báo lỗi dịch máy ngô nghê | Bắt buộc dùng `EmptyState` / `SearchEmptyState` cho mọi danh sách rỗng kèm nút hành động. UX copy bằng tiếng Việt chuẩn hành chính công vụ theo Luật Đất đai 2024. |

### Bộ Giao Diện Dùng Chung (Design System Components)

Mọi User Story khi dựng UI **BẮT BUỘC** import từ 2 thư mục chuẩn:

1. **Bộ thành phần giao diện (`@/components/ui`)**:
   - `Button`: Nút bấm đa năng với các biến thể ngữ nghĩa:
     - `ButtonCreate` (`variant="create"`): Xanh lục pháp lý, icon Plus, phục vụ tạo mới hồ sơ/thửa đất.
     - `ButtonEdit` (`variant="edit"`): Vàng hổ phách, icon Pencil, phục vụ chỉnh sửa thông tin.
     - `ButtonDelete` (`variant="delete"`): Đỏ cảnh báo, icon Trash2, phục vụ hủy/xóa.
     - `ButtonView` (`variant="view"`): Viền xám tinh tế, icon Eye, phục vụ xem chi tiết/Sổ Đỏ Số.
     - `ButtonSearch` (`variant="search"`): Xanh công vụ, icon Search, phục vụ tra cứu.
     - Tất cả nút đều có `isLoading` (spinner `Loader2`), `disabled`, `focus-visible:ring-2`.
   - `Input`: Ô nhập liệu có `label`, `error`, `helperText`, `leadingIcon`, `trailingIcon`, `onClear`.
   - `SearchInput`: Ô tìm kiếm có debounce, phím tắt `Ctrl + K`, icon xóa từ khóa nhanh.
   - `Select`: Menu chọn lựa có icon mũi tên đồng bộ, `label`, `error`, hỗ trợ danh sách `options`.
   - `Badge` & `StatusBadge`:
     - `ParcelStatusBadge`: Tự động map trạng thái thửa đất (`AVAILABLE`, `LOCKED`, `MORTGAGED`, `DISPUTED`, `FROZEN`).
     - `DossierStatusBadge`: Tự động map trạng thái hồ sơ biến động (`SUBMITTED`, `COMMUNE_VERIFIED`, `APPRAISED`, `COMPLETED`, `REJECTED`).
     - `RoleBadge`: Tự động hiển thị vai trò 6 persona Đề án 06.
   - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: Khung chứa chuẩn hóa.
   - `EmptyState`, `SearchEmptyState`: Trạng thái trống thân thiện, có minh họa và nút kêu gọi hành động (CTA), tránh màn hình chết.
   - `Modal`: Hộp thoại tương tác nổi, nền mờ `backdrop-blur`, đóng bằng phím ESC, phân tách rõ ràng Header - Body - Footer.

2. **Bộ bố cục lớn (`@/components/layout`)**:
   - `Navbar`: Thanh điều hướng đầu trang mang bản sắc Quốc gia (Đỏ Quốc kỳ, Huy hiệu, Đề án 06, Trạng thái PostGIS/Redlock thời gian thực, Cổng định danh).
   - `Sidebar`: Thanh bên quản lý chức năng cốt lõi, tích hợp danh mục 6 vai trò Đề án 06 và thông tin tuân thủ Luật Đất đai 2024.
   - `NavItem`: Phần tử menu đồng bộ có icon, trạng thái active nổi bật, badge cảnh báo.
   - `PageHeader`: Tiêu đề trang chuẩn mực, kèm thanh điều hướng bánh mì (`breadcrumbs`), mô tả nghiệp vụ và khu vực nút thao tác (`actions`).
   - `MainLayout`: Khung bao bọc toàn diện responsive chuẩn cho máy tính và thiết bị di động.

---

## 3. Tài Liệu Tham Chiếu & Cấu Trúc Hỗ Trợ

- **Quy tắc vĩnh viễn của Agent**: [`AGENTS.md`](file:///E:/personal_project/DIACHINHSO/AGENTS.md)
- **Tài liệu API Endpoints**: [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md)
- **Danh mục 114 User Stories**: [`user_stories/README.md`](file:///E:/personal_project/DIACHINHSO/user_stories/README.md)
- **File gốc Backlog**: [`Địa Chính Số.xlsx`](file:///E:/personal_project/DIACHINHSO/Địa%20Chính%20Số.xlsx)
