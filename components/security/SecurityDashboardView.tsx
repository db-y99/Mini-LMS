'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  ShieldAlert, ShieldCheck, Activity, Users, FileText, ChevronRight,
  Zap, Target, Phone, Ban, History, Eye
} from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

interface SecurityStats {
  totalChecks: number;
  pendingChecks: number;
  approvedChecks: number;
  rejectedChecks: number;
  fraudAlerts: number;
  blacklistHits: number;
  avgProcessingTime: string;
}

export const SecurityDashboardView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [stats, setStats] = useState<SecurityStats>({
    totalChecks: 0,
    pendingChecks: 0,
    approvedChecks: 0,
    rejectedChecks: 0,
    fraudAlerts: 0,
    blacklistHits: 0,
    avgProcessingTime: '45 phút'
  });

  useEffect(() => {
    // Calculate stats from loans
    const securityLoans = loans.filter(l => 
      l.canonicalStatus === 'REQUIRE_DEVICE_LOCK' || 
      l.canonicalStatus === 'DEVICE_LOCKED' ||
      l.securityCheckStatus
    );
    
    const pending = securityLoans.filter(l => l.canonicalStatus === 'REQUIRE_DEVICE_LOCK');
    const approved = securityLoans.filter(l => l.securityCheckStatus === 'passed');
    const rejected = securityLoans.filter(l => l.securityCheckStatus === 'failed');

    setStats({
      totalChecks: securityLoans.length,
      pendingChecks: pending.length,
      approvedChecks: approved.length,
      rejectedChecks: rejected.length,
      fraudAlerts: 0, // Mock
      blacklistHits: 0, // Mock
      avgProcessingTime: '45 phút'
    });
  }, [loans]);

  const recentPending = loans
    .filter(l => l.canonicalStatus === 'REQUIRE_DEVICE_LOCK')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Bảo mật</h1>
        <p className="text-slate-600 text-sm">
          Xác thực danh tính, kiểm tra thiết bị và phát hiện gian lận.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Chờ xử lý</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pendingChecks}</div>
          <div className="text-xs text-slate-600">Hồ sơ cần kiểm tra</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đã duyệt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approvedChecks}</div>
          <div className="text-xs text-slate-600">Hồ sơ đạt chuẩn</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Cảnh báo</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.fraudAlerts}</div>
          <div className="text-xs text-slate-600">Phát hiện rủi ro</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Blacklist</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.blacklistHits}</div>
          <div className="text-xs text-slate-600">Trùng khớp</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/sec/pending-checks')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Clock className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Chờ kiểm tra</div>
          <div className="text-xs text-slate-600">Xác thực hồ sơ mới</div>
        </button>

        <button
          onClick={() => router.push('/sec/blacklist')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Ban className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Blacklist</div>
          <div className="text-xs text-slate-600">Danh sách đen</div>
        </button>

        <button
          onClick={() => router.push('/sec/fraud-reports')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <ShieldAlert className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Báo cáo gian lận</div>
          <div className="text-xs text-slate-600">Phát hiện bất thường</div>
        </button>

        <button
          onClick={() => router.push('/sec/history')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <History className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Lịch sử</div>
          <div className="text-xs text-slate-600">Kiểm tra đã thực hiện</div>
        </button>
      </div>

      {/* Recent Pending Checks */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">
              Hồ sơ chờ xác thực
            </span>
          </div>
          <button
            onClick={() => router.push('/sec/pending-checks')}
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
                <th className="px-4 py-2 text-left">Tài sản</th>
                <th className="px-4 py-2 text-right">Số tiền</th>
                <th className="px-4 py-2 text-center">Trạng thái</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recentPending.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {loan.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.phoneNumber}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">
                    {loan.collateralType}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Chờ kiểm tra
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/sec/verify/${loan.id}`)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Xác thực
                    </button>
                  </td>
                </tr>
              ))}
              {recentPending.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không có hồ sơ chờ xác thực
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 text-sm mb-1">
              Quy trình xác thực
            </div>
            <p className="text-sm text-blue-800">
              Kiểm tra CCCD, xác thực thiết bị, tra cứu blacklist và khóa iCloud/Find My Device 
              trước khi chuyển hồ sơ sang Admin phê duyệt cuối cùng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
