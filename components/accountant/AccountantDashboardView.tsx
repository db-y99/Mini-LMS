import React, { useState, useEffect } from 'react';
import {
  Calculator, CreditCard, DollarSign, BarChart3, TrendingUp, TrendingDown,
  CheckCircle, XCircle, Clock, AlertTriangle, Users, Activity
} from 'lucide-react';

export const AccountantDashboardView: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Mock data cho accountant dashboard
  const stats = [
    {
      label: 'Hồ sơ chờ giải ngân',
      value: '6',
      trend: 'neutral',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Đã giải ngân hôm nay',
      value: '24',
      trend: 'up',
      trendValue: '+12%',
      icon: CreditCard,
      color: 'green'
    },
    {
      label: 'Tổng hoa hồng tháng',
      value: '2.4M',
      trend: 'up',
      trendValue: '+8%',
      icon: DollarSign,
      color: 'purple'
    },
    {
      label: 'Hồ sơ quá hạn',
      value: '2',
      trend: 'down',
      trendValue: '-50%',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const recentTransactions = [
    {
      id: 'TXN001',
      type: 'disbursement',
      amount: 15000000,
      customer: 'Nguyễn Văn An',
      status: 'completed',
      time: '10:30',
      description: 'Giải ngân thành công'
    },
    {
      id: 'TXN002',
      type: 'commission',
      amount: 75000,
      customer: 'Trần Thị Bình',
      status: 'pending',
      time: '09:15',
      description: 'Hoa hồng chờ thanh toán'
    },
    {
      id: 'TXN003',
      type: 'disbursement',
      amount: 25000000,
      customer: 'Lê Văn Cường',
      status: 'failed',
      time: '08:45',
      description: 'Giải ngân thất bại - thiếu thông tin'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'disbursement': return <CreditCard className="w-4 h-4" />;
      case 'commission': return <DollarSign className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Kế toán</h1>
          <p className="text-slate-600">Quản lý giải ngân và thanh toán hoa hồng</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hôm nay: 24 hồ sơ
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  {stat.trendValue && (
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                      {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' :
                        stat.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {stat.trendValue}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Giao dịch gần đây</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{transaction.customer}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Hoàn thành' :
                       transaction.status === 'pending' ? 'Chờ xử lý' : 'Thất bại'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{transaction.description}</p>
                  <p className="text-xs text-slate-400">{transaction.time} • {transaction.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {transaction.amount.toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-slate-500 capitalize">{transaction.type}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button className="w-full text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors">
            Xem tất cả giao dịch <Activity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Giải ngân nhanh</h4>
              <p className="text-sm text-slate-600">Xử lý hồ sơ chờ giải ngân</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Bắt đầu giải ngân
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Thanh toán hoa hồng</h4>
              <p className="text-sm text-slate-600">Thanh toán cho đại lý</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Xử lý thanh toán
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Báo cáo tài chính</h4>
              <p className="text-sm text-slate-600">Xuất báo cáo tháng</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};
