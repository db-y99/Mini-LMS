// ========== BASIC TYPES ==========
import { LoanStatus, CanonicalLoanStatus, LegacyLoanStatus } from './constants/status';
import { UserRoleCode } from './constants/roles';

export type CollateralType = 'car' | 'bike' | 'phone' | 'computer' | 'house' | 'land' | 'other';

export type UserRole = UserRoleCode;
export type { LoanStatus, CanonicalLoanStatus, LegacyLoanStatus };

export interface Branch {
  id: string;
  code: string;
  name: string;
  province: string;
  address: string;
  phone: string;
  managerId?: string;
  managerName?: string;
  approvalLimit: number; // Giới hạn phê duyệt (VND)
  region?: 'North' | 'Central' | 'South';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export type Permission =
  | 'create_loan'
  | 'view_loan'
  | 'edit_loan'
  | 'approve_loan'
  | 'reject_loan'
  | 'disburse_loan'
  | 'manage_users'
  | 'manage_roles'
  | 'view_audit_logs'
  | 'manage_commission'
  | 'view_reports'
  | 'manage_system'
  | 'manage_cache';

// ========== USER & AUTHENTICATION ==========
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, userData: Partial<User>) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

// ========== DASHBOARD & STATISTICS ==========
export interface DashboardStat {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: string;
}

export interface AdminDashboardStats {
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  totalUsers: number;
  activeUsers: number;
  totalCommission: number;
  monthlyRevenue: number;
}

