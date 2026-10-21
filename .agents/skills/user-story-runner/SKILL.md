---
name: user-story-runner
description: >-
  Automated Story-Driven Workflow executor for Dia Chinh So project using GitHub Flow.
  Activates whenever the user specifies a User Story ID (e.g. 'DCS-01-CN-001') or a story title.
  Creates a feature branch from main, implements code, writes unit & integration tests,
  executes tests, verifies build, commits atomically, merges directly into main, and pushes to git remote.
---

# User Story Runner - Automated Implementation & Verification Runbook (GitHub Flow)

This skill defines the exact automated procedure to execute when the user mentions, inputs, or requests the implementation of a User Story from the **Địa Chính Số** backlog (located in `user_stories/`).

---

## Trigger Conditions
Activate this skill whenever:
- The user provides a story ID, e.g. `DCS-01-CN-001`, `DCS-03-CN-001`, `DCS-04-CN-005`.
- The user provides a story title, e.g. "Đăng nhập Cổng Định danh Số", "Tạo mã QR Sổ Đỏ Số", "Khóa giao dịch công chứng".
- The user uses syntax like `/story DCS-XX-YY-ZZZ` or says "Triển khai story...".

---

## Step-by-Step Execution Runbook (GitHub Flow)

### Step 1 (GitHub Flow): Create Feature Branch from `main`
Before making any changes, ensure `main` is clean and updated, then create and switch to a dedicated feature branch:
```bash
git checkout main
git pull origin main
git checkout -b feature/<STORY_ID>-<ten-tinh-nang>
```
*Example*: `git checkout -b feature/DCS-01-CN-001-citizen-idp-login`

---

### Step 2: Identify & Read Story Specification
1. Search `user_stories/` for the requested Story ID or title.
2. Open and view `user_stories/<STORY_ID>.md`.
3. Extract and parse:
   - **Persona & Goal**: Who is the user and what do they want to achieve?
   - **Acceptance Criteria (ACs)**: All 4 testable scenarios (Given - When - Then).
   - **Tasks**: The 5 subtasks defined for this story.
   - **Business Rules**: All linked `QTD-xx` rules.
   - **Dependencies**: Any preceding stories that must be in place.

---

### Step 3: Implementation on Feature Branch (Shared -> API -> Web)
Implement code adhering strictly to the architecture:

1. **`packages/shared`** (if new types, schemas, or constants are required):
   - Add enums/interfaces in `src/types/index.ts`.
   - Add Zod validation schemas in `src/schemas/index.ts`.
   - Add constants in `src/constants/index.ts`.
   - Compile shared package: `pnpm --filter @diachinhso/shared build`.

2. **`apps/api`** (Backend Implementation):
   - Update database schema in `src/database/schema.ts` if needed.
   - Implement business logic in the corresponding service (`src/modules/<module>/<module>.service.ts`).
   - Expose REST endpoints in controller (`src/modules/<module>/<module>.controller.ts`) with Swagger decorators.
   - Apply guards (`JwtAuthGuard`, `RolesGuard`) based on the Persona role.

