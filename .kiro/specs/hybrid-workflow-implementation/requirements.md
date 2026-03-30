# Hybrid Workflow Implementation - Requirements

## 1. Overview

Implement hybrid workflow với 34 statuses để nâng cấp hệ thống LMS lên chuẩn enterprise-grade, kết hợp điểm mạnh của workflow hiện tại và workflow đề xuất mới.

## 2. Goals

- Thêm 7 statuses mới vào hệ thống
- Cập nhật state machine với ~18 transitions mới
- Đảm bảo backward compatibility với loans hiện tại
- Cải thiện tracking rejection và debt management

## 3. User Stories

### 3.1. Assessment Team

**US-1:** Là Assessment, tôi muốn có thể từ chối hồ sơ với trạng thái ASSESSMENT_REJECTED riêng biệt để tracking rõ ràng hơn.

**Acceptance Criteria:**
- Có nút "Từ chối thẩm định" trong AssessmentFormView
- Khi click, chuyển status sang ASSESSMENT_REJECTED
- Hiển thị form nhập lý do từ chối
- Lưu lý do vào loan record
- ASSESSMENT_REJECTED là terminal state

### 3.2. Admin - Credit Decision

**US-2:** Là Admin, tôi muốn có bước quyết định tín dụng riêng (CREDIT_APPROVED/REJECTED) sau khi thẩm định đạt.

**Acceptance Criteria:**
- Sau ASSESSMENT_APPROVED, có bước CREDIT_APPROVED
- Admin có thể duyệt (CREDIT_APPROVED) hoặc từ chối (CREDIT_REJECTED)
- CREDIT_APPROVED tự động phân luồng theo loan_type
- CREDIT_REJECTED là terminal state
- Có form nhập lý do quyết định

### 3.3. Customer - Contract Management

**US-3:** Là Customer, tôi muốn có thể từ chối hợp đồng nếu không đồng ý điều khoản.

**Acceptance Criteria:**
- Có nút "Từ chối hợp đồng" trong CustomerSignContractView
- Khi click, chuyển sang CONTRACT_REJECTED
- Hiển thị form nhập lý do
- CONTRACT_REJECTED là terminal state

**US-4:** Là Admin, tôi muốn hệ thống tự động đánh dấu hợp đồng hết hạn nếu khách không ký trong thời gian quy định.

**Acceptance Criteria:**
- Sau 7 ngày từ CONTRACT_SENT, tự động chuyển sang CONTRACT_EXPIRED
- Có thể gửi lại hợp đồng (CONTRACT_EXPIRED → READY_FOR_CONTRACT)
- Có thể cancel (CONTRACT_EXPIRED → CANCELLED)



### 3.4. Accountant - Disbursement Processing

**US-5:** Là Accountant, tôi muốn thấy trạng thái "Đang xử lý giải ngân" khi tiền đang được chuyển.

**Acceptance Criteria:**
- Sau DISBURSEMENT_APPROVED, có trạng thái DISBURSEMENT_PROCESSING
- Hiển thị progress indicator
- Tự động chuyển sang DISBURSED khi thành công
- Tự động chuyển sang DISBURSEMENT_FAILED khi thất bại
- Có timeout warning sau 24 giờ

### 3.5. Collection - Debt Restructuring

**US-6:** Là Collection, tôi muốn có thể tái cấu trúc nợ cho khách hàng gặp khó khăn tạm thời.

**Acceptance Criteria:**
- Có nút "Tái cấu trúc nợ" trong CollectionDashboardView
- Có thể restructure từ IN_REPAYMENT, OVERDUE_MINOR, OVERDUE_SEVERE
- Hiển thị form nhập điều khoản mới (thời gian, lãi suất, số tiền)
- Cần approval từ Admin
- Sau approve, tự động chuyển về IN_REPAYMENT với schedule mới

**US-7:** Là Collection, tôi muốn có thể xóa nợ (write-off) cho các trường hợp đặc biệt.

**Acceptance Criteria:**
- Có nút "Xóa nợ" trong CollectionDashboardView
- Chỉ có thể write-off từ COLLECTION_IN_PROGRESS
- Hiển thị form nhập lý do và số tiền write-off
- Cần approval cao từ Admin/Management
- WRITE_OFF là terminal state
- Ghi nhận loss vào báo cáo tài chính

## 4. Non-Functional Requirements

### 4.1. Performance
- Chuyển trạng thái phải hoàn thành trong < 500ms
- Auto-transitions phải xử lý trong < 1s
- UI phải responsive, không lag

### 4.2. Backward Compatibility
- Tất cả loans hiện tại phải hoạt động bình thường
- Không force migrate existing loans
- Legacy status mapping phải hoạt động

### 4.3. Data Integrity
- Mọi status change phải được log trong audit trail
- Không được mất data khi chuyển trạng thái
- Transaction phải atomic

### 4.4. Security
- Role-based access control phải được enforce
- Approval requirements phải được kiểm tra
- Sensitive actions phải require confirmation

### 4.5. Usability
- UI phải có Vietnamese labels
- Error messages phải rõ ràng
- Confirmation dialogs cho critical actions

## 5. Technical Constraints

- Sử dụng TypeScript
- Sử dụng React cho UI
- State machine phải deterministic
- Không breaking changes cho API

## 6. Out of Scope

- Migration existing loans sang statuses mới (optional, phase 2)
- Advanced reporting (phase 2)
- Mobile app updates (phase 2)
- Email/SMS notifications (phase 2)

## 7. Success Criteria

- ✅ 7 statuses mới được thêm vào constants/status.ts
- ✅ ~18 transitions mới được thêm vào state-machine/transitions.ts
- ✅ Tất cả tests pass
- ✅ No breaking changes
- ✅ Documentation updated

