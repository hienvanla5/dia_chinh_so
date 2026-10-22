# BẢNG THEO DÕI TIẾN TRÌNH PRODUCT BACKLOG (BACKLOG PROGRESS TRACKER)

> Tài liệu nguồn sự thật ghi nhận toàn bộ tiến trình thực thi 114 User Stories thuộc dự án **Địa Chính Số (Sổ Đỏ Số & CSDL Thửa Đất Thời Gian Thực)**.
> Được tham chiếu trực tiếp tại [AGENTS.md](file:///E:/personal_project/DIACHINHSO/AGENTS.md) và [.agents/skills/user-story-runner/SKILL.md](file:///E:/personal_project/DIACHINHSO/.agents/skills/user-story-runner/SKILL.md).

---

## 1. Tổng Quan Tiến Độ Dự Án (Overall Progress Metrics)

| Chỉ số | Số lượng | Tỷ lệ (%) | Ghi chú |
|---|---|---|---|
| **Tổng số User Stories** | **114** | **100%** | Toàn bộ 114 User Stories được số hóa tại `user_stories/` |
| **Đã hoàn thành (Done)** | **5** | **4.4%** | Đã hoàn thành cả Shared, API, Web, Unit/Integration Tests & Docs |
| **Đang thực hiện (In Progress)** | **0** | **0.0%** | Không có Story nào đang dở dang |
| **Chưa thực hiện (Backlog)** | **109** | **95.6%** | Sẵn sàng triển khai theo thứ tự ưu tiên |

- **User Story hoàn thành gần nhất**: [`DCS-01-CN-005`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-005.md) - Quản lý phiên làm việc và bảo mật xác thực 2FA.
- **User Story đề xuất tiếp theo (Next Immediate Story)**: [`DCS-01-CN-006`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-006.md) - Khóa và vô hiệu hóa tài khoản công vụ khi điều chuyển công tác.

---

## 2. Danh Sách User Stories Đã Hoàn Thành (Completed Stories Audit Trail)

| Mã Story | Tên User Story | Ngày hoàn thành | Nhánh / Commit chính | API Endpoints | Route Web | Tests | Trạng thái |
|---|---|---|---|---|---|---|---|
| [`DCS-01-CN-001`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-001.md) | Đăng nhập Cổng Định danh Số công dân qua CCCD và OTP SMS | 2026-10-19 | `main`<br>(`666d6b0`, `22c895f`, `e9f5b4e`, `1861544`) | `POST /api/v1/auth/citizen/send-otp`<br>`POST /api/v1/auth/citizen/verify-otp` | `/login`<br>(Tab Công dân) | 13 tests PASS | **Hoàn thành** |
| [`DCS-01-CN-002`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-002.md) | Đăng nhập SSO tài khoản công vụ cho cán bộ ngành | 2026-10-21 | `main`<br>(`7bbcaba`, `e3024de`, `f623330`, `76a44f8`) | `POST /api/v1/auth/officer/login`<br>`POST /api/v1/auth/officer/verify-mfa` | `/login`<br>(Tab Cán bộ công vụ) | 9 tests PASS | **Hoàn thành** |
| [`DCS-01-CN-003`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-003.md) | Phân quyền truy cập dữ liệu địa chính theo cấp hành chính (2 cấp: Tỉnh & Xã, 34 tỉnh thành) | 2026-10-21<br>*(Cập nhật 2 cấp: 2026-10-22)* | `main`<br>(`d9a5c1f`, `a4cccf3`, `65dc1ef`, `883f27d`, `da0cb46`, `655e4a0`, `b19c191`) | `GET /api/v1/jurisdiction/provinces`<br>`GET /api/v1/jurisdiction/communes`<br>`POST /api/v1/jurisdiction/verify-access`<br>`GET /api/v1/jurisdiction/officers/:id` | `/jurisdiction` | 14 tests PASS | **Hoàn thành** |
| [`DCS-01-CN-004`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-004.md) | Tích hợp chứng thư số chuyên dùng công vụ và SmartCA | 2026-10-22 | `main`<br>(feature `DCS-01-CN-004`) | `GET /api/v1/digital-signature/certificates`<br>`GET /api/v1/digital-signature/ocsp-check/:serialNumber`<br>`GET /api/v1/digital-signature/pending-dossiers`<br>`POST /api/v1/digital-signature/sign-approval`<br>`POST /api/v1/digital-signature/verify` | `/digital-signature` | 17 tests PASS | **Hoàn thành** |
| [`DCS-01-CN-005`](file:///E:/personal_project/DIACHINHSO/user_stories/DCS-01-CN-005.md) | Quản lý phiên làm việc và bảo mật xác thực 2FA | 2026-10-22 | `main`<br>(feature `DCS-01-CN-005`) | `POST /api/v1/session-security/step-up/challenge`<br>`POST /api/v1/session-security/step-up/verify`<br>`POST /api/v1/session-security/unlock`<br>`POST /api/v1/session-security/terminate`<br>`POST /api/v1/session-security/heartbeat`<br>`GET /api/v1/session-security/active`<br>`GET /api/v1/session-security/alerts` | `/session-security` | 16 tests PASS | **Hoàn thành** |

---

## 3. Chi Tiết Đóng Gói Từng User Story Đã Xong

### 3.1. [DCS-01-CN-001] Đăng nhập Cổng Định danh Số công dân qua CCCD và OTP SMS
- **Persona**: Người sử dụng đất (Công dân)
- **Kiến trúc triển khai**:
  - `packages/shared`: Khai báo schemas `SendOtpSchema`, `VerifyOtpSchema`, `CitizenAuthResponse`.
  - `apps/api`: Service `CitizenAuthService` tích hợp Mock Sandbox Citizen IdP, gửi mã OTP 6 số (hạn 5 phút, tối đa 5 lần thử), tạo JWT Bearer Token kèm mã băm SHA-256 Audit Trail.
  - `apps/web`: Route `/login` với tab "Công dân", nhập CCCD 12 số, nhập OTP 6 số, hiển thị màn hình định danh và Ví số giấy tờ đất đai.
  - `tests`: 13 test cases bao phủ đầy đủ 4 Tiêu chí chấp nhận (TC-01, TC-02, TC-03, TC-04).
- **Tài liệu API**: Đã ghi nhận tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md#dcs-01-cn-001-gui-ma-otp-xac-thuc-cong-dan).

### 3.2. [DCS-01-CN-002] Đăng nhập SSO tài khoản công vụ cho cán bộ ngành
- **Persona**: Cán bộ Địa chính xã/phường, Văn phòng Đăng ký Đất đai, Sở TN&MT, Thanh tra Bộ, Quản trị viên
- **Kiến trúc triển khai**:
  - `packages/shared`: Khai báo schemas `OfficerLoginSchema`, `OfficerMfaSchema`, vai trò công vụ và thẩm quyền đơn vị hành chính.
  - `apps/api`: Service `OfficerAuthService` tích hợp SSO công vụ, xác thực tài khoản công chức, kiểm tra trạng thái hoạt động (QTD-22), kiểm tra MFA TOTP 6 số, giới hạn 3 lần thử, gắn mã băm SHA-256 kiểm toán.
  - `apps/web`: Route `/login` với tab "Cán bộ công vụ", nhập email công vụ/tên đăng nhập, mật khẩu, và mã xác thực MFA 2 bước, hiển thị thẻ thông tin công vụ và quyền hạn phân công.
  - `tests`: 9 test cases bao phủ 4 Tiêu chí chấp nhận (TC-01, TC-02, TC-03, TC-04).
  - UI Writing: 100% ẩn các ID nội bộ kỹ thuật (`VT-xx`, `QTD-xx`, `AC-xx`).
- **Tài liệu API**: Đã ghi nhận tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md#dcs-01-cn-002-dang-nhap-can-bo-cong-vu-sso).

### 3.3. [DCS-01-CN-003] Phân quyền truy cập dữ liệu địa chính theo cấp hành chính
- **Persona**: Cán bộ các cấp quản lý hành chính
- **Kiến trúc triển khai**:
  - **Mô hình chính quyền 2 cấp**: Cấp Tỉnh/TP trực thuộc Trung ương và Cấp Xã/Phường/Thị trấn trực thuộc (bỏ hoàn toàn cấp Quận/Huyện theo chỉ đạo mới).
  - **Dữ liệu 34 tỉnh thành**: 23 tỉnh sáp nhập mới (Tuyên Quang, Lào Cai, Thái Nguyên, Phú Thọ, Bắc Ninh, Hưng Yên, TP. Hải Phòng, Ninh Bình, Quảng Trị, TP. Đà Nẵng, Quảng Ngãi, Gia Lai, Khánh Hòa, Lâm Đồng, Đắk Lắk, TP. Hồ Chí Minh, TP. Đồng Nai, Tây Ninh, TP. Cần Thơ, Vĩnh Long, Đồng Tháp, Cà Mau, An Giang) và 11 tỉnh thành giữ nguyên (Hà Nội, Huế, Lai Châu, Điện Biên, Sơn La, Lạng Sơn, Quảng Ninh, Thanh Hóa, Nghệ An, Hà Tĩnh, Cao Bằng).
  - `packages/shared`: Khai báo `AdminJurisdictionLevel` (2 cấp: `PROVINCE`, `COMMUNE`), enum `VietnamProvinceCode` (34 tỉnh thành), danh sách xã trực thuộc.
  - `apps/api`: Service `JurisdictionService` xác thực truy cập địa giới (QTD-16), chặn truy cập vượt cấp, trả về ma trận thẩm quyền phân cấp, lưu vết kiểm toán SHA-256.
  - `apps/web`: Route `/jurisdiction` tra cứu danh mục 34 tỉnh thành, danh mục xã phường, ma trận phân quyền 2 cấp, kiểm tra thẩm quyền địa giới trực quan. Ẩn toàn bộ mã nội bộ kỹ thuật.
  - `tests`: 14 test cases bao phủ 4 Tiêu chí chấp nhận (TC-01, TC-02, TC-03, TC-04).
- **Tài liệu API**: Đã ghi nhận tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md#dcs-01-cn-003-tra-cuu-danh-sach-tinh-thanh-pho-2-cap-hanh-chinh).

### 3.4. [DCS-01-CN-004] Tích hợp chứng thư số chuyên dùng công vụ và SmartCA
- **Persona**: Văn phòng Đăng ký Đất đai (`LAND_REGISTRAR`)
- **Kiến trúc triển khai**:
  - `packages/shared`:
    - Enums `DigitalSignatureProvider` (Ban Cơ yếu Chính phủ, VNPT SmartCA, Viettel-CA, FPT SmartCA, USB Token PKCS#11), `SignatureStandard` (PADES, CADES, XADES), `OcspCertificateStatus` (VALID, REVOKED, EXPIRED).
    - Interfaces `PublicOfficerCertificate`, `SignDossierApprovalRequest`, `SignDossierApprovalResponse`, `VerifyDigitalSignatureRequest`, `PendingDossierForSigning`.
    - Zod schemas `SignDossierApprovalSchema`, `VerifyDigitalSignatureSchema`.
  - `apps/api`:
    - Service `DigitalSignatureService` cung cấp kiểm tra trực tuyến trạng thái thu hồi chứng thư số qua giao thức OCSP (QTD-28), kiểm soát thẩm quyền ký duyệt của Lãnh đạo Văn phòng ĐKĐĐ (QTD-05), chặn ký duyệt hồ sơ khi thửa đất đang bị khóa hoặc có tranh chấp ranh giới, sinh chữ ký số PAdES kèm dấu thời gian TSA RFC 3161 và lưu nhật ký kiểm toán bất biến SHA-256.
    - Controller `DigitalSignatureController` cung cấp 5 REST endpoints chuẩn hóa.
    - Module `DigitalSignatureModule` tích hợp vào `AppModule`.
  - `apps/web`:
    - Route `/digital-signature` với giao diện chuyên biệt cho Văn phòng ĐKĐĐ: Tra cứu & lọc hồ sơ địa chính chờ ký duyệt, modal ký số chuyên dùng công vụ kèm live OCSP status indicator, nhập mã PIN, mô phỏng 4 bước ký số trực tuyến, và modal hiển thị con dấu số điện tử trang trọng kèm chức năng xác minh chữ ký số trực tuyến.
    - Đảm bảo 100% ẩn các ID nội bộ kỹ thuật (`VT-xx`, `QTD-xx`, `DCS-xx`, `AC-xx`).
  - `tests`: 17 test cases bao phủ đầy đủ 4 Tiêu chí chấp nhận (TC-01, TC-02, TC-03, TC-04).
- **Tài liệu API**: Đã ghi nhận tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md#9-nhom-api-ky-so-chuyen-dung-cong-vu--smartca-digital-signature--smartca).

### 3.5. [DCS-01-CN-005] Quản lý phiên làm việc và bảo mật xác thực 2FA
- **Persona**: Quản trị viên Hệ thống (`ADMIN`) / Cán bộ công vụ
- **Kiến trúc triển khai**:
  - `packages/shared`:
    - Enums `SessionStatus` (ACTIVE, LOCKED_INACTIVITY, SUSPENDED_SECURITY, TERMINATED), `SensitiveOperationType` (APPROVE_CERTIFICATE, ALTER_PARCEL_BOUNDARY, BULK_DATA_EXPORT, REVOKE_DOCUMENT).
    - Interfaces `UserSession`, `StepUp2FaChallengeRequest/Response`, `VerifyStepUp2FaRequest/Response`, `UnlockSessionRequest/Response`, `TerminateSessionRequest/Response`, `SecurityViolationAlert`.
    - Zod schemas `StepUp2FaChallengeSchema`, `VerifyStepUp2FaSchema`, `UnlockSessionSchema`, `TerminateSessionSchema`.
  - `apps/api`:
    - Service `SessionSecurityService`:
      - Quản lý phiên công vụ, tự động khóa sau 15 phút (900s) không tương tác (inactivity timeout).
      - Mở khóa phiên làm việc bằng PIN hoặc 2FA, đếm số lần sai; mở khóa thành công gia hạn phiên làm việc thêm 15 phút.
      - Thử thách bảo mật 2 lớp (Step-Up 2FA Challenge) khi thao tác nhạy cảm (duyệt cấp GCN, thay đổi ranh giới thửa đất, xuất dữ liệu hàng loạt, thu hồi hồ sơ), cấp `stepUpToken` dùng một lần có hạn 5 phút.
      - Tự động phát hiện vi phạm bảo mật theo quy tắc an toàn thông tin (QTD-22): đình chỉ phiên ngay lập tức (`SUSPENDED_SECURITY`) khi truy cập từ IP ngoài mạng công vụ hoặc nhập sai mã quá 3 lần liên tiếp.
      - Ghi vết kiểm toán bất biến kèm mã băm SHA-256 cho toàn bộ vòng đời phiên làm việc.
    - Controller `SessionSecurityController` cung cấp 7 REST endpoints chuẩn hóa.
    - Module `SessionSecurityModule` tích hợp vào `AppModule`.
  - `apps/web`:
    - Route `/session-security` hiển thị bảng điều khiển bảo mật phiên làm việc: giám sát phiên công vụ đang hoạt động, bộ đếm ngược tự động khóa 15 phút, thao tác kiểm tra cơ chế mở khóa phiên (Unlock Modal), chạy giả lập thử thách Step-Up 2FA cho thao tác nhạy cảm, và bảng ghi nhật ký cảnh báo an ninh thời gian thực.
    - Đảm bảo 100% ẩn các ID nội bộ kỹ thuật (`VT-xx`, `QTD-xx`, `DCS-xx`, `AC-xx`).
  - `tests`: 16 test cases bao phủ đầy đủ 4 Tiêu chí chấp nhận (TC-01, TC-02, TC-03, TC-04).
- **Tài liệu API**: Đã ghi nhận tại [`docs/api-endpoints.md`](file:///E:/personal_project/DIACHINHSO/docs/api-endpoints.md#10-nhom-api-quan-ly-phien-lam-viec-va-bao-mat-xac-thuc-2fa-session-security--2fa).

---

## 4. Cơ Chế Kiểm Soát Tiến Trình Dành Cho Agent (Gatekeeper Protocol)

Trước khi thực thi bất kỳ User Story nào, Agent **BẮT BUỘC** thực hiện quy trình tra cứu bảng tiến trình này:

```mermaid
flowchart TD
    Req["Nhận yêu cầu User Story từ Người dùng"] --> CheckTable{"Kiểm tra bảng tiến trình docs/backlog-progress.md"}
    
    CheckTable -- "ĐÃ CÓ trong bảng Đã hoàn thành" --> WarnDup["CẢNH BÁO TRÙNG LẶP (Duplicate Warning):<br>1. Thông báo Story này đã xong ngày nào, commit nào, test nào<br>2. Dừng thực thi ghi đè<br>3. Hỏi người dùng muốn chỉnh sửa chi tiết nào"]
    
    CheckTable -- "CHƯA LÀM nhưng cách quá xa tiến trình hiện tại (Nhảy cóc)" --> WarnGap["CẢNH BÁO NHẢY CÓC (Sequence Gap Warning):<br>1. Chỉ rõ Story xong gần nhất (Anchor: DCS-01-CN-005)<br>2. Liệt kê các Story nối tiếp bị bỏ qua (DCS-01-CN-006, ...)<br>3. Cảnh báo rủi ro đứt gãy phụ thuộc dữ liệu<br>4. Đề xuất làm tuần tự Story tiếp theo hoặc chờ xác nhận"]
    
    CheckTable -- "ĐÚNG TIẾN TRÌNH TUẦN TỰ (ví dụ: DCS-01-CN-006)" --> RunStory["Thực hiện GitHub Flow theo AGENTS.md & SKILL.md"]
    WarnGap -- "Người dùng vẫn xác nhận làm tiếp" --> RunStory
    
    RunStory --> Done["Kiểm thử PASS, Build PASS, Merge main, Push origin"]
    Done --> UpdateLog["BẮT BUỘC: Cập nhật docs/backlog-progress.md<br>(tăng bộ đếm, cập nhật Anchor và bảng Audit Trail)"]
```

### 4.1. Quy tắc 1: Cảnh báo Trùng lặp (Duplicate Detection)
- **Điều kiện kích hoạt**: Khi User Story yêu cầu đã có mặt trong **Mục 2: Danh Sách User Stories Đã Hoàn Thành**.
- **Hành động của Agent**:
  - **TUYỆT ĐỐI KHÔNG** tự ý code lại từ đầu hoặc chạy lại flow làm đè hỏng mã nguồn đã có.
  - Lập tức gửi cảnh báo đến người dùng:
    > "User Story `[MÃ_STORY]` đã được hoàn thành trước đó vào ngày `[NGÀY]`, commit `[COMMIT_ID]`, với `[X]` test cases đã PASS và giao diện tại `[ROUTE]`. Nếu bạn muốn cập nhật logic hoặc bổ sung chức năng mới cho Story này, vui lòng nêu rõ yêu cầu cụ thể thay vì chạy lại từ đầu."

### 4.2. Quy tắc 2: Cảnh báo Nhảy cóc / Bỏ qua công việc nối tiếp (Sequence Gap Detection)
- **Điều kiện kích hoạt**: Khi User Story được yêu cầu không phải là story kế tiếp nối dài luồng nghiệp vụ hiện tại (ví dụ: đang ở `DCS-01-CN-004` nhưng người dùng yêu cầu làm `DCS-03-CN-001` hoặc `DCS-05-CN-001`, nhảy qua `DCS-01-CN-005`...).
- **Hành động của Agent**:
  - Không tự tiện thực thi ngay lập tức mà gửi cảnh báo phân tích cấu trúc:
    > "⚠️ **Cảnh báo tiến trình Product Backlog**:
    > - Tiến trình hiện tại vừa hoàn thành: `[MÃ_STORY_GẦN_NHẤT]` (`DCS-01-CN-005`).
    > - User Story tiếp theo liền kề theo thiết kế hệ thống là: `[MÃ_STORY_TIẾP_THEO]` (`DCS-01-CN-006`: Khóa và vô hiệu hóa tài khoản công vụ khi điều chuyển công tác).
    > - Yêu cầu hiện tại của bạn là `[MÃ_STORY_YÊU_CẦU]` - đang bỏ qua các bước tiền đề liền trước: `[DANH_SÁCH_STORIES_BỊ_BỎ_QUA]`.
    > - **Rủi ro kiến trúc**: `[Giải thích rõ lý do phân quyền / luồng dữ liệu...]`.
    > 
    > **Đề xuất**: Bạn có muốn thực hiện tuần tự `[MÃ_STORY_TIẾP_THEO]` trước để đảm bảo tính toàn vẹn hệ thống, hay bạn vẫn muốn ưu tiên thực hiện trước `[MÃ_STORY_YÊU_CẦU]`?"
  - Chỉ khi người dùng xác nhận rõ ràng muốn làm câu chuyện đó trước, Agent mới bắt đầu triển khai.

### 4.3. Quy tắc 3: Cập nhật Tiến trình Sau Khi Hoàn Thành (Mandatory Post-Execution Logging)
- **Điều kiện kích hoạt**: Mỗi khi một User Story vượt qua toàn bộ tiêu chí (Step 5 pass tests, Step 7 pass build, Step 8 merge main và push remote).
- **Hành động của Agent**:
  - Mở file [`docs/backlog-progress.md`](file:///E:/personal_project/DIACHINHSO/docs/backlog-progress.md).
  - Tăng số lượng `Đã hoàn thành` thêm 1, giảm `Chưa thực hiện` đi 1, tính lại tỷ lệ `%`.
  - Cập nhật dòng `User Story hoàn thành gần nhất` và `User Story đề xuất tiếp theo`.
  - Thêm một hàng mới vào **Mục 2: Danh Sách User Stories Đã Hoàn Thành** và bổ sung chi tiết vào **Mục 3**.
  - Thực hiện commit tài liệu này cùng với mã nguồn story.