3. **`apps/web`** (Frontend Implementation - Tuân thủ nghiêm ngặt Design System):
   - **Tái sử dụng 100% component dùng chung**: Bắt buộc import từ `@/components/ui/` (`Button`, `ButtonCreate`, `ButtonEdit`, `ButtonDelete`, `ButtonView`, `ButtonSearch`, `Input`, `SearchInput`, `Select`, `Badge`, `StatusBadge`, `Card`, `EmptyState`, `Modal`) và `@/components/layout/` (`Navbar`, `Sidebar`, `NavItem`, `PageHeader`, `MainLayout`).
   - **Khắc phục 6 cạm bẫy thiết kế của AI**:
     1. *Thấu cảm Persona*: Giao diện phân rõ đối tượng phục vụ (Cán bộ địa chính cần mật độ dữ liệu cao; Người dân cần trực quan, dễ thao tác).
     2. *Bản sắc Thương hiệu Quốc gia*: Màu sắc chủ đạo Đỏ Quốc kỳ (`vnred-500`), Vàng sao (`gold-500`), Xanh công vụ (`primary-900`), Xanh pháp lý (`emerald-600`).
     3. *Logic Nghiệp vụ & Kỹ thuật*: Mọi nút bấm tương tác phải có `isLoading`, `disabled`, `aria-busy`. Mọi trạng thái pháp lý phải dùng `ParcelStatusBadge` hoặc `DossierStatusBadge`.
     4. *Bản quyền & Chuẩn hóa Icon*: 100% icon sử dụng từ `lucide-react`.
     5. *Nhất quán Design System*: Cấm tự tiện viết `<button>` hoặc `<input>` trần với class CSS tự chế ngoài hệ thống.
     6. *Chi tiết & Empty States*: Mọi bảng danh sách rỗng phải có `EmptyState` hoặc `SearchEmptyState` kèm nút kêu gọi hành động (CTA). UX copy bằng tiếng Việt chuẩn mực hành chính theo Luật Đất đai 2024.
   - **Quy chuẩn Font chữ & Typography (Sans-Serif)**:
     - Font chính (Body): **Roboto** (Google Font, cân đối, sắc nét trên mọi thiết bị). Fallback: `Open Sans`, `Helvetica / Arial`.
     - Font tiêu đề (Headings): **Montserrat** (mạnh mẽ, dứt khoát, hiện đại). Fallback: `Poppins`.
     - Độ tương phản chữ cao: Dùng `text-slate-950`, `text-slate-900`, `text-slate-800`. Cấm dùng chữ màu xám mờ khó đọc.
     - Tăng kích thước các thông số trọng yếu: Mã thửa đất 15 ký tự, số CCCD, mã OTP, số lượng thống kê phải có kích thước lớn, font đậm (`font-extrabold`).
   - **Loại bỏ Status Thừa, Ngôn Từ Sáo Rỗng & Icon/Badge Cạnh Tiêu Đề**:
     - Cấm các pill/status kỹ thuật rườm rà trên Navbar (ví dụ: cấm pill `VN-2000 PostGIS | Khóa 90p`).
     - Cấm các khẩu hiệu PR/marketing sáo rỗng (như "Giải quyết triệt để vấn nạn..."). Văn phong phải cô đọng, súc tích, mang tính chỉ dẫn công vụ chuẩn xác.
     - **Tuyệt đối cấm gắn icon, badge hoặc pill trạng thái gần các tiêu đề** (`h1`, `h2`, `h3`, card titles, ví dụ: cấm gắn badge `Luật Đất đai 2024`, `QTD-07 Hợp lệ`, `Đề án 06`, biểu tượng ngôi sao, checkmark, sparkles ngay cạnh tiêu đề). Tiêu đề phải thanh thoát, trang trọng, tập trung vào nội dung chính. Giao diện chưa cần quá phức tạp.
   - **Tập Trung Tuyệt Đối Vào User Story Đang Thực Hiện (Zero Overengineering & No Scope Creep)**:
     - Khi thực hiện một User Story, chỉ tạo và hoàn thiện đúng các backend API và frontend (route, màn hình, form, trang kết quả) phục vụ trực tiếp cho User Story đó.
     - *Ví dụ*: User Story đăng nhập `DCS-01-CN-001` chỉ hoàn thiện backend auth/audit và frontend route `/login` (màn hình nhập CCCD/OTP và màn hình định danh thành công), không sinh các route khác khi chưa làm.
     - **TUYỆT ĐỐI CẤM** tạo trước các route, trang mockup (placeholder/stub pages như `/map`, `/parcels`, `/locks`, `/dossiers`, `/certificates`) hoặc dựng sẵn menu, link ảo khi các Story đó chưa được giao thực hiện.
     - Không dàn trải nội dung, không vẽ trước tính năng tương lai. Toàn bộ mã nguồn phải phản ánh chân thực tiến độ thực tế của các Story đã hoàn thành.
   - Kết nối API Backend, kiểm soát trạng thái dữ liệu (Loading, Success, Error).

