import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus2, FileStack, Users, Clock, History, LogOut, ChevronRight,
  Settings, UserCheck, Shield, Calculator, BarChart3, Key, Database, FileText,
  CreditCard, CheckCircle, AlertTriangle, DollarSign, UserCog, Activity,
  Building, FileCheck, Lock, Zap, Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ROUTES } from '../routes';
import logo from '../logo.png';

interface SidebarProps {
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | null;
  permission?: string;
  children?: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // Define menus for each role using ROUTES constants
  const getMenuItems = (role: UserRole): MenuItem[] => {
    const baseMenus: Record<UserRole, MenuItem[]> = {
      admin: [
        { id: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard Admin', icon: LayoutDashboard },
        {
          id: 'admin-branches',
          label: 'Quản lý Chi nhánh',
          icon: Building,
          children: [
            { id: ROUTES.ADMIN.BRANCHES, label: 'Danh sách chi nhánh', icon: Building },
            { id: ROUTES.ADMIN.BRANCH_LOANS, label: 'Hồ sơ vay theo chi nhánh', icon: FileStack },
            { id: ROUTES.ADMIN.BRANCH_ASSIGNMENT, label: 'Phân bổ nhân sự', icon: UserCheck },
          ]
        },
        {
          id: 'admin-users',
          label: 'Quản lý Users',
          icon: UserCog,
          children: [
            { id: ROUTES.ADMIN.USERS, label: 'Danh sách Users', icon: Users },
            { id: ROUTES.ADMIN.ROLES, label: 'Quản lý Roles', icon: Key },
          ]
        },
        {
          id: 'admin-loans',
          label: 'Quản lý Loans',
          icon: FileStack,
          children: [
            { id: ROUTES.ADMIN.LOANS, label: 'Tất cả hồ sơ', icon: FileStack },
            { id: ROUTES.ADMIN.LOANS_PENDING, label: 'Chờ phê duyệt', icon: Clock, badge: '12' },
            { id: ROUTES.ADMIN.LOANS_APPROVED, label: 'Đã phê duyệt', icon: CheckCircle },
            { id: ROUTES.ADMIN.LOANS_REJECTED, label: 'Từ chối', icon: AlertTriangle },
          ]
        },
        { id: ROUTES.ADMIN.CUSTOMERS, label: 'Quản lý Customers', icon: Users },
        { id: ROUTES.ADMIN.COMMISSION_SETTINGS, label: 'Cài đặt Commission', icon: DollarSign },
        { id: ROUTES.ADMIN.AUDIT_LOG, label: 'Audit Log', icon: Activity },
        { id: ROUTES.ADMIN.REPORTS, label: 'Báo cáo', icon: BarChart3 },
        {
          id: 'admin/system',
          label: 'Cài đặt hệ thống',
          icon: Settings,
          children: [
            { id: ROUTES.ADMIN.SYSTEM_SETTINGS, label: 'Cài đặt chung', icon: Settings },
            { id: ROUTES.ADMIN.CACHE_MANAGEMENT, label: 'Quản lý Cache', icon: Database },
            { id: ROUTES.ADMIN.CMS_INTEGRATION, label: 'Tích hợp CMS', icon: Building },
          ]
        },
      ],
      cskh: [
        { id: ROUTES.CS.DASHBOARD, label: 'Dashboard CS', icon: LayoutDashboard },
        { id: ROUTES.CS.CREATE_LOAN, label: 'Tạo hồ sơ vay', icon: FilePlus2 },
        { id: ROUTES.CS.LOANS, label: 'Hồ sơ đã tạo', icon: FileStack },
      ],
      security: [
        { id: ROUTES.SEC.DASHBOARD, label: 'Dashboard Security', icon: Shield },
        { id: ROUTES.SEC.PENDING_CHECKS, label: 'Chờ kiểm tra', icon: Clock, badge: '8' },
        { id: ROUTES.SEC.APPROVED, label: 'Đã phê duyệt', icon: CheckCircle },
        { id: ROUTES.SEC.REJECTED, label: 'Từ chối', icon: AlertTriangle },
        { id: ROUTES.SEC.FRAUD_REPORTS, label: 'Báo cáo gian lận', icon: AlertTriangle },
        { id: ROUTES.SEC.BLACKLIST, label: 'Danh sách đen', icon: Lock },
        { id: ROUTES.SEC.HISTORY, label: 'Lịch sử kiểm tra', icon: History },
      ],
      assessment: [
        { id: ROUTES.CA.DASHBOARD, label: 'Dashboard CA', icon: LayoutDashboard },
        { id: ROUTES.CA.PENDING, label: 'Chờ thẩm định', icon: Clock, badge: '15' },
        { id: ROUTES.CA.COMPLETED, label: 'Đã thẩm định', icon: CheckCircle },
        { id: ROUTES.CA.HISTORY, label: 'Lịch sử thẩm định', icon: History },
      ],
      accountant: [
        { id: ROUTES.ACC.DASHBOARD, label: 'Dashboard Accountant', icon: Calculator },
        {
          id: 'acc-disbursements',
          label: 'Quản lý giải ngân',
          icon: CreditCard,
          children: [
            { id: ROUTES.ACC.DISBURSEMENTS_PENDING, label: 'Chờ giải ngân', icon: Clock, badge: '6' },
            { id: ROUTES.ACC.DISBURSEMENTS_COMPLETED, label: 'Đã giải ngân', icon: CheckCircle },
            { id: ROUTES.ACC.DISBURSEMENTS_FAILED, label: 'Thất bại', icon: AlertTriangle },
          ]
        },
        { id: ROUTES.ACC.COMMISSION_PAYMENTS, label: 'Thanh toán hoa hồng', icon: DollarSign },
        { id: ROUTES.ACC.FINANCIAL_REPORTS, label: 'Báo cáo tài chính', icon: BarChart3 },
        { id: ROUTES.ACC.LOAN_REPAYMENTS, label: 'Theo dõi trả nợ', icon: CreditCard },
        { id: ROUTES.ACC.HISTORY, label: 'Lịch sử giao dịch', icon: History },
      ],
      customer: [
        { id: ROUTES.CUSTOMER.SIGN_CONTRACT, label: 'Ký Hợp đồng', icon: FileText },
      ],
      it: [
        { id: ROUTES.IT.DASHBOARD, label: 'IT Dashboard', icon: LayoutDashboard },
        { id: ROUTES.IT.SYSTEM_MONITORING, label: 'System Monitoring', icon: Activity },
        { id: ROUTES.IT.DATABASE_STATUS, label: 'Database Status', icon: Database },
        { id: ROUTES.IT.API_STATUS, label: 'API Status', icon: Globe },
        { id: ROUTES.IT.ERROR_LOGS, label: 'Error Logs', icon: AlertTriangle },
        { id: ROUTES.IT.AUDIT_LOGS, label: 'Audit Logs', icon: Activity },
        { id: ROUTES.IT.PERFORMANCE, label: 'Performance', icon: BarChart3 },
        { id: ROUTES.IT.SETTINGS, label: 'IT Settings', icon: Settings },
      ],
    };

    return baseMenus[role] || [];
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const currentPath = window.location.pathname;
    const isActive = currentPath === `/${item.id}` || (item.children && item.children.some(child => currentPath === `/${child.id}`));
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = level * 12 + 12; // Indent for sub-menu items

    return (
      <div key={item.id}>
        <button
          onClick={() => navigate(`/${item.id}`)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group border border-transparent font-medium text-left
            ${isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center gap-3">
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`} />
            <span className="text-sm truncate">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {item.badge}
              </span>
            )}
            {isActive && <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />}
          </div>
        </button>

        {/* Render children if expanded */}
        {hasChildren && isActive && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white flex flex-col z-20 hidden md:flex border-r border-slate-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 bg-white border-b border-slate-100">
        <img
          src={logo}
          alt="Mini-LMS Logo"
          className="w-8 h-8 object-contain mr-3"
        />
        <span className="text-xl font-bold text-slate-800 tracking-tight">Mini-LMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {user?.role === 'admin' ? 'System Administration' :
           user?.role === 'cskh' ? 'Customer Service' :
           user?.role === 'security' ? 'Security & Fraud' :
           user?.role === 'assessment' ? 'Credit Assessment' :
           user?.role === 'accountant' ? 'Accounting & Disbursement' :
           user?.role === 'customer' ? 'Customer Portal' :
           user?.role === 'it' ? 'IT Support & Monitoring' : 'Main Menu'}
        </div>
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role === 'cskh' ? 'CS' :
               user?.role === 'security' ? 'Security' :
               user?.role === 'assessment' ? 'Credit Assessment' :
               user?.role === 'accountant' ? 'Accountant' :
               user?.role === 'customer' ? 'Customer' :
               user?.role === 'it' ? 'IT Support' : user?.role}
            </p>
          </div>
        </div>
        <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="font-medium text-sm">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};