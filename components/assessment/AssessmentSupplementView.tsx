import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, User, DollarSign, AlertCircle, CheckCircle,
  XCircle, Eye, ArrowLeft, Send, Search, Filter
} from 'lucide-react';
import { LoanApplication } from '../../types';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAudit } from '../../contexts/AuditContext';

export const AssessmentSupplementView: React.FC = () => {
  const navigate = useNavigate();
  const { loans, updateLoanStatus, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const { logAction } = useAudit();
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [supplementReason, setSupplementReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách hồ sơ chờ thẩm định
  const pendingLoans = loans.filter(loan => loan.status === 'pending_assessment');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshLoans();
      } catch (error) {
        console.error('Failed to load loans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshLoans]);

  const filteredLoans = pendingLoans.filter(loan => {
    const searchLower = searchTerm.toLowerCase();
    return (
      loan.id.toLowerCase().includes(searchLower) ||
      loan.customer.fullName.toLowerCase().includes(searchLower) ||
      loan.customer.phoneNumber.includes(searchTerm)
    );
  });

  const handleRequestSupplement = async () => {
    if (!selectedLoan || !supplementReason.trim()) {
      alert('Vui lòng nhập lý do yêu cầu bổ sung hồ sơ');
      return;
    }

    try {
      // Cập nhật hồ sơ với thông tin yêu cầu bổ sung
      const updatedLoan: LoanApplication = {
        ...selectedLoan,
        status: 'pending_cskh_supplement',
        supplementRequest: {
          requestedBy: user?.id || 'unknown',
          requestedByName: user?.fullName || 'Không xác định',
          requestedAt: new Date(),
          reason: supplementReason.trim()
        },
        updatedAt: new Date()
      };

      // Log audit action
      await logAction({
        userId: user?.id || 'unknown',
        userName: user?.fullName || 'Unknown',
        userRole: user?.role || 'assessment',
        action: 'REQUEST_SUPPLEMENT',
        resourceType: 'loan',
        resourceId: selectedLoan.id,
        oldValues: { status: selectedLoan.status },
        newValues: {
          status: 'pending_cskh_supplement',
          supplementReason: supplementReason.trim()
        },
        metadata: {
          requestedBy: user?.fullName,
          reason: supplementReason.trim()
        }
      });

      // Cập nhật status
      const success = await updateLoanStatus(
        selectedLoan.id,
        'pending_cskh_supplement',
        user?.id || 'unknown',
        `Yêu cầu bổ sung: ${supplementReason.trim()}`
      );

      if (success) {
        // Lưu thông tin bổ sung vào loan
        const storageService = (await import('../../services/storageService')).storageService;
        await storageService.saveLoan(updatedLoan);

        alert('Đã yêu cầu CSKH bổ sung hồ sơ thành công!');
        setShowSupplementModal(false);
        setSelectedLoan(null);
        setSupplementReason('');
        await refreshLoans();
      } else {
        alert('Không thể yêu cầu bổ sung hồ sơ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Failed to request supplement:', error);
      alert('Có lỗi xảy ra khi yêu cầu bổ sung hồ sơ.');
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ca/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yêu cầu bổ sung hồ sơ</h1>
            <p className="text-slate-600">Chọn hồ sơ cần yêu cầu CSKH bổ sung thông tin</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hồ sơ, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Hồ sơ chờ thẩm định ({filteredLoans.length})
          </h2>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Không có hồ sơ nào chờ thẩm định</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {loan.id}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                        {loan.collateralType === 'car' ? 'Ô tô' :
                         loan.collateralType === 'bike' ? 'Xe máy' :
                         loan.collateralType === 'phone' ? 'Điện thoại' :
                         loan.collateralType === 'computer' ? 'Máy tính' : 'Khác'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Khách hàng</p>
                          <p className="text-sm font-medium text-slate-900">{loan.customer.fullName}</p>
                          <p className="text-xs text-slate-500">{loan.customer.phoneNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Số tiền vay</p>
                          <p className="text-sm font-medium text-slate-900">{formatCurrency(loan.loanAmount)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Ngày tạo</p>
                          <p className="text-sm font-medium text-slate-900">{formatDate(loan.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {loan.createdByName && (
                      <div className="mt-3 text-xs text-slate-500">
                        Tạo bởi: <span className="font-medium">{loan.createdByName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/ca/assess/${loan.id}`)}
                      className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowSupplementModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Yêu cầu bổ sung
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplement Request Modal */}
      {showSupplementModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Yêu cầu bổ sung hồ sơ</h3>
                <button
                  onClick={() => {
                    setShowSupplementModal(false);
                    setSelectedLoan(null);
                    setSupplementReason('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Loan Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Thông tin hồ sơ</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">Mã hồ sơ:</span> <span className="font-medium">{selectedLoan.id}</span></p>
                  <p><span className="text-slate-500">Khách hàng:</span> <span className="font-medium">{selectedLoan.customer.fullName}</span></p>
                  <p><span className="text-slate-500">Số tiền vay:</span> <span className="font-medium">{formatCurrency(selectedLoan.loanAmount)}</span></p>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lý do yêu cầu bổ sung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={supplementReason}
                  onChange={(e) => setSupplementReason(e.target.value)}
                  placeholder="Ví dụ: Thiếu giấy tờ chứng minh thu nhập, cần bổ sung ảnh tài sản rõ ràng hơn, thiếu thông tin liên hệ người tham chiếu..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Hồ sơ sẽ được chuyển về CSKH ({selectedLoan.createdByName || 'người tạo đơn'}) để bổ sung thông tin.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSupplementModal(false);
                  setSelectedLoan(null);
                  setSupplementReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRequestSupplement}
                disabled={!supplementReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

