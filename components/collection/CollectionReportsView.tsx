'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const CollectionReportsView: React.FC = () => {
  const { loans } = useWorkflow();
  const [stats, setStats] = useState({
    totalOverdue: 0,
    minor: 0,
    severe: 0,
    legal: 0,
    recovered: 0,
    totalAmount: 0,
    recoveredAmount: 0,
    recoveryRate: 0
  });

  useEffect(() => {
    const overdue = loans.filter(l => l.dpd > 0);
    const recovered = loans.filter(l => l.recovery_status === 'recovered');
    
    setStats({
      totalOverdue: overdue.length,
      minor: overdue.filter(l => l.dpd <= 30).length,
      severe: overdue.filter(l => l.dpd > 30 && l.dpd <= 90).length,
      legal: overdue.filter(l => l.dpd > 90).length,
      recovered: recovered.length,
      totalAmount: overdue.reduce((sum, l) => sum + l.loanAmount, 0),
      recoveredAmount: recovered.reduce((sum, l) => sum + l.loanAmount, 0),
      recoveryRate: overdue.length > 0 ? (recovered.length / (overdue.length + recovered.length)) * 100 : 0
    });
  }, [loans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo Thu hồi Nợ</h1>
          <p className="text-slate-600 text-sm">
            Thống kê và phân tích hiệu quả thu hồi nợ.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tổng nợ quá hạn</div>
          <div className="text-2xl font-bold text-red-600">{stats.totalOverdue}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Đã thu hồi</div>
          <div className="text-2xl font-bold text-green-600">{stats.recovered}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tỷ lệ thu hồi</div>
          <div className="text-2xl font-bold text-blue-600">{stats.recoveryRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Giá trị thu hồi</div>
          <div className="text-2xl font-bold text-green-600">
            {(stats.recoveredAmount / 1000000000).toFixed(2)}B
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Phân loại nợ quá hạn</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Quá hạn nhẹ (1-30 ngày)</span>
              <span className="font-semibold text-amber-600">{stats.minor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Quá hạn nghiêm trọng (31-90 ngày)</span>
              <span className="font-semibold text-orange-600">{stats.severe}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Cần xử lý pháp lý (&gt;90 ngày)</span>
              <span className="font-semibold text-red-600">{stats.legal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-slate-900">Hiệu quả thu hồi</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tổng nợ quá hạn</span>
              <span className="font-semibold text-slate-900">
                {(stats.totalAmount / 1000000000).toFixed(2)}B VND
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Đã thu hồi</span>
              <span className="font-semibold text-green-600">
                {(stats.recoveredAmount / 1000000000).toFixed(2)}B VND
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tỷ lệ thành công</span>
              <span className="font-semibold text-blue-600">{stats.recoveryRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Lưu ý:</span> Báo cáo này được tạo từ dữ liệu demo. 
          Trong phiên bản đầy đủ sẽ có biểu đồ chi tiết, xu hướng theo thời gian, và phân tích sâu hơn.
        </p>
      </div>
    </div>
  );
};
