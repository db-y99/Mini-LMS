/**
 * Workflow Module - Public API
 * Handles all workflow and state transitions
 */

import { WorkflowEngine } from '@/core/workflow-engine/WorkflowEngine';
import { CanonicalLoanStatus } from '@/constants/status';
import { User } from '@/types';
import { TransitionMetadata } from '@/core/workflow-engine/WorkflowEngine';

export class WorkflowModule {
  private engine: WorkflowEngine | null = null;

  constructor() {
    // Lazy initialization to avoid server-side localStorage access
  }

  private getEngine(): WorkflowEngine {
    if (!this.engine) {
      this.engine = new WorkflowEngine();
    }
    return this.engine;
  }

  /**
   * Transition loan to new status
   */
  async transitionLoan(
    loanId: string,
    toStatus: CanonicalLoanStatus,
    user: User,
    metadata?: TransitionMetadata
  ): Promise<void> {
    return this.getEngine().transition(loanId, toStatus, user, metadata);
  }

  /**
   * Get available transitions for a loan
   */
  async getAvailableTransitions(
    loanId: string,
    user: User
  ): Promise<CanonicalLoanStatus[]> {
    return this.getEngine().getAllowedTransitions(loanId, user);
  }

  /**
   * Validate if transition is allowed
   */
  async canTransition(
    loanId: string,
    toStatus: CanonicalLoanStatus,
    user: User
  ): Promise<boolean> {
    return this.getEngine().canTransition(loanId, toStatus, user);
  }

  /**
   * Get workflow history for a loan
   */
  async getWorkflowHistory(loanId: string): Promise<any[]> {
    // TODO: Implement workflow history
    return [];
  }

  /**
   * Initialize workflow for new loan
   */
  async initializeWorkflow(loanId: string): Promise<void> {
    // Workflow is initialized when loan is created with DRAFT status
    // No additional action needed
  }
}

// Export singleton instance
export const workflowModule = new WorkflowModule();
