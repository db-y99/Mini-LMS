'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, FileText, Clock, CheckCircle, AlertTriangle, Gavel, TrendingUp } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const LegalDashboardView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    inProgress: 0,
    courtCases: 0,
    settled: 0,
    totalValue: 0
  });

  useEffect(() => {
    // Filter loans that need legal action (DPD > 90)
    const legalCases = loans.filter(loan => loan.dpd > 90);
    const pending = legalCases.filter(loan => !loan.recovery_status);
    const inProgress = legalCases.filter(loan => loan.recovery_status === 'legal');
    const settled = loans.filter(loan => loan.recovery_status === 'recovered' && loan.dpd > 90);

    setStats({
      totalCases: legalCases.length,
      pendingCases: pending.length,
      inProgress: inProgress.length,
      courtCases: Math.floor(inProgress.length * 0.6), // Mock
      settled: settled.length,
      totalValue: legalCases.reduce((sum, l) => sum + l.loanAmount, 0)
    });
  }, [loans]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Pháp chế</h1>
        <p className="text-slate-600 text-sm">
          Quản lý các vụ việc pháp lý, kiện tụng và xử lý nợ quá hạn nghiêm trọng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalCases}</div>
          <div className="text-xs text-slate-600">Vụ việc pháp lý</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Chờ xử lý</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pendingCases}</div>
          <div className="text-xs text-slate-600">Vụ việc mới</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Gavel className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tòa án</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.courtCases}</div>
          <div className="text-xs text-slate-600">Đang kiện tụng</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đã giải quyết</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.settled}</div>
          <div className="text-xs text-slate-600">Vụ việc</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/legal/pending-cases')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Clock className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Vụ việc chờ xử lý</div>
          <div className="text-xs text-slate-600">Cần đánh giá và phân loại</div>
        </button>

        <button
          onClick={() => router.push('/legal/court-cases')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <Gavel className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Vụ kiện tòa án</div>
          <div className="text-xs text-slate-600">Đang trong quá trình kiện tụng</div>
        </button>

        <button
          onClick={() => router.push('/legal/contracts')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Hợp đồng</div>
          <div className="text-xs text-slate-600">Soạn thảo và quản lý</div>
        </button>

        <button
          onClick={() => router.push('/legal/reports')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
        >
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold text-slate-900 text-sm">Báo cáo</div>
          <div className="text-xs text-slate-600">Thống kê và phân tích</div>
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900 text-sm mb-1">
              Cần xử lý ưu tiên
            </div>
            <p className="text-sm text-red-800">
              Có {stats.pendingCases} vụ việc mới cần đánh giá và {stats.courtCases} vụ kiện đang chờ xử lý tại tòa án.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
