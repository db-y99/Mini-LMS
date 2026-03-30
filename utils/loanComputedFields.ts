/**
 * Loan Computed Fields Utilities
 * Tính toán các trường computed cho loan (DPD, overdue_level, is_expired, etc.)
 */

import { LoanApplication, PaymentSchedule } from '../types';

/**
 * Calculate Days Past Due (DPD)
 * Tính số ngày quá hạn dựa trên payment schedule
 */
export const calculateDPD = (
  loan: LoanApplication,
  paymentSchedule?: PaymentSchedule
): number => {
  // Chỉ tính DPD cho loans đang IN_REPAYMENT
  if (loan.status !== 'IN_REPAYMENT' && loan.status !== 'COLLECTION_IN_PROGRESS') {
    return 0;
  }

  if (!paymentSchedule || !paymentSchedule.items) {
    return 0;
  }

  // Tìm kỳ trả tiếp theo chưa thanh toán
  const today = new Date();
  const nextUnpaidInstallment = paymentSchedule.items.find(
    item => item.status === 'pending' || item.status === 'overdue'
  );

  if (!nextUnpaidInstallment) {
    return 0; // Đã trả hết
  }

  const dueDate = new Date(nextUnpaidInstallment.dueDate);

  // Nếu chưa đến hạn
  if (today <= dueDate) {
    return 0;
  }

  // Tính số ngày quá hạn
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Calculate Overdue Level based on DPD
 * Tính mức độ quá hạn dựa trên số ngày quá hạn
 */
export const calculateOverdueLevel = (
  dpd: number
): 'none' | 'minor' | 'severe' | 'collection' => {
  if (dpd === 0) return 'none';
  if (dpd <= 30) return 'minor'; // 1-30 days
  if (dpd <= 90) return 'severe'; // 31-90 days
  return 'collection'; // >90 days
};

/**
 * Check if contract is expired
 * Kiểm tra hợp đồng có hết hạn không (7 ngày sau khi gửi)
 */
export const isContractExpired = (loan: LoanApplication): boolean => {
  if (loan.status !== 'CONTRACT_SENT') {
    return false;
  }

  if (!loan.contract_sent_at) {
    return false;
  }

  const sentDate = new Date(loan.contract_sent_at);
  const today = new Date();
  const daysDiff = (today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);

  // Hợp đồng hết hạn sau 7 ngày
  return daysDiff > 7;
};

/**
 * Calculate contract expiry date
 * Tính ngày hết hạn hợp đồng (7 ngày sau khi gửi)
 */
export const calculateContractExpiryDate = (
  contractSentAt: Date
): Date => {
  const expiryDate = new Date(contractSentAt);
  expiryDate.setDate(expiryDate.getDate() + 7);
  return expiryDate;
};

/**
 * Get overdue level label in Vietnamese
 */
export const getOverdueLevelLabel = (
  level: 'none' | 'minor' | 'severe' | 'collection'
): string => {
  const labels = {
    none: 'Không quá hạn',
    minor: 'Quá hạn nhẹ (1-30 ngày)',
    severe: 'Quá hạn nặng (31-90 ngày)',
    collection: 'Cần thu hồi (>90 ngày)'
  };
  return labels[level];
};

/**
 * Get approval level label in Vietnamese
 */
export const getApprovalLevelLabel = (
  level?: 'branch' | 'head_office' | 'pending'
): string => {
  if (!level) return 'Chưa duyệt';
  
  const labels = {
    branch: 'Chi nhánh duyệt',
    head_office: 'Trụ sở chính duyệt',
    pending: 'Chờ duyệt'
  };
  return labels[level];
};

/**
 * Get rejection stage label in Vietnamese
 */
export const getRejectionStageLabel = (
  stage?: 'assessment' | 'credit' | 'contract'
): string => {
  if (!stage) return 'Từ chối';
  
  const labels = {
    assessment: 'Từ chối tại thẩm định',
    credit: 'Từ chối tín dụng',
    contract: 'Từ chối hợp đồng'
  };
  return labels[stage];
};

/**
 * Get recovery status label in Vietnamese
 */
export const getRecoveryStatusLabel = (
  status?: 'pending' | 'legal' | 'sold' | 'recovered'
): string => {
  if (!status) return 'Chưa xử lý';
  
  const labels = {
    pending: 'Chờ xử lý',
    legal: 'Thu hồi pháp lý',
    sold: 'Đã bán nợ',
    recovered: 'Đã thu hồi'
  };
  return labels[status];
};

/**
 * Update all computed fields for a loan
 * Cập nhật tất cả các trường computed
 */
export const updateLoanComputedFields = (
  loan: LoanApplication,
  paymentSchedule?: PaymentSchedule
): LoanApplication => {
  const dpd = calculateDPD(loan, paymentSchedule);
  const overdue_level = calculateOverdueLevel(dpd);
  const is_expired = isContractExpired(loan);

  return {
    ...loan,
    dpd,
    overdue_level,
    is_expired
  };
};

/**
 * Check if loan should auto-escalate overdue status
 * Kiểm tra xem loan có cần tự động escalate overdue không
 */
export const shouldAutoEscalateOverdue = (
  loan: LoanApplication
): { shouldEscalate: boolean; newStatus?: string; reason?: string } => {
  const dpd = loan.dpd || 0;
  const currentStatus = loan.status;

  // IN_REPAYMENT → COLLECTION_IN_PROGRESS khi DPD > 90
  if (currentStatus === 'IN_REPAYMENT' && dpd > 90) {
    return {
      shouldEscalate: true,
      newStatus: 'COLLECTION_IN_PROGRESS',
      reason: `Auto-escalated: DPD ${dpd} days (>90)`
    };
  }

  return { shouldEscalate: false };
};

/**
 * Initialize default values for new loan
 */
export const initializeLoanDefaults = (
  loan: Partial<LoanApplication>
): Partial<LoanApplication> => {
  return {
    ...loan,
    version: loan.version || 1,
    dpd: loan.dpd || 0,
    overdue_level: loan.overdue_level || 'none',
    is_expired: loan.is_expired || false,
    is_frozen: loan.is_frozen || false,
    risk_score: loan.risk_score || 0,
    risk_grade: loan.risk_grade || 'C',
    pd: loan.pd || 0,
    lgd: loan.lgd || 0,
    ecl: loan.ecl || 0,
    ecl_stage: loan.ecl_stage || 1
  };
};
