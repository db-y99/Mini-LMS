'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Search, Eye, Clock } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const LegalInProgressView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter loans in legal process
  const inProgressCases = loans.filter(loan => 
    loan.recovery_status === 'legal'
  );

  const filteredCases = inProgressCases.filter(loan =>
    loan.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer.phoneNumber.includes(searchTerm) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vụ việc đang xử lý</h1>
        <p className="text-slate-600 text-sm">
          Các vụ việc pháp lý đang trong quá trình xử lý.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-slate-900">{inProgressCases.length}</div>
            <div className="text-sm text-slate-600">Đang xử lý</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, mã hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Mã hồ sơ</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-center">DPD</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {loan.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.phoneNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {loan.dpd} ngày
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Activity className="w-3 h-3 mr-1" />
                      Đang xử lý
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/legal/cases/${loan.id}`)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Không có vụ việc đang xử lý
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
