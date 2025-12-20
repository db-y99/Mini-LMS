import React, { useState } from 'react';
import {
  BarChart3, Download, Calendar, TrendingUp, TrendingDown,
  FileText, Users, DollarSign, CreditCard, Filter
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('this-month');
  const [reportType, setReportType] = useState('overview');

  const reports = [
    {
      title: 'Báo cáo tổng quan',
      description: 'Thống kê tổng hợp về hoạt động hệ thống',
      icon: BarChart3,
      metrics: [
        { label: 'Tổng hồ sơ', value: '1,247', trend: '+12%' },
        { label: 'Đã phê duyệt', value: '1,056', trend: '+8%' },
        { label: 'Từ chối', value: '102', trend: '-2%' },
        { label: 'Hoa hồng', value: '2.4M ₫', trend: '+15%' }
      ]
    },
    {
      title: 'Báo cáo theo sản phẩm',
      description: 'Thống kê theo loại tài sản thế chấp',
      icon: CreditCard,
      metrics: [
        { label: 'Ô tô', value: '456', trend: '+18%' },
        { label: 'Xe máy', value: '623', trend: '+5%' },
        { label: 'Điện thoại', value: '168', trend: '-8%' }
      ]
    },
    {
      title: 'Báo cáo hiệu suất',
      description: 'Đánh giá hiệu quả xử lý hồ sơ',
      icon: TrendingUp,
      metrics: [
        { label: 'Thời gian TB', value: '2.3 ngày', trend: '-15%' },
        { label: 'Tỷ lệ duyệt', value: '84.7%', trend: '+3%' },
        { label: 'SLA đạt', value: '91.2%', trend: '+5%' }
      ]
    }
  ];

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    alert(`Đang xuất báo cáo dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo & Thống kê</h1>
          <p className="text-slate-600">Phân tích dữ liệu và xuất báo cáo chi tiết</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hôm nay</option>
            <option value="this-week">Tuần này</option>
            <option value="this-month">Tháng này</option>
            <option value="last-month">Tháng trước</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setReportType('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            reportType === 'overview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setReportType('detailed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            reportType === 'detailed'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Chi tiết
        </button>
        <button
          onClick={() => setReportType('performance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            reportType === 'performance'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hiệu suất
        </button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{report.title}</h3>
                  <p className="text-sm text-slate-600">{report.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {report.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{metric.value}</span>
                      {metric.trend && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          metric.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {metric.trend}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Xem chi tiết →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Xuất báo cáo</h3>
            <p className="text-slate-600">Xuất dữ liệu theo định dạng mong muốn</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-900">Tổng hồ sơ</div>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-900">Tổng giá trị</div>
            <div className="text-2xl font-bold text-green-600">2.4B ₫</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-900">Hoa hồng</div>
            <div className="text-2xl font-bold text-purple-600">245M ₫</div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Báo cáo gần đây</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Báo cáo tháng 12/2024</h4>
                <p className="text-sm text-slate-600">Xuất ngày 18/12/2024 • 2.4MB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Hoàn thành</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Tải lại
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Thống kê quý 4/2024</h4>
                <p className="text-sm text-slate-600">Xuất ngày 15/12/2024 • 1.8MB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Hoàn thành</span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Tải lại
              </button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Báo cáo hiệu suất</h4>
                <p className="text-sm text-slate-600">Đang xử lý... • Ước tính 45s</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Đang xử lý</span>
              <div className="w-16 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
