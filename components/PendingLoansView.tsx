import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, AlertTriangle, CheckCircle2, XCircle, FileText, CalendarClock, Check, User, Eye, X, Calculator } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { WorkflowProgress } from './WorkflowProgress';
import { LoanApplication, LoanStatus } from '../types';

interface PendingLoanItem {
  id: string;
  name: string;
  amount: number;
  type: string;
  submittedAt: string;
  timeElapsed: string;
  slaStatus: 'normal' | 'warning' | 'urgent';
  riskScore: 'low' | 'medium' | 'high';
  riskValue: number;
  note: string;
  status: LoanStatus;
  loanData: LoanApplication;
}

export const PendingLoansView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, getLoansByRole, updateLoanStatus, getAllowedTransitions, refreshLoans } = useWorkflow();
  const [pendingLoans, setPendingLoans] = useState<PendingLoanItem[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<PendingLoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      const roleLoans = getLoansByRole(user.role);
      const formattedLoans: PendingLoanItem[] = roleLoans.map(loan => ({
        id: loan.id,
        name: loan.customer.fullName,
        amount: loan.loanAmount,
        type: getCollateralTypeLabel(loan.collateralType),
        submittedAt: formatDate(loan.createdAt),
        timeElapsed: getTimeElapsed(loan.createdAt),
        slaStatus: getSlaStatus(loan.createdAt, user.role),
        riskScore: getRiskScore(loan.riskScore || 700),
        riskValue: loan.riskScore || 700,
        note: getLoanNote(loan),
        status: loan.status,
        loanData: loan
      }));
      setPendingLoans(formattedLoans);
      setFilteredLoans(formattedLoans);
    }
    setLoading(false);
  }, [user, loans, getLoansByRole]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLoans(pendingLoans);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = pendingLoans.filter(loan =>
      loan.id.toLowerCase().includes(query) ||
      loan.name.toLowerCase().includes(query) ||
      loan.type.toLowerCase().includes(query)
    );
    setFilteredLoans(filtered);
  }, [searchQuery, pendingLoans]);

  const getCollateralTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'car': 'Ô tô',
      'bike': 'Xe máy',
      'phone': 'Điện thoại',
      'computer': 'Máy tính',
      'house': 'Nhà đất',
      'land': 'Đất'
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getTimeElapsed = (createdAt: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60)) % 60;

    if (diffInHours > 0) {
      return `${diffInHours} giờ ${diffInMinutes} phút`;
    }
    return `${diffInMinutes} phút`;
  };

  const getSlaStatus = (createdAt: Date, role: string): 'normal' | 'warning' | 'urgent' => {
    const now = new Date();
    const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // SLA based on role
    const slaHours = {
      'assessment': 48,
      'security': 24,
      'admin': 12,
      'accountant': 8
    }[role] || 24;

    if (diffInHours > slaHours) return 'urgent';
    if (diffInHours > slaHours * 0.8) return 'warning';
    return 'normal';
  };

  const getRiskScore = (score?: number): 'low' | 'medium' | 'high' => {
    if (!score) return 'medium';
    if (score >= 700) return 'low';
    if (score >= 500) return 'medium';
    return 'high';
  };

  const getLoanNote = (loan: LoanApplication): string => {
    // Special note for security when collateral is phone
    if (loan.status === 'pending_security' && loan.collateralType === 'phone') {
      return 'Cần khóa điện thoại';
    }
    if (loan.assessmentReport) {
      return `Đánh giá: ${loan.assessmentReport.riskLevel === 'low' ? 'Rủi ro thấp' : loan.assessmentReport.riskLevel === 'medium' ? 'Rủi ro trung bình' : 'Rủi ro cao'}`;
    }
    if (loan.securityCheckStatus) {
      return `Bảo mật: ${loan.securityCheckStatus === 'passed' ? 'Đã duyệt' : 'Có vấn đề'}`;
    }
    return loan.internalNotes || 'Hồ sơ đang chờ xử lý';
  };

  const handleStatusChange = async (loanId: string, newStatus: LoanStatus, notes?: string) => {
    if (!user) return;

    try {
      const success = await updateLoanStatus(loanId, newStatus, user.id, notes);
      if (success) {
        // Refresh loans list
        await refreshLoans();
        // Update local state
        if (user) {
          const roleLoans = getLoansByRole(user.role);
          const formattedLoans: PendingLoanItem[] = roleLoans.map(loan => ({
            id: loan.id,
            name: loan.customer.fullName,
            amount: loan.loanAmount,
            type: getCollateralTypeLabel(loan.collateralType),
            submittedAt: formatDate(loan.createdAt),
            timeElapsed: getTimeElapsed(loan.createdAt),
            slaStatus: getSlaStatus(loan.createdAt, user.role),
            riskScore: getRiskScore(loan.riskScore || 700),
            riskValue: loan.riskScore || 700,
            note: getLoanNote(loan),
            status: loan.status,
            loanData: loan
          }));
          setPendingLoans(formattedLoans);
        }
        setShowWorkflowModal(false);
        setSelectedLoan(null);
      }
    } catch (error) {
      console.error('Failed to update loan status:', error);
    }
  };

  const handleLoanAction = async (loan: PendingLoanItem, action: 'approve' | 'reject', notes?: string) => {
    if (!user) return;

    const transitions = getAllowedTransitions(loan.status, user.role, loan.loanData);
    const targetTransition = action === 'approve'
      ? transitions.find(t => t.toStatus !== 'rejected')
      : transitions.find(t => t.toStatus === 'rejected');

    if (!targetTransition) {
      return;
    }

    const success = await updateLoanStatus(loan.id, targetTransition.toStatus, user.id, notes);
    if (success) {
      // Refresh the loans list
      if (user) {
        const roleLoans = getLoansByRole(user.role);
        const formattedLoans: PendingLoanItem[] = roleLoans.map(loan => ({
          id: loan.id,
          name: loan.customer.fullName,
          amount: loan.loanAmount,
          type: getCollateralTypeLabel(loan.collateralType),
          submittedAt: formatDate(loan.createdAt),
          timeElapsed: getTimeElapsed(loan.createdAt),
          slaStatus: getSlaStatus(loan.createdAt, user.role),
          riskScore: getRiskScore(loan.riskScore || 700),
          riskValue: loan.riskScore || 700,
          note: getLoanNote(loan),
          status: loan.status,
          loanData: loan
        }));
        setPendingLoans(formattedLoans);
        setFilteredLoans(formattedLoans);
      }
    }
  };


  const getSlaBadge = (status: string) => {
      switch(status) {
          case 'urgent': return <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Quá hạn SLA</span>;
          case 'warning': return <span className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Sắp quá hạn</span>;
          default: return <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Trong hạn</span>;
      }
  };

  const getRiskIndicator = (level: string, score: number) => {
      let colorClass = '';
      let label = '';

      if (level === 'high') { colorClass = 'bg-red-500'; label = 'Rủi ro cao'; }
      else if (level === 'medium') { colorClass = 'bg-amber-500'; label = 'Trung bình'; }
      else { colorClass = 'bg-green-500'; label = 'An toàn'; }

      return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className={`text-xs font-bold ${level === 'high' ? 'text-red-600' : level === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>{label}</span>
                <span className="text-[10px] text-slate-400">Score: {score}</span>
            </div>
            <div className={`w-1.5 h-8 rounded-full ${colorClass}`}></div>
        </div>
      );
  };

  const getActionButtons = (loan: PendingLoanItem) => {
    if (!user) return null;

    const isAssessmentRole = user.role === 'assessment';

    // For assessment role, only show assessment button
    if (isAssessmentRole && loan.status === 'pending_assessment') {
      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/ca/assess/${loan.id}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Thẩm định
          </button>
        </div>
      );
    }

    // For other roles, show their respective actions
    const allowedTransitions = getAllowedTransitions(loan.status, user.role, loan.loanData);

    return (
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {allowedTransitions.some(t => t.toStatus !== 'rejected') && (
          <button
            onClick={() => handleLoanAction(loan, 'approve')}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Duyệt
          </button>
        )}
        {allowedTransitions.some(t => t.toStatus === 'rejected') && (
          <button
            onClick={() => handleLoanAction(loan, 'reject')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" />
            Từ chối
          </button>
        )}
        <button
          onClick={() => {
            setSelectedLoan(loan.loanData);
            setShowWorkflowModal(true);
          }}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          Workflow
        </button>
        <button
          onClick={() => navigate(`/ca/loans/${loan.id}`, { state: { from: '/ca/pending' } })}
          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          Chi tiết
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const urgentCount = pendingLoans.filter(loan => loan.slaStatus === 'urgent').length;
  const warningCount = pendingLoans.filter(loan => loan.slaStatus === 'warning').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Hồ sơ chờ xử lý
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-sm font-bold border border-red-200">
              {pendingLoans.length}
            </span>
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {user?.role === 'assessment' && 'Các hồ sơ cần thẩm định tài chính và đánh giá rủi ro'}
            {user?.role === 'security' && 'Các hồ sơ cần kiểm tra bảo mật. Với tài sản là điện thoại, cần khóa điện thoại trước khi duyệt.'}
            {user?.role === 'admin' && 'Các hồ sơ cần phê duyệt cuối cùng'}
            {user?.role === 'accountant' && 'Các hồ sơ chờ giải ngân'}
          </p>
        </div>
        {(urgentCount > 0 || warningCount > 0) && (
          <div className="flex gap-3">
            {urgentCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>{urgentCount} Hồ sơ quá hạn</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>{warningCount} Sắp quá hạn</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <FileText className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm">Tổng chờ xử lý</p>
                  <p className="text-xl font-bold text-slate-900">{pendingLoans.length} Hồ sơ</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm">Quá hạn SLA</p>
                  <p className="text-xl font-bold text-slate-900">{urgentCount} Hồ sơ</p>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <User className="w-6 h-6" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm">Người xử lý</p>
                  <p className="text-xl font-bold text-slate-900">{user?.fullName}</p>
              </div>
          </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm theo mã hồ sơ, tên khách hàng, loại tài sản..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
         </div>
      </div>

      {/* Task List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                     <tr>
                         <th className="px-6 py-4 font-semibold">Thông tin hồ sơ</th>
                         <th className="px-6 py-4 font-semibold">Khoản vay</th>
                         <th className="px-6 py-4 font-semibold">Thời gian chờ</th>
                         <th className="px-6 py-4 font-semibold text-right">Rủi ro</th>
                         <th className="px-6 py-4 font-semibold">Ghi chú hệ thống</th>
                         <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {filteredLoans.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="px-6 py-12 text-center">
                           <div className="flex flex-col items-center gap-2">
                             <FileText className="w-12 h-12 text-slate-300" />
                             <p className="text-slate-500 font-medium">Không tìm thấy hồ sơ nào</p>
                             {searchQuery && (
                               <button
                                 onClick={() => setSearchQuery('')}
                                 className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                               >
                                 Xóa bộ lọc
                               </button>
                             )}
                           </div>
                         </td>
                       </tr>
                     ) : (
                       filteredLoans.map((loan, i) => (
                         <tr key={i} className={`group transition-colors ${loan.slaStatus === 'urgent' ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-slate-50'}`}>
                             <td className="px-6 py-4">
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <span className="font-bold text-blue-600 hover:underline cursor-pointer">{loan.id}</span>
                                         {loan.slaStatus === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                     </div>
                                     <p className="font-semibold text-slate-900 mt-1">{loan.name}</p>
                                     <p className="text-xs text-slate-500 mt-0.5">{loan.type} • {loan.submittedAt}</p>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="font-bold text-slate-800">{loan.amount.toLocaleString()} ₫</div>
                                 <div className="text-xs text-slate-500">{loan.loanData.loanDuration} Tháng</div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="space-y-1.5">
                                     {getSlaBadge(loan.slaStatus)}
                                     <div className="text-xs text-slate-500 pl-1">Đã chờ: {loan.timeElapsed}</div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="flex justify-end">
                                     {getRiskIndicator(loan.riskScore, loan.riskValue)}
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <p className="text-slate-600 max-w-xs truncate" title={loan.note}>{loan.note}</p>
                             </td>
                             <td className="px-6 py-4">
                                 {getActionButtons(loan)}
                             </td>
                         </tr>
                       ))
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Workflow Modal */}
      {showWorkflowModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Chi tiết workflow hồ sơ</h3>
                  <p className="text-sm text-slate-600 mt-1">#{selectedLoan.id} - {selectedLoan.customer.fullName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowWorkflowModal(false);
                    setSelectedLoan(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <WorkflowProgress
                loan={selectedLoan}
                currentUserRole={user?.role || 'cskh'}
                onStatusChange={(newStatus, notes) => handleStatusChange(selectedLoan.id, newStatus, notes)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};