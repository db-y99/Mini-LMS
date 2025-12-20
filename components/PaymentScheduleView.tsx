import React, { useState, useMemo } from 'react';
import {
  Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle,
  Download, Filter, Search, X, ChevronDown, TrendingUp, TrendingDown
} from 'lucide-react';
import { PaymentSchedule, PaymentScheduleItem } from '../types';

interface PaymentScheduleViewProps {
  schedule: PaymentSchedule;
  onClose?: () => void;
  showHeader?: boolean;
}

export const PaymentScheduleView: React.FC<PaymentScheduleViewProps> = ({
  schedule,
  onClose,
  showHeader = true
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'overdue': return 'Quá hạn';
      case 'partial': return 'Trả một phần';
      case 'pending': return 'Chờ thanh toán';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'partial': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  // Tính toán thống kê
  const stats = useMemo(() => {
    const totalItems = schedule.items.length;
    const paidItems = schedule.items.filter(item => item.status === 'paid').length;
    const overdueItems = schedule.items.filter(item => item.status === 'overdue').length;
    const pendingItems = schedule.items.filter(item => item.status === 'pending').length;
    const totalPaid = schedule.items
      .filter(item => item.status === 'paid' || item.status === 'partial')
      .reduce((sum, item) => sum + (item.paidAmount || item.totalAmount), 0);
    const totalRemaining = schedule.totalPayment - totalPaid;
    const overdueAmount = schedule.items
      .filter(item => item.status === 'overdue')
      .reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      totalItems,
      paidItems,
      overdueItems,
      pendingItems,
      totalPaid,
      totalRemaining,
      overdueAmount,
      progress: (totalPaid / schedule.totalPayment) * 100
    };
  }, [schedule]);

  // Lọc danh sách
  const filteredItems = useMemo(() => {
    let filtered = schedule.items;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.installmentNumber.toString().includes(searchTerm) ||
        formatDate(item.dueDate).includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => a.installmentNumber - b.installmentNumber);
  }, [schedule.items, statusFilter, searchTerm]);

  const handleExport = () => {
    // Tạo nội dung CSV
    const headers = ['Kỳ', 'Ngày đến hạn', 'Gốc', 'Lãi', 'Tổng', 'Trạng thái', 'Đã trả', 'Ngày trả'];
    const rows = schedule.items.map(item => [
      item.installmentNumber.toString(),
      formatDate(item.dueDate),
      item.principalAmount.toString(),
      item.interestAmount.toString(),
      item.totalAmount.toString(),
      getStatusLabel(item.status),
      (item.paidAmount || 0).toString(),
      item.paidDate ? formatDate(item.paidDate) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `LichTraNo_${schedule.loanId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lịch trả nợ</h2>
            <p className="text-slate-600 mt-1">
              Khách hàng: <span className="font-medium">{schedule.customerName}</span> • 
              Mã hồ sơ: <span className="font-medium">{schedule.loanId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tổng số kỳ</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
            </div>
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidItems}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pendingItems}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Thông tin tài chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Tổng đã trả</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Còn lại</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalRemaining)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Quá hạn</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900">Tiến độ thanh toán</span>
          <span className="text-sm font-bold text-blue-600">{stats.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${Math.min(stats.progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
          <span>{formatCurrency(stats.totalPaid)}</span>
          <span>{formatCurrency(schedule.totalPayment)}</span>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo kỳ, ngày..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
              <option value="partial">Trả một phần</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Bảng lịch trả nợ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kỳ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Ngày đến hạn
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Gốc
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Lãi
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tổng
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Đã trả
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Ngày trả
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const isOverdue = item.status === 'overdue' || 
                  (item.status === 'pending' && new Date(item.dueDate) < new Date());
                const isPaid = item.status === 'paid';
                const isPartial = item.status === 'partial';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isOverdue ? 'bg-red-50/50' : isPaid ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-slate-900">
                          Kỳ {item.installmentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={`text-sm ${
                          isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'
                        }`}>
                          {formatDate(item.dueDate)}
                        </span>
                        {item.overdueDays && item.overdueDays > 0 && (
                          <span className="text-xs text-red-600">
                            (+{item.overdueDays} ngày)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-slate-900">{formatCurrency(item.principalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-slate-900">{formatCurrency(item.interestAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {isPaid || isPartial ? (
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(item.paidAmount || item.totalAmount)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.paidDate ? (
                        <span className="text-sm text-slate-900">{formatDate(item.paidDate)}</span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy kỳ trả nợ</h3>
            <p className="text-slate-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
          </div>
        )}
      </div>

      {/* Tổng kết */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tổng kết</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-2">Thông tin khoản vay</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Số tiền vay:</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(schedule.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Lãi suất:</span>
                <span className="text-sm font-medium text-slate-900">{schedule.interestRate}% / năm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Thời hạn:</span>
                <span className="text-sm font-medium text-slate-900">{schedule.loanDuration} tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Trả hàng tháng:</span>
                <span className="text-sm font-medium text-blue-600">{formatCurrency(schedule.monthlyPayment)}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Tình trạng thanh toán</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tổng phải trả:</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(schedule.totalPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Đã trả:</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(stats.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Còn lại:</span>
                <span className="text-sm font-medium text-slate-900">{formatCurrency(stats.totalRemaining)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tiến độ:</span>
                <span className="text-sm font-bold text-blue-600">{stats.progress.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

