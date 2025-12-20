/**
 * Route Configuration cho Hệ thống Quản lý Khoản vay & Hoa hồng
 *
 * Routes được chia theo từng vai trò (Role-based routing)
 * Mỗi vai trò có các sub-routes riêng biệt
 */

export const ROUTES = {
  // ===== ADMIN ROUTES =====
  ADMIN: {
    DASHBOARD: 'admin/dashboard',
    USERS: 'admin/users',
    ROLES: 'admin/roles',
    LOANS: 'admin/loans',
    LOANS_PENDING: 'admin/loans-pending',
    LOANS_APPROVED: 'admin/loans-approved',
    LOANS_REJECTED: 'admin/loans-rejected',
    CUSTOMERS: 'admin/customers',
    BRANCHES: 'admin/branches',
    BRANCH_LOANS: 'admin/branch-loans',
    BRANCH_ASSIGNMENT: 'admin/branch-assignment',
    COMMISSION_SETTINGS: 'admin/commission-settings',
    AUDIT_LOG: 'admin/audit-log',
    REPORTS: 'admin/reports',
    SYSTEM_SETTINGS: 'admin/system-settings',
    CACHE_MANAGEMENT: 'admin/cache-management',
    CMS_INTEGRATION: 'admin/cms-integration'
  },

  // ===== CS ROUTES ===== (Customer Service)
  CS: {
    DASHBOARD: 'cs/dashboard',
    CREATE_LOAN: 'cs/create-loan',
    LOANS: 'cs/loans'
  },

  // ===== SEC ROUTES ===== (Security)
  SEC: {
    DASHBOARD: 'sec/dashboard',
    PENDING_CHECKS: 'sec/pending-checks',
    APPROVED: 'sec/approved',
    REJECTED: 'sec/rejected',
    FRAUD_REPORTS: 'sec/fraud-reports',
    BLACKLIST: 'sec/blacklist',
    HISTORY: 'sec/history'
  },

  // ===== CA ROUTES ===== (Credit Assessment)
  CA: {
    DASHBOARD: 'ca/dashboard',
    PENDING: 'ca/pending',
    IN_PROGRESS: 'ca/in-progress',
    COMPLETED: 'ca/completed',
    REPORTS: 'ca/reports',
    HISTORY: 'ca/history'
  },

  // ===== ACC ROUTES ===== (Accountant)
  ACC: {
    DASHBOARD: 'acc/dashboard',
    DISBURSEMENTS_PENDING: 'acc/disbursements-pending',
    DISBURSEMENTS_COMPLETED: 'acc/disbursements-completed',
    DISBURSEMENTS_FAILED: 'acc/disbursements-failed',
    COMMISSION_PAYMENTS: 'acc/commission-payments',
    FINANCIAL_REPORTS: 'acc/financial-reports',
    LOAN_REPAYMENTS: 'acc/loan-repayments',
    HISTORY: 'acc/history'
  },

  // ===== CUSTOMER ROUTES =====
  CUSTOMER: {
    SIGN_CONTRACT: 'customer/sign-contract'
  },

  // ===== IT ROUTES ===== (IT Support & Monitoring)
  IT: {
    DASHBOARD: 'it/dashboard',
    SYSTEM_MONITORING: 'it/system-monitoring',
    DATABASE_STATUS: 'it/database-status',
    API_STATUS: 'it/api-status',
    ERROR_LOGS: 'it/error-logs',
    AUDIT_LOGS: 'it/audit-logs',
    PERFORMANCE: 'it/performance',
    SETTINGS: 'it/settings'
  }
} as const;

// Helper functions
export const getRoleRoutes = (role: keyof typeof ROUTES) => {
  return ROUTES[role];
};

export const getDefaultRouteForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'cskh':
      return ROUTES.CS.DASHBOARD;
    case 'security':
      return ROUTES.SEC.DASHBOARD;
    case 'assessment':
      return ROUTES.CA.PENDING;
    case 'accountant':
      return ROUTES.ACC.DISBURSEMENTS_PENDING;
    case 'customer':
      return ROUTES.CUSTOMER.SIGN_CONTRACT;
    case 'it':
      return ROUTES.IT.DASHBOARD;
    default:
      return 'dashboard';
  }
};

export const getRoleFromRoute = (route: string) => {
  if (route.startsWith('admin/')) return 'admin';
  if (route.startsWith('cs/')) return 'cskh';
  if (route.startsWith('sec/')) return 'security';
  if (route.startsWith('ca/')) return 'assessment';
  if (route.startsWith('acc/')) return 'accountant';
  if (route.startsWith('customer/')) return 'customer';
  if (route.startsWith('it/')) return 'it';
  return 'unknown';
};

