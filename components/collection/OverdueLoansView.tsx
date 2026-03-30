'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download
} from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { LoanApplication } from '@/types';

interface OverdueLoansViewProps {
  filterType?: 'all' | 'minor' | 'severe' | 'legal';
}

export const OverdueLoansView: React.FC<OverdueLoansViewProps> = ({ filterType = 'all' }) => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dpd' | 'amount' | 'date'>('dpd');

  useEffect(() => {
    filterLoans();
  }, [loans, filterType, search, sortBy]);

  const filterLoans = () => {
    // Get overdue loans (DISBURSED, IN_REPAYMENT, or COLLECTION_IN_PROGRESS with dpd > 0)
    let overdue = loans.filter(
      loan => (loan.canonicalStatus === 'DISBURSED' || loan.canonicalStatus === 'IN_REPAYMENT' || loan.canonicalStatus === 'COLLECTION_IN_PROGRESS') && loan.dpd > 0
    );

    // Apply filter type
    if (filterType === 'minor') {
      overdue = overdue.filter(loan => loan.dpd >= 1 && loan.dpd <= 30);
    } else if (filterType === 'severe') {
      overdue = overdue.filter(loan => loan.dpd >= 31 && loan.dpd <= 90);
    } else if (filterType === 'legal') {
      overdue = overdue.filter(loan => loan.dpd > 90);
    }

    // Apply search
    if (search) {
      overdue = overdue.filter(loan =>
        loan.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        loan.customer.phoneNumber.includes(search) ||
        loan.customer.idNumber.includes(search) ||
        loan.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'dpd') {
      overdue.sort((a, b) => b.dpd - a.dpd);
    } else if (sortBy === 'amount') {
      overdue.sort((a, b) => b.loanAmount - a.loanAmount);
    } else if (sortBy === 'date') {
      overdue.sort((a, b) => new Date(b.disbursedAt || 0).getTime() - new Date(a.disbursedAt || 0).getTime());
    }

    setFilteredLoans(overdue);
  };

  const getTitle = () => {
    switch (filterType) {
      case 'minor':
        return 'Nợ quá hạn nhẹ (1-30 ngày)';
      case 'severe':
        return 'Nợ quá hạn nghiêm trọng (31-90 ngày)';
      case 'legal':
        return 'Cần xử lý pháp lý (>90 ngày)';
      default:
        return 'Tất cả nợ quá hạn';
    }
  };

  const getOverdueLevelColor = (dpd: number) => {
    if (dpd <= 30) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (dpd <= 90) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getOverdueLevelLabel = (dpd: number) => {
    if (dpd <= 30) return 'Nhẹ';
    if (dpd <= 90) return 'Nghiêm trọng';
    return 'Pháp lý';
  };

  const totalAmount = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

  const handleExport = () => {
    // Mock export functionality
    alert('Chức năng xuất báo cáo đang được phát triển');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
          <p className="text-slate-600 text-sm">
            Danh sách các khoản vay cần liên hệ khách hàng để thu hồi nợ.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng số</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{filteredLoans.length}</div>
          <div className="text-xs text-slate-600">Khoản vay</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tổng nợ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(totalAmount / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-slate-600">VND</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">TB quá hạn</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {filteredLoans.length > 0
              ? Math.round(filteredLoans.reduce((sum, l) => sum + l.dpd, 0) / filteredLoans.length)
              : 0}
          </div>
          <div className="text-xs text-slate-600">Ngày</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Search className="inline w-3 h-3 mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên, SĐT, CMND, mã hồ sơ..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              <Filter className="inline w-3 h-3 mr-1" />
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'dpd' | 'amount' | 'date')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dpd">Số ngày quá hạn (cao → thấp)</option>
              <option value="amount">Số tiền (cao → thấp)</option>
              <option value="date">Ngày giải ngân (mới → cũ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-slate-900">
              Danh sách khoản vay ({filteredLoans.length})
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Mã HS</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-left">Liên hệ</th>
                <th className="px-4 py-2 text-right">Số tiền vay</th>
                <th className="px-4 py-2 text-center">DPD</th>
                <th className="px-4 py-2 text-center">Mức độ</th>
                <th className="px-4 py-2 text-left">Ngày giải ngân</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-slate-900 font-semibold">
                      {loan.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-slate-500">{loan.collateralType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.idNumber}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{loan.customer.phoneNumber}</span>
                      </div>
                      {loan.customer.email && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{loan.customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-slate-900">
                      {(loan.loanAmount / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-slate-500">
                      {loan.loanDuration} tháng
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {loan.dpd} ngày
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getOverdueLevelColor(loan.dpd)}`}>
                      {getOverdueLevelLabel(loan.dpd)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">
                      {loan.disbursedAt
                        ? new Date(loan.disbursedAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`tel:${loan.customer.phoneNumber}`}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        title="Gọi điện"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => router.push(`/admin/loans/${loan.id}`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy khoản vay quá hạn phù hợp.
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
