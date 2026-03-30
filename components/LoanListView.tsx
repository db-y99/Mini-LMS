'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, MoreHorizontal, Eye, ChevronLeft, ChevronRight, ArrowUpDown, Calendar, CheckCircle2, Clock, XCircle, Car, Bike, Smartphone, Monitor, FileText } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';
import { LoanStatus } from '../types';

interface LoanDisplayItem {
  id: string;
  name: string;
  phone: string;
  amount: number;
  asset: string;
  date: string;
  status: string;
  branch: string;
  createdByName?: string;
}

export const LoanListView: React.FC = () => {
  const { loans, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const handleViewDetail = (loanId: string) => {
    router.push(`/cs/loans/${loanId}`);
  };

  // Convert loan data to display format
  const displayLoans: LoanDisplayItem[] = useMemo(() => {
    let filteredLoans = loans;

    // Filter loans based on user role
    if (user?.role === 'cskh') {
      // CS can only see loans they created
      filteredLoans = loans.filter(loan => loan.createdBy === user.id);
    } else if (user?.role === 'assessment') {
      // CA can see loans pending assessment or already assessed
      filteredLoans = loans.filter(loan =>
        loan.status === 'pending_assessment' ||
        loan.status === 'pending_security' ||
        loan.status === 'pending_admin' ||
        loan.status === 'pending_disbursement' ||
        loan.status === 'disbursed' ||
        loan.status === 'rejected'
      );
    } else if (user?.role === 'security') {
      // SEC can see loans pending security check or later stages
      filteredLoans = loans.filter(loan =>
        loan.status === 'pending_security' ||
        loan.status === 'pending_admin' ||
        loan.status === 'pending_disbursement' ||
        loan.status === 'disbursed' ||
        loan.status === 'rejected'
      );
    } else if (user?.role === 'accountant') {
      // ACC can see loans pending disbursement or disbursed
      filteredLoans = loans.filter(loan =>
        loan.status === 'pending_disbursement' ||
        loan.status === 'disbursed'
      );
    }
    // Admin can see all loans

    return filteredLoans.map(loan => ({
      id: loan.id,
      name: loan.customer.fullName,
      phone: loan.customer.phoneNumber,
      amount: loan.loanAmount,
      asset: loan.collateralType,
      date: loan.createdAt.toLocaleDateString('vi-VN'),
      status: loan.status,
      branch: 'Default Branch', // TODO: Add branch info to loan model
      createdByName: loan.createdByName
    }));
  }, [loans, user]);

  // Filter loans based on search and status
  const filteredLoans = useMemo(() => {
    let filtered = displayLoans;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(search) ||
        loan.phone.includes(search) ||
        loan.id.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    return filtered;
  }, [displayLoans, searchTerm, statusFilter]);

  useEffect(() => {
    const loadLoans = async () => {
      setLoading(true);
      try {
        await refreshLoans();
      } catch (error) {
        console.error('Failed to load loans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [refreshLoans]);

  const getAssetIcon = (type: string) => {
    switch (type) {
        case 'car': return <Car className="w-4 h-4" />;
        case 'bike': return <Bike className="w-4 h-4" />;
        case 'phone': return <Smartphone className="w-4 h-4" />;
        case 'computer': return <Monitor className="w-4 h-4" />;
        default: return <Bike className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: LoanStatus): string => {
    switch (status) {
      case 'draft': return 'Nháp';
      case 'pending_cskh': return 'Chờ CSKH xử lý';
      case 'pending_cskh_supplement': return 'Chờ CSKH bổ sung hồ sơ';
      case 'pending_assessment': return 'Chờ thẩm định';
      case 'pending_security': return 'Chờ kiểm tra bảo mật';
      case 'pending_admin': return 'Chờ phê duyệt admin';
      case 'pending_disbursement': return 'Chờ giải ngân';
      case 'disbursed': return 'Đã giải ngân';
      case 'rejected': return 'Từ chối';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'disbursed':
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Đã giải ngân
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                    <XCircle className="w-3 h-3 mr-1" /> Từ chối
                </span>
            );
        case 'cancelled':
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                    <XCircle className="w-3 h-3 mr-1" /> Đã hủy
                </span>
            );
        case 'draft':
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
                    <FileText className="w-3 h-3 mr-1" /> Nháp
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="w-3 h-3 mr-1" /> {getStatusLabel(status as LoanStatus)}
                </span>
            );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh sách hồ sơ vay</h2>
          <p className="text-slate-500 mt-1 text-sm">Quản lý và theo dõi trạng thái hồ sơ khách hàng.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Lọc nâng cao</span>
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         {/* Search */}
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm theo tên, SĐT hoặc mã hồ sơ..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Right Filters */}
         <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <select 
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-blue-400 transition-colors min-w-[200px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
             >
                 <option value="all">Tất cả trạng thái</option>
                 <option value="draft">Nháp</option>
                 <option value="pending_cskh">Chờ CSKH xử lý</option>
                 <option value="pending_cskh_supplement">Chờ CSKH bổ sung hồ sơ</option>
                 <option value="pending_assessment">Chờ thẩm định</option>
                 <option value="pending_security">Chờ kiểm tra bảo mật</option>
                 <option value="pending_admin">Chờ phê duyệt admin</option>
                 <option value="pending_disbursement">Chờ giải ngân</option>
                 <option value="disbursed">Đã giải ngân</option>
                 <option value="rejected">Từ chối</option>
                 <option value="cancelled">Đã hủy</option>
             </select>

             <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-blue-400 transition-colors">
                 <option>Tháng này</option>
                 <option>Tháng trước</option>
                 <option>Quý này</option>
             </select>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold">
                            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                Mã hồ sơ <ArrowUpDown className="w-3 h-3" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold">Khách hàng</th>
                        <th className="px-6 py-4 font-semibold">
                            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                Số tiền vay <ArrowUpDown className="w-3 h-3" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold">Tài sản</th>
                        <th className="px-6 py-4 font-semibold">Người tạo</th>
                        <th className="px-6 py-4 font-semibold">Chi nhánh</th>
                        <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                        <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredLoans.length > 0 ? filteredLoans.map((loan, i) => (
                        <tr key={loan.id} className="group hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => handleViewDetail(loan.id)}>
                                {loan.id}
                                <div className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {loan.date}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-semibold text-slate-900">{loan.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{loan.phone}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">
                                {loan.amount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="p-1.5 bg-slate-100 rounded-md">
                                        {getAssetIcon(loan.asset)}
                                    </div>
                                    <span className="capitalize">
                                        {loan.asset === 'bike' ? 'Xe máy' :
                                         loan.asset === 'car' ? 'Ô tô' :
                                         loan.asset === 'phone' ? 'Điện thoại' :
                                         loan.asset === 'computer' ? 'Máy tính' : 'Khác'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <span className="font-medium">{loan.createdByName || 'Không xác định'}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {loan.branch}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {getStatusBadge(loan.status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleViewDetail(loan.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" 
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                    <p>Không có hồ sơ vay nào</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        {filteredLoans.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-sm text-slate-500">
                    Hiển thị <span className="font-semibold text-slate-900">1-{Math.min(filteredLoans.length, 10)}</span> trong tổng số <span className="font-semibold text-slate-900">{filteredLoans.length}</span> hồ sơ
                </span>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 text-slate-500" disabled>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm">1</button>
                        {filteredLoans.length > 10 && (
                            <>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-sm font-medium">2</button>
                                <span className="text-slate-400 px-1">...</span>
                            </>
                        )}
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-500" disabled={filteredLoans.length <= 10}>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};