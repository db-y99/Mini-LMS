'use client';
import React, { useState, useEffect } from 'react';
import {
  FileSearch, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  BarChart3, Target, Users, DollarSign, AlertTriangle, Eye,
  FileText, Calculator, Star
} from 'lucide-react';
import { DashboardStat } from '../../types';

interface AssessmentStats {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  rejectedAssessments: number;
  avgAssessmentTime: string;
  approvalRate: number;
  totalLoanAmount: number;
  avgRiskScore: number;
}

export const AssessmentDashboardView: React.FC = () => {
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    rejectedAssessments: 0,
    avgAssessmentTime: '0 giờ',
    approvalRate: 0,
    totalLoanAmount: 0,
    avgRiskScore: 0
  });
  
  const mockRecentAssessments: any[] = [];
  const mockRiskDistribution: any[] = [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const dashboardStats: DashboardStat[] = [
    {
      label: 'Tổng thẩm định',
      value: stats.totalAssessments.toLocaleString(),
      trend: 'up',
      trendValue: '+12%',
      icon: 'FileSearch'
    },
    {
      label: 'Đã hoàn thành',
      value: stats.completedAssessments.toString(),
      trend: 'up',
      trendValue: '+15%',
      icon: 'CheckCircle'
    },
    {
      label: 'Chờ thẩm định',
      value: stats.pendingAssessments.toString(),
      trend: 'neutral',
      trendValue: '8 mới',
      icon: 'Clock'
    },
    {
      label: 'Từ chối',
      value: stats.rejectedAssessments.toString(),
      trend: 'down',
      trendValue: '-3%',
      icon: 'XCircle'
    },
    {
      label: 'Tỷ lệ duyệt',
      value: `${stats.approvalRate}%`,
      trend: 'up',
      trendValue: '+2.1%',
      icon: 'Target'
    },
    {
      label: 'Điểm rủi ro TB',
      value: stats.avgRiskScore.toFixed(1),
      trend: 'down',
      trendValue: '-0.2',
      icon: 'Calculator'
    }
  ];

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <FileSearch className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'text-green-600 bg-green-100';
    if (score <= 3) return 'text-blue-600 bg-blue-100';
    if (score <= 4) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      FileSearch, CheckCircle, XCircle, Clock, Target, Calculator
    };
    return icons[iconName];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Gần đây';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Thẩm định</h1>
          <p className="text-slate-600">Quản lý và theo dõi quá trình thẩm định khoản vay</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.pendingAssessments > 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}>
            {stats.pendingAssessments} hồ sơ chờ xử lý
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Thẩm định gần đây</h3>
            <FileSearch className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {mockRecentAssessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileSearch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Không có dữ liệu thẩm định gần đây</p>
              </div>
            ) : mockRecentAssessments.map((assessment) => (
              <div key={assessment.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="mt-0.5">
                  {getDecisionIcon(assessment.decision)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{assessment.customerName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(assessment.riskScore)}`}>
                      Rủi ro: {assessment.riskScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatCurrency(assessment.loanAmount)} • {assessment.assessor} • {formatTimeAgo(assessment.timestamp)}
                  </p>
                  {assessment.reason && (
                    <p className="text-xs text-red-600 mt-1">Lý do: {assessment.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Phân bố rủi ro</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {mockRiskDistribution.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Không có dữ liệu phân bố rủi ro</p>
              </div>
            ) : mockRiskDistribution.map((risk, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${risk.color}`}></div>
                  <span className="text-sm text-slate-700">{risk.level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${risk.color} rounded-full`}
                      style={{ width: `${risk.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">
                    {risk.count}
                  </span>
                  <span className="text-xs text-slate-500 w-10 text-right">
                    {risk.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group">
              <FileSearch className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Thẩm định mới</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Duyệt hồ sơ</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-colors group">
              <Eye className="w-6 h-6 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Xem chi tiết</span>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors group">
              <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-slate-900">Báo cáo</span>
            </button>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tóm tắt thẩm định</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-900">Hồ sơ được duyệt</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completedAssessments - stats.rejectedAssessments}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-slate-900">Hồ sơ từ chối</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.rejectedAssessments}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-slate-900">Chờ xử lý</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{stats.pendingAssessments}</span>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tổng giá trị thẩm định:</span>
                <span className="font-bold text-slate-900">{formatCurrency(stats.totalLoanAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-600">Thời gian xử lý TB:</span>
                <span className="font-bold text-slate-900">{stats.avgAssessmentTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Thẩm định viên xuất sắc</h3>
        <div className="text-center py-8 text-slate-500">
          <Star className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Không có dữ liệu thẩm định viên</p>
        </div>
      </div>
    </div>
  );
};
