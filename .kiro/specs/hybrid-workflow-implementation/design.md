# Hybrid Workflow Implementation - Design

## 1. Architecture Overview

### 1.1. System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  - Role-specific Views (Assessment, Admin, Collection...)   │
│  - Status Display Components                                 │
│  - Action Buttons (Approve, Reject, Restructure...)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  WorkflowContext (State Management)          │
├─────────────────────────────────────────────────────────────┤
│  - updateLoanStatus()                                        │
│  - validateTransition()                                      │
│  - checkPermissions()                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              State Machine (transitions.ts)                  │
├─────────────────────────────────────────────────────────────┤
│  - STATE_TRANSITIONS[]                                       │
│  - getAllowedTransitions()                                   │
│  - Conditional logic (loan_type routing)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Status Constants (status.ts)                  │
├─────────────────────────────────────────────────────────────┤
│  - STATUS_GROUPS                                             │
│  - STATUS_LABELS                                             │
│  - normalizeStatus(), toLegacyStatus()                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Storage Layer (localStorage)                  │
├─────────────────────────────────────────────────────────────┤
│  - Loan records                                              │
│  - Audit trail                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Data Model Changes

### 2.1. New Statuses

```typescript
// Add to STATUS_GROUPS in constants/status.ts

export const STATUS_GROUPS = {
  preContract: [
    'DRAFT',
    'SUBMITTED',
    'UNDER_ASSESSMENT',
    'NEED_ADDITIONAL_INFO',
    'ASSESSMENT_APPROVED',
    'ASSESSMENT_REJECTED' // NEW
  ],
  creditDecision: [ // NEW GROUP
    'CREDIT_APPROVED',
    'CREDIT_REJECTED'
  ],
  collateral: [
    'REQUIRE_DEVICE_LOCK',
    'DEVICE_LOCKED',
    'REQUIRE_COLLATERAL_CONFIRMATION',
    'COLLATERAL_CONFIRMED'
  ],
  contract: [
    'READY_FOR_CONTRACT',
    'CONTRACT_SENT',
    'CONTRACT_SIGNED',
    'CONTRACT_EXPIRED', // NEW
    'CONTRACT_REJECTED' // NEW
  ],
  disbursement: [
    'READY_FOR_DISBURSEMENT',
    'DISBURSEMENT_DRAFTED',
    'DISBURSEMENT_APPROVED',
    'DISBURSEMENT_PROCESSING', // NEW
    'DISBURSEMENT_FAILED',
    'DISBURSED'
  ],
  collection: [
    'IN_REPAYMENT',
    'OVERDUE_MINOR',
    'OVERDUE_SEVERE',
    'RESTRUCTURED', // NEW
    'COLLECTION_IN_PROGRESS',
    'SETTLED',
    'WRITE_OFF', // NEW
    'BAD_DEBT'
  ],
  terminal: [
    'REJECTED',
    'CANCELLED'
  ]
} as const;
```



### 2.2. Vietnamese Labels

```typescript
export const STATUS_LABELS: Record<CanonicalLoanStatus, string> = {
  // ... existing labels ...
  
  // NEW LABELS
  ASSESSMENT_REJECTED: 'Từ chối thẩm định',
  CREDIT_APPROVED: 'Duyệt tín dụng',
  CREDIT_REJECTED: 'Từ chối tín dụng',
  CONTRACT_EXPIRED: 'Hợp đồng hết hạn',
  CONTRACT_REJECTED: 'Từ chối hợp đồng',
  DISBURSEMENT_PROCESSING: 'Đang xử lý giải ngân',
  RESTRUCTURED: 'Tái cấu trúc nợ',
  WRITE_OFF: 'Xóa nợ'
};
```

### 2.3. Legacy Mapping

```typescript
const canonicalToLegacyMap: Partial<Record<CanonicalLoanStatus, LegacyLoanStatus>> = {
  // ... existing mappings ...
  
  // NEW MAPPINGS
  ASSESSMENT_REJECTED: 'rejected',
  CREDIT_APPROVED: 'pending_admin',
  CREDIT_REJECTED: 'rejected',
  CONTRACT_EXPIRED: 'pending_admin',
  CONTRACT_REJECTED: 'rejected',
  DISBURSEMENT_PROCESSING: 'pending_disbursement',
  RESTRUCTURED: 'disbursed',
  WRITE_OFF: 'disbursed'
};
```

