'use client';
import React, { useState, useEffect } from 'react';
import { Scale, Search, Gavel, Clock } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { LoanApplication } from '@/types';

interface LegalCasesViewProps {
  filterType?: 'all' | 'pending' | 'in-progress' | 'court' | 'settled';
}

export const LegalCasesView: React.FC<LegalCasesViewProps> = ({ filterType = 'all' }) => {
  const { loans } = useWorkflow();
  const [cases, setCases] = useState<LoanApplication[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let filtered = loans.filter(loan => loan.dpd > 90);

    if (filterType === 'pending') {
      filtered = filtered.filter(l => !l.recovery_status);
    } else if (filterType === 'in-progress') {
      filtered = filtered.filter(l => l.recovery_status === 'legal');
    } else if (filterType === 'settled') {
      filtered = filtered.filter(l => l.recovery_status === 'recovered');
    }

    if (search) {
      filtered = filtered.filter(l =>
        l.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.customer.phoneNumber.includes(search) ||
        l.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    setCases(filtered);
  }, [loans, filterType, search]);

  const getTitle = () => {
    switch (filterType) {
      case 'pending': return 'Vụ việc chờ xử lý';
      case 'in-progress': return 'Đang xử lý';
      case 'court': return 'Vụ kiện tòa án';
      case 'settled': return 'Đã giải quyết';
      default: return 'Tất cả vụ việc pháp lý';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
        <p className="text-slate-600 text-sm">
          Danh sách các khoản vay cần xử lý pháp lý (quá hạn &gt;90 ngày).
        </p>
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
            Danh sách ({cases.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Mã HS</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-right">Số tiền</th>
                <th className="px-4 py-2 text-center">DPD</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{loan.id.slice(0, 8)}</td>
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
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">
                      {loan.recovery_status === 'legal' ? 'Đang xử lý' : 
                       loan.recovery_status === 'recovered' ? 'Đã giải quyết' : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không có vụ việc nào.
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
