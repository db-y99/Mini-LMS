'use client';
import React, { useState, useEffect } from 'react';
import { Building2, FileText, TrendingUp, DollarSign, Search, Filter } from 'lucide-react';
import { branchModule, loanModule } from '@modules';
import { Branch } from '@/types';
import Link from 'next/link';

interface BranchLoanStats {
  branchId: string;
  branchName: string;
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  totalAmount: number;
  averageAmount: number;
}

export const BranchLoansView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Mock data for demo
  const [branchStats] = useState<BranchLoanStats[]>([
    {
      branchId: 'branch-1',
      branchName: 'Chi nhánh Hà Nội',
      totalLoans: 45,
      pendingLoans: 12,
      approvedLoans: 28,
      rejectedLoans: 5,
      totalAmount: 2250000000,
      averageAmount: 50000000
    },
    {
      branchId: 'branch-2',
      branchName: 'Chi nhánh TP.HCM',
      totalLoans: 38,
      pendingLoans: 8,
      approvedLoans: 25,
      rejectedLoans: 5,
      totalAmount: 1900000000,
      averageAmount: 50000000
    }
  ]);

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

  const filteredStats = branchStats.filter(stat => {
    const matchSearch = stat.branchName.toLowerCase().includes(search.toLowerCase());
    const matchBranch = selectedBranch === 'all' || stat.branchId === selectedBranch;
    return matchSearch && matchBranch;
  });

  const totalStats = {
    totalLoans: branchStats.reduce((sum, s) => sum + s.totalLoans, 0),
    totalAmount: branchStats.reduce((sum, s) => sum + s.totalAmount, 0),
    pendingLoans: branchStats.reduce((sum, s) => sum + s.pendingLoans, 0),
    approvedLoans: branchStats.reduce((sum, s) => sum + s.approvedLoans, 0)
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Vay theo Chi nhánh</h1>
        <p className="text-slate-600 text-sm">
          Theo dõi và phân tích hiệu suất cho vay của từng chi nhánh.
        </p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStats.totalLoans}</div>
          <div className="text-xs text-slate-600">Hồ sơ vay</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Đang xử lý</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStats.pendingLoans}</div>
          <div className="text-xs text-slate-600">Hồ sơ chờ duyệt</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đã duyệt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalStats.approvedLoans}</div>
          <div className="text-xs text-slate-600">Hồ sơ được phê duyệt</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-slate-500">Tổng giá trị</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(totalStats.totalAmount / 1000000000).toFixed(1)}B
          </div>
          <div className="text-xs text-slate-600">VND</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Search className="inline w-3 h-3 mr-1" />
              Tìm kiếm chi nhánh
            </label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên chi nhánh..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Filter className="inline w-3 h-3 mr-1" />
              Lọc theo chi nhánh
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả chi nhánh</option>
              {branches.filter(b => b.isActive).map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branch stats table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">
              Thống kê theo chi nhánh
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Chi nhánh</th>
                <th className="px-4 py-2 text-right">Tổng HS</th>
                <th className="px-4 py-2 text-right">Chờ duyệt</th>
                <th className="px-4 py-2 text-right">Đã duyệt</th>
                <th className="px-4 py-2 text-right">Từ chối</th>
                <th className="px-4 py-2 text-right">Tổng giá trị</th>
                <th className="px-4 py-2 text-right">TB/HS</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map(stat => (
                <tr key={stat.branchId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{stat.branchName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {stat.totalLoans}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-600 font-medium">
                    {stat.pendingLoans}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">
                    {stat.approvedLoans}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
                    {stat.rejectedLoans}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {(stat.totalAmount / 1000000).toLocaleString()}M
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {(stat.averageAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/loans?branch=${stat.branchId}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy dữ liệu phù hợp.
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
          <span className="font-semibold">Lưu ý:</span> Dữ liệu hiển thị là demo. Trong phiên bản đầy đủ, thống kê sẽ được tính toán từ dữ liệu thực tế của hệ thống.
        </p>
      </div>
    </div>
  );
};
