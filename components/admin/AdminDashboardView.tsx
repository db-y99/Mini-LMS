'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, FileText, CheckCircle, XCircle, Clock, DollarSign,
  TrendingUp, TrendingDown, Activity, Shield, BarChart3,
  AlertTriangle, CreditCard, UserCheck
} from 'lucide-react';
import { AdminDashboardStats, DashboardStat } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCommission: 0,
    monthlyRevenue: 0
  });
  
  const mockRecentActivities: any[] = [];
  const [loading, setLoading] = useState(false);

  // Simulate data loading
  useEffect(() => {
    setLoading(true);
    // In real app, fetch from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const dashboardStats: DashboardStat[] = [
    {
      label: 'Tổng hồ sơ vay',
      value: stats.totalLoans.toLocaleString(),
      trend: 'up',
      trendValue: '+12%',
      icon: 'FileText'
    },
    {
      label: 'Hồ sơ chờ xử lý',
      value: stats.pendingLoans.toString(),
      trend: 'neutral',
      trendValue: '8 mới',
      icon: 'Clock'
    },
    {
      label: 'Đã phê duyệt',
      value: stats.approvedLoans.toLocaleString(),
      trend: 'up',
      trendValue: '+8%',
      icon: 'CheckCircle'
    },
    {
      label: 'Từ chối',
      value: stats.rejectedLoans.toString(),
      trend: 'down',
      trendValue: '-2%',
      icon: 'XCircle'
    },
    {
      label: 'Tổng users',
      value: stats.totalUsers.toString(),
      trend: 'up',
      trendValue: '+3',
      icon: 'Users'
    },
    {
      label: 'Hoa hồng đã trả',
      value: `${(stats.totalCommission / 1000000).toFixed(0)}M`,
      trend: 'up',
      trendValue: '+15%',
      icon: 'DollarSign'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejection': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'disbursement': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'user_creation': return <UserCheck className="w-4 h-4 text-purple-500" />;
      case 'config_change': return <Shield className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      FileText, CheckCircle, XCircle, Clock, Users, DollarSign
    };
    return icons[iconName];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-600">Tổng quan hệ thống quản lý khoản vay</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hệ thống hoạt động bình thường
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = getIcon(stat.icon ?? 'FileText');
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
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
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Icon className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Tình trạng hệ thống</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">CPU Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Memory Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database Connections</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">75%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">
                    {activity.user} • {activity.target} • {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả hoạt động →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-900">Quản lý Users</span>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-900">Audit Log</span>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-900">Commission</span>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-slate-900">Báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
