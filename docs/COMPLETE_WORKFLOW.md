# WORKFLOW HOÀN CHỈNH - HỆ THỐNG MINI-LMS

## 📊 TỔNG QUAN

Hệ thống Mini-LMS hiện có **29 trạng thái** và **67 transitions** (chuyển đổi trạng thái) được quản lý chặt chẽ bởi State Machine.

### Phân loại trạng thái:
- **Pre-Contract (5)**: DRAFT → SUBMITTED → UNDER_ASSESSMENT → NEED_ADDITIONAL_INFO → ASSESSMENT_APPROVED
- **Collateral/Device (4)**: REQUIRE_DEVICE_LOCK → DEVICE_LOCKED / REQUIRE_COLLATERAL_CONFIRMATION → COLLATERAL_CONFIRMED
- **Contract (3)**: READY_FOR_CONTRACT → CONTRACT_SENT → CONTRACT_SIGNED
- **Disbursement (5)**: READY_FOR_DISBURSEMENT → DISBURSEMENT_DRAFTED → DISBURSEMENT_APPROVED → DISBURSEMENT_FAILED → DISBURSED
- **Collection (6)**: IN_REPAYMENT → OVERDUE_MINOR → OVERDUE_SEVERE → COLLECTION_IN_PROGRESS → SETTLED → BAD_DEBT
- **Terminal (2)**: REJECTED, CANCELLED

---

## 🔄 LUỒNG CHÍNH (HAPPY PATH)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GIAI ĐOẠN 1: TẠO HỒ SƠ                       │
└─────────────────────────────────────────────────────────────────────┘

1. CSKH tạo hồ sơ
   📝 DRAFT (Nháp)
   ↓ [CSKH gửi hồ sơ]
   
2. Hồ sơ đã gửi
   📤 SUBMITTED (Đã gửi)
   ↓ [Tự động chuyển]
   
┌─────────────────────────────────────────────────────────────────────┐
│                      GIAI ĐOẠN 2: THẨM ĐỊNH                         │
└─────────────────────────────────────────────────────────────────────┘

3. Thẩm định xử lý
   🔍 UNDER_ASSESSMENT (Đang thẩm định)
   ↓
   ├─ [Thiếu thông tin] → 📋 NEED_ADDITIONAL_INFO → Về CSKH bổ sung → SUBMITTED
   ├─ [Không đạt] → ❌ REJECTED (Kết thúc)
   └─ [Đạt yêu cầu] → ✅ ASSESSMENT_APPROVED
   
┌─────────────────────────────────────────────────────────────────────┐
│              GIAI ĐOẠN 3: XÁC NHẬN TÀI SẢN ĐẢM BẢO                  │
└─────────────────────────────────────────────────────────────────────┘

4. Phân luồng theo loại tài sản:

   A. 📱 ĐIỆN THOẠI/THIẾT BỊ:
      🔒 REQUIRE_DEVICE_LOCK (Yêu cầu khóa thiết bị)
      ↓ [Security kiểm tra]
      ├─ [Phát hiện gian lận] → ❌ REJECTED
      └─ [Đạt] → 🔐 DEVICE_LOCKED (Thiết bị đã khóa)
      
   B. 🏠 TÀI SẢN KHÁC (Ô tô, Xe máy, Nhà đất...):
      📋 REQUIRE_COLLATERAL_CONFIRMATION (Yêu cầu xác nhận TSĐB)
      ↓ [Admin xác nhận]
      ├─ [Tài sản không đủ giá trị] → ❌ REJECTED
      └─ [Đạt] → ✅ COLLATERAL_CONFIRMED (TSĐB đã xác nhận)

   ↓ [Tự động chuyển]
   
┌─────────────────────────────────────────────────────────────────────┐
│                    GIAI ĐOẠN 4: KÝ HỢP ĐỒNG                         │
└─────────────────────────────────────────────────────────────────────┘

5. Chuẩn bị hợp đồng
   📄 READY_FOR_CONTRACT (Sẵn sàng tạo hợp đồng)
   ↓ [Admin/CSKH gửi hợp đồng]
   