## 3. State Machine Design

### 3.1. New Transitions

```typescript
// Credit Decision transitions
{ 
  fromStatus: 'ASSESSMENT_APPROVED', 
  toStatus: 'CREDIT_APPROVED', 
  allowedRoles: ['admin'], 
  requiresApproval: true 
},
{ 
  fromStatus: 'ASSESSMENT_APPROVED', 
  toStatus: 'CREDIT_REJECTED', 
  allowedRoles: ['admin'], 
  requiresApproval: true 
},
{ 
  fromStatus: 'CREDIT_APPROVED', 
  toStatus: 'REQUIRE_DEVICE_LOCK', 
  allowedRoles: ['admin'], 
  requiresApproval: false, 
  autoTransition: true, 
  conditions: ['loan_type === "DEVICE"'] 
},
{ 
  fromStatus: 'CREDIT_APPROVED', 
  toStatus: 'REQUIRE_COLLATERAL_CONFIRMATION', 
  allowedRoles: ['admin'], 
  requiresApproval: false, 
  autoTransition: true, 
  conditions: ['loan_type === "COLLATERAL"'] 
},

// Assessment Rejection
{ 
  fromStatus: 'UNDER_ASSESSMENT', 
  toStatus: 'ASSESSMENT_REJECTED', 
  allowedRoles: ['assessment', 'admin'], 
  requiresApproval: true 
},

// Contract transitions
{ 
  fromStatus: 'CONTRACT_SENT', 
  toStatus: 'CONTRACT_REJECTED', 
  allowedRoles: ['customer', 'admin'], 
  requiresApproval: false 
},
{ 
  fromStatus: 'CONTRACT_SENT', 
  toStatus: 'CONTRACT_EXPIRED', 
  allowedRoles: ['admin'], 
  requiresApproval: false, 
  autoTransition: true 
},
{ 
  fromStatus: 'CONTRACT_EXPIRED', 
  toStatus: 'READY_FOR_CONTRACT', 
  allowedRoles: ['admin'], 
  requiresApproval: false 
},
{ 
  fromStatus: 'CONTRACT_EXPIRED', 
  toStatus: 'CANCELLED', 
  allowedRoles: ['admin'], 
  requiresApproval: true 
},

// Disbursement Processing
{ 
  fromStatus: 'DISBURSEMENT_APPROVED', 
  toStatus: 'DISBURSEMENT_PROCESSING', 
  allowedRoles: ['accountant', 'admin'], 
  requiresApproval: false, 
  autoTransition: true 
},
{ 
  fromStatus: 'DISBURSEMENT_PROCESSING', 
  toStatus: 'DISBURSED', 
  allowedRoles: ['accountant', 'admin'], 
  requiresApproval: false, 
  autoTransition: true 
},
{ 
  fromStatus: 'DISBURSEMENT_PROCESSING', 
  toStatus: 'DISBURSEMENT_FAILED', 
  allowedRoles: ['accountant', 'admin'], 
  requiresApproval: false 
},

// Restructuring
{ 
  fromStatus: 'IN_REPAYMENT', 
  toStatus: 'RESTRUCTURED', 
  allowedRoles: ['admin', 'collection'], 
  requiresApproval: true 
},
{ 
  fromStatus: 'OVERDUE_MINOR', 
  toStatus: 'RESTRUCTURED', 
  allowedRoles: ['admin', 'collection'], 
  requiresApproval: true 
},
{ 
  fromStatus: 'OVERDUE_SEVERE', 
  toStatus: 'RESTRUCTURED', 
  allowedRoles: ['admin', 'collection'], 
  requiresApproval: true 
},
{ 
  fromStatus: 'RESTRUCTURED', 
  toStatus: 'IN_REPAYMENT', 
  allowedRoles: ['admin'], 
  requiresApproval: false, 
  autoTransition: true 
},

// Write-off
{ 
  fromStatus: 'COLLECTION_IN_PROGRESS', 
  toStatus: 'WRITE_OFF', 
  allowedRoles: ['admin'], 
  requiresApproval: true 
}
```



