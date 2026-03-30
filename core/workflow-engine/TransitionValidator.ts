import { CanonicalLoanStatus, LoanApplication, User } from '../../types';
import { storageService } from '../../services/storageService';
import { WorkflowTransition } from './WorkflowEngine';

/**
 * TransitionValidator - Validates loan status transitions
 * Checks: frozen state, role permissions, conditions, approval requirements, branch limits
 */
export class TransitionValidator {
  private transitions: WorkflowTransition[] = [];

  constructor() {
    this.loadTransitions();
  }

  /**
   * Validate if transition is allowed
   */
  async validate(
    loan: LoanApplication,
    toStatus: CanonicalLoanStatus,
    user: User,
    metadata?: any
  ): Promise<void> {
    // 1. Check if loan is frozen
    if (loan.is_frozen) {
      throw new Error(
        `Loan is frozen: ${loan.frozen_reason}. Cannot perform transitions.`
      );
    }

    // 2. Find valid transition
    const transition = await this.findTransition(
      loan.status as CanonicalLoanStatus,
      toStatus,
      user.role,
      loan
    );

    if (!transition) {
      throw new Error(
        `Invalid transition: ${loan.status} → ${toStatus} for role ${user.role}`
      );
    }

    // 3. Check approval requirement
    if (transition.requires_approval && !metadata?.approved_by) {
      throw new Error(
        `Transition ${loan.status} → ${toStatus} requires approval`
      );
    }

    // 4. Check branch limits (for credit approval)
    if (toStatus === 'CREDIT_APPROVED') {
      await this.validateBranchLimit(loan, user);
    }
  }

  /**
   * Get all allowed transitions for loan and user
   */
  async getAllowedTransitions(
    loan: LoanApplication,
    user: User
  ): Promise<CanonicalLoanStatus[]> {
    if (loan.is_frozen) {
      return []; // No transitions allowed when frozen
    }

    const allowed: CanonicalLoanStatus[] = [];

    for (const transition of this.transitions) {
      if (
        transition.from_status === loan.status &&
        transition.active &&
        transition.allowed_roles.includes(user.role) &&
        this.checkConditions(transition.conditions, loan)
      ) {
        allowed.push(transition.to_status);
      }
    }

    return allowed;
  }

  /**
   * Find matching transition
   */
  private async findTransition(
    fromStatus: CanonicalLoanStatus,
    toStatus: CanonicalLoanStatus,
    userRole: string,
    loan: LoanApplication
  ): Promise<WorkflowTransition | null> {
    const candidates = this.transitions.filter(
      t =>
        t.from_status === fromStatus &&
        t.to_status === toStatus &&
        t.active &&
        t.allowed_roles.includes(userRole)
    );

    // Check conditions
    for (const transition of candidates) {
      if (this.checkConditions(transition.conditions, loan)) {
        return transition;
      }
    }

    return null;
  }

