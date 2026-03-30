/**
 * Loan Module - Public API
 * This is the ONLY interface other modules should use to interact with Loan domain
 */

import { LoanApplication } from '@/types';
import { storageService } from '@/services/storageService';

export class LoanModule {
  /**
   * Get loan by ID
   */
  async getLoan(loanId: string): Promise<LoanApplication | null> {
    const loans = await storageService.getLoans();
    return loans.find(loan => loan.id === loanId) || null;
  }

  /**
   * Get all loans
   */
  async getLoans(): Promise<LoanApplication[]> {
    return storageService.getLoans();
  }

  /**
   * Get loans by branch
   */
  async getLoansByBranch(branchId: string): Promise<LoanApplication[]> {
    const loans = await storageService.getLoans();
    return loans.filter(loan => loan.branchId === branchId);
  }

  /**
   * Get loans by customer
   */
  async getLoansByCustomer(customerId: string): Promise<LoanApplication[]> {
    const loans = await storageService.getLoans();
    return loans.filter(loan => loan.customerId === customerId);
  }

  /**
   * Get loans by status
   */
  async getLoansByStatus(status: string): Promise<LoanApplication[]> {
    const loans = await storageService.getLoans();
    return loans.filter(loan => loan.status === status);
  }

  /**
   * Create new loan
   */
  async createLoan(loan: LoanApplication): Promise<LoanApplication> {
    await storageService.saveLoan(loan);
    return loan;
  }

  /**
   * Update loan
   */
  async updateLoan(loanId: string, updates: Partial<LoanApplication>): Promise<LoanApplication> {
    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    const updatedLoan = {
      ...loan,
      ...updates,
      updatedAt: new Date()
    };

    await storageService.saveLoan(updatedLoan);
    return updatedLoan;
  }

  /**
   * Delete loan
   */
  async deleteLoan(loanId: string): Promise<boolean> {
    return storageService.deleteLoan(loanId);
  }

  /**
   * Check if loan exists
   */
  async loanExists(loanId: string): Promise<boolean> {
    const loan = await this.getLoan(loanId);
    return loan !== null;
  }

  /**
   * Get loan count by status
   */
  async getLoanCountByStatus(status: string): Promise<number> {
    const loans = await this.getLoansByStatus(status);
    return loans.length;
  }
}

// Export singleton instance
export const loanModule = new LoanModule();
