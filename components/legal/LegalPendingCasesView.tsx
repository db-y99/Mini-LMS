'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, Eye, User, Calendar, AlertTriangle } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const LegalPendingCasesView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter loans that need legal action (DPD > 90) and not yet assigned
  const pendingCases = loans.filter(loan => 
    loan.dpd > 90 && !loan.recovery_status
  );

  const filteredCases = pendingCases.filter(loan =>
    loan.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer.phoneNumber.includes(searchTerm) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vụ việc chờ xử lý</h1>
        <p className="text-slate-600 text-sm">
          Các khoản vay quá hạn nghiêm trọng cần đánh giá pháp lý.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-600" />
          <div>
            <div className="text-2xl font-bold text-slate-900">{pendingCases.length}</div>
            <div className="text-sm text-slate-600">Vụ việc chờ xử lý</div>
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
                <th className="px-4 py-3 text-center">Ngày quá hạn</th>
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
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {new Date(loan.updatedAt).toLocaleDateString('vi-VN')}
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
                    Không có vụ việc chờ xử lý
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900 text-sm mb-1">
              Ưu tiên xử lý
            </div>
            <p className="text-sm text-amber-800">
              Các khoản vay quá hạn trên 90 ngày cần được đánh giá và xử lý pháp lý ngay lập tức 
              để tránh tổn thất tài chính.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
