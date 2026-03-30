'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LoanApplication,
  LoanStatus,
  UserRole,
  WorkflowStep,
  WorkflowTransition,
  AssessmentReport,
  SecurityCheck
} from '../types';
import { useAudit } from './AuditContext';
import { useAuth } from './AuthContext';
import { loanModule } from '@modules';
import { STATE_TRANSITIONS, getAllowedTransitions as getDocTransitions } from '../state-machine/transitions';
import { matchesStatus, normalizeStatus, toLegacyStatus } from '../constants/status';

// Workflow steps definition
const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'cskh_create',
    name: 'Tạo hồ sơ',
    role: 'cskh',
    order: 1,
    requiredPermissions: ['create_loan'],
    canReject: false,
    canReassign: false,
    slaHours: 24
  },
  {
    id: 'assessment_review',
    name: 'Thẩm định tài chính',
    role: 'assessment',
    order: 2,
    requiredPermissions: ['view_loan', 'approve_loan', 'reject_loan'],
    canReject: true,
    canReassign: true,
    slaHours: 48
  },
  {
    id: 'security_check',
    name: 'Kiểm tra bảo mật',
    role: 'security',
    order: 3,
    requiredPermissions: ['view_loan', 'approve_loan', 'reject_loan'],
    canReject: true,
    canReassign: false,
    slaHours: 24
  },
  {
    id: 'admin_approval',
    name: 'Phê duyệt cuối',
    role: 'admin',
    order: 4,
    requiredPermissions: ['view_loan', 'approve_loan', 'reject_loan'],
    canReject: true,
    canReassign: true,
    slaHours: 12
  },
  {
    id: 'accountant_disbursement',
    name: 'Giải ngân',
    role: 'accountant',
    order: 5,
    requiredPermissions: ['view_loan', 'disburse_loan'],
    canReject: false,
    canReassign: false,
    slaHours: 8
  }
];

// Workflow transitions (source of truth from state-machine/transitions)
const WORKFLOW_TRANSITIONS: WorkflowTransition[] = STATE_TRANSITIONS.map(t => ({
  ...t,
  fromStatus: t.fromStatus,
  toStatus: t.toStatus
})) as WorkflowTransition[];