// ========== LOAN MANAGEMENT ==========
export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  numberOfDependents?: number;
  idType: 'cccd' | 'cmnd' | 'passport';
  idNumber: string;
  issueDate: string;
  issuePlace: string;
  country: string;
  province: string;
  district: string;
  address: string;
  occupation?: string;
  // Employment details
  companyName?: string;
  companyAddress?: string;
  position?: string;
  workExperience?: number; // years
  employmentType?: 'fulltime' | 'parttime' | 'contract' | 'selfemployed' | 'unemployed';
  // Financial details
  monthlyIncome?: number;
  otherIncome?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  existingLoans?: number;
  monthlyLoanPayments?: number;
  creditCardDebt?: number;
  creditCardLimit?: number;
  // Emergency contacts & References
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  reference1Name?: string;
  reference1Phone?: string;
  reference1Relationship?: string;
  reference2Name?: string;
  reference2Phone?: string;
  reference2Relationship?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanApplication {
  id: string;
  branchId?: string;
  customerId: string;
  customer: Customer;
  loanType?: 'DEVICE' | 'COLLATERAL';

  // Loan details
  collateralType: CollateralType;
  collateralDescription: string;
  collateralDetails?: {
    // Ô tô / Xe máy
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: string;
    color?: string;
    chassisNumber?: string;
    engineNumber?: string;
    mileage?: string;
    // Điện thoại / Máy tính
    manufacturer?: string;
    deviceModel?: string;
    storage?: string;
    imei?: string;
    serialNumber?: string;
    condition?: string;
    // Máy tính
    cpu?: string;
    ram?: string;
    hardDrive?: string;
  };
  loanAmount: number;
  loanDuration: number; // months
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  loanPurpose?: string;

  // Status & workflow
  status: LoanStatus;
  canonicalStatus?: CanonicalLoanStatus;
  legacyStatus?: LegacyLoanStatus;
  currentStep: string;
  assignedTo?: string; // User ID
  assignedBy?: string;
  assignedAt?: Date;
  
  // NEW: Version tracking
  version: number;

  // NEW: Attributes (thay vì nhiều statuses)
  approval_level?: 'branch' | 'head_office' | 'pending';
  rejection_stage?: 'assessment' | 'credit' | 'contract';
  recovery_status?: 'pending' | 'legal' | 'sold' | 'recovered';

  // NEW: Computed fields
  dpd: number; // Days Past Due (computed)
  overdue_level: 'none' | 'minor' | 'severe' | 'collection'; // Computed from DPD
  is_expired: boolean; // Contract expired (computed)

  // NEW: Overlay states (behavioral locks)
  is_frozen: boolean;
  frozen_reason?: string;
  frozen_at?: Date;
  frozen_by?: string;
  frozen_from_status?: CanonicalLoanStatus;

  // NEW: Branch control
  approved_by_branch?: string;
  approved_by_head_office?: string;

  // NEW: Risk profile
  risk_score: number; // 0-1000
  risk_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  pd: number; // Probability of Default (0-1)
  lgd: number; // Loss Given Default (0-1)
  ecl: number; // Expected Credit Loss
  ecl_stage: 1 | 2 | 3; // IFRS 9

  // NEW: Contract tracking
  contract_sent_at?: Date;
  contract_expires_at?: Date;

  // Documents
  documents: DocumentUpload[];
  referralCode?: string;

  // Processing
  riskScore?: number; // DEPRECATED: Use risk_score instead
  securityCheckStatus?: 'pending' | 'passed' | 'failed';
  assessmentReport?: AssessmentReport;
  internalNotes?: string;
  supplementRequest?: {
    requestedBy: string; // User ID của CA yêu cầu bổ sung
    requestedByName?: string; // Tên người yêu cầu
    requestedAt: Date;
    reason: string; // Lý do yêu cầu bổ sung
  };
  
  // NEW: Disbursement tracking
  disbursement_processing_started_at?: Date;

  // Financial
  commissionAmount?: number;
  commissionPaid?: boolean;
  commissionPaidAt?: Date;

  // Metadata
  createdBy: string;
  createdByName?: string; // Tên người tạo đơn
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  disbursedAt?: Date;
  disbursedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface DocumentUpload {
  id: string;
  type: 'id_front' | 'id_back' | 'portrait' | 'utility_bill' | 'residency' | 'collateral' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  verified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

// ========== CONTRACT & DISBURSEMENT ==========
export interface Contract {
  id: string;
  loanId: string;
  contractNo: string;
  status: 'SENT' | 'SIGNED' | 'REJECTED';
  signedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Disbursement {
  id: string;
  loanId: string;
  amount: number;
  bankAccount: string;
  status: 'DRAFT' | 'APPROVED' | 'DISBURSED';
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== ASSESSMENT & SECURITY ==========
export interface AssessmentReport {
  id: string;
  loanId: string;
  assessorId: string;
  assessorName: string;

  // Financial assessment
  creditScore: number;
  incomeVerified: boolean;
  employmentVerified: boolean;
  debtToIncomeRatio: number;
  loanToValueRatio: number;

  // Risk analysis
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];

  // Collateral assessment
  collateralValue: number;
  collateralCondition: string;
  marketValue: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityCheck {
  id: string;
  loanId: string;
  securityOfficerId: string;
  securityOfficerName: string;

  // Identity verification
  idVerified: boolean;
  biometricVerified?: boolean;
  addressVerified: boolean;

  // Fraud detection
  fraudDetected: boolean;
  fraudIndicators: string[];
  blacklistCheck: boolean;
  criminalRecordCheck: boolean;

  // Additional checks
  phoneVerified: boolean;
  emailVerified: boolean;
  bankAccountVerified: boolean;

  // Phone locking (for phone collateral)
  phoneLocked?: boolean;
  phoneLockedAt?: Date;
  phoneLockedBy?: string;

  status: 'pending' | 'passed' | 'failed';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== COMMISSION MANAGEMENT ==========
export interface CommissionRule {
  id: string;
  productType: CollateralType;
  minAmount: number;
  maxAmount: number;
  commissionRate: number; // percentage
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface CommissionPayment {
  id: string;
  loanId: string;
  referrerId?: string; // User who referred the customer
  referrerName?: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  paidBy?: string;
  notes?: string;
  createdAt: Date;
}

// ========== PAYMENT SCHEDULE ==========
export interface PaymentScheduleItem {
  id: string;
  loanId: string;
  installmentNumber: number; // Số kỳ trả (1, 2, 3, ...)
  dueDate: Date; // Ngày đến hạn
  principalAmount: number; // Số tiền gốc
  interestAmount: number; // Số tiền lãi
  totalAmount: number; // Tổng số tiền phải trả
  status: 'pending' | 'paid' | 'overdue' | 'partial'; // Trạng thái
  paidAmount?: number; // Số tiền đã trả (nếu trả một phần)
  paidDate?: Date; // Ngày thanh toán
  overdueDays?: number; // Số ngày quá hạn
  notes?: string; // Ghi chú
}

export interface PaymentSchedule {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  loanAmount: number;
  totalPayment: number;
  monthlyPayment: number;
  loanDuration: number; // Số tháng
  interestRate: number;
  startDate: Date; // Ngày bắt đầu trả nợ (thường là ngày giải ngân + 1 tháng)
  items: PaymentScheduleItem[]; // Danh sách các kỳ trả nợ
  createdAt: Date;
  updatedAt: Date;
}

// ========== AUDIT LOG ==========
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'loan' | 'user' | 'customer' | 'commission' | 'system' | 'report';
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ========== SYSTEM SETTINGS ==========
export interface SystemSettings {
  id: string;
  maxLoanAmount: number;
  minLoanAmount: number;
  defaultInterestRate: number;
  maxLoanDuration: number;
  minLoanDuration: number;
  autoApprovalThreshold: number;
  fraudDetectionEnabled: boolean;
  twoFactorAuthRequired: boolean;
  auditLogRetentionDays: number;
  cacheExpirationMinutes: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  updatedBy: string;
  updatedAt: Date;
}

// ========== REPORTS ==========
export interface ReportFilter {
  dateFrom: Date;
  dateTo: Date;
  status?: LoanStatus[];
  productType?: CollateralType[];
  userId?: string;
  branchId?: string;
}

export interface LoanReport {
  totalLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  disbursedLoans: number;
  totalAmount: number;
  averageAmount: number;
  totalCommission: number;
  conversionRate: number;
  loansByProduct: Record<CollateralType, number>;
  loansByStatus: Record<LoanStatus, number>;
  monthlyTrend: Array<{
    month: string;
    loans: number;
    amount: number;
  }>;
}

export interface CommissionReport {
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  topPerformers: Array<{
    userId: string;
    userName: string;
    totalCommission: number;
    loanCount: number;
  }>;
  commissionByProduct: Record<CollateralType, number>;
  monthlyCommission: Array<{
    month: string;
    amount: number;
  }>;
}

// ========== UI & FORMS ==========
export interface LoanFormData {
  // Section 1 - Collateral
  collateralType: CollateralType;
  collateralDescription: string;
  // Chi tiết tài sản đảm bảo
  collateralDetails?: {
    // Ô tô / Xe máy
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: string;
    color?: string;
    chassisNumber?: string;
    engineNumber?: string;
    mileage?: string;
    // Điện thoại / Máy tính
    manufacturer?: string;
    deviceModel?: string;
    storage?: string;
    imei?: string;
    serialNumber?: string;
    condition?: string;
    // Máy tính
    cpu?: string;
    ram?: string;
    hardDrive?: string;
  };

  // Section 2 - Customer Info
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  idType: 'cccd' | 'cmnd' | 'passport';
  idNumber: string;
  issueDate: string;
  issuePlace: string;
  country: string;
  province: string;
  district: string;
  address: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  numberOfDependents?: number;

  // Section 3 - Employment & Financial
  occupation?: string;
  companyName?: string;
  companyAddress?: string;
  position?: string;
  workExperience?: number; // years
  employmentType?: 'fulltime' | 'parttime' | 'contract' | 'selfemployed' | 'unemployed';
  monthlyIncome?: number;
  otherIncome?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  existingLoans?: number;
  monthlyLoanPayments?: number;
  creditCardDebt?: number;
  creditCardLimit?: number;

  // Section 4 - Emergency Contacts & References
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  reference1Name?: string;
  reference1Phone?: string;
  reference1Relationship?: string;
  reference2Name?: string;
  reference2Phone?: string;
  reference2Relationship?: string;

  // Section 5 - Loan Details
  loanAmount: number;
  loanDuration: number;
  loanPurpose?: string;
  referralCode?: string;

  // Section 6 - Additional
  internalNotes: string;
  customerSource?: string; // where customer came from
  salesChannel?: string; // online, branch, referral, etc.
}

export interface FileUploadStatus {
  file: File | null;
  previewUrl: string | null;
  progress: number;
  error?: string;
}

export interface DocUploads {
  idFront: FileUploadStatus;
  idBack: FileUploadStatus;
  portrait: FileUploadStatus;
  utilityBill: FileUploadStatus;
  residency: FileUploadStatus;
  collateral: FileUploadStatus;
}

// ========== API RESPONSES ==========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== WORKFLOW ==========
export interface WorkflowStep {
  id: string;
  name: string;
  role: UserRole;
  order: number;
  requiredPermissions: Permission[];
  canReject: boolean;
  canReassign: boolean;
  slaHours?: number; // Service Level Agreement
}

export interface WorkflowTransition {
  fromStatus: LoanStatus;
  toStatus: LoanStatus;
  allowedRoles: UserRole[];
  requiresApproval: boolean;
  autoTransition?: boolean;
  conditions?: string[];
}
