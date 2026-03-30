import { CanonicalLoanStatus, LoanApplication, User } from '../../types';
import { storageService } from '../../services/storageService';
import { updateLoanComputedFields } from '../../utils/loanComputedFields';
import { loanVersioningService } from '../services/LoanVersioningService';
import { eventLogger } from '../services/EventLogger';

/**
 * Transition Metadata
 */
export interface TransitionMetadata {
  reason?: string;
  notes?: string;
  approved_by?: string;
  approval_notes?: string;
  create_version?: boolean;
  ip_address?: string;
  user_agent?: string;
  [key: string]: any;
}

/**
 * Workflow Transition Definition
 */
export interface WorkflowTransition {
  id: string;
  from_status: CanonicalLoanStatus;
  to_status: CanonicalLoanStatus;
  allowed_roles: string[];
  requires_approval: boolean;
  conditions?: Record<string, any>;
  priority: number;
  active: boolean;
  auto_transition?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * WorkflowEngine - Core workflow management
 * Data-driven state machine with validation, execution, and logging
 */
export class WorkflowEngine {
  private transitions: WorkflowTransition[] = [];
  private initialized: boolean = false;

  constructor() {
    // Lazy initialization to avoid server-side localStorage access
  }

  /**
   * Initialize workflow engine - load transitions from storage
   */
  private initialize(): void {
    if (this.initialized) return;

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      // Server-side: use default transitions only
      this.transitions = this.getDefaultTransitions();
      this.initialized = true;
      return;
    }

    // Client-side: load from storage
    const stored = storageService.getWorkflowTransitions();
    
    if (stored && stored.length > 0) {
      this.transitions = stored;
    } else {
      // Initialize with default transitions from state-machine
      this.transitions = this.getDefaultTransitions();
      storageService.saveWorkflowTransitions(this.transitions);
    }

    this.initialized = true;
  }

  /**
   * Transition loan to new status
   * Main entry point for all status changes
   */
  async transition(
    loanId: string,
    toStatus: CanonicalLoanStatus,
    user: User,
    metadata?: TransitionMetadata
  ): Promise<void> {
    this.initialize(); // Ensure initialized
    // 1. Load loan
    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    // 2. Validate frozen state
    if (loan.is_frozen) {
      throw new Error(
        `Loan is frozen: ${loan.frozen_reason || 'Unknown reason'}. Cannot perform transitions.`
      );
    }

    // 3. Find valid transition
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

    // 4. Check approval requirement
    if (transition.requires_approval && !metadata?.approved_by) {
      throw new Error(
        `Transition ${loan.status} → ${toStatus} requires approval`
      );
    }

    // 5. Execute transition (atomic)
    await this.executeTransition(loan, toStatus, user, metadata, transition);
  }

