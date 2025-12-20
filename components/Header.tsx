import React from 'react';
import { Bell, Search, Menu, UserCircle, ChevronDown, RotateCcw } from 'lucide-react';

interface HeaderProps {
    userName: string;
    userRole: string;
}

export const Header: React.FC<HeaderProps> = ({ userName, userRole }) => {
  const getRoleLabel = (role: string) => {
    switch(role) {
        case 'cskh': return 'CS';
        case 'assessment': return 'Credit Assessment';
        case 'security': return 'Security';
        case 'accountant': return 'Accountant';
        case 'admin': return 'Administrator';
        case 'customer': return 'Customer';
        default: return 'Staff';
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">Hệ thống Mini-LMS</h1>
        </div>
      
      <div className="flex items-center gap-4">
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
          />
        </div>

        {/* Reload Button */}
        <button
          onClick={handleReload}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          title="Reload Page"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900">{userName}</p>
            <p className="text-xs text-blue-600 font-medium">{getRoleLabel(userRole)}</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <UserCircle className="w-full h-full p-1" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 md:hidden" />
        </div>
      </div>
    </header>
  );
};