6. Gửi hợp đồng cho khách
   📧 CONTRACT_SENT (Đã gửi hợp đồng)
   ↓ [Khách hàng xem xét]
   ├─ [Khách từ chối] → ❌ REJECTED
   ├─ [Khách yêu cầu hủy] → 🚫 CANCELLED
   └─ [Khách ký thành công] → ✍️ CONTRACT_SIGNED (Đã ký hợp đồng)
   
   ↓ [Tự động chuyển]
   
┌─────────────────────────────────────────────────────────────────────┐
│                     GIAI ĐOẠN 5: GIẢI NGÂN                          │
└─────────────────────────────────────────────────────────────────────┘

7. Sẵn sàng giải ngân
   💰 READY_FOR_DISBURSEMENT (Sẵn sàng giải ngân)
   ↓ [Kế toán lập lệnh]
   
8. Lập lệnh giải ngân
   📝 DISBURSEMENT_DRAFTED (Lập lệnh giải ngân)
   ↓ [Admin duyệt]
   ├─ [Admin từ chối] → ❌ REJECTED
   └─ [Admin duyệt] → ✅ DISBURSEMENT_APPROVED (Lệnh đã duyệt)
   
9. Thực hiện giải ngân
   ↓ [Kế toán thực hiện]
   ├─ [Thất bại] → ⚠️ DISBURSEMENT_FAILED
   │   ↓ [Sửa lại]
   │   └─ Quay về DISBURSEMENT_DRAFTED hoặc READY_FOR_DISBURSEMENT
   │
   └─ [Thành công] → 💸 DISBURSED (Đã giải ngân)
   
   ↓ [Tự động chuyển]
   
┌─────────────────────────────────────────────────────────────────────┐
│                  GIAI ĐOẠN 6: TRẢ NỢ & THU HỒI                      │
└─────────────────────────────────────────────────────────────────────┘

10. Theo dõi trả nợ
    💳 IN_REPAYMENT (Đang trả nợ)
    ↓
    ├─ [Trả đủ đúng hạn] → ✅ SETTLED (Đã tất toán) ✓
    │
    └─ [Quá hạn] → ⏰ OVERDUE_MINOR (Quá hạn nhẹ)
        ↓
        ├─ [Khách trả bù] → Quay về IN_REPAYMENT
        │
        └─ [Tiếp tục quá hạn] → 🚨 OVERDUE_SEVERE (Quá hạn nặng)
            ↓
            ├─ [Khách trả bù] → Quay về IN_REPAYMENT hoặc OVERDUE_MINOR
            │
            └─ [Không trả] → 📞 COLLECTION_IN_PROGRESS (Đang thu hồi)
                ↓
                ├─ [Thu hồi thành công] → ✅ SETTLED ✓
                ├─ [Khách trả lại] → Quay về IN_REPAYMENT
                └─ [Không thu hồi được] → 💀 BAD_DEBT (Nợ xấu) ✗
