export const STATUS_GROUPS = {
  application: [
    'DRAFT',
    'SUBMITTED',
    'UNDER_ASSESSMENT',
    'NEED_ADDITIONAL_INFO',
    'ASSESSMENT_APPROVED'
  ],
  creditDecision: [
    'CREDIT_APPROVED' // + approval_level attribute
  ],
  collateral: [
    'REQUIRE_DEVICE_LOCK',
    'DEVICE_LOCKED',
    'REQUIRE_COLLATERAL_CONFIRMATION',
    'COLLATERAL_CONFIRMED'
  ],
  contract: [
    'CONTRACT_SENT', // + is_expired computed
    'CONTRACT_SIGNED'
  ],
  disbursement: [
    'READY_FOR_DISBURSEMENT',
    'DISBURSEMENT_DRAFTED',
    'DISBURSEMENT_APPROVED',
    'DISBURSEMENT_PROCESSING',
    'DISBURSEMENT_FAILED',
    'DISBURSED'
  ],
  servicing: [
    'IN_REPAYMENT', // + dpd, overdue_level computed
    'RESTRUCTURED',
    'COLLECTION_IN_PROGRESS'
  ],
  resolution: [
    'SETTLED',
    'WRITE_OFF', // + recovery_status attribute
    'BAD_DEBT',
    'CANCELLED',
    'REJECTED' // + rejection_stage attribute
  ]
} as const;

export type CanonicalLoanStatus = typeof STATUS_GROUPS[keyof typeof STATUS_GROUPS][number];

// Legacy statuses kept for backward compatibility with existing UI logic.
export type LegacyLoanStatus =
  | 'draft'
  | 'pending_cskh'
  | 'pending_cskh_supplement'
  | 'pending_assessment'
  | 'pending_security'
  | 'pending_admin'
  | 'pending_disbursement'
  | 'disbursed'
  | 'rejected'
  | 'cancelled';

export type LoanStatus = CanonicalLoanStatus | LegacyLoanStatus;

export const STATUS_LABELS: Record<CanonicalLoanStatus, string> = {
  // Application phase
  DRAFT: 'Nháp',
  SUBMITTED: 'Đã gửi',
  UNDER_ASSESSMENT: 'Đang thẩm định',
  NEED_ADDITIONAL_INFO: 'Yêu cầu bổ sung hồ sơ',
  ASSESSMENT_APPROVED: 'Thẩm định đạt',
  
  // Credit decision
  CREDIT_APPROVED: 'Duyệt tín dụng',
  
  // Collateral verification
  REQUIRE_DEVICE_LOCK: 'Yêu cầu khóa thiết bị',
  DEVICE_LOCKED: 'Thiết bị đã khóa',
  REQUIRE_COLLATERAL_CONFIRMATION: 'Yêu cầu xác nhận TSĐB',
  COLLATERAL_CONFIRMED: 'Tài sản đảm bảo đã xác nhận',
  
  // Contract
  CONTRACT_SENT: 'Đã gửi hợp đồng',
  CONTRACT_SIGNED: 'Đã ký hợp đồng',
  
  // Disbursement
  READY_FOR_DISBURSEMENT: 'Sẵn sàng giải ngân',
  DISBURSEMENT_DRAFTED: 'Lập lệnh giải ngân',
  DISBURSEMENT_APPROVED: 'Lệnh giải ngân đã duyệt',
  DISBURSEMENT_PROCESSING: 'Đang xử lý giải ngân',
  DISBURSEMENT_FAILED: 'Giải ngân thất bại',
  DISBURSED: 'Đã giải ngân',
  
  // Servicing
  IN_REPAYMENT: 'Đang trả nợ',
  RESTRUCTURED: 'Tái cấu trúc nợ',
  COLLECTION_IN_PROGRESS: 'Đang thu hồi',
  
  // Resolution
  SETTLED: 'Đã tất toán',
  WRITE_OFF: 'Xóa nợ',
  BAD_DEBT: 'Nợ xấu',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy'
};

// Mapping legacy statuses to canonical equivalents
const legacyToCanonicalMap: Partial<Record<LegacyLoanStatus, CanonicalLoanStatus>> = {
  draft: 'DRAFT',
  pending_cskh: 'SUBMITTED',
  pending_cskh_supplement: 'NEED_ADDITIONAL_INFO',
  pending_assessment: 'UNDER_ASSESSMENT',
  pending_security: 'REQUIRE_DEVICE_LOCK',
  pending_admin: 'ASSESSMENT_APPROVED',
  pending_disbursement: 'READY_FOR_DISBURSEMENT',
  disbursed: 'DISBURSED',
  rejected: 'BAD_DEBT', // best-effort mapping
  cancelled: 'BAD_DEBT' // best-effort mapping
};

// Mapping canonical back to a legacy-friendly label for current UI (best-effort)
const canonicalToLegacyMap: Partial<Record<CanonicalLoanStatus, LegacyLoanStatus>> = {
  DRAFT: 'draft',
  SUBMITTED: 'pending_cskh',
  UNDER_ASSESSMENT: 'pending_assessment',
  NEED_ADDITIONAL_INFO: 'pending_cskh_supplement',
  ASSESSMENT_APPROVED: 'pending_admin',
  CREDIT_APPROVED: 'pending_admin',
  REQUIRE_DEVICE_LOCK: 'pending_security',
  DEVICE_LOCKED: 'pending_admin',
  REQUIRE_COLLATERAL_CONFIRMATION: 'pending_admin',
  COLLATERAL_CONFIRMED: 'pending_admin',
  CONTRACT_SENT: 'pending_admin',
  CONTRACT_SIGNED: 'pending_disbursement',
  READY_FOR_DISBURSEMENT: 'pending_disbursement',
  DISBURSEMENT_DRAFTED: 'pending_disbursement',
  DISBURSEMENT_APPROVED: 'pending_disbursement',
  DISBURSEMENT_PROCESSING: 'pending_disbursement',
  DISBURSEMENT_FAILED: 'pending_disbursement',
  DISBURSED: 'disbursed',
  IN_REPAYMENT: 'disbursed',
  RESTRUCTURED: 'disbursed',
  COLLECTION_IN_PROGRESS: 'disbursed',
  SETTLED: 'disbursed',
  WRITE_OFF: 'disbursed',
  BAD_DEBT: 'disbursed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const normalizeStatus = (status: LoanStatus): CanonicalLoanStatus => {
  if (status in legacyToCanonicalMap) {
    return legacyToCanonicalMap[status as LegacyLoanStatus] ?? 'DRAFT';
  }
  return status as CanonicalLoanStatus;
};

export const toLegacyStatus = (status: CanonicalLoanStatus): LoanStatus => {
  return canonicalToLegacyMap[status] ?? status;
};

export const isCanonicalStatus = (status: LoanStatus): status is CanonicalLoanStatus => {
  return Object.values(STATUS_GROUPS).flat().includes(status as CanonicalLoanStatus);
};

export const matchesStatus = (status: LoanStatus, candidates: LoanStatus[]): boolean => {
  const canonical = normalizeStatus(status);
  return candidates.some(candidate => normalizeStatus(candidate) === canonical);
};