### 3.2. Transition Logic

```typescript
// Update getAllowedTransitions to handle new credit decision flow
export const getAllowedTransitions = (
  currentStatus: LoanStatus, 
  userRole: UserRole, 
  loan?: { loan_type?: string }
) => {
  const canonical = normalizeStatus(currentStatus);
  return STATE_TRANSITIONS.filter(transition => {
    if (transition.fromStatus !== canonical) return false;
    if (!transition.allowedRoles.includes(userRole)) return false;
    
    // Handle conditional transitions
    if (transition.conditions && loan) {
      for (const condition of transition.conditions) {
        if (condition === 'loan_type === "DEVICE"' && loan.loan_type !== 'DEVICE') {
          return false;
        }
        if (condition === 'loan_type === "COLLATERAL"' && loan.loan_type !== 'COLLATERAL') {
          return false;
        }
      }
    }
    
    return true;
  });
};
```

## 4. UI Component Design

### 4.1. Assessment View Updates

**File:** `components/assessment/AssessmentFormView.tsx`

**Changes:**
- Add "Từ chối thẩm định" button
- Add rejection reason modal
- Update submit handler to support ASSESSMENT_REJECTED

```typescript
const handleReject = async (reason: string) => {
  await updateLoanStatus(loanId, 'ASSESSMENT_REJECTED', {
    reason,
    rejectedBy: currentUser.id,
    rejectedAt: new Date().toISOString()
  });
};
```

### 4.2. Credit Decision View (NEW)

**File:** `components/admin/CreditDecisionView.tsx` (NEW)

**Purpose:** Admin duyệt/từ chối quyết định tín dụng

**Features:**
- Display loan info and assessment results
- Credit analysis form
- Approve button → CREDIT_APPROVED
- Reject button → CREDIT_REJECTED
- Reason input for both actions

```typescript
interface CreditDecisionViewProps {
  loan: Loan;
  onApprove: (decision: CreditDecision) => void;
  onReject: (reason: string) => void;
}
```

### 4.3. Contract View Updates

**File:** `components/customer/CustomerSignContractView.tsx`

**Changes:**
- Add "Từ chối hợp đồng" button
- Add rejection reason modal
- Update to handle CONTRACT_REJECTED

### 4.4. Disbursement Processing View (NEW)

**File:** `components/accountant/DisbursementProcessingView.tsx` (NEW)

**Purpose:** Monitor disbursement processing status

**Features:**
- Progress indicator
- Estimated completion time
- Manual override buttons (success/failed)
- Timeout warning after 24h



### 4.5. Loan Restructuring View (NEW)

**File:** `components/collection/LoanRestructuringView.tsx` (NEW)

**Purpose:** Tái cấu trúc nợ

**Features:**
- Current loan terms display
- New terms input form (duration, interest rate, monthly payment)
- Payment schedule calculator
- Reason input
- Submit for approval

```typescript
interface RestructureTerms {
  newDuration: number;
  newInterestRate: number;
  newMonthlyPayment: number;
  reason: string;
  effectiveDate: string;
}
```

### 4.6. Write-off Management View (NEW)

**File:** `components/collection/WriteOffManagementView.tsx` (NEW)

**Purpose:** Xóa nợ

**Features:**
- Loan details display
- Write-off amount input
- Reason selection (dropdown + custom)
- Impact calculation (loss amount)
- High-level approval workflow

## 5. Business Logic

### 5.1. Auto-transition Handler

**File:** `utils/autoTransitions.ts` (NEW)

