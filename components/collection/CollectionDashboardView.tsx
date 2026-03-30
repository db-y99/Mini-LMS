'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Phone
} from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { LoanApplication } from '@/types';

interface CollectionStats {
  totalOverdue: number;
  minorOverdue: number;      // 1-30 days
  severeOverdue: number;     // 31-90 days
  legalAction: number;       // >90 days
  totalOverdueAmount: number;
  recoveredThisMonth: number;
  recoveredAmount: number;
  contactsMade: number;
}

export const CollectionDashboardView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [stats, setStats] = useState<CollectionStats>({
    totalOverdue: 0,
    minorOverdue: 0,
    severeOverdue: 0,
    legalAction: 0,
    totalOverdueAmount: 0,
    recoveredThisMonth: 0,
    recoveredAmount: 0,
    contactsMade: 0
  });
  const [recentOverdue, setRecentOverdue] = useState<LoanApplication[]>([]);

  useEffect(() => {
    calculateStats();
  }, [loans]);

  const calculateStats = () => {
    // Filter loans that are disbursed
    const disbursedLoans = loans.filter(
      loan => loan.canonicalStatus === 'DISBURSED'
    );

    const overdueLoans = disbursedLoans.filter(loan => loan.dpd > 0);
    
    const minor = overdueLoans.filter(loan => loan.dpd >= 1 && loan.dpd <= 30);
    const severe = overdueLoans.filter(loan => loan.dpd >= 31 && loan.dpd <= 90);
    const legal = overdueLoans.filter(loan => loan.dpd > 90);

    const totalAmount = overdueLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

    // Mock recovered data
    const recovered = loans.filter(
      loan => loan.recovery_status === 'recovered'
    );

    setStats({
      totalOverdue: overdueLoans.length,
      minorOverdue: minor.length,
      severeOverdue: severe.length,
      legalAction: legal.length,
      totalOverdueAmount: totalAmount,
      recoveredThisMonth: recovered.length,
      recoveredAmount: recovered.reduce((sum, loan) => sum + loan.loanAmount, 0),
      contactsMade: 0 // Mock data
    });

    // Get recent overdue loans (sorted by DPD descending)
    const recent = overdueLoans
      .sort((a, b) => b.dpd - a.dpd)
      .slice(0, 5);
    setRecentOverdue(recent);
  };

  const getOverdueLevelColor = (dpd: number) => {
    if (dpd <= 30) return 'text-amber-600 bg-amber-50';
    if (dpd <= 90) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getOverdueLevelLabel = (dpd: number) => {
    if (dpd <= 30) return 'Nhẹ';
    if (dpd <= 90) return 'Nghiêm trọng';
    return 'Pháp lý';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Thu hồi Nợ</h1>
        <p className="text-slate-600 text-sm">
          Theo dõi và quản lý các khoản vay quá hạn, liên hệ khách hàng để thu hồi nợ.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalOverdue}</div>
          <div className="text-xs text-slate-600">Khoản vay quá hạn</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">1-30 ngày</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.minorOverdue}</div>
          <div className="text-xs text-slate-600">Quá hạn nhẹ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-slate-500">31-90 ngày</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.severeOverdue}</div>
          <div className="text-xs text-slate-600">Quá hạn nghiêm trọng</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">&gt;90 ngày</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.legalAction}</div>
          <div className="text-xs text-slate-600">Cần xử lý pháp lý</div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tổng nợ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(stats.totalOverdueAmount / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-slate-600">VND quá hạn</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Tháng này</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.recoveredThisMonth}</div>
          <div className="text-xs text-slate-600">Khoản đã thu hồi</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đã thu</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(stats.recoveredAmount / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-slate-600">VND thu hồi</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/co/minor-overdue')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Clock className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Nợ quá hạn nhẹ</div>
          <div className="text-xs text-slate-600">1-30 ngày</div>
        </button>

        <button
          onClick={() => router.push('/co/severe-overdue')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Nợ nghiêm trọng</div>
          <div className="text-xs text-slate-600">31-90 ngày</div>
        </button>

        <button
          onClick={() => router.push('/co/legal-action')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <XCircle className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Xử lý pháp lý</div>
          <div className="text-xs text-slate-600">&gt;90 ngày</div>
        </button>

        <button
          onClick={() => router.push('/co/reports')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Báo cáo</div>
          <div className="text-xs text-slate-600">Thống kê chi tiết</div>
        </button>
      </div>

      {/* Recent Overdue Loans */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-slate-900">
              Khoản vay quá hạn gần đây
            </span>
          </div>
          <button
            onClick={() => router.push('/co/overdue')}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Mã HS</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-right">Số tiền</th>
                <th className="px-4 py-2 text-center">DPD</th>
                <th className="px-4 py-2 text-center">Mức độ</th>
                <th className="px-4 py-2 text-left">SĐT</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recentOverdue.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {loan.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.idNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {loan.dpd} ngày
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOverdueLevelColor(loan.dpd)}`}>
                      {getOverdueLevelLabel(loan.dpd)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{loan.customer.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/co/overdue/${loan.id}`)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))}
              {recentOverdue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không có khoản vay quá hạn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900 text-sm mb-1">
              Ưu tiên xử lý
            </div>
            <p className="text-sm text-amber-800">
              Có {stats.severeOverdue} khoản vay quá hạn nghiêm trọng (31-90 ngày) và {stats.legalAction} khoản cần xử lý pháp lý (&gt;90 ngày). 
              Vui lòng ưu tiên liên hệ khách hàng để thu hồi nợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
