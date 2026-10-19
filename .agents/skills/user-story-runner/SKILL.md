---
name: user-story-runner
description: >-
  Automated Story-Driven Workflow executor for Dia Chinh So project. Activates whenever
  the user specifies a User Story ID (e.g. 'DCS-01-CN-001') or a story title.
  Reads user_stories/<STORY_ID>.md, implements code, writes unit & integration tests,
  executes tests with self-correcting fix loops, commits atomically, and pushes to git remote.
---

# User Story Runner - Automated Implementation & Verification Runbook

This skill defines the exact automated procedure to execute when the user mentions, inputs, or requests the implementation of a User Story from the **Địa Chính Số** backlog (located in `user_stories/`).

---

## Trigger Conditions
Activate this skill whenever:
- The user provides a story ID, e.g. `DCS-01-CN-001`, `DCS-03-CN-001`, `DCS-04-CN-005`.
- The user provides a story title, e.g. "Đăng nhập Cổng Định danh Số", "Tạo mã QR Sổ Đỏ Số", "Khóa giao dịch công chứng".
- The user uses syntax like `/story DCS-XX-YY-ZZZ` or says "Triển khai story...".

---

## Step-by-Step Execution Runbook

### Step 1: Identify & Read Story Specification
1. Search `user_stories/` for the requested Story ID or title.
2. Open and view `user_stories/<STORY_ID>.md`.
3. Extract and parse:
   - **Persona & Goal**: Who is the user and what do they want to achieve?
   - **Acceptance Criteria (ACs)**: All 4 testable scenarios (Given - When - Then).
   - **Tasks**: The 5 subtasks defined for this story.
   - **Business Rules**: All linked `QTD-xx` rules.
   - **Dependencies**: Any preceding stories that must be in place.

---

### Step 2: Implementation (Shared -> API -> Web)
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

3. **`apps/web`** (Frontend Implementation):
   - Build UI components and pages in `src/app/` and `src/components/`.
   - Connect API calls and handle error states / loading states.

---

### Step 3: Write Unit & Integration Tests (BẮT BUỘC)
Write test suites specifically testing the 4 Acceptance Criteria of the story:
1. **Unit Tests**:
   - Location: `apps/api/src/modules/<module>/<module>.service.spec.ts`.
   - Test success scenarios (AC-01), validation/invalid data (AC-02), and business rule constraints (AC-03).
2. **Integration / E2E Tests**:
   - Location: `apps/api/src/modules/<module>/<module>.controller.spec.ts` or `test/`.
   - Test controller endpoints, HTTP status codes, and authorization guards.

---

### Step 4: Execute Tests & Self-Correction Loop
Run the test runner and enforce the zero-failure gate:
```bash
pnpm --filter @diachinhso/api test
```

- **If tests PASS (Green)**: Proceed to Step 5.
- **If tests FAIL (Red)**:
  1. Inspect the stack trace and failure output.
  2. Diagnose whether the issue is in the business logic or test assertions.
  3. Edit code to fix the issue.
  4. Re-run `pnpm --filter @diachinhso/api test`.
  5. Repeat until 100% of test suites and test cases pass.
  6. **NEVER** skip tests or proceed with failing tests.

---

### Step 5: Write API Documentation (`docs/`) & Update Story Status
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

### Step 6: Verify Monorepo Build
Run the full monorepo build to verify zero compile or type errors:
```bash
pnpm build
```
Confirm `@diachinhso/shared`, `@diachinhso/api`, and `@diachinhso/web` all build cleanly.

---

### Step 7: Atomic Commits & Git Push
Commit changes in small, logical increments:
```bash
git add packages/shared/
git commit -m "feat(shared): add types and schemas for <STORY_ID>"

git add apps/api/src/modules/
git commit -m "feat(api): implement business logic for <STORY_ID>"

git add apps/api/src/**/*.spec.ts
git commit -m "test(api): unit and integration tests for <STORY_ID>"

git add apps/web/
git commit -m "feat(web): add UI interface for <STORY_ID>"

git add user_stories/ docs/
git commit -m "docs(story): complete <STORY_ID> and update endpoints"

git push origin main
```

---

### Step 8: User Summary
Respond to the user with:
- Story implemented (ID & Title).
- Key files created/modified with clickable `file://` links.
- Test execution output showing 100% passed test cases.
- Commit hash and push confirmation.
