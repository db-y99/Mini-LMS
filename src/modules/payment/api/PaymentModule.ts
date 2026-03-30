/**
 * Payment Module - Public API
 * Handles payment processing and repayment schedules
 */

import { LoanApplication } from '@/types';

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference?: string;
  notes?: string;
}

export interface RepaymentSchedule {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paidAmount?: number;
  paidDate?: Date;
}

export class PaymentModule {
  /**
   * Generate repayment schedule for a loan
   */
  async generateSchedule(loan: LoanApplication): Promise<RepaymentSchedule[]> {
    const schedule: RepaymentSchedule[] = [];
    const monthlyPayment = loan.monthlyPayment;
    const startDate = loan.disbursedAt || new Date();

    for (let i = 1; i <= loan.loanDuration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Simple calculation - in production, use proper amortization
      const interestAmount = (loan.loanAmount * loan.interestRate / 100) / 12;
      const principalAmount = monthlyPayment - interestAmount;

      schedule.push({
        id: `${loan.id}-${i}`,
        loanId: loan.id,
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount: monthlyPayment,
        status: 'PENDING'
      });
    }

    return schedule;
  }

  /**
   * Get repayment schedule for a loan
   */
  async getSchedule(loanId: string): Promise<RepaymentSchedule[]> {
    // TODO: Implement storage
    return [];
  }

  /**
   * Record a payment
   */
  async recordPayment(payment: Payment): Promise<Payment> {
    // TODO: Implement payment recording
    return payment;
  }

  /**
   * Get payments for a loan
   */
  async getPayments(loanId: string): Promise<Payment[]> {
    // TODO: Implement storage
    return [];
  }

  /**
   * Calculate overdue amount
   */
  async calculateOverdueAmount(loanId: string): Promise<number> {
    const schedule = await this.getSchedule(loanId);
    const now = new Date();
    
    return schedule
      .filter(s => s.status === 'OVERDUE' || (s.status === 'PENDING' && s.dueDate < now))
      .reduce((sum, s) => sum + (s.totalAmount - (s.paidAmount || 0)), 0);
  }

  /**
   * Get next payment due
   */
  async getNextPaymentDue(loanId: string): Promise<RepaymentSchedule | null> {
    const schedule = await this.getSchedule(loanId);
    const pending = schedule.filter(s => s.status === 'PENDING');
    
    if (pending.length === 0) return null;
    
    return pending.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  }
}

// Export singleton instance
export const paymentModule = new PaymentModule();