interface WorkflowContextType {
  workflowSteps: WorkflowStep[];
  workflowTransitions: WorkflowTransition[];
  loans: LoanApplication[];
  pendingLoans: LoanApplication[];
  createLoan: (loan: LoanApplication) => Promise<boolean>;
  getLoansByStatus: (status: LoanStatus) => LoanApplication[];
  getLoansByRole: (role: UserRole) => LoanApplication[];
  updateLoanStatus: (loanId: string, newStatus: LoanStatus, userId: string, notes?: string) => Promise<boolean>;
  assignLoan: (loanId: string, userId: string, role: UserRole) => Promise<boolean>;
  submitAssessmentReport: (loanId: string, report: AssessmentReport) => Promise<boolean>;
  submitSecurityCheck: (loanId: string, check: SecurityCheck) => Promise<boolean>;
  getNextStep: (currentStatus: LoanStatus) => WorkflowStep | null;
  getAllowedTransitions: (currentStatus: LoanStatus, userRole: UserRole, loan?: LoanApplication) => WorkflowTransition[];
  refreshLoans: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Mock loan data removed - using empty array
const mockLoans: LoanApplication[] = [];

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const { logAction } = useAudit();
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load loans from localStorage on mount
  useEffect(() => {
    const loadLoans = async () => {
      try {
        const storedLoans = await loanModule.getLoans();

        // Filter out mock loans (LOAN001, LOAN002, LOAN003) if they exist
        const mockLoanIds = ['LOAN001', 'LOAN002', 'LOAN003'];
        const hasMockData = storedLoans.some(loan => mockLoanIds.includes(loan.id));

        if (hasMockData) {
          // Remove mock loans and save cleaned data
          const cleanedLoans = storedLoans.filter(loan => !mockLoanIds.includes(loan.id));
          setLoans(cleanedLoans);
        } else {
          setLoans(storedLoans);
        }
      } catch (error) {
        console.error('Failed to load loans:', error);
        setLoans([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoans();
  }, []);

  const pendingLoans = loans.filter(loan =>
    matchesStatus(loan.status, [
      'pending_cskh',
      'pending_cskh_supplement',
      'pending_assessment',
      'pending_security',
      'pending_admin',
      'pending_disbursement',
      'SUBMITTED',
      'NEED_ADDITIONAL_INFO',
      'UNDER_ASSESSMENT',
      'REQUIRE_DEVICE_LOCK',
      'REQUIRE_COLLATERAL_CONFIRMATION',
      'READY_FOR_DISBURSEMENT',
      'DISBURSEMENT_DRAFTED'
    ])
  );

  const getLoansByStatus = (status: LoanStatus): LoanApplication[] => {
    return loans.filter(loan => loan.status === status);
  };

  const getLoansByRole = (role: UserRole): LoanApplication[] => {
    switch (role) {
      case 'cskh':
        return loans.filter(loan =>
          matchesStatus(loan.status, ['draft', 'pending_cskh', 'pending_cskh_supplement', 'DRAFT', 'SUBMITTED', 'NEED_ADDITIONAL_INFO'])
        );
      case 'assessment':
        return loans.filter(loan => matchesStatus(loan.status, ['pending_assessment', 'UNDER_ASSESSMENT']));
      case 'security':
        return loans.filter(loan => matchesStatus(loan.status, ['pending_security', 'REQUIRE_DEVICE_LOCK']));
      case 'admin':
        return loans.filter(loan =>
          matchesStatus(loan.status, [
            'pending_admin',
            'ASSESSMENT_APPROVED',
            'REQUIRE_COLLATERAL_CONFIRMATION',
            'COLLATERAL_CONFIRMED',
            'DISBURSEMENT_DRAFTED'
          ])
        );
      case 'accountant':
        return loans.filter(loan =>
          matchesStatus(loan.status, ['pending_disbursement', 'READY_FOR_DISBURSEMENT', 'DISBURSEMENT_DRAFTED', 'DISBURSEMENT_APPROVED'])
        );
      default:
        return [];
    }
  };

  const createLoan = async (loan: LoanApplication): Promise<boolean> => {
    try {
      const canonicalStatus = normalizeStatus(loan.status);
      await logAction({
        userId: user?.id || loan.createdBy,
        userName: user?.fullName || loan.createdBy,
        userRole: user?.role || 'cskh',
        action: 'CREATE_LOAN',
        resourceType: 'loan',
        resourceId: loan.id,
        newValues: {
          status: canonicalStatus,
          loanAmount: loan.loanAmount,
          customerId: loan.customerId
        },
        metadata: {
          createdFrom: 'CSKH'
        }
      });

      setLoans(prevLoans => [...prevLoans, { ...loan, canonicalStatus }]);

      // Save to localStorage
      await loanModule.createLoan({ ...loan, canonicalStatus });

      return true;
    } catch (error) {
      console.error('Failed to create loan:', error);
      return false;
    }
  };

  const updateLoanStatus = async (loanId: string, newStatus: LoanStatus, userId: string, notes?: string): Promise<boolean> => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return false;
      const canonicalStatus = normalizeStatus(newStatus);
      const legacyFriendlyStatus = toLegacyStatus(canonicalStatus);

      // Log audit action
      await logAction({
        userId: user?.id || userId,
        userName: user?.fullName || userId,
        userRole: user?.role || 'cskh',
        action: newStatus === 'rejected' ? 'REJECT_LOAN' : 'UPDATE_LOAN_STATUS',
        resourceType: 'loan',
        resourceId: loanId,
        oldValues: { status: loan.status },
        newValues: {
          status: canonicalStatus,
          ...(canonicalStatus === 'BAD_DEBT' && { rejectionReason: notes })
        },
        metadata: { notes }
      });

      const updatedLoans = loans.map(loan => {
        if (loan.id === loanId) {
          const updated: LoanApplication = {
            ...loan,
            status: legacyFriendlyStatus,
            canonicalStatus,
            updatedAt: new Date(),
            ...(canonicalStatus === 'DISBURSED' && { disbursedAt: new Date(), disbursedBy: userId }),
            ...(canonicalStatus === 'BAD_DEBT' && { rejectedAt: new Date(), rejectedBy: userId, rejectionReason: notes })
          };
          // Preserve supplementRequest if it exists (when updating from supplement view)
          if (loan.supplementRequest) {
            updated.supplementRequest = loan.supplementRequest;
          }
          return updated;
        }
        return loan;
      });

      setLoans(updatedLoans);

      // Save updated loan to storage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await loanModule.updateLoan(loanId, updatedLoan);
      }

      return true;
    } catch (error) {
      console.error('Failed to update loan status:', error);
      return false;
    }
  };

  const assignLoan = async (loanId: string, userId: string, role: UserRole): Promise<boolean> => {
    try {
      const updatedLoans = loans.map(loan =>
        loan.id === loanId
          ? {
            ...loan,
            assignedTo: userId,
            assignedBy: userId, // In real app, this would be current user
            assignedAt: new Date(),
            updatedAt: new Date()
          }
          : loan
      );

      setLoans(updatedLoans);

      // Save updated loan to localStorage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await loanModule.updateLoan(loanId, updatedLoan);
      }
      return true;
    } catch (error) {
      console.error('Failed to assign loan:', error);
      return false;
    }
  };

