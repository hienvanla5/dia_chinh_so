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
  2. Triển khai code Shared -> Backend API -> Frontend Web.
  3. Bắt buộc viết Unit Test & Integration Test bao phủ 4 Tiêu chí chấp nhận (ACs).
  4. Chạy kiểm thử tự động, tự sửa lỗi trong vòng lặp kín cho đến khi 100% test case PASS.
  5. Cập nhật trạng thái story và tài liệu API tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md).
  6. Kiểm tra `pnpm build` toàn bộ Monorepo.
  7. Commit từng phần theo chuẩn Conventional Commits và push lên GitHub.

---

## 2. Tài Liệu Tham Chiếu & Cấu Trúc Hỗ Trợ

- **Quy tắc vĩnh viễn của Agent**: [`AGENTS.md`](file:///E:/personal_project/DIACHINHSO/AGENTS.md)
- **Tài liệu API Endpoints**: [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md)
- **Danh mục 114 User Stories**: [`user_stories/README.md`](file:///E:/personal_project/DIACHINHSO/user_stories/README.md)
- **File gốc Backlog**: [`Địa Chính Số.xlsx`](file:///E:/personal_project/DIACHINHSO/Địa%20Chính%20Số.xlsx)
