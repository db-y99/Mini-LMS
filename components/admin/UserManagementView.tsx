'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit, Trash2, Search, Filter,
  MoreVertical, Shield, ShieldCheck, Eye, EyeOff,
  ChevronDown, CheckCircle, XCircle
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserManagementViewProps {
  activeView: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ activeView }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Load users from API or storage
    setUsers([]);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'cskh': return 'CSKH';
      case 'security': return 'Bảo mật';
      case 'assessment': return 'Thẩm định viên';
      case 'accountant': return 'Kế toán';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-slate-100 text-slate-800';
      case 'cskh': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-indigo-100 text-indigo-800';
      case 'assessment': return 'bg-amber-100 text-amber-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeView === 'admin/users' ? 'Quản lý Users' : 'Quản lý Roles'}
          </h1>
          <p className="text-slate-600">
            {activeView === 'admin/users'
              ? 'Quản lý tài khoản người dùng và phân quyền'
              : 'Định nghĩa và quản lý vai trò trong hệ thống'
            }
          </p>
        </div>
        {activeView === 'admin/users' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Thêm User
          </button>
        )}
      </div>

      {/* Filters */}
      {activeView === 'admin/users' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
              className="appearance-none px-4 py-2 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="cskh">CSKH</option>
              <option value="security">Bảo mật</option>
              <option value="assessment">Thẩm định viên</option>
              <option value="accountant">Kế toán</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeView === 'admin/users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Đăng nhập cuối
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.fullName}</div>
                          <div className="text-sm text-slate-500">@{user.username}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`p-1 rounded ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy user</h3>
              <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc kiểm tra bộ lọc.</p>
            </div>
          )}
        </div>
      )}

      {/* Roles Management */}
      {activeView === 'admin/roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['admin', 'cskh', 'security', 'assessment', 'accountant'] as UserRole[]).map((role) => (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{getRoleLabel(role)}</h3>
                <Shield className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  {role === 'admin' && 'Quản trị hệ thống, user, và cấu hình'}
                  {role === 'cskh' && 'Tiếp nhận và xử lý hồ sơ ban đầu'}
                  {role === 'security' && 'Kiểm tra bảo mật và gian lận'}
                  {role === 'assessment' && 'Thẩm định tài chính và rủi ro'}
                  {role === 'accountant' && 'Giải ngân và quản lý tài chính'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {users.filter(u => u.role === role).length} users
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Chỉnh sửa quyền
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
