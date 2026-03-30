'use client';
import React from 'react';
import { TrendingUp, Target, Award, DollarSign } from 'lucide-react';

export const BranchPerformanceView: React.FC = () => {
  const kpis = [
    { label: 'Doanh số tháng', value: '2.5B', target: '3B', progress: 83, icon: DollarSign, color: 'blue' },
    { label: 'Số hồ sơ duyệt', value: '45', target: '50', progress: 90, icon: Target, color: 'green' },
    { label: 'Tỷ lệ chuyển đổi', value: '68%', target: '75%', progress: 91, icon: TrendingUp, color: 'purple' },
    { label: 'Điểm đánh giá', value: '4.5', target: '5.0', progress: 90, icon: Award, color: 'amber' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hiệu suất Chi nhánh</h1>
        <p className="text-slate-600 text-sm">
          Theo dõi KPI và hiệu suất hoạt động chi nhánh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-slate-600 mb-1">{kpi.label}</div>
                <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
                <div className="text-xs text-slate-500 mt-1">Mục tiêu: {kpi.target}</div>
              </div>
              <div className={`w-12 h-12 rounded-full bg-${kpi.color}-100 flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Tiến độ</span>
                <span className="font-semibold text-slate-900">{kpi.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`bg-${kpi.color}-600 h-2 rounded-full transition-all`}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Lưu ý:</span> Dữ liệu KPI được cập nhật hàng ngày. 
          Trong phiên bản đầy đủ sẽ có biểu đồ chi tiết và so sánh với các chi nhánh khác.
        </p>
      </div>
    </div>
  );
};
