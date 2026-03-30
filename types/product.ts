/**
 * Loan Product Types
 */

export interface LoanProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  
  // Loan terms
  minAmount: number;
  maxAmount: number;
  minDuration: number; // months
  maxDuration: number; // months
  
  // Interest rates
  interestRate: number; // annual percentage
  interestType: 'fixed' | 'variable';
  
  // Fees
  processingFee: number; // percentage
  lateFee: number; // percentage per day
  earlyRepaymentFee: number; // percentage
  
  // Collateral
  collateralRequired: boolean;
  collateralTypes: string[]; // ['phone', 'motorbike', 'car', 'property']
  minCollateralValue: number; // percentage of loan amount
  
  // Eligibility
  minAge: number;
  maxAge: number;
  minIncome: number;
  minCreditScore: number;
  
  // Status
  isActive: boolean;
  isPublic: boolean; // visible to customers
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateLoanProductDTO {
  code: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  interestRate: number;
  interestType: 'fixed' | 'variable';
  processingFee: number;
  lateFee: number;
  earlyRepaymentFee: number;
  collateralRequired: boolean;
  collateralTypes: string[];
  minCollateralValue: number;
  minAge: number;
  maxAge: number;
  minIncome: number;
  minCreditScore: number;
  isActive: boolean;
  isPublic: boolean;
}

export interface UpdateLoanProductDTO extends Partial<CreateLoanProductDTO> {}

export interface LoanProductFilter {
  isActive?: boolean;
  isPublic?: boolean;
  collateralRequired?: boolean;
  search?: string;
}
