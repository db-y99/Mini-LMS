'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Search, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { LoanApplication } from '@/types';

export const RecoveredLoansView: React.FC = () => {
  const { loans } = useWorkflow();
  const [recoveredLoans, setRecoveredLoans] = useState<LoanApplication[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const recovered = loans.filter(loan => loan.recovery_status === 'recovered');
    setRecoveredLoans(recovered);
  }, [loans]);

  const filteredLoans = recoveredLoans.filter(loan =>
    loan.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
    loan.customer.phoneNumber.includes(search) ||
    loan.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecovered = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khoản vay đã Thu hồi</h1>
        <p className="text-slate-600 text-sm">
          Danh sách các khoản vay đã thu hồi thành công.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Tổng số</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{filteredLoans.length}</div>
          <div className="text-xs text-slate-600">Khoản đã thu hồi</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Tổng giá trị</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(totalRecovered / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-slate-600">VND</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Trung bình</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {filteredLoans.length > 0 ? (totalRecovered / filteredLoans.length / 1000000).toFixed(1) : 0}M
          </div>
          <div className="text-xs text-slate-600">VND/khoản</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className="block text-xs font-medium text-slate-600 mb-2">
          <Search className="inline w-3 h-3 mr-1" />
          Tìm kiếm
        </label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm theo tên, SĐT, mã hồ sơ..."
        />
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
                <th className="px-4 py-2 text-left">Ngày thu hồi</th>
                <th className="px-4 py-2 text-left">Ghi chú</th>
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
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {loan.updatedAt ? new Date(loan.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    Thu hồi thành công
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có khoản vay nào được thu hồi.
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
