import { CanonicalLoanStatus, LoanStatus, normalizeStatus } from '../constants/status';
import { UserRole } from '../types';

export interface Transition {
  fromStatus: CanonicalLoanStatus;
  toStatus: CanonicalLoanStatus;
  allowedRoles: UserRole[];
  requiresApproval: boolean;
  autoTransition?: boolean;
  conditions?: string[];
}

export const STATE_TRANSITIONS: Transition[] = [
  // ========== PRE-CONTRACT PHASE ==========
  { fromStatus: 'DRAFT', toStatus: 'SUBMITTED', allowedRoles: ['cskh'], requiresApproval: false },
  { fromStatus: 'SUBMITTED', toStatus: 'UNDER_ASSESSMENT', allowedRoles: ['cskh', 'admin', 'assessment'], requiresApproval: false, autoTransition: true },
  { fromStatus: 'UNDER_ASSESSMENT', toStatus: 'NEED_ADDITIONAL_INFO', allowedRoles: ['assessment'], requiresApproval: true },
  { fromStatus: 'NEED_ADDITIONAL_INFO', toStatus: 'SUBMITTED', allowedRoles: ['cskh'], requiresApproval: false },
  { fromStatus: 'UNDER_ASSESSMENT', toStatus: 'ASSESSMENT_APPROVED', allowedRoles: ['assessment'], requiresApproval: true },

  // ========== COLLATERAL/DEVICE PATH ==========
  { fromStatus: 'ASSESSMENT_APPROVED', toStatus: 'CREDIT_APPROVED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'CREDIT_APPROVED', toStatus: 'REQUIRE_DEVICE_LOCK', allowedRoles: ['admin', 'assessment'], requiresApproval: false, autoTransition: true, conditions: ['loan_type === "DEVICE"'] },
  { fromStatus: 'CREDIT_APPROVED', toStatus: 'REQUIRE_COLLATERAL_CONFIRMATION', allowedRoles: ['admin', 'assessment'], requiresApproval: false, autoTransition: true, conditions: ['loan_type === "COLLATERAL"'] },
  { fromStatus: 'REQUIRE_DEVICE_LOCK', toStatus: 'DEVICE_LOCKED', allowedRoles: ['security'], requiresApproval: true },
  { fromStatus: 'REQUIRE_COLLATERAL_CONFIRMATION', toStatus: 'COLLATERAL_CONFIRMED', allowedRoles: ['admin'], requiresApproval: true },

  // ========== CONTRACT PHASE ==========
  { fromStatus: 'DEVICE_LOCKED', toStatus: 'CONTRACT_SENT', allowedRoles: ['admin', 'cskh'], requiresApproval: false },
  { fromStatus: 'COLLATERAL_CONFIRMED', toStatus: 'CONTRACT_SENT', allowedRoles: ['admin', 'cskh'], requiresApproval: false },
  { fromStatus: 'CONTRACT_SENT', toStatus: 'CONTRACT_SIGNED', allowedRoles: ['customer'], requiresApproval: true },

  // ========== DISBURSEMENT PHASE ==========
  { fromStatus: 'CONTRACT_SIGNED', toStatus: 'READY_FOR_DISBURSEMENT', allowedRoles: ['admin'], requiresApproval: false, autoTransition: true },
  { fromStatus: 'READY_FOR_DISBURSEMENT', toStatus: 'DISBURSEMENT_DRAFTED', allowedRoles: ['accountant'], requiresApproval: false },
  { fromStatus: 'DISBURSEMENT_DRAFTED', toStatus: 'DISBURSEMENT_APPROVED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'DISBURSEMENT_APPROVED', toStatus: 'DISBURSEMENT_PROCESSING', allowedRoles: ['accountant', 'admin', 'system'], requiresApproval: false, autoTransition: true },
  { fromStatus: 'DISBURSEMENT_PROCESSING', toStatus: 'DISBURSED', allowedRoles: ['accountant', 'admin', 'system'], requiresApproval: false, autoTransition: true },
  
  // Disbursement failure handling
  { fromStatus: 'DISBURSEMENT_PROCESSING', toStatus: 'DISBURSEMENT_FAILED', allowedRoles: ['accountant', 'admin', 'system'], requiresApproval: false },
  { fromStatus: 'DISBURSEMENT_FAILED', toStatus: 'DISBURSEMENT_DRAFTED', allowedRoles: ['accountant'], requiresApproval: false },
  { fromStatus: 'DISBURSEMENT_FAILED', toStatus: 'READY_FOR_DISBURSEMENT', allowedRoles: ['admin'], requiresApproval: false },

  // ========== REPAYMENT / COLLECTION PHASE ==========
  { fromStatus: 'DISBURSED', toStatus: 'IN_REPAYMENT', allowedRoles: ['accountant', 'admin'], requiresApproval: false, autoTransition: true },
  
  // Normal repayment completion
  { fromStatus: 'IN_REPAYMENT', toStatus: 'SETTLED', allowedRoles: ['accountant', 'collection', 'admin'], requiresApproval: false },
  
  // Restructuring (NEW)
  { fromStatus: 'IN_REPAYMENT', toStatus: 'RESTRUCTURED', allowedRoles: ['admin', 'collection'], requiresApproval: true },
  { fromStatus: 'RESTRUCTURED', toStatus: 'IN_REPAYMENT', allowedRoles: ['admin'], requiresApproval: false, autoTransition: true },
  
  // Collection escalation (system-driven based on DPD)
  { fromStatus: 'IN_REPAYMENT', toStatus: 'COLLECTION_IN_PROGRESS', allowedRoles: ['collection', 'admin', 'system'], requiresApproval: false },
  
  // Collection outcomes
  { fromStatus: 'COLLECTION_IN_PROGRESS', toStatus: 'SETTLED', allowedRoles: ['collection', 'accountant', 'admin'], requiresApproval: false },
  { fromStatus: 'COLLECTION_IN_PROGRESS', toStatus: 'IN_REPAYMENT', allowedRoles: ['collection', 'accountant', 'admin'], requiresApproval: false },
  { fromStatus: 'COLLECTION_IN_PROGRESS', toStatus: 'WRITE_OFF', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'COLLECTION_IN_PROGRESS', toStatus: 'BAD_DEBT', allowedRoles: ['collection', 'admin'], requiresApproval: true },

  // ========== REJECTION FLOWS ==========
  // Can reject at assessment stage
  { fromStatus: 'UNDER_ASSESSMENT', toStatus: 'REJECTED', allowedRoles: ['assessment', 'admin'], requiresApproval: true },
  
  // Can reject at credit decision
  { fromStatus: 'ASSESSMENT_APPROVED', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'CREDIT_APPROVED', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },
  
  // Can reject at security check
  { fromStatus: 'REQUIRE_DEVICE_LOCK', toStatus: 'REJECTED', allowedRoles: ['security', 'admin'], requiresApproval: true },
  
  // Can reject at collateral confirmation
  { fromStatus: 'REQUIRE_COLLATERAL_CONFIRMATION', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },
  
  // Customer can reject contract
  { fromStatus: 'CONTRACT_SENT', toStatus: 'REJECTED', allowedRoles: ['customer', 'admin'], requiresApproval: false },
  
  // Admin can reject at various stages
  { fromStatus: 'DEVICE_LOCKED', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'COLLATERAL_CONFIRMED', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'DISBURSEMENT_DRAFTED', toStatus: 'REJECTED', allowedRoles: ['admin'], requiresApproval: true },

  // ========== CANCELLATION FLOWS ==========
  // Can cancel at early stages
  { fromStatus: 'DRAFT', toStatus: 'CANCELLED', allowedRoles: ['cskh', 'admin'], requiresApproval: false },
  { fromStatus: 'SUBMITTED', toStatus: 'CANCELLED', allowedRoles: ['cskh', 'admin'], requiresApproval: true },
  { fromStatus: 'UNDER_ASSESSMENT', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'NEED_ADDITIONAL_INFO', toStatus: 'CANCELLED', allowedRoles: ['cskh', 'admin'], requiresApproval: false },
  { fromStatus: 'ASSESSMENT_APPROVED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'CREDIT_APPROVED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  
  // Can cancel during collateral/device verification
  { fromStatus: 'REQUIRE_DEVICE_LOCK', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'REQUIRE_COLLATERAL_CONFIRMATION', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'DEVICE_LOCKED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'COLLATERAL_CONFIRMED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  
  // Can cancel during contract phase
  { fromStatus: 'CONTRACT_SENT', toStatus: 'CANCELLED', allowedRoles: ['admin', 'customer'], requiresApproval: true },
  
  // Can cancel before disbursement (but requires high approval)
  { fromStatus: 'CONTRACT_SIGNED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'READY_FOR_DISBURSEMENT', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true },
  { fromStatus: 'DISBURSEMENT_DRAFTED', toStatus: 'CANCELLED', allowedRoles: ['admin'], requiresApproval: true }
];

export const getAllowedTransitions = (currentStatus: LoanStatus, userRole: UserRole, loan?: { loan_type?: string }) => {
  const canonical = normalizeStatus(currentStatus);
  return STATE_TRANSITIONS.filter(transition => {
    if (transition.fromStatus !== canonical) return false;
    if (!transition.allowedRoles.includes(userRole)) return false;
    if (transition.conditions && loan) {
      for (const condition of transition.conditions) {
        if (condition === 'loan_type === "DEVICE"' && loan.loan_type !== 'DEVICE') return false;
        if (condition === 'loan_type === "COLLATERAL"' && loan.loan_type !== 'COLLATERAL') return false;
      }
    }
    return true;
  });
};