  /**
   * Check transition conditions
   */
  private checkConditions(
    conditions: Record<string, any> | undefined,
    loan: LoanApplication
  ): boolean {
    if (!conditions) return true;

    for (const [key, value] of Object.entries(conditions)) {
      if ((loan as any)[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate branch approval limits
   */
  private async validateBranchLimit(loan: LoanApplication, user: User): Promise<void> {
    // Get branch limits from config
    const branches = await storageService.getBranches();
    const branch = branches.find(b => b.id === loan.branchId || b.id === user.id);

    if (!branch) {
      // No branch limit check if branch not found
      return;
    }

    // Check if amount exceeds branch limit
    if (loan.loanAmount > branch.approvalLimit) {
      // Require head office approval
      if (!loan.approved_by_head_office) {
        throw new Error(
          `Loan amount ${loan.loanAmount.toLocaleString()} VND exceeds branch limit ${branch.approvalLimit.toLocaleString()} VND. Head office approval required.`
        );
      }
    }
  }

  /**
   * Load transitions from storage (data-driven)
   */
  private loadTransitions(): void {
    const stored = storageService.getWorkflowTransitions();

    if (stored && stored.length > 0) {
      this.transitions = stored;
    } else {
      // Initialize with default transitions
      this.transitions = this.getDefaultTransitions();
      storageService.saveWorkflowTransitions(this.transitions);
    }
  }

  /**
   * Reload transitions (for when they're updated)
   */
  reloadTransitions(): void {
    this.loadTransitions();
  }

  /**
   * Default transitions (fallback)
   */
  private getDefaultTransitions(): WorkflowTransition[] {
    return [
      // Application phase
      {
        id: 'trans-1',
        from_status: 'DRAFT',
        to_status: 'SUBMITTED',
        allowed_roles: ['cskh', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      {
        id: 'trans-2',
        from_status: 'SUBMITTED',
        to_status: 'UNDER_ASSESSMENT',
        allowed_roles: ['cskh', 'admin', 'assessment'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-3',
        from_status: 'UNDER_ASSESSMENT',
        to_status: 'ASSESSMENT_APPROVED',
        allowed_roles: ['assessment', 'admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      {
        id: 'trans-4',
        from_status: 'UNDER_ASSESSMENT',
        to_status: 'NEED_ADDITIONAL_INFO',
        allowed_roles: ['assessment', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      {
        id: 'trans-5',
        from_status: 'NEED_ADDITIONAL_INFO',
        to_status: 'SUBMITTED',
        allowed_roles: ['cskh', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      // Credit decision
      {
        id: 'trans-6',
        from_status: 'ASSESSMENT_APPROVED',
        to_status: 'CREDIT_APPROVED',
        allowed_roles: ['admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      // Collateral verification - Device
      {
        id: 'trans-7',
        from_status: 'CREDIT_APPROVED',
        to_status: 'REQUIRE_DEVICE_LOCK',
        allowed_roles: ['admin', 'system'],
        requires_approval: false,
        conditions: { loanType: 'DEVICE' },
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-8',
        from_status: 'REQUIRE_DEVICE_LOCK',
        to_status: 'DEVICE_LOCKED',
        allowed_roles: ['security', 'admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      // Collateral verification - Other
      {
        id: 'trans-9',
        from_status: 'CREDIT_APPROVED',
        to_status: 'REQUIRE_COLLATERAL_CONFIRMATION',
        allowed_roles: ['admin', 'system'],
        requires_approval: false,
        conditions: { loanType: 'COLLATERAL' },
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-10',
        from_status: 'REQUIRE_COLLATERAL_CONFIRMATION',
        to_status: 'COLLATERAL_CONFIRMED',
        allowed_roles: ['admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      // Contract
      {
        id: 'trans-11',
        from_status: 'DEVICE_LOCKED',
        to_status: 'CONTRACT_SENT',
        allowed_roles: ['admin', 'cskh', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-12',
        from_status: 'COLLATERAL_CONFIRMED',
        to_status: 'CONTRACT_SENT',
        allowed_roles: ['admin', 'cskh', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-13',
        from_status: 'CONTRACT_SENT',
        to_status: 'CONTRACT_SIGNED',
        allowed_roles: ['customer', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      // Disbursement
      {
        id: 'trans-14',
        from_status: 'CONTRACT_SIGNED',
        to_status: 'READY_FOR_DISBURSEMENT',
        allowed_roles: ['admin', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-15',
        from_status: 'READY_FOR_DISBURSEMENT',
        to_status: 'DISBURSEMENT_DRAFTED',
        allowed_roles: ['accountant', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      {
        id: 'trans-16',
        from_status: 'DISBURSEMENT_DRAFTED',
        to_status: 'DISBURSEMENT_APPROVED',
        allowed_roles: ['admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      {
        id: 'trans-17',
        from_status: 'DISBURSEMENT_APPROVED',
        to_status: 'DISBURSEMENT_PROCESSING',
        allowed_roles: ['accountant', 'admin', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-18',
        from_status: 'DISBURSEMENT_PROCESSING',
        to_status: 'DISBURSED',
        allowed_roles: ['accountant', 'admin', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      // Servicing
      {
        id: 'trans-19',
        from_status: 'DISBURSED',
        to_status: 'IN_REPAYMENT',
        allowed_roles: ['accountant', 'admin', 'system'],
        requires_approval: false,
        active: true,
        priority: 1,
        auto_transition: true
      },
      {
        id: 'trans-20',
        from_status: 'IN_REPAYMENT',
        to_status: 'SETTLED',
        allowed_roles: ['accountant', 'collection', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      },
      // Rejection
      {
        id: 'trans-21',
        from_status: 'UNDER_ASSESSMENT',
        to_status: 'REJECTED',
        allowed_roles: ['assessment', 'admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      {
        id: 'trans-22',
        from_status: 'ASSESSMENT_APPROVED',
        to_status: 'REJECTED',
        allowed_roles: ['admin'],
        requires_approval: true,
        active: true,
        priority: 1
      },
      // Cancellation
      {
        id: 'trans-23',
        from_status: 'DRAFT',
        to_status: 'CANCELLED',
        allowed_roles: ['cskh', 'admin'],
        requires_approval: false,
        active: true,
        priority: 1
      }
    ];
  }
}
