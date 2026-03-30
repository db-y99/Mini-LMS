'use client';
import React, { useState, useEffect } from 'react';
import {
  CreditCard, AlertTriangle, CheckCircle, Clock, DollarSign,
  Search, Filter, Download, Eye, Calendar, TrendingUp,
  TrendingDown, User, Phone, MapPin, ChevronDown, X, List
} from 'lucide-react';
import { PaymentScheduleView } from '@/components/PaymentScheduleView';
import { PaymentSchedule, PaymentScheduleItem } from '@/types';

interface LoanRepayment {
  id: string;
  loanId: string;
  customerName: string;
  customerPhone: string;
  loanAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  dueDate: Date;
  status: 'current' | 'overdue' | 'paid' | 'defaulted';
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  overdueDays: number;
  totalPaid: number;
  nextPaymentDate: Date;
}

export const LoanRepaymentsView: React.FC = () => {
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [filteredRepayments, setFilteredRepayments] = useState<LoanRepayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRepayment, setSelectedRepayment] = useState<LoanRepayment | null>(null);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);

  useEffect(() => {
    let filtered = repayments;

    if (searchTerm) {
      filtered = filtered.filter(repayment =>
        repayment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repayment.customerPhone.includes(searchTerm) ||
        repayment.loanId.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(repayment => repayment.status === statusFilter);
    }

    setFilteredRepayments(filtered);
  }, [repayments, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-amber-100 text-amber-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current': return 'Đang trả nợ';
      case 'overdue': return 'Quá hạn';
      case 'paid': return 'Đã hoàn thành';
      case 'defaulted': return 'Nợ xấu';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'paid': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'defaulted': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

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
    }).format(date);
  };

  const calculateProgress = (repayment: LoanRepayment) => {
    const totalPaid = repayment.totalPaid;
    const totalAmount = repayment.loanAmount;
    return (totalPaid / totalAmount) * 100;
  };

  // Tạo payment schedule từ repayment data
  const generatePaymentSchedule = (repayment: LoanRepayment): PaymentSchedule => {
    const items: PaymentScheduleItem[] = [];
    const monthlyPayment = repayment.monthlyPayment;
    const loanDuration = Math.ceil(repayment.loanAmount / monthlyPayment);
    const startDate = new Date(repayment.nextPaymentDate);
    startDate.setMonth(startDate.getMonth() - 1); // Bắt đầu từ kỳ trước

    let remainingBalance = repayment.loanAmount;
    const interestRate = 0.18; // 18% năm, giả định
    const monthlyInterestRate = interestRate / 12;

    for (let i = 1; i <= loanDuration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Tính toán gốc và lãi
      const interestAmount = remainingBalance * monthlyInterestRate;
      const principalAmount = monthlyPayment - interestAmount;
      const totalAmount = monthlyPayment;

      // Cập nhật số dư còn lại
      remainingBalance = Math.max(0, remainingBalance - principalAmount);

      // Xác định trạng thái
      let status: 'pending' | 'paid' | 'overdue' | 'partial' = 'pending';
      let paidAmount: number | undefined;
      let paidDate: Date | undefined;
      let overdueDays: number | undefined;

      if (i === 1 && repayment.lastPaymentDate) {
        // Kỳ đầu tiên đã trả
        status = 'paid';
        paidAmount = repayment.lastPaymentAmount || monthlyPayment;
        paidDate = repayment.lastPaymentDate;
      } else if (dueDate < new Date()) {
        // Quá hạn
        const daysDiff = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          status = 'overdue';
          overdueDays = daysDiff;
        }
      }

      items.push({
        id: `ITEM_${repayment.loanId}_${i}`,
        loanId: repayment.loanId,
        installmentNumber: i,
        dueDate,
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        totalAmount: Math.round(totalAmount),
        status,
        paidAmount,
        paidDate,
        overdueDays
      });
    }

    return {
      id: `SCHEDULE_${repayment.loanId}`,
      loanId: repayment.loanId,
      customerId: repayment.loanId,
      customerName: repayment.customerName,
      loanAmount: repayment.loanAmount,
      totalPayment: repayment.loanAmount + (repayment.loanAmount * interestRate * loanDuration / 12),
      monthlyPayment: repayment.monthlyPayment,
      loanDuration,
      interestRate: interestRate * 100,
      startDate,
      items,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const handleViewPaymentSchedule = (repayment: LoanRepayment) => {
    const schedule = generatePaymentSchedule(repayment);
    setPaymentSchedule(schedule);
    setShowPaymentSchedule(true);
  };

  const stats = {
    total: repayments.length,
    current: repayments.filter(r => r.status === 'current').length,
    overdue: repayments.filter(r => r.status === 'overdue').length,
    paid: repayments.filter(r => r.status === 'paid').length,
    defaulted: repayments.filter(r => r.status === 'defaulted').length,
    totalOutstanding: repayments.reduce((sum, r) => sum + r.remainingBalance, 0),
    totalOverdue: repayments
      .filter(r => r.status === 'overdue' || r.status === 'defaulted')
      .reduce((sum, r) => sum + r.remainingBalance, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theo dõi trả nợ</h1>
          <p className="text-slate-600">Quản lý và giám sát tiến độ trả nợ của khách hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tổng hồ sơ</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đang trả nợ</p>
              <p className="text-2xl font-bold text-green-600">{stats.current}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Quá hạn</p>
              <p className="text-2xl font-bold text-amber-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Dư nợ còn lại</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại..."
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
              <option value="current">Đang trả nợ</option>
              <option value="overdue">Quá hạn</option>
              <option value="paid">Đã hoàn thành</option>
              <option value="defaulted">Nợ xấu</option>
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

      {/* Repayments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Danh sách trả nợ</h3>
            <span className="text-sm text-slate-500">{filteredRepayments.length} kết quả</span>
          </div>

          <div className="space-y-4">
            {filteredRepayments.map((repayment) => {
              const progress = calculateProgress(repayment);
              return (
                <div key={repayment.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(repayment.status)}
                      <div>
                        <h4 className="font-semibold text-slate-900">{repayment.customerName}</h4>
                        <p className="text-sm text-slate-500">#{repayment.loanId} • {repayment.customerPhone}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(repayment.status)}`}>
                      {getStatusLabel(repayment.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Tổng vay</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(repayment.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Đã trả</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(repayment.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Còn lại</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(repayment.remainingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Trả hàng tháng</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(repayment.monthlyPayment)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Tiến độ trả nợ</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 75 ? 'bg-blue-500' :
                          progress >= 50 ? 'bg-amber-500' : 'bg-slate-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      <span>Hạn trả tiếp theo: </span>
                      <span className={`font-medium ${
                        repayment.status === 'overdue' ? 'text-red-600' :
                        repayment.status === 'defaulted' ? 'text-red-700' : 'text-slate-900'
                      }`}>
                        {formatDate(repayment.nextPaymentDate)}
                      </span>
                      {repayment.overdueDays > 0 && (
                        <span className="text-red-600 ml-2">
                          (Quá hạn {repayment.overdueDays} ngày)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPaymentSchedule(repayment)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <List className="w-4 h-4" />
                        Lịch trả nợ
                      </button>
                      <button
                        onClick={() => setSelectedRepayment(repayment)}
                        className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                      {repayment.status === 'overdue' && (
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Thu hồi nợ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRepayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy hồ sơ trả nợ</h3>
              <p className="text-slate-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Repayment Detail Modal */}
      {selectedRepayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Chi tiết trả nợ</h3>
                <button
                  onClick={() => setSelectedRepayment(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Thông tin khách hàng</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Họ tên:</span> {selectedRepayment.customerName}</p>
                      <p><span className="font-medium">Số điện thoại:</span> {selectedRepayment.customerPhone}</p>
                      <p><span className="font-medium">Mã hồ sơ:</span> {selectedRepayment.loanId}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Trạng thái trả nợ</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRepayment.status)}`}>
                          {getStatusLabel(selectedRepayment.status)}
                        </span>
                      </p>
                      <p><span className="font-medium">Hạn trả tiếp theo:</span> {formatDate(selectedRepayment.nextPaymentDate)}</p>
                      {selectedRepayment.overdueDays > 0 && (
                        <p><span className="font-medium text-red-600">Quá hạn:</span> {selectedRepayment.overdueDays} ngày</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Tổng vay</h5>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedRepayment.loanAmount)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="text-sm font-medium text-green-700 mb-2">Đã trả</h5>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedRepayment.totalPaid)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Còn lại</h5>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedRepayment.remainingBalance)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Lịch sử thanh toán</h4>
                  <div className="space-y-2">
                    {selectedRepayment.lastPaymentDate && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Thanh toán gần nhất</p>
                          <p className="text-xs text-slate-500">{formatDate(selectedRepayment.lastPaymentDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{formatCurrency(selectedRepayment.lastPaymentAmount || 0)}</p>
                          <p className="text-xs text-slate-500">Trả hàng tháng</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Số tiền hàng tháng</p>
                        <p className="text-xs text-slate-500">Lịch trả định kỳ</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedRepayment.monthlyPayment)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      if (selectedRepayment) {
                        handleViewPaymentSchedule(selectedRepayment);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    Xem lịch trả nợ
                  </button>
                  <button
                    onClick={() => setSelectedRepayment(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  {selectedRepayment.status === 'overdue' && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Khởi tạo thu hồi nợ
                    </button>
                  )}
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Ghi nhận thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Schedule Modal */}
      {showPaymentSchedule && paymentSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full mx-4 my-8 max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Lịch trả nợ chi tiết</h3>
                <button
                  onClick={() => {
                    setShowPaymentSchedule(false);
                    setPaymentSchedule(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PaymentScheduleView
                schedule={paymentSchedule}
                onClose={() => {
                  setShowPaymentSchedule(false);
                  setPaymentSchedule(null);
                }}
                showHeader={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
