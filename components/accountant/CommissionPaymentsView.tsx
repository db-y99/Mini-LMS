import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Filter, Download, CheckCircle, Clock,
  AlertTriangle, TrendingUp, Users, Calendar, CreditCard,
  ChevronDown, Eye, X, UserCheck
} from 'lucide-react';

interface CommissionPayment {
  id: string;
  loanId: string;
  customerName: string;
  referrerId: string;
  referrerName: string;
  loanAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  paidBy?: string;
  notes?: string;
  paymentMethod?: 'bank_transfer' | 'cash' | 'wallet';
}

export const CommissionPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<CommissionPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<CommissionPayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loanId.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'bank_transfer': return 'Chuyển khoản';
      case 'cash': return 'Tiền mặt';
      case 'wallet': return 'Ví điện tử';
      default: return 'Chưa xác định';
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleProcessPayment = (payment: CommissionPayment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedPayment) return;

    // Update payment status
    setPayments(prev => prev.map(p =>
      p.id === selectedPayment.id
        ? { ...p, status: 'paid' as const, paidAt: new Date(), paidBy: 'Phạm Thị Mai', paymentMethod: 'bank_transfer' }
        : p
    ));

    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    totalAmount: payments.reduce((sum, p) => sum + p.commissionAmount, 0),
    paidAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.commissionAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thanh toán hoa hồng</h1>
          <p className="text-slate-600">Quản lý và xử lý thanh toán hoa hồng cho nhân viên</p>
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
              <p className="text-sm text-slate-600">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tổng hoa hồng</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đã chi trả</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
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
              placeholder="Tìm kiếm theo tên khách hàng, nhân viên..."
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
              <option value="cancelled">Đã hủy</option>
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

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Danh sách thanh toán</h3>
            <span className="text-sm text-slate-500">{filteredPayments.length} kết quả</span>
          </div>

          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-semibold text-slate-900">{payment.customerName}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                      <span className="text-sm text-slate-500">#{payment.loanId}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Nhân viên giới thiệu:</span> {payment.referrerName}
                      </div>
                      <div>
                        <span className="font-medium">Số tiền vay:</span> {formatCurrency(payment.loanAmount)}
                      </div>
                      <div>
                        <span className="font-medium">Hoa hồng:</span> {formatCurrency(payment.commissionAmount)}
                        <span className="text-slate-500 ml-1">({payment.commissionRate}%)</span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-slate-500">
                      Tạo: {formatDate(payment.createdAt)}
                      {payment.paidAt && ` • Thanh toán: ${formatDate(payment.paidAt)}`}
                      {payment.paymentMethod && ` • ${getPaymentMethodLabel(payment.paymentMethod)}`}
                    </div>

                    {payment.notes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
                        {payment.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </button>
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleProcessPayment(payment)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Thanh toán
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy thanh toán</h3>
              <p className="text-slate-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && !showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Chi tiết thanh toán hoa hồng</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
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
                      <p><span className="font-medium">Họ tên:</span> {selectedPayment.customerName}</p>
                      <p><span className="font-medium">Mã hồ sơ:</span> {selectedPayment.loanId}</p>
                      <p><span className="font-medium">Số tiền vay:</span> {formatCurrency(selectedPayment.loanAmount)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Thông tin hoa hồng</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nhân viên:</span> {selectedPayment.referrerName}</p>
                      <p><span className="font-medium">Tỷ lệ hoa hồng:</span> {selectedPayment.commissionRate}%</p>
                      <p><span className="font-medium">Số tiền hoa hồng:</span> {formatCurrency(selectedPayment.commissionAmount)}</p>
                      <p><span className="font-medium">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayment.status)}`}>
                          {getStatusLabel(selectedPayment.status)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Thời gian</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Ngày tạo:</span> {formatDate(selectedPayment.createdAt)}</p>
                      {selectedPayment.paidAt && (
                        <p><span className="font-medium">Ngày thanh toán:</span> {formatDate(selectedPayment.paidAt)}</p>
                      )}
                    </div>
                  </div>

                  {selectedPayment.paidBy && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Thông tin thanh toán</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Người thanh toán:</span> {selectedPayment.paidBy}</p>
                        <p><span className="font-medium">Phương thức:</span> {getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedPayment.notes && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Ghi chú</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedPayment.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  {selectedPayment.status === 'pending' && (
                    <button
                      onClick={() => handleProcessPayment(selectedPayment)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Xử lý thanh toán
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">Xác nhận thanh toán</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Khách hàng:</span>
                    <span className="font-medium">{selectedPayment.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Nhân viên:</span>
                    <span className="font-medium">{selectedPayment.referrerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Số tiền hoa hồng:</span>
                    <span className="font-bold text-green-600">{formatCurrency(selectedPayment.commissionAmount)}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  Bạn có chắc chắn muốn xử lý thanh toán hoa hồng này? Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