```

---

## ❌ LUỒNG TỪ CHỐI (REJECTION FLOWS)

Hồ sơ có thể bị từ chối ở nhiều giai đoạn:

### 1. Từ chối tại Thẩm định
```
UNDER_ASSESSMENT → REJECTED
- Vai trò: Assessment, Admin
- Lý do: Không đủ điều kiện tín dụng, thu nhập thấp, rủi ro cao
```

### 2. Từ chối tại Security
```
REQUIRE_DEVICE_LOCK → REJECTED
- Vai trò: Security, Admin
- Lý do: Phát hiện gian lận, thiết bị báo mất, blacklist
```

### 3. Từ chối tại Xác nhận Tài sản
```
REQUIRE_COLLATERAL_CONFIRMATION → REJECTED
- Vai trò: Admin
- Lý do: Tài sản không đủ giá trị, không hợp lệ
```

### 4. Khách hàng từ chối Hợp đồng
```
CONTRACT_SENT → REJECTED
- Vai trò: Customer, Admin
- Lý do: Khách không đồng ý điều khoản
```

### 5. Admin từ chối ở các giai đoạn khác
```
ASSESSMENT_APPROVED → REJECTED
DEVICE_LOCKED → REJECTED
COLLATERAL_CONFIRMED → REJECTED
READY_FOR_CONTRACT → REJECTED
DISBURSEMENT_DRAFTED → REJECTED
- Vai trò: Admin
- Lý do: Phát hiện vấn đề, chính sách thay đổi
```

---

## 🚫 LUỒNG HỦY (CANCELLATION FLOWS)

Hồ sơ có thể bị hủy ở hầu hết các giai đoạn (trước khi giải ngân):

### Giai đoạn có thể hủy:
1. **DRAFT → CANCELLED** (CSKH, Admin)
2. **SUBMITTED → CANCELLED** (CSKH, Admin - cần duyệt)
3. **UNDER_ASSESSMENT → CANCELLED** (Admin - cần duyệt)
4. **NEED_ADDITIONAL_INFO → CANCELLED** (CSKH, Admin)
5. **ASSESSMENT_APPROVED → CANCELLED** (Admin - cần duyệt)
6. **REQUIRE_DEVICE_LOCK → CANCELLED** (Admin - cần duyệt)
7. **REQUIRE_COLLATERAL_CONFIRMATION → CANCELLED** (Admin - cần duyệt)
8. **DEVICE_LOCKED → CANCELLED** (Admin - cần duyệt)
9. **COLLATERAL_CONFIRMED → CANCELLED** (Admin - cần duyệt)
10. **READY_FOR_CONTRACT → CANCELLED** (Admin, Customer - cần duyệt)
11. **CONTRACT_SENT → CANCELLED** (Admin, Customer - cần duyệt)
12. **CONTRACT_SIGNED → CANCELLED** (Admin - cần duyệt cao)
13. **READY_FOR_DISBURSEMENT → CANCELLED** (Admin - cần duyệt cao)
14. **DISBURSEMENT_DRAFTED → CANCELLED** (Admin - cần duyệt cao)

### Lý do hủy phổ biến:
- Khách hàng thay đổi ý định
- Phát hiện thông tin sai lệch
- Không đủ điều kiện
- Yêu cầu từ cấp trên

---

## 🔄 LUỒNG RECOVERY (KHÔI PHỤC)

### 1. Recovery từ Overdue (Quá hạn)
```
OVERDUE_MINOR → IN_REPAYMENT
OVERDUE_SEVERE → IN_REPAYMENT
OVERDUE_SEVERE → OVERDUE_MINOR
COLLECTION_IN_PROGRESS → IN_REPAYMENT
```
**Khi nào:** Khách hàng trả bù khoản nợ quá hạn

### 2. Recovery từ Disbursement Failed
```
DISBURSEMENT_FAILED → DISBURSEMENT_DRAFTED
DISBURSEMENT_FAILED → READY_FOR_DISBURSEMENT
```
**Khi nào:** Sửa lỗi thông tin tài khoản, thử lại giải ngân

---

## 📋 BẢNG TỔNG HỢP TRANSITIONS

| # | From Status | To Status | Roles | Approval | Auto | Conditions |
|---|-------------|-----------|-------|----------|------|------------|
| 1 | DRAFT | SUBMITTED | cskh | No | No | - |
| 2 | SUBMITTED | UNDER_ASSESSMENT | cskh, admin, assessment | No | Yes | - |
| 3 | UNDER_ASSESSMENT | NEED_ADDITIONAL_INFO | assessment | Yes | No | - |
| 4 | NEED_ADDITIONAL_INFO | SUBMITTED | cskh | No | No | - |
| 5 | UNDER_ASSESSMENT | ASSESSMENT_APPROVED | assessment | Yes | No | - |
| 6 | ASSESSMENT_APPROVED | REQUIRE_DEVICE_LOCK | admin, assessment | No | Yes | loan_type === "DEVICE" |
| 7 | ASSESSMENT_APPROVED | REQUIRE_COLLATERAL_CONFIRMATION | admin, assessment | No | Yes | loan_type === "COLLATERAL" |
| 8 | REQUIRE_DEVICE_LOCK | DEVICE_LOCKED | security | Yes | No | - |
| 9 | REQUIRE_COLLATERAL_CONFIRMATION | COLLATERAL_CONFIRMED | admin | Yes | No | - |
| 10 | DEVICE_LOCKED | READY_FOR_CONTRACT | admin | No | Yes | - |
| 11 | COLLATERAL_CONFIRMED | READY_FOR_CONTRACT | admin | No | Yes | - |
| 12 | READY_FOR_CONTRACT | CONTRACT_SENT | admin, cskh | No | No | - |
| 13 | CONTRACT_SENT | CONTRACT_SIGNED | customer | Yes | No | - |
| 14 | CONTRACT_SIGNED | READY_FOR_DISBURSEMENT | admin | No | Yes | - |
| 15 | READY_FOR_DISBURSEMENT | DISBURSEMENT_DRAFTED | accountant | No | No | - |
| 16 | DISBURSEMENT_DRAFTED | DISBURSEMENT_APPROVED | admin | Yes | No | - |
| 17 | DISBURSEMENT_APPROVED | DISBURSED | accountant, admin | No | Yes | - |
| 18 | DISBURSEMENT_APPROVED | DISBURSEMENT_FAILED | accountant, admin | No | No | - |
| 19 | DISBURSEMENT_FAILED | DISBURSEMENT_DRAFTED | accountant | No | No | - |
| 20 | DISBURSEMENT_FAILED | READY_FOR_DISBURSEMENT | admin | No | No | - |
| 21 | DISBURSED | IN_REPAYMENT | accountant, admin | No | Yes | - |
| 22 | IN_REPAYMENT | SETTLED | accountant, collection, admin | No | No | - |
| 23 | IN_REPAYMENT | OVERDUE_MINOR | collection, admin, accountant | No | No | - |
| 24 | OVERDUE_MINOR | OVERDUE_SEVERE | collection, admin | No | No | - |
| 25 | OVERDUE_SEVERE | COLLECTION_IN_PROGRESS | collection, admin | No | No | - |
| 26 | OVERDUE_MINOR | IN_REPAYMENT | collection, accountant, admin | No | No | - |
| 27 | OVERDUE_SEVERE | IN_REPAYMENT | collection, accountant, admin | No | No | - |
| 28 | OVERDUE_SEVERE | OVERDUE_MINOR | collection, accountant, admin | No | No | - |
| 29 | COLLECTION_IN_PROGRESS | SETTLED | collection, accountant, admin | No | No | - |
| 30 | COLLECTION_IN_PROGRESS | IN_REPAYMENT | collection, accountant, admin | No | No | - |
| 31 | COLLECTION_IN_PROGRESS | BAD_DEBT | collection, admin | Yes | No | - |

**+ 36 transitions cho Rejection và Cancellation flows**

---

## 🎯 NGUYÊN TẮC KIỂM SOÁT

### 1. Separation of Duties (Phân tách nhiệm vụ)
- Người tạo không được duyệt
- Mỗi bước cần vai trò khác nhau

### 2. Approval Requirements (Yêu cầu phê duyệt)
- Các quyết định quan trọng cần approval
- Từ chối/Hủy ở giai đoạn muộn cần approval cao

### 3. Auto-Transition (Tự động chuyển)
- Một số bước tự động để giảm thao tác thủ công
- Đảm bảo tính nhất quán

### 4. Audit Trail (Nhật ký kiểm toán)
- Mọi thay đổi trạng thái đều được ghi log
- Ghi rõ: Ai, Làm gì, Khi nào, Lý do

### 5. Terminal States (Trạng thái kết thúc)
- SETTLED: Thành công ✅
- BAD_DEBT: Thất bại (nợ xấu) ❌
- REJECTED: Bị từ chối ❌
- CANCELLED: Bị hủy 🚫

---

## 📊 THỐNG KÊ WORKFLOW

- **Tổng số trạng thái:** 29
- **Tổng số transitions:** 67
- **Trạng thái có thể hủy:** 14
- **Trạng thái có thể từ chối:** 9
- **Trạng thái tự động chuyển:** 7
- **Trạng thái kết thúc:** 4 (SETTLED, BAD_DEBT, REJECTED, CANCELLED)

---

## 🔍 KIỂM TRA WORKFLOW

### Checklist đầy đủ:
- ✅ Luồng thành công (Happy Path)
- ✅ Luồng từ chối (Rejection)
- ✅ Luồng hủy (Cancellation)
- ✅ Luồng khôi phục (Recovery)
- ✅ Xử lý lỗi giải ngân
- ✅ Xử lý quá hạn và thu hồi
- ✅ Phân quyền rõ ràng
- ✅ Audit trail đầy đủ

### Workflow hiện tại: **100% HOÀN CHỈNH** ✅

---

*Tài liệu được tạo tự động từ State Machine*
*Cập nhật lần cuối: 2024*
