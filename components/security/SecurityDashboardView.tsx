import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Eye, Lock, Ban, Search,
  BarChart3, Target, Zap, Users, FileText
} from 'lucide-react';
import { DashboardStat } from '../../types';

interface SecurityStats {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  pendingChecks: number;
  fraudAlerts: number;
  blacklistHits: number;
  avgProcessingTime: string;
  riskScoreAvg: number;
}

export const SecurityDashboardView: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats>({
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    pendingChecks: 0,
    fraudAlerts: 0,
    blacklistHits: 0,
    avgProcessingTime: '0 giờ',
    riskScoreAvg: 0
  });
  
  const mockSecurityActivities: any[] = [];
  const mockFraudAlerts: any[] = [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const dashboardStats: DashboardStat[] = [
    {
      label: 'Tổng kiểm tra',
      value: stats.totalChecks.toLocaleString(),
      trend: 'up',
      trendValue: '+8%',
      icon: 'Shield'
    },
    {
      label: 'Đạt yêu cầu',
      value: stats.passedChecks.toString(),
      trend: 'up',
      trendValue: '+12%',
      icon: 'CheckCircle'
    },
    {
      label: 'Không đạt',
      value: stats.failedChecks.toString(),
      trend: 'down',
      trendValue: '-5%',
      icon: 'XCircle'
    },
    {
      label: 'Chờ kiểm tra',
      value: stats.pendingChecks.toString(),
      trend: 'neutral',
      trendValue: '3 mới',
      icon: 'Clock'
    },
    {
      label: 'Cảnh báo gian lận',
      value: stats.fraudAlerts.toString(),
      trend: 'up',
      trendValue: '+2',
      icon: 'AlertTriangle'
    },
    {
      label: 'Điểm rủi ro TB',
      value: stats.riskScoreAvg.toFixed(1),
      trend: 'down',
      trendValue: '-0.2',
      icon: 'Target'
    }
  ];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'blocked': return <Ban className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-700 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-l-green-500 bg-green-50';
      case 'medium': return 'border-l-amber-500 bg-amber-50';
      case 'high': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-slate-500 bg-slate-50';
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Shield, CheckCircle, XCircle, Clock, AlertTriangle, Target
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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Bảo mật</h1>
          <p className="text-slate-600">Giám sát và kiểm tra an ninh hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.fraudAlerts > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {stats.fraudAlerts > 0 ? `${stats.fraudAlerts} cảnh báo` : 'An toàn'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = getIcon(stat.icon);
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Activities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Hoạt động kiểm tra</h3>
            <Shield className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {mockSecurityActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="mt-0.5">
                  {getActivityIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(activity.riskLevel)}`}>
                      {activity.riskLevel === 'low' ? 'Thấp' :
                       activity.riskLevel === 'medium' ? 'Trung bình' :
                       activity.riskLevel === 'high' ? 'Cao' : 'Nguy hiểm'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.customer} • {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Cảnh báo gian lận</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {mockFraudAlerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-900">{alert.type}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {alert.severity === 'high' ? 'Cao' :
                     alert.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">{alert.customer}</p>
                <p className="text-sm text-slate-500">{alert.description}</p>
                <p className="text-xs text-slate-400 mt-2">{formatTimeAgo(alert.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <Search className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Kiểm tra hồ sơ</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Danh sách đen</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-colors group">
              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Báo cáo gian lận</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors group">
              <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Báo cáo bảo mật</span>
            </button>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tổng quan rủi ro</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Rủi ro thấp</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Rủi ro trung bình</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-amber-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Rủi ro cao</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">25%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-slate-700">Thời gian xử lý trung bình: {stats.avgProcessingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