---

### Step 4: Write Unit & Integration Tests (BẮT BUỘC)
Write test suites specifically testing the 4 Acceptance Criteria of the story:
1. **Unit Tests**:
   - Location: `apps/api/src/modules/<module>/<module>.service.spec.ts`.
   - Test success scenarios (AC-01), validation/invalid data (AC-02), and business rule constraints (AC-03).
2. **Integration / E2E Tests**:
   - Location: `apps/api/src/modules/<module>/<module>.controller.spec.ts` or `test/`.
   - Test controller endpoints, HTTP status codes, and authorization guards.

---

### Step 5: Execute Tests & Self-Correction Loop
Run the test runner and enforce the zero-failure gate:
```bash
pnpm --filter @diachinhso/api test
```

- **If tests PASS (Green)**: Proceed to Step 6.
- **If tests FAIL (Red)**:
  1. Inspect the stack trace and failure output.
  2. Diagnose whether the issue is in the business logic or test assertions.
  3. Edit code to fix the issue.
  4. Re-run `pnpm --filter @diachinhso/api test`.
  5. Repeat until 100% of test suites and test cases pass.
  6. **NEVER** skip tests or proceed with failing tests.

---

### Step 6: Write API Documentation (`docs/`) & Update Story Status
1. **Mandatory API Documentation**:
   - Open [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md).
   - If the story creates or modifies any backend API endpoint, you **MUST** document it clearly under the corresponding module section:
     - Tag with User Story ID: `### [<STORY_ID>] <Endpoint Name>`
     - HTTP Method and Route path (`/api/v1/...`)
     - Role requirements / Permissions
     - Sample JSON Request Body / Query Parameters with data types
     - Sample `200/201` Response payload
     - Standard error status codes (`400`, `401`, `403`, `404`, `409`)
2. **Update Story Markdown**:
   - Open `user_stories/<STORY_ID>.md`:
     - Mark all completed tasks as done: change `- [ ]` to `- [x]`.
     - Update metadata: change `- **Trạng thái**: Chưa thực hiện` to `- **Trạng thái**: Hoàn thành`.

---

### Step 7: Verify Monorepo Build
Run the full monorepo build to verify zero compile or type errors:
```bash
pnpm build
```
Confirm `@diachinhso/shared`, `@diachinhso/api`, and `@diachinhso/web` all build cleanly.

---

### Step 8 (GitHub Flow): Commit on Feature Branch, Merge into `main` & Push
1. **Commit changes in small, logical increments on the feature branch**:
   ```bash
   git add packages/shared/ ; git commit -m "feat(shared): add types and schemas for <STORY_ID>"
   git add apps/api/ ; git commit -m "feat(api): implement business logic for <STORY_ID>"
   git add apps/api/src/**/*.spec.ts ; git commit -m "test(api): unit and integration tests for <STORY_ID>"
   git add apps/web/ ; git commit -m "feat(web): add UI interface for <STORY_ID>"
   git add docs/ ; git commit -m "docs(api): document endpoints for <STORY_ID>"
   git add user_stories/ ; git commit -m "docs(story): mark <STORY_ID> as completed"
   ```

2. **Merge directly into `main` branch**:
   ```bash
   git checkout main
   git merge feature/<STORY_ID>-<ten-tinh-nang>
   ```

3. **Push to remote repository**:
   ```bash
   git push origin main
   ```

4. **Clean up local feature branch**:
   ```bash
   git branch -d feature/<STORY_ID>-<ten-tinh-nang>
   ```

---

### Step 9: User Summary
Respond to the user with:
- Story implemented (ID & Title).
- Key files created/modified with clickable `file://` links.
- Test execution output showing 100% passed test cases.
- Commit hash and push confirmation on `main`.
- Confirmation that the feature branch was merged directly into `main`.