  const submitAssessmentReport = async (loanId: string, report: AssessmentReport): Promise<boolean> => {
    try {
      const updatedLoans = loans.map(loan =>
        loan.id === loanId
          ? {
            ...loan,
            assessmentReport: report,
            riskScore: report.riskLevel === 'low' ? 85 : report.riskLevel === 'medium' ? 65 : 35,
            updatedAt: new Date()
          }
          : loan
      );

      setLoans(updatedLoans);

      // Save updated loan to localStorage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await loanModule.updateLoan(loanId, updatedLoan);
      }

      return true;
    } catch (error) {
      console.error('Failed to submit assessment report:', error);
      return false;
    }
  };

  const submitSecurityCheck = async (loanId: string, check: SecurityCheck): Promise<boolean> => {
    try {
      const updatedLoans = loans.map(loan =>
        loan.id === loanId
          ? {
            ...loan,
            securityCheckStatus: (check.status === 'passed' ? 'passed' : 'failed') as 'pending' | 'passed' | 'failed',
            updatedAt: new Date()
          }
          : loan
      ) as LoanApplication[];

      setLoans(updatedLoans);

      // Save updated loan to localStorage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await loanModule.updateLoan(loanId, updatedLoan);
      }

      return true;
    } catch (error) {
      console.error('Failed to submit security check:', error);
      return false;
    }
  };

  const getNextStep = (currentStatus: LoanStatus): WorkflowStep | null => {
    const currentStepOrder = WORKFLOW_STEPS.find(step =>
      step.id === getStepIdFromStatus(currentStatus)
    )?.order;

    if (!currentStepOrder) return null;

    return WORKFLOW_STEPS.find(step => step.order === currentStepOrder + 1) || null;
  };

  const getAllowedTransitions = (currentStatus: LoanStatus, userRole: UserRole, loan?: LoanApplication): WorkflowTransition[] => {
    const transitions = getDocTransitions(currentStatus, userRole, { loan_type: loan?.loanType });
    return transitions as unknown as WorkflowTransition[];
  };

  const getStepIdFromStatus = (status: LoanStatus): string => {
    const canonical = normalizeStatus(status);
    switch (canonical) {
      case 'SUBMITTED': return 'cskh_create';
      case 'UNDER_ASSESSMENT': return 'assessment_review';
      case 'REQUIRE_DEVICE_LOCK': return 'security_check';
      case 'ASSESSMENT_APPROVED':
      case 'REQUIRE_COLLATERAL_CONFIRMATION':
      case 'COLLATERAL_CONFIRMED':
      case 'READY_FOR_DISBURSEMENT':
      case 'DISBURSEMENT_DRAFTED': return 'admin_approval';
      case 'DISBURSEMENT_APPROVED': return 'accountant_disbursement';
      default: return '';
    }
  };

  const refreshLoans = async (): Promise<void> => {
    // In real app, fetch from API
    console.log('Refreshing loans...');
  };

  const value: WorkflowContextType = {
    workflowSteps: WORKFLOW_STEPS,
    workflowTransitions: WORKFLOW_TRANSITIONS,
    loans,
    pendingLoans,
    createLoan,
    getLoansByStatus,
    getLoansByRole,
    updateLoanStatus,
    assignLoan,
    submitAssessmentReport,
    submitSecurityCheck,
    getNextStep,
    getAllowedTransitions,
    refreshLoans
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
