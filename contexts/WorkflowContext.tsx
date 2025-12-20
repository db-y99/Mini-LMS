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
import { storageService } from '../services/storageService';

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

// Workflow transitions
const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Draft -> Pending CSKH or Assessment
  {
    fromStatus: 'draft',
    toStatus: 'pending_cskh',
    allowedRoles: ['cskh'],
    requiresApproval: false,
    autoTransition: false
  },
  {
    fromStatus: 'draft',
    toStatus: 'pending_assessment',
    allowedRoles: ['cskh'],
    requiresApproval: false,
    autoTransition: false
  },
  // CSKH -> Assessment
  {
    fromStatus: 'pending_cskh',
    toStatus: 'pending_assessment',
    allowedRoles: ['cskh'],
    requiresApproval: false,
    autoTransition: true
  },
  // Assessment -> Security (for phone) or Admin (for other assets) or Reject
  {
    fromStatus: 'pending_assessment',
    toStatus: 'pending_security',
    allowedRoles: ['assessment'],
    requiresApproval: true,
    conditions: ['collateralType === "phone"'] // Only for phone assets
  },
  {
    fromStatus: 'pending_assessment',
    toStatus: 'pending_admin',
    allowedRoles: ['assessment'],
    requiresApproval: true,
    conditions: ['collateralType !== "phone"'] // For non-phone assets
  },
  {
    fromStatus: 'pending_assessment',
    toStatus: 'rejected',
    allowedRoles: ['assessment'],
    requiresApproval: true
  },
  // Assessment -> CSKH (yêu cầu bổ sung hồ sơ)
  {
    fromStatus: 'pending_assessment',
    toStatus: 'pending_cskh_supplement',
    allowedRoles: ['assessment'],
    requiresApproval: true
  },
  // CSKH bổ sung xong -> Assessment lại
  {
    fromStatus: 'pending_cskh_supplement',
    toStatus: 'pending_assessment',
    allowedRoles: ['cskh'],
    requiresApproval: false,
    autoTransition: true
  },
  // Security -> Admin or Reject
  {
    fromStatus: 'pending_security',
    toStatus: 'pending_admin',
    allowedRoles: ['security'],
    requiresApproval: true
  },
  {
    fromStatus: 'pending_security',
    toStatus: 'rejected',
    allowedRoles: ['security'],
    requiresApproval: true
  },
  // Admin -> Disbursement or Reject
  {
    fromStatus: 'pending_admin',
    toStatus: 'pending_disbursement',
    allowedRoles: ['admin'],
    requiresApproval: true
  },
  {
    fromStatus: 'pending_admin',
    toStatus: 'rejected',
    allowedRoles: ['admin'],
    requiresApproval: true
  },
  // Accountant -> Disbursed
  {
    fromStatus: 'pending_disbursement',
    toStatus: 'disbursed',
    allowedRoles: ['accountant'],
    requiresApproval: false
  },
  // Cancel transitions - CSKH can cancel at early stages
  {
    fromStatus: 'pending_cskh',
    toStatus: 'cancelled',
    allowedRoles: ['cskh', 'admin'],
    requiresApproval: true
  },
  {
    fromStatus: 'pending_cskh_supplement',
    toStatus: 'cancelled',
    allowedRoles: ['cskh', 'admin'],
    requiresApproval: true
  },
  // Cancel transitions - Assessment can cancel
  {
    fromStatus: 'pending_assessment',
    toStatus: 'cancelled',
    allowedRoles: ['assessment', 'admin'],
    requiresApproval: true
  },
  // Cancel transitions - Security can cancel
  {
    fromStatus: 'pending_security',
    toStatus: 'cancelled',
    allowedRoles: ['security', 'admin'],
    requiresApproval: true
  },
  // Cancel transitions - Admin can cancel
  {
    fromStatus: 'pending_admin',
    toStatus: 'cancelled',
    allowedRoles: ['admin'],
    requiresApproval: true
  },
  // Cancel transitions - Accountant/Admin can cancel before disbursement
  {
    fromStatus: 'pending_disbursement',
    toStatus: 'cancelled',
    allowedRoles: ['accountant', 'admin'],
    requiresApproval: true
  }
];

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
        const storedLoans = await storageService.getLoans();
        
        // Filter out mock loans (LOAN001, LOAN002, LOAN003) if they exist
        const mockLoanIds = ['LOAN001', 'LOAN002', 'LOAN003'];
        const hasMockData = storedLoans.some(loan => mockLoanIds.includes(loan.id));
        
        if (hasMockData) {
          // Remove mock loans and save cleaned data
          const cleanedLoans = storedLoans.filter(loan => !mockLoanIds.includes(loan.id));
          // Clear all and save only cleaned loans
          await storageService.clearLoans();
          for (const loan of cleanedLoans) {
            await storageService.saveLoan(loan);
          }
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
    ['pending_cskh', 'pending_cskh_supplement', 'pending_assessment', 'pending_security', 'pending_admin', 'pending_disbursement'].includes(loan.status)
  );

  const getLoansByStatus = (status: LoanStatus): LoanApplication[] => {
    return loans.filter(loan => loan.status === status);
  };

  const getLoansByRole = (role: UserRole): LoanApplication[] => {
    switch (role) {
      case 'cskh':
        return loans.filter(loan => ['draft', 'pending_cskh', 'pending_cskh_supplement'].includes(loan.status));
      case 'assessment':
        return loans.filter(loan => loan.status === 'pending_assessment');
      case 'security':
        return loans.filter(loan => loan.status === 'pending_security');
      case 'admin':
        return loans.filter(loan => loan.status === 'pending_admin');
      case 'accountant':
        return loans.filter(loan => loan.status === 'pending_disbursement');
      default:
        return [];
    }
  };

  const createLoan = async (loan: LoanApplication): Promise<boolean> => {
    try {
      await logAction({
        userId: user?.id || loan.createdBy,
        userName: user?.fullName || loan.createdBy,
        userRole: user?.role || 'cskh',
        action: 'CREATE_LOAN',
        resourceType: 'loan',
        resourceId: loan.id,
        newValues: {
          status: loan.status,
          loanAmount: loan.loanAmount,
          customerId: loan.customerId
        },
        metadata: {
          createdFrom: 'CSKH'
        }
      });

      setLoans(prevLoans => [...prevLoans, loan]);
      
      // Save to localStorage
      await storageService.saveLoan(loan);
      
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
          status: newStatus,
          ...(newStatus === 'rejected' && { rejectionReason: notes })
        },
        metadata: { notes }
      });

      const updatedLoans = loans.map(loan => {
        if (loan.id === loanId) {
          const updated: LoanApplication = {
            ...loan,
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === 'disbursed' && { disbursedAt: new Date(), disbursedBy: userId }),
            ...(newStatus === 'rejected' && { rejectedAt: new Date(), rejectedBy: userId, rejectionReason: notes })
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
      
      // Save updated loan to localStorage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await storageService.saveLoan(updatedLoan);
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
        await storageService.saveLoan(updatedLoan);
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
        await storageService.saveLoan(updatedLoan);
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
              securityCheckStatus: check.status === 'passed' ? 'passed' : 'failed',
              updatedAt: new Date()
            }
          : loan
      );
      
      setLoans(updatedLoans);
      
      // Save updated loan to localStorage
      const updatedLoan = updatedLoans.find(l => l.id === loanId);
      if (updatedLoan) {
        await storageService.saveLoan(updatedLoan);
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
    return WORKFLOW_TRANSITIONS.filter(transition => {
      // Check basic conditions
      if (transition.fromStatus !== currentStatus || !transition.allowedRoles.includes(userRole)) {
        return false;
      }
      
      // Check conditional transitions based on loan collateral type
      if (transition.conditions && loan) {
        for (const condition of transition.conditions) {
          if (condition === 'collateralType === "phone"') {
            if (loan.collateralType !== 'phone') return false;
          } else if (condition === 'collateralType !== "phone"') {
            if (loan.collateralType === 'phone') return false;
          }
        }
      }
      
      return true;
    });
  };

  const getStepIdFromStatus = (status: LoanStatus): string => {
    switch (status) {
      case 'pending_cskh': return 'cskh_create';
      case 'pending_assessment': return 'assessment_review';
      case 'pending_security': return 'security_check';
      case 'pending_admin': return 'admin_approval';
      case 'pending_disbursement': return 'accountant_disbursement';
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
