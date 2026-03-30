'use client';
import React, { useState, useEffect } from 'react';
import { Building2, Users, UserPlus, Search, X } from 'lucide-react';
import { branchModule } from '@modules';
import { Branch } from '@/types';

interface UserAssignment {
  userId: string;
  userName: string;
  role: string;
  branchId?: string;
  branchName?: string;
}

export const BranchAssignmentView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users] = useState<UserAssignment[]>([
    { userId: 'user-1', userName: 'Nguyễn Văn A', role: 'CS', branchId: 'branch-1', branchName: 'Chi nhánh Hà Nội' },
    { userId: 'user-2', userName: 'Trần Thị B', role: 'CA', branchId: 'branch-1', branchName: 'Chi nhánh Hà Nội' },
    { userId: 'user-3', userName: 'Lê Văn C', role: 'CS', branchId: 'branch-2', branchName: 'Chi nhánh TP.HCM' },
    { userId: 'user-4', userName: 'Phạm Thị D', role: 'CA' },
    { userId: 'user-5', userName: 'Hoàng Văn E', role: 'SEC' },
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await branchModule.getBranches();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.userName.toLowerCase().includes(search.toLowerCase()) ||
                       user.role.toLowerCase().includes(search.toLowerCase());
    const matchBranch = selectedBranch === 'all' || 
                       (selectedBranch === 'unassigned' && !user.branchId) ||
                       user.branchId === selectedBranch;
    return matchSearch && matchBranch;
  });

  const getBranchStats = (branchId: string) => {
    return users.filter(u => u.branchId === branchId).length;
  };

  const unassignedCount = users.filter(u => !u.branchId).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phân bổ Nhân sự theo Chi nhánh</h1>
        <p className="text-slate-600 text-sm">
          Quản lý phân công nhân viên vào các chi nhánh hoạt động.
        </p>
      </div>

      {/* Branch overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.filter(b => b.isActive).map(branch => (
          <div
            key={branch.id}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedBranch(branch.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">{branch.code}</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{branch.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Users className="w-3 h-3" />
              <span>{getBranchStats(branch.id)} nhân viên</span>
            </div>
          </div>
        ))}
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedBranch('unassigned')}
        >
          <div className="flex items-start justify-between mb-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">N/A</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Chưa phân bổ</h3>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Users className="w-3 h-3" />
            <span>{unassignedCount} nhân viên</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Tìm kiếm nhân viên
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm theo tên, vai trò..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Lọc theo chi nhánh
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả chi nhánh</option>
              <option value="unassigned">Chưa phân bổ</option>
              {branches.filter(b => b.isActive).map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">
              Danh sách nhân viên ({filteredUsers.length})
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Nhân viên</th>
                <th className="px-4 py-2 text-left">Vai trò</th>
                <th className="px-4 py-2 text-left">Chi nhánh hiện tại</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.userId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{user.userName}</div>
                    <div className="text-xs text-slate-500">{user.userId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.branchName ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{user.branchName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa phân bổ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        title="Phân bổ chi nhánh"
                      >
                        Phân bổ
                      </button>
                      {user.branchId && (
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          title="Gỡ khỏi chi nhánh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy nhân viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Lưu ý:</span> Đây là giao diện demo. Chức năng phân bổ nhân sự sẽ được tích hợp với hệ thống quản lý người dùng trong phiên bản đầy đủ.
        </p>
      </div>
    </div>
  );
};
