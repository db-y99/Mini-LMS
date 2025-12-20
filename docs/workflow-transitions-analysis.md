# Phân tích Workflow Transitions

## Tổng quan
Dự án có **10 trạng thái** và **11 transitions** được định nghĩa.

## Các trạng thái trong hệ thống
1. `draft` - Nháp
2. `pending_cskh` - Chờ CSKH xử lý
3. `pending_cskh_supplement` - Chờ CSKH bổ sung hồ sơ
4. `pending_assessment` - Chờ thẩm định
5. `pending_security` - Chờ kiểm tra bảo mật
6. `pending_admin` - Chờ phê duyệt admin
7. `pending_disbursement` - Chờ giải ngân
8. `disbursed` - Đã giải ngân
9. `rejected` - Từ chối
10. `cancelled` - Đã hủy

## Các Transitions hiện có (11 transitions)

### 1. CSKH Workflow
- ✅ `pending_cskh` → `pending_assessment` (cskh, auto)
- ✅ `pending_cskh_supplement` → `pending_assessment` (cskh, auto)

### 2. Assessment Workflow
- ✅ `pending_assessment` → `pending_security` (assessment, conditional: phone only)
- ✅ `pending_assessment` → `pending_admin` (assessment, conditional: non-phone)
- ✅ `pending_assessment` → `rejected` (assessment)
- ✅ `pending_assessment` → `pending_cskh_supplement` (assessment)

### 3. Security Workflow
- ✅ `pending_security` → `pending_admin` (security)
- ✅ `pending_security` → `rejected` (security)

### 4. Admin Workflow
- ✅ `pending_admin` → `pending_disbursement` (admin)
- ✅ `pending_admin` → `rejected` (admin)

### 5. Accountant Workflow
- ✅ `pending_disbursement` → `disbursed` (accountant)

## Các Transitions có thể thiếu

### 1. Draft Transitions
❌ **THIẾU**: `draft` → `pending_cskh` (cskh)
- **Lý do**: Khi CSKH lưu nháp, cần có cách chuyển từ draft sang pending_cskh để gửi đi
- **Giải pháp**: Thêm transition này

❌ **THIẾU**: `draft` → `pending_assessment` (cskh)
- **Lý do**: Có thể CSKH muốn gửi trực tiếp từ draft lên assessment
- **Giải pháp**: Có thể thêm nếu cần

### 2. Cancelled Transitions
❌ **THIẾU**: Các transitions đến `cancelled`
- **Lý do**: Status `cancelled` tồn tại nhưng không có transition nào đến nó
- **Các trường hợp có thể hủy**:
  - `pending_cskh` → `cancelled` (cskh, admin)
  - `pending_cskh_supplement` → `cancelled` (cskh, admin)
  - `pending_assessment` → `cancelled` (assessment, admin)
  - `pending_security` → `cancelled` (security, admin)
  - `pending_admin` → `cancelled` (admin)
  - `pending_disbursement` → `cancelled` (accountant, admin)
- **Giải pháp**: Thêm transitions hủy ở các giai đoạn phù hợp

### 3. Rejected Transitions
✅ **ĐÃ CÓ**: Rejected từ assessment, security, admin
- Có thể cần thêm rejected từ các giai đoạn khác nếu cần

### 4. Final States
✅ **ĐÃ CÓ**: `disbursed` là trạng thái cuối (không có transition đi)
✅ **ĐÃ CÓ**: `rejected` là trạng thái cuối (không có transition đi)
❌ **THIẾU**: `cancelled` là trạng thái cuối (không có transition đi) - OK

## Đề xuất cải thiện

### Priority 1: Thêm transitions cần thiết
1. `draft` → `pending_cskh` (cskh)
2. `pending_cskh` → `cancelled` (cskh, admin)
3. `pending_cskh_supplement` → `cancelled` (cskh, admin)
4. `pending_assessment` → `cancelled` (assessment, admin)
5. `pending_security` → `cancelled` (security, admin)
6. `pending_admin` → `cancelled` (admin)
7. `pending_disbursement` → `cancelled` (accountant, admin)

### Priority 2: Có thể thêm (tùy chọn)
1. `draft` → `pending_assessment` (cskh) - nếu muốn gửi trực tiếp từ draft

## Sơ đồ Workflow hiện tại

```
draft (không có transition đi)
  ↓ (cần thêm)
pending_cskh
  ↓
pending_assessment
  ├─→ pending_security (phone only)
  │     ├─→ pending_admin
  │     │     ├─→ pending_disbursement
  │     │     │     └─→ disbursed (FINAL)
  │     │     └─→ rejected (FINAL)
  │     └─→ rejected (FINAL)
  ├─→ pending_admin (non-phone)
  │     ├─→ pending_disbursement
  │     │     └─→ disbursed (FINAL)
  │     └─→ rejected (FINAL)
  ├─→ rejected (FINAL)
  └─→ pending_cskh_supplement
        └─→ pending_assessment (quay lại)

cancelled (FINAL - không có transition đến)
```

## Kết luận
- **11 transitions** hiện có đã cover flow chính
- **Thiếu transitions** cho draft và cancelled
- Cần bổ sung để hệ thống hoàn chỉnh hơn

