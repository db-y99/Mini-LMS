'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const LegalReportsView: React.FC = () => {
  const { loans } = useWorkflow();
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    inProgress: 0,
    courtCases: 0,
    settled: 0,
    totalValue: 0,
    successRate: 0
  });

  useEffect(() => {
    const legalCases = loans.filter(loan => loan.dpd > 90);
    const pending = legalCases.filter(loan => !loan.recovery_status);
    const inProgress = legalCases.filter(loan => loan.recovery_status === 'legal');
    const settled = loans.filter(loan => loan.recovery_status === 'recovered' && loan.dpd > 90);

    setStats({
      totalCases: legalCases.length,
      pendingCases: pending.length,
      inProgress: inProgress.length,
      courtCases: Math.floor(inProgress.length * 0.6),
      settled: settled.length,
      totalValue: legalCases.reduce((sum, l) => sum + l.loanAmount, 0),
      successRate: legalCases.length > 0 ? (settled.length / legalCases.length) * 100 : 0
    });
  }, [loans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Báo cáo pháp lý</h1>
        <p className="text-slate-600 text-sm">
          Thống kê và phân tích các vụ việc pháp lý.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalCases}</div>
          <div className="text-xs text-slate-600">Vụ việc pháp lý</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Giá trị</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(stats.totalValue / 1000000000).toFixed(2)}B
          </div>
          <div className="text-xs text-slate-600">VND</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Tỷ lệ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-600">Giải quyết thành công</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tòa án</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.courtCases}</div>
          <div className="text-xs text-slate-600">Vụ kiện</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Phân loại vụ việc
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Chờ xử lý</span>
                <span className="font-bold text-slate-900">{stats.pendingCases}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500"
                  style={{ width: `${stats.totalCases > 0 ? (stats.pendingCases / stats.totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Đang xử lý</span>
                <span className="font-bold text-slate-900">{stats.inProgress}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${stats.totalCases > 0 ? (stats.inProgress / stats.totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Đã giải quyết</span>
                <span className="font-bold text-slate-900">{stats.settled}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${stats.totalCases > 0 ? (stats.settled / stats.totalCases) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Xu hướng theo thời gian
          </h3>
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              Biểu đồ xu hướng sẽ được hiển thị ở đây
            </p>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Xuất báo cáo</h3>
            <p className="text-sm text-slate-600">
              Tải xuống báo cáo chi tiết dưới dạng Excel hoặc PDF
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Excel
            </button>
            <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
