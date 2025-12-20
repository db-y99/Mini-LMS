import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Download, Calendar,
  DollarSign, CreditCard, Users, FileText, PieChart,
  ChevronDown, Filter, Eye, Target, Activity
} from 'lucide-react';

interface FinancialMetric {
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
}

interface MonthlyData {
  month: string;
  disbursements: number;
  repayments: number;
  commissions: number;
  revenue: number;
}

export const FinancialReportsView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_6_months');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const mockProductBreakdown: any[] = [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const calculateTotals = () => {
    const totalDisbursements = monthlyData.reduce((sum, month) => sum + month.disbursements, 0);
    const totalRepayments = monthlyData.reduce((sum, month) => sum + month.repayments, 0);
    const totalCommissions = monthlyData.reduce((sum, month) => sum + month.commissions, 0);
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);

    return {
      totalDisbursements,
      totalRepayments,
      totalCommissions,
      totalRevenue,
      repaymentRate: totalRepayments / totalDisbursements * 100
    };
  };

  const getMetrics = (): FinancialMetric[] => {
    const totals = calculateTotals();

    return [
      {
        label: 'Tổng giải ngân',
        value: formatCompactCurrency(totals.totalDisbursements),
        change: 8.5,
        changeType: 'increase',
        icon: 'CreditCard'
      },
      {
        label: 'Tổng thu hồi',
        value: formatCompactCurrency(totals.totalRepayments),
        change: 12.3,
        changeType: 'increase',
        icon: 'DollarSign'
      },
      {
        label: 'Tỷ lệ thu hồi',
        value: `${totals.repaymentRate.toFixed(1)}%`,
        change: 2.1,
        changeType: 'increase',
        icon: 'Target'
      },
      {
        label: 'Hoa hồng đã trả',
        value: formatCompactCurrency(totals.totalCommissions),
        change: 15.7,
        changeType: 'increase',
        icon: 'Users'
      },
      {
        label: 'Doanh thu ròng',
        value: formatCompactCurrency(totals.totalRevenue),
        change: -3.2,
        changeType: 'decrease',
        icon: 'TrendingUp'
      },
      {
        label: 'Tổng hồ sơ',
        value: mockProductBreakdown.reduce((sum, product) => sum + product.loans, 0),
        change: 5.8,
        changeType: 'increase',
        icon: 'FileText'
      }
    ];
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      CreditCard, DollarSign, Target, Users, TrendingUp, FileText
    };
    return icons[iconName];
  };

  const totals = calculateTotals();
  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo tài chính</h1>
          <p className="text-slate-600">Tổng quan hiệu quả kinh doanh và dòng tiền</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
            >
              <option value="last_3_months">3 tháng gần nhất</option>
              <option value="last_6_months">6 tháng gần nhất</option>
              <option value="last_year">1 năm gần nhất</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = getIcon(metric.icon);
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.changeType === 'increase' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                    {metric.changeType === 'decrease' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                    <span className={`text-sm font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' :
                      metric.changeType === 'decrease' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Icon className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Xu hướng theo tháng</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {monthlyData.slice(0, 6).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {new Date(data.month + '-01').toLocaleDateString('vi-VN', { month: 'short' })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(data.month + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.loans || Math.floor(data.disbursements / 25000000)} hồ sơ
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCompactCurrency(data.disbursements)}</p>
                  <p className="text-xs text-green-600">+{formatCompactCurrency(data.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Phân tích theo sản phẩm</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {mockProductBreakdown.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-amber-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-slate-500'
                  }`}></div>
                  <span className="text-sm text-slate-700">{product.product}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900">{product.loans} hồ sơ</span>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-amber-500' :
                        index === 3 ? 'bg-purple-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${product.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">
                    {product.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(mockProductBreakdown.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Financial Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Chi tiết tài chính theo tháng</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">6 tháng gần nhất</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Tháng</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Giải ngân</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Thu hồi</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Tỷ lệ thu hồi</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Hoa hồng</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => {
                  const repaymentRate = (data.repayments / data.disbursements * 100);
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">
                        {new Date(data.month + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {formatCurrency(data.disbursements)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {formatCurrency(data.repayments)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`font-medium ${
                          repaymentRate >= 80 ? 'text-green-600' :
                          repaymentRate >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {repaymentRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900">
                        {formatCurrency(data.commissions)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                        {formatCurrency(data.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="py-3 px-4 text-sm font-bold text-slate-900">Tổng cộng</td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-slate-900">
                    {formatCurrency(totals.totalDisbursements)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-slate-900">
                    {formatCurrency(totals.totalRepayments)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-slate-900">
                    {totals.repaymentRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-slate-900">
                    {formatCurrency(totals.totalCommissions)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                    {formatCurrency(totals.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Phân tích hiệu suất</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Điểm mạnh</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tỷ lệ thu hồi tốt (78.4%)</li>
              <li>• Doanh thu hoa hồng tăng 15.7%</li>
              <li>• Sản phẩm ô tô hiệu quả cao</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Cần cải thiện</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Doanh thu ròng giảm 3.2%</li>
              <li>• Chi phí vận hành tăng</li>
              <li>• Nợ xấu tiềm ẩn</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Khuyến nghị</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tăng cường thu hồi nợ</li>
              <li>• Đa dạng hóa sản phẩm</li>
              <li>• Tối ưu chi phí vận hành</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