```typescript
export const handleAutoTransition = async (
  loan: Loan,
  fromStatus: CanonicalLoanStatus
): Promise<CanonicalLoanStatus | null> => {
  // CREDIT_APPROVED → route by loan_type
  if (fromStatus === 'CREDIT_APPROVED') {
    if (loan.loan_type === 'DEVICE') {
      return 'REQUIRE_DEVICE_LOCK';
    } else if (loan.loan_type === 'COLLATERAL') {
      return 'REQUIRE_COLLATERAL_CONFIRMATION';
    }
  }
  
  // DISBURSEMENT_APPROVED → DISBURSEMENT_PROCESSING
  if (fromStatus === 'DISBURSEMENT_APPROVED') {
    return 'DISBURSEMENT_PROCESSING';
  }
  
  // RESTRUCTURED → IN_REPAYMENT
  if (fromStatus === 'RESTRUCTURED') {
    return 'IN_REPAYMENT';
  }
  
  return null;
};
```

### 5.2. Contract Expiry Handler

**File:** `utils/contractExpiry.ts` (NEW)

```typescript
export const checkContractExpiry = (loan: Loan): boolean => {
  if (loan.status !== 'CONTRACT_SENT') return false;
  
  const sentDate = new Date(loan.contract_sent_at);
  const now = new Date();
  const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysDiff > 7; // 7 days expiry
};

export const handleExpiredContracts = async () => {
  const loans = await getLoansWithStatus('CONTRACT_SENT');
  
  for (const loan of loans) {
    if (checkContractExpiry(loan)) {
      await updateLoanStatus(loan.id, 'CONTRACT_EXPIRED', {
        expiredAt: new Date().toISOString(),
        reason: 'Contract not signed within 7 days'
      });
    }
  }
};
```



### 5.3. Disbursement Processing Handler

**File:** `utils/disbursementProcessing.ts` (NEW)

```typescript
export const processDisbursement = async (loan: Loan): Promise<boolean> => {
  try {
    // Update to DISBURSEMENT_PROCESSING
    await updateLoanStatus(loan.id, 'DISBURSEMENT_PROCESSING', {
      processingStartedAt: new Date().toISOString()
    });
    
    // Simulate bank transfer (in real system, call bank API)
    const success = await transferFunds(loan);
    
    if (success) {
      await updateLoanStatus(loan.id, 'DISBURSED', {
        disbursedAt: new Date().toISOString()
      });
      return true;
    } else {
      await updateLoanStatus(loan.id, 'DISBURSEMENT_FAILED', {
        failedAt: new Date().toISOString(),
        failureReason: 'Bank transfer failed'
      });
      return false;
    }
  } catch (error) {
    await updateLoanStatus(loan.id, 'DISBURSEMENT_FAILED', {
      failedAt: new Date().toISOString(),
      failureReason: error.message
    });
    return false;
  }
};

export const checkProcessingTimeout = (loan: Loan): boolean => {
  if (loan.status !== 'DISBURSEMENT_PROCESSING') return false;
  
  const startTime = new Date(loan.processing_started_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff > 24; // 24 hours timeout
};
```

## 6. Validation Rules

### 6.1. Status Transition Validation

```typescript
export const validateTransition = (
  fromStatus: CanonicalLoanStatus,
  toStatus: CanonicalLoanStatus,
  userRole: UserRole,
  loan: Loan
): { valid: boolean; error?: string } => {
  // Check if transition exists
  const allowedTransitions = getAllowedTransitions(fromStatus, userRole, loan);
  const transition = allowedTransitions.find(t => t.toStatus === toStatus);
  
  if (!transition) {
    return {
      valid: false,
      error: `Không thể chuyển từ ${fromStatus} sang ${toStatus}`
    };
  }
  
  // Check role permission
  if (!transition.allowedRoles.includes(userRole)) {
    return {
      valid: false,
      error: `Role ${userRole} không có quyền thực hiện hành động này`
    };
  }
  
  // Check conditions
  if (transition.conditions) {
    for (const condition of transition.conditions) {
      if (condition === 'loan_type === "DEVICE"' && loan.loan_type !== 'DEVICE') {
        return {
          valid: false,
          error: 'Chỉ áp dụng cho khoản vay thiết bị'
        };
      }
      if (condition === 'loan_type === "COLLATERAL"' && loan.loan_type !== 'COLLATERAL') {
        return {
          valid: false,
          error: 'Chỉ áp dụng cho khoản vay tài sản đảm bảo'
        };
      }
    }
  }
  
  return { valid: true };
};
```