  /**
   * Get allowed transitions for current loan and user
   */
  async getAllowedTransitions(
    loanId: string,
    user: User
  ): Promise<CanonicalLoanStatus[]> {
    this.initialize(); // Ensure initialized
    const loan = await this.getLoan(loanId);
    if (!loan) return [];

    // Cannot transition if frozen
    if (loan.is_frozen) return [];

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
   * Check if loan can transition to status
   */
  async canTransition(
    loanId: string,
    toStatus: CanonicalLoanStatus,
    user: User
  ): Promise<boolean> {
    try {
      this.initialize(); // Ensure initialized
      const loan = await this.getLoan(loanId);
      if (!loan || loan.is_frozen) return false;

      const transition = await this.findTransition(
        loan.status as CanonicalLoanStatus,
        toStatus,
        user.role,
        loan
      );

      return transition !== null;
    } catch {
      return false;
    }
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
   * Execute transition (atomic operation)
   */
  private async executeTransition(
    loan: LoanApplication,
    toStatus: CanonicalLoanStatus,
    user: User,
    metadata: TransitionMetadata | undefined,
    transition: WorkflowTransition
  ): Promise<void> {
    const oldStatus = loan.status;
    const oldLoan = { ...loan }; // Keep old state for versioning
    const correlationId = this.generateUUID(); // For tracking related events

    try {
      // Update loan status
      loan.status = toStatus;
      loan.updatedAt = new Date();

      // Update computed fields
      const updatedLoan = updateLoanComputedFields(loan);

      // Handle special status updates
      this.handleSpecialStatusUpdates(updatedLoan, toStatus, metadata);

      // Check if should create version
      const versionCheck = loanVersioningService.shouldCreateVersion(oldLoan, updatedLoan);
      
      if (versionCheck.should || metadata?.create_version) {
        await loanVersioningService.createVersion(
          updatedLoan,
          versionCheck.type || 'status_change',
          metadata?.reason || versionCheck.reason || `Status changed to ${toStatus}`,
          user
        );
        
        // Log version creation event
        await eventLogger.log(
          updatedLoan.id,
          'VERSION_CREATED',
          {
            version: updatedLoan.version,
            version_type: versionCheck.type || 'status_change',
            reason: metadata?.reason || versionCheck.reason
          },
          user,
          {
            correlation_id: correlationId,
            description: `Tạo phiên bản ${updatedLoan.version}`
          }
        );
      }

      // Save loan
      await storageService.saveLoan(updatedLoan);

      // Log status change in audit (existing)
      await this.logStatusChange(
        updatedLoan,
        oldStatus as CanonicalLoanStatus,
        toStatus,
        user,
        metadata,
        transition
      );

      // Log status change event (new - EventLogger)
      await eventLogger.logStatusChange(
        updatedLoan.id,
        oldStatus as CanonicalLoanStatus,
        toStatus,
        user,
        metadata?.reason,
        {
          transition_id: transition.id,
          requires_approval: transition.requires_approval,
          approved_by: metadata?.approved_by,
          correlation_id: correlationId,
          ip_address: metadata?.ip_address,
          user_agent: metadata?.user_agent
        }
      );

      // Log special status events
      await this.logSpecialStatusEvents(updatedLoan, toStatus, user, correlationId);

      // Handle auto-transitions
      if (this.shouldAutoTransition(toStatus, updatedLoan)) {
        const nextStatus = this.getAutoTransitionTarget(toStatus, updatedLoan);
        if (nextStatus) {
          // Recursive call for auto-transition
          await this.transition(updatedLoan.id, nextStatus, user, {
            ...metadata,
            reason: `Auto-transition from ${toStatus}`,
            auto_transition: true,
            correlation_id: correlationId // Link related events
          });
        }
      }
    } catch (error) {
      // Log failed transition
      await eventLogger.log(
        loan.id,
        'STATUS_CHANGE_FAILED',
        {
          from_status: oldStatus,
          to_status: toStatus,
          error: error instanceof Error ? error.message : String(error)
        },
        user,
        {
          correlation_id: correlationId,
          description: `Thay đổi trạng thái thất bại: ${error instanceof Error ? error.message : String(error)}`
        }
      );
      
      throw error;
    }
  }

  /**
   * Handle special status-specific updates
   */
  private handleSpecialStatusUpdates(
    loan: LoanApplication,
    toStatus: CanonicalLoanStatus,
    metadata?: TransitionMetadata
  ): void {
    switch (toStatus) {
      case 'CONTRACT_SENT':
        loan.contract_sent_at = new Date();
        loan.contract_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;

      case 'CONTRACT_SIGNED':
        // Clear expiry
        loan.is_expired = false;
        break;

      case 'DISBURSEMENT_PROCESSING':
        loan.disbursement_processing_started_at = new Date();
        break;

      case 'DISBURSED':
        loan.disbursedAt = new Date();
        break;

      case 'REJECTED':
        loan.rejectedAt = new Date();
        if (metadata?.rejection_stage) {
          loan.rejection_stage = metadata.rejection_stage;
        }
        if (metadata?.reason) {
          loan.rejectionReason = metadata.reason;
        }
        break;

      case 'CREDIT_APPROVED':
        if (metadata?.approval_level) {
          loan.approval_level = metadata.approval_level;
        }
        if (metadata?.approved_by_branch) {
          loan.approved_by_branch = metadata.approved_by_branch;
        }
        if (metadata?.approved_by_head_office) {
          loan.approved_by_head_office = metadata.approved_by_head_office;
        }
        break;

      case 'WRITE_OFF':
        if (metadata?.recovery_status) {
          loan.recovery_status = metadata.recovery_status;
        }
        break;
    }
  }

  /**
   * Check if should auto-transition
   */
  private shouldAutoTransition(
    status: CanonicalLoanStatus,
    loan: LoanApplication
  ): boolean {
    const autoTransitionStatuses: CanonicalLoanStatus[] = [
      'CREDIT_APPROVED', // → REQUIRE_DEVICE_LOCK or REQUIRE_COLLATERAL_CONFIRMATION
      'DEVICE_LOCKED', // → CONTRACT_SENT
      'COLLATERAL_CONFIRMED', // → CONTRACT_SENT
      'CONTRACT_SIGNED', // → READY_FOR_DISBURSEMENT
      'DISBURSEMENT_APPROVED', // → DISBURSEMENT_PROCESSING
      'DISBURSEMENT_PROCESSING', // → DISBURSED (when successful)
      'DISBURSED', // → IN_REPAYMENT
      'RESTRUCTURED' // → IN_REPAYMENT
    ];

    return autoTransitionStatuses.includes(status);
  }

  /**
   * Get auto-transition target
   */
  private getAutoTransitionTarget(
    status: CanonicalLoanStatus,
    loan: LoanApplication
  ): CanonicalLoanStatus | null {
    switch (status) {
      case 'CREDIT_APPROVED':
        return loan.loanType === 'DEVICE' 
          ? 'REQUIRE_DEVICE_LOCK' 
          : 'REQUIRE_COLLATERAL_CONFIRMATION';

      case 'DEVICE_LOCKED':
      case 'COLLATERAL_CONFIRMED':
        return 'CONTRACT_SENT';

      case 'CONTRACT_SIGNED':
        return 'READY_FOR_DISBURSEMENT';

      case 'DISBURSEMENT_APPROVED':
        return 'DISBURSEMENT_PROCESSING';

      case 'DISBURSED':
        return 'IN_REPAYMENT';

      case 'RESTRUCTURED':
        return 'IN_REPAYMENT';

      default:
        return null;
    }
  }

  /**
   * Log special status events
   */
  private async logSpecialStatusEvents(
    loan: LoanApplication,
    toStatus: CanonicalLoanStatus,
    user: User,
    correlationId: string
  ): Promise<void> {
    const status = toStatus as CanonicalLoanStatus | 'LOAN_FROZEN' | 'WRITE_OFF';
    switch (status) {
      case 'SUBMITTED':
        await eventLogger.log(
          loan.id,
          'LOAN_CREATED',
          { loan_amount: loan.loanAmount, loan_type: loan.loanType },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'UNDER_ASSESSMENT':
        await eventLogger.log(
          loan.id,
          'ASSESSMENT_STARTED',
          { assessor: user.fullName },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'ASSESSMENT_APPROVED':
        await eventLogger.log(
          loan.id,
          'ASSESSMENT_COMPLETED',
          { result: 'approved' },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'CREDIT_APPROVED':
        await eventLogger.logApproval(
          loan.id,
          'credit',
          loan.approval_level || 'pending',
          user,
          'Credit approval granted'
        );
        break;

      case 'DEVICE_LOCKED':
        await eventLogger.log(
          loan.id,
          'DEVICE_LOCKED',
          { device_type: loan.collateralType },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'COLLATERAL_CONFIRMED':
        await eventLogger.log(
          loan.id,
          'COLLATERAL_VERIFIED',
          { collateral_type: loan.collateralType },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'CONTRACT_SENT':
        await eventLogger.log(
          loan.id,
          'CONTRACT_SENT',
          { 
            sent_at: loan.contract_sent_at,
            expires_at: loan.contract_expires_at
          },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'CONTRACT_SIGNED':
        await eventLogger.log(
          loan.id,
          'CONTRACT_SIGNED',
          { signed_at: new Date().toISOString() },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'DISBURSEMENT_PROCESSING':
        await eventLogger.log(
          loan.id,
          'DISBURSEMENT_PROCESSING',
          { 
            amount: loan.loanAmount,
            started_at: loan.disbursement_processing_started_at
          },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'DISBURSED':
        await eventLogger.logDisbursement(
          loan.id,
          loan.loanAmount,
          'N/A', // Bank account would come from metadata
          user,
          'completed'
        );
        break;

      case 'REJECTED':
        await eventLogger.logRejection(
          loan.id,
          loan.rejection_stage || 'unknown',
          loan.rejectionReason || 'No reason provided',
          user
        );
        break;

      case 'LOAN_FROZEN':
        if (loan.is_frozen) {
          await eventLogger.logFreeze(
            loan.id,
            loan.frozen_reason || 'No reason provided',
            user
          );
        }
        break;

      case 'WRITE_OFF':
        await eventLogger.log(
          loan.id,
          'WRITE_OFF_COMPLETED',
          { 
            recovery_status: loan.recovery_status,
            amount: loan.loanAmount
          },
          user,
          { correlation_id: correlationId }
        );
        break;

      case 'SETTLED':
        await eventLogger.log(
          loan.id,
          'PAYMENT_RECEIVED',
          { 
            amount: loan.totalPayment,
            status: 'settled'
          },
          user,
          { correlation_id: correlationId, description: 'Khoản vay đã thanh toán đầy đủ' }
        );
        break;
    }
  }

  /**
   * Log status change to audit
   */
  private async logStatusChange(
    loan: LoanApplication,
    fromStatus: CanonicalLoanStatus,
    toStatus: CanonicalLoanStatus,
    user: User,
    metadata: TransitionMetadata | undefined,
    transition: WorkflowTransition
  ): Promise<void> {
    const auditLog = {
      id: this.generateUUID(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'STATUS_CHANGED',
      resourceType: 'loan' as const,
      resourceId: loan.id,
      oldValues: { status: fromStatus },
      newValues: { status: toStatus },
      ipAddress: metadata?.ip_address,
      userAgent: metadata?.user_agent,
      timestamp: new Date(),
      metadata: {
        transition_id: transition.id,
        requires_approval: transition.requires_approval,
        approved_by: metadata?.approved_by,
        reason: metadata?.reason,
        notes: metadata?.notes
      }
    };

    await storageService.saveAuditLog(auditLog);
  }

  /**
   * Get loan from storage
   */
  private async getLoan(loanId: string): Promise<LoanApplication | null> {
    const loans = await storageService.getLoans();
    return loans.find(l => l.id === loanId) || null;
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get default transitions from state-machine
   */
  private getDefaultTransitions(): WorkflowTransition[] {
    const { STATE_TRANSITIONS } = require('../../state-machine/transitions');
    
    return STATE_TRANSITIONS.map((t: any, index: number) => ({
      id: `trans-${index + 1}`,
      from_status: t.fromStatus,
      to_status: t.toStatus,
      allowed_roles: t.allowedRoles,
      requires_approval: t.requiresApproval,
      conditions: t.conditions ? this.parseConditions(t.conditions) : undefined,
      priority: 1,
      active: true,
      auto_transition: t.autoTransition || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Parse condition strings to objects
   */
  private parseConditions(conditions: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const condition of conditions) {
      // Parse "loan_type === 'DEVICE'" to { loan_type: 'DEVICE' }
      const match = condition.match(/(\w+)\s*===\s*["'](\w+)["']/);
      if (match) {
        result[match[1]] = match[2];
      }
    }
    
    return result;
  }

  /**
   * Reload transitions from storage
   */
  reloadTransitions(): void {
    this.initialized = false;
    this.initialize();
  }

  /**
   * Get all transitions (for admin UI)
   */
  getAllTransitions(): WorkflowTransition[] {
    this.initialize(); // Ensure initialized
    return [...this.transitions];
  }

  /**
   * Update transition (for admin UI)
   */
  async updateTransition(
    transitionId: string,
    updates: Partial<WorkflowTransition>
  ): Promise<boolean> {
    const index = this.transitions.findIndex(t => t.id === transitionId);
    if (index === -1) return false;

    this.transitions[index] = {
      ...this.transitions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return storageService.saveWorkflowTransitions(this.transitions);
  }

  /**
   * Add new transition (for admin UI)
   */
  async addTransition(transition: Omit<WorkflowTransition, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const newTransition: WorkflowTransition = {
      ...transition,
      id: this.generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.transitions.push(newTransition);
    return storageService.saveWorkflowTransitions(this.transitions);
  }

  /**
   * Delete transition (for admin UI)
   */
  async deleteTransition(transitionId: string): Promise<boolean> {
    this.transitions = this.transitions.filter(t => t.id !== transitionId);
    return storageService.saveWorkflowTransitions(this.transitions);
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
