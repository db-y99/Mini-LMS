'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, FileText, TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuth } from '@/contexts/AuthContext';

export const BranchManagerDashboardView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    teamMembers: 0
  });

  useEffect(() => {
    // Mock: Filter loans by branch (in real app, would filter by user's branchId)
    const branchLoans = loans; // In production: loans.filter(l => l.branchId === user.branchId)
    
    const pending = branchLoans.filter(l => 
      l.canonicalStatus === 'UNDER_ASSESSMENT' || 
      l.canonicalStatus === 'ASSESSMENT_APPROVED'
    );
    const approved = branchLoans.filter(l => l.canonicalStatus === 'CREDIT_APPROVED');
    const rejected = branchLoans.filter(l => l.canonicalStatus === 'REJECTED');

    setStats({
      totalLoans: branchLoans.length,
      pendingApproval: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      totalAmount: branchLoans.reduce((sum, l) => sum + l.loanAmount, 0),
      teamMembers: 8 // Mock
    });
  }, [loans]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Quản lý Chi nhánh</h1>
        <p className="text-slate-600 text-sm">
          Tổng quan hoạt động và hiệu suất chi nhánh của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalLoans}</div>
          <div className="text-xs text-slate-600">Hồ sơ vay</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Chờ duyệt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pendingApproval}</div>
          <div className="text-xs text-slate-600">Cần phê duyệt</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đã duyệt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
          <div className="text-xs text-slate-600">Hồ sơ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-slate-500">Nhân sự</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.teamMembers}</div>
          <div className="text-xs text-slate-600">Thành viên</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/bm/pending-approval')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Clock className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Chờ phê duyệt</div>
          <div className="text-xs text-slate-600">Hồ sơ cần duyệt</div>
        </button>

        <button
          onClick={() => router.push('/bm/team')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Users className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Quản lý Team</div>
          <div className="text-xs text-slate-600">Nhân sự chi nhánh</div>
        </button>

        <button
          onClick={() => router.push('/bm/performance')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Hiệu suất</div>
          <div className="text-xs text-slate-600">KPI chi nhánh</div>
        </button>

        <button
          onClick={() => router.push('/bm/reports')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Báo cáo</div>
          <div className="text-xs text-slate-600">Thống kê chi tiết</div>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Lưu ý:</span> Dashboard này hiển thị dữ liệu demo. 
          Trong phiên bản đầy đủ sẽ lọc theo chi nhánh cụ thể của bạn.
        </p>
      </div>
    </div>
  );
};
