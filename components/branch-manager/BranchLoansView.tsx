'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useRouter } from 'next/navigation';

export const BranchLoansView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLoans = loans.filter(loan => {
    const matchSearch = loan.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
                       loan.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || loan.canonicalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Vay Chi nhánh</h1>
        <p className="text-slate-600 text-sm">
          Quản lý tất cả hồ sơ vay của chi nhánh.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Search className="inline w-3 h-3 mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên, mã hồ sơ..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Filter className="inline w-3 h-3 mr-1" />
              Lọc theo trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="SUBMITTED">Đã nộp</option>
              <option value="UNDER_ASSESSMENT">Đang thẩm định</option>
              <option value="CREDIT_APPROVED">Đã duyệt</option>
              <option value="DISBURSED">Đã giải ngân</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">
            Danh sách ({filteredLoans.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Mã HS</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-right">Số tiền</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{loan.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.phoneNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">{loan.canonicalStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {loan.createdAt.toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/admin/loans/${loan.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="w-3 h-3" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
