import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardWidgets } from './components/DashboardWidgets';
import { LoanForm } from './components/LoanForm';
import { DashboardView } from './components/DashboardView';
import { LoanListView } from './components/LoanListView';
import { LoanDetailView } from './components/LoanDetailView';
import { CustomerView } from './components/CustomerView';
import { PendingLoansView } from './components/PendingLoansView';
import { ActivityLogView } from './components/ActivityLogView';
import { LoginView } from './components/LoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { UserManagementView } from './components/admin/UserManagementView';
import { CommissionSettingsView } from './components/admin/CommissionSettingsView';
import { AdminReportsView } from './components/admin/AdminReportsView';
import { AdminSystemSettingsView } from './components/admin/AdminSystemSettingsView';
import { AdminCacheManagementView } from './components/admin/AdminCacheManagementView';
import { AdminCmsIntegrationView } from './components/admin/AdminCmsIntegrationView';
import { BranchManagementView } from './components/admin/BranchManagementView';
import { BranchLoansView } from './components/admin/BranchLoansView';
import { BranchAssignmentView } from './components/admin/BranchAssignmentView';
import { AccountantDashboardView } from './components/accountant/AccountantDashboardView';
import { CommissionPaymentsView } from './components/accountant/CommissionPaymentsView';
import { FinancialReportsView } from './components/accountant/FinancialReportsView';
import { LoanRepaymentsView } from './components/accountant/LoanRepaymentsView';
import { CskhDashboardView } from './components/cskh/CskhDashboardView';
import { CskhCreateLoanView } from './components/cskh/CskhCreateLoanView';
import { SecurityDashboardView } from './components/security/SecurityDashboardView';
import { FraudReportsView } from './components/security/FraudReportsView';
import { SecurityBlacklistView } from './components/security/SecurityBlacklistView';
import { AssessmentDashboardView } from './components/assessment/AssessmentDashboardView';
import { AssessmentReportsView } from './components/assessment/AssessmentReportsView';
import { AssessmentFormView } from './components/assessment/AssessmentFormView';
import { CustomerSignContractView } from './components/customer/CustomerSignContractView';
import { ITDashboardView } from './components/it/ITDashboardView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { AuditProvider } from './contexts/AuditContext';
import { UserRole } from './types';
import { ROUTES, getDefaultRouteForRole } from './routes';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based Route Component
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user?.role || 'login'}`} replace />;
  }

  return <>{children}</>;
};

// App Layout Wrapper Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header userName={user.fullName} userRole={user.role} />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Login Component
const LoginPage: React.FC = () => {
  return <LoginView onLogin={(role: UserRole, userData: any) => {
    // Login logic will be handled by LoginView component
  }} />;
};

// Main App with Router
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AuditProvider>
          <WorkflowProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AppLayout><AdminDashboardView /></AppLayout>} />
            <Route path="/admin/users" element={<AppLayout><UserManagementView activeView="admin/users" /></AppLayout>} />
            <Route path="/admin/roles" element={<AppLayout><UserManagementView activeView="admin/roles" /></AppLayout>} />
            <Route path="/admin/loans" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/admin/loans-pending" element={<AppLayout><PendingLoansView /></AppLayout>} />
            <Route path="/admin/loans-approved" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/admin/loans-rejected" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/admin/customers" element={<AppLayout><CustomerView /></AppLayout>} />
            <Route path="/admin/branches" element={<AppLayout><BranchManagementView /></AppLayout>} />
            <Route path="/admin/branch-loans" element={<AppLayout><BranchLoansView /></AppLayout>} />
            <Route path="/admin/branch-assignment" element={<AppLayout><BranchAssignmentView /></AppLayout>} />
            <Route path="/admin/commission-settings" element={<AppLayout><CommissionSettingsView activeView="admin/commission-settings" /></AppLayout>} />
            <Route path="/admin/audit-log" element={<AppLayout><ActivityLogView /></AppLayout>} />
            <Route path="/admin/reports" element={<AppLayout><AdminReportsView /></AppLayout>} />
            <Route path="/admin/system-settings" element={<AppLayout><AdminSystemSettingsView /></AppLayout>} />
            <Route path="/admin/cache-management" element={<AppLayout><AdminCacheManagementView /></AppLayout>} />
            <Route path="/admin/cms-integration" element={<AppLayout><AdminCmsIntegrationView /></AppLayout>} />

            {/* CS Routes */}
            <Route path="/cs/dashboard" element={<AppLayout><CskhDashboardView /></AppLayout>} />
            <Route path="/cs/create-loan" element={<AppLayout><CskhCreateLoanView /></AppLayout>} />
            <Route path="/cs/loans" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/cs/loans/:id" element={<AppLayout><LoanDetailView /></AppLayout>} />

            {/* SEC Routes */}
            <Route path="/sec/dashboard" element={<AppLayout><SecurityDashboardView /></AppLayout>} />
            <Route path="/sec/pending-checks" element={<AppLayout><PendingLoansView /></AppLayout>} />
            <Route path="/sec/approved" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/sec/rejected" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/sec/fraud-reports" element={<AppLayout><FraudReportsView /></AppLayout>} />
            <Route path="/sec/blacklist" element={<AppLayout><SecurityBlacklistView /></AppLayout>} />
            <Route path="/sec/history" element={<AppLayout><ActivityLogView /></AppLayout>} />

            {/* CA Routes */}
            <Route path="/ca/dashboard" element={<AppLayout><AssessmentDashboardView /></AppLayout>} />
            <Route path="/ca/pending" element={<AppLayout><PendingLoansView /></AppLayout>} />
            <Route path="/ca/assess/:id" element={<AppLayout><AssessmentFormView /></AppLayout>} />
            <Route path="/ca/loans/:id" element={<AppLayout><LoanDetailView /></AppLayout>} />
            <Route path="/ca/in-progress" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/ca/completed" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/ca/reports" element={<AppLayout><AssessmentReportsView /></AppLayout>} />
            <Route path="/ca/history" element={<AppLayout><ActivityLogView /></AppLayout>} />

            {/* ACC Routes */}
            <Route path="/acc/dashboard" element={<AppLayout><AccountantDashboardView /></AppLayout>} />
            <Route path="/acc/disbursements-pending" element={<AppLayout><PendingLoansView /></AppLayout>} />
            <Route path="/acc/disbursements-completed" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/acc/disbursements-failed" element={<AppLayout><LoanListView /></AppLayout>} />
            <Route path="/acc/commission-payments" element={<AppLayout><CommissionPaymentsView /></AppLayout>} />
            <Route path="/acc/financial-reports" element={<AppLayout><FinancialReportsView /></AppLayout>} />
            <Route path="/acc/loan-repayments" element={<AppLayout><LoanRepaymentsView /></AppLayout>} />
            <Route path="/acc/history" element={<AppLayout><ActivityLogView /></AppLayout>} />
            
            {/* IT Routes */}
            <Route path="/it/dashboard" element={<AppLayout><ITDashboardView /></AppLayout>} />
            
            {/* Customer routes (không dùng AppLayout, full-page portal riêng) */}
            <Route path="/customer/sign-contract" element={<CustomerSignContractView />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin-users" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin-loans" element={<Navigate to="/admin/loans" replace />} />
            <Route path="/admin-branches" element={<Navigate to="/admin/branches" replace />} />
            <Route path="/admin/system" element={<Navigate to="/admin/system-settings" replace />} />
            <Route path="/cs" element={<Navigate to="/cs/dashboard" replace />} />
            <Route path="/sec" element={<Navigate to="/sec/dashboard" replace />} />
            <Route path="/ca" element={<Navigate to="/ca/dashboard" replace />} />
            <Route path="/acc" element={<Navigate to="/acc/dashboard" replace />} />
            <Route path="/acc-disbursements" element={<Navigate to="/acc/disbursements-pending" replace />} />
            <Route path="/it" element={<Navigate to="/it/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          </WorkflowProvider>
        </AuditProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;