// Route descriptions for documentation
export const ROUTE_DESCRIPTIONS = {
  // Admin
  [ROUTES.ADMIN.DASHBOARD]: 'Dashboard tổng quan hệ thống',
  [ROUTES.ADMIN.USERS]: 'Quản lý tài khoản người dùng',
  [ROUTES.ADMIN.ROLES]: 'Định nghĩa và quản lý vai trò',
  [ROUTES.ADMIN.LOANS]: 'Xem tất cả hồ sơ vay',
  [ROUTES.ADMIN.LOANS_PENDING]: 'Hồ sơ chờ phê duyệt',
  [ROUTES.ADMIN.LOANS_APPROVED]: 'Hồ sơ đã phê duyệt',
  [ROUTES.ADMIN.LOANS_REJECTED]: 'Hồ sơ bị từ chối',
  [ROUTES.ADMIN.CUSTOMERS]: 'Quản lý thông tin khách hàng',
  [ROUTES.ADMIN.BRANCHES]: 'Quản lý danh sách chi nhánh',
  [ROUTES.ADMIN.BRANCH_LOANS]: 'Theo dõi hồ sơ vay theo chi nhánh',
  [ROUTES.ADMIN.BRANCH_ASSIGNMENT]: 'Phân bổ nhân sự theo chi nhánh',
  [ROUTES.ADMIN.COMMISSION_SETTINGS]: 'Cài đặt tỷ lệ hoa hồng',
  [ROUTES.ADMIN.AUDIT_LOG]: 'Nhật ký hoạt động hệ thống',
  [ROUTES.ADMIN.REPORTS]: 'Báo cáo và thống kê',
  [ROUTES.ADMIN.SYSTEM_SETTINGS]: 'Cài đặt hệ thống',
  [ROUTES.ADMIN.CACHE_MANAGEMENT]: 'Quản lý cache',
  [ROUTES.ADMIN.CMS_INTEGRATION]: 'Tích hợp CMS bên ngoài',

  // CS (Customer Service)
  [ROUTES.CS.DASHBOARD]: 'Dashboard CS',
  [ROUTES.CS.CREATE_LOAN]: 'Tạo hồ sơ vay mới',
  [ROUTES.CS.LOANS]: 'Danh sách hồ sơ đã tạo',

  // SEC (Security)
  [ROUTES.SEC.DASHBOARD]: 'Dashboard Security',
  [ROUTES.SEC.PENDING_CHECKS]: 'Hồ sơ chờ kiểm tra',
  [ROUTES.SEC.APPROVED]: 'Hồ sơ đã duyệt',
  [ROUTES.SEC.REJECTED]: 'Hồ sơ bị từ chối',
  [ROUTES.SEC.FRAUD_REPORTS]: 'Báo cáo gian lận',
  [ROUTES.SEC.BLACKLIST]: 'Danh sách đen',
  [ROUTES.SEC.HISTORY]: 'Lịch sử kiểm tra',

  // CA (Credit Assessment)
  [ROUTES.CA.DASHBOARD]: 'Dashboard Credit Assessment',
  [ROUTES.CA.PENDING]: 'Hồ sơ chờ thẩm định',
  [ROUTES.CA.IN_PROGRESS]: 'Đang thẩm định',
  [ROUTES.CA.COMPLETED]: 'Đã thẩm định',
  [ROUTES.CA.REPORTS]: 'Báo cáo thẩm định',
  [ROUTES.CA.HISTORY]: 'Lịch sử thẩm định',

  // ACC (Accountant)
  [ROUTES.ACC.DISBURSEMENTS_PENDING]: 'Chờ giải ngân',
  [ROUTES.ACC.DISBURSEMENTS_COMPLETED]: 'Đã giải ngân',
  [ROUTES.ACC.DISBURSEMENTS_FAILED]: 'Giải ngân thất bại',
  [ROUTES.ACC.COMMISSION_PAYMENTS]: 'Thanh toán hoa hồng',
  [ROUTES.ACC.FINANCIAL_REPORTS]: 'Báo cáo tài chính',
  [ROUTES.ACC.LOAN_REPAYMENTS]: 'Theo dõi trả nợ',
  [ROUTES.ACC.HISTORY]: 'Lịch sử giao dịch',

  // IT (IT Support & Monitoring)
  [ROUTES.IT.DASHBOARD]: 'IT Dashboard - Tổng quan hệ thống',
  [ROUTES.IT.SYSTEM_MONITORING]: 'Giám sát hệ thống',
  [ROUTES.IT.DATABASE_STATUS]: 'Trạng thái Database',
  [ROUTES.IT.API_STATUS]: 'Trạng thái API',
  [ROUTES.IT.ERROR_LOGS]: 'Nhật ký lỗi',
  [ROUTES.IT.AUDIT_LOGS]: 'Nhật ký kiểm toán',
  [ROUTES.IT.PERFORMANCE]: 'Hiệu suất hệ thống',
  [ROUTES.IT.SETTINGS]: 'Cài đặt IT'

  // CUSTOMER
  // [ROUTES.CUSTOMER.SIGN_CONTRACT]: 'Khách hàng ký hợp đồng'
} as const;
