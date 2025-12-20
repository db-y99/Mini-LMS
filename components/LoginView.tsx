import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, FileSearch, Calculator, Lock, ArrowRight, Fingerprint, Activity, Server } from 'lucide-react';
import { UserRole } from '../types';
import { getDefaultRouteForRole } from '../routes';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.png';

interface LoginViewProps {
  onLogin: (role: UserRole, userData: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { 
      id: 'cskh', 
      label: 'Nhân viên CSKH', 
      name: 'Trần Minh Tú', 
      icon: Users, 
      color: 'blue', 
      desc: 'Tạo hồ sơ, quản lý khách hàng' 
    },
    {
      id: 'assessment',
      label: 'Nhân viên Thẩm định',
      name: 'Nguyễn Văn Nam',
      icon: FileSearch,
      color: 'amber',
      desc: 'Duyệt hồ sơ, đánh giá rủi ro'
    },
    { 
      id: 'security', 
      label: 'Nhân viên Bảo mật', 
      name: 'Lê Thanh Hải', 
      icon: ShieldCheck, 
      color: 'indigo', 
      desc: 'Xác thực danh tính, Anti-fraud' 
    },
    { 
      id: 'accountant', 
      label: 'Kế toán / Giải ngân', 
      name: 'Phạm Thị Mai', 
      icon: Calculator, 
      color: 'green', 
      desc: 'Duyệt giải ngân, thu hồi nợ' 
    },
    { 
      id: 'admin', 
      label: 'Quản trị viên', 
      name: 'System Admin', 
      icon: Lock, 
      color: 'slate', 
      desc: 'Cấu hình hệ thống, User' 
    },
    { 
      id: 'it',
      label: 'IT Support',
      name: 'IT Support',
      icon: Server,
      color: 'cyan',
      desc: 'Giám sát và kiểm tra hệ thống'
    },
    { 
      id: 'customer',
      label: 'Khách hàng',
      name: 'Nguyễn Văn A',
      icon: Users,
      color: 'purple',
      desc: 'Ký hợp đồng online (Customer Portal)'
    },
  ];

  const handleRoleSelect = (roleId: UserRole, userData: any) => {
    setIsLoading(roleId);
    // Simulate API delay
    setTimeout(() => {
      login(roleId, userData);
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        const defaultRoute = getDefaultRouteForRole(roleId);
        navigate(`/${defaultRoute}`);
      }, 100);
    }, 800);
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 bg-white">
              <img src={logo} alt="Mini-LMS Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Mini-LMS Syst</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Hệ thống quản lý <br/>
            <span className="text-blue-400">Tín dụng & Thế chấp</span>
          </h2>
          <p className="text-slate-400 max-w-md text-lg">
            Nền tảng nội bộ chuyên nghiệp giúp tối ưu hóa quy trình xử lý hồ sơ vay, thẩm định rủi ro và quản lý khách hàng.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Activity className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="text-white font-bold text-lg">99.9%</h4>
                <p className="text-slate-400 text-sm">System Uptime</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Fingerprint className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="text-white font-bold text-lg">Secure</h4>
                <p className="text-slate-400 text-sm">2FA Enabled</p>
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
            <div className="text-center mb-10 lg:hidden">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                <img src={logo} alt="Mini-LMS Logo" className="w-12 h-12 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Mini-LMS</h2>
              <p className="text-slate-500">Đăng nhập để truy cập hệ thống</p>
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Chọn vai trò đăng nhập</h3>
                <p className="text-slate-500 text-sm">Vui lòng chọn vai trò phù hợp để truy cập vào không gian làm việc của bạn (Demo Mode).</p>
            </div>

            <div className="space-y-3">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id as UserRole, { fullName: role.name })}
                        disabled={isLoading !== null}
                        className={`
                            w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
                            ${isLoading === role.id 
                                ? `border-${role.color}-500 bg-${role.color}-50` 
                                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Loading Overlay */}
                        {isLoading === role.id && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                <div className={`w-6 h-6 border-2 border-${role.color}-600 border-t-transparent rounded-full animate-spin`}></div>
                            </div>
                        )}

                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors
                            ${role.id === 'cskh' ? 'bg-blue-100 text-blue-600' : 
                              role.id === 'risk' ? 'bg-amber-100 text-amber-600' : 
                              role.id === 'security' ? 'bg-indigo-100 text-indigo-600' : 
                              role.id === 'accountant' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}
                        `}>
                            <role.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 text-left">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{role.label}</h4>
                            <p className="text-xs text-slate-500">{role.desc}</p>
                        </div>

                        <ArrowRight className={`w-5 h-5 text-slate-300 group-hover:text-${role.color}-500 transition-colors transform group-hover:translate-x-1`} />
                    </button>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    Phiên bản Demo v1.0.2 • Bảo mật bởi Mini-LMS Security
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};