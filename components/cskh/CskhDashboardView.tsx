import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FilePlus2, FileStack, Clock, CheckCircle, AlertTriangle,
  TrendingUp, TrendingDown, BarChart3, Target, Zap
} from 'lucide-react';
import { DashboardStat, LoanApplication, Customer } from '../../types';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';

interface CskhStats {
  totalCustomers: number;
  activeLoans: number;
  pendingReviews: number;
  completedToday: number;
  conversionRate: number;
  avgProcessingTime: string;
  supplementLoans: number;
}

interface RecentActivity {
  id: string;
  action: string;
  customer: string;
  amount: number | null;
  timestamp: Date;
  status: string;
}

export const CskhDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { loans, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Calculate CSKH statistics from actual data
  const stats: CskhStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique customers from loans created by CSKH users
    const cskhLoans = loans.filter(loan => loan.createdBy === user?.id);
    const uniqueCustomers = new Set(cskhLoans.map(loan => loan.customerId)).size;

    // Active loans (pending status)
    const activeLoans = cskhLoans.filter(loan =>
      ['pending_cskh', 'pending_cskh_supplement', 'pending_assessment', 'pending_security', 'pending_admin', 'pending_disbursement'].includes(loan.status)
    ).length;

    // Pending reviews (loans that need CSKH action)
    const pendingReviews = cskhLoans.filter(loan =>
      loan.status === 'pending_cskh' || loan.status === 'draft' || loan.status === 'pending_cskh_supplement'
    ).length;

    // Loans need supplement
    const supplementLoans = cskhLoans.filter(loan =>
      loan.status === 'pending_cskh_supplement'
    ).length;

    // Completed today (loans moved to next step today)
    const completedToday = cskhLoans.filter(loan => {
      const updatedDate = new Date(loan.updatedAt);
      updatedDate.setHours(0, 0, 0, 0);
      return updatedDate.getTime() === today.getTime() &&
             !['pending_cskh', 'draft'].includes(loan.status);
    }).length;

    // Conversion rate (loans that passed initial screening)
    const totalProcessedLoans = cskhLoans.filter(loan => !['pending_cskh', 'draft'].includes(loan.status)).length;
    const convertedLoans = cskhLoans.filter(loan =>
      ['pending_assessment', 'pending_security', 'pending_admin', 'pending_disbursement', 'disbursed'].includes(loan.status)
    ).length;
    const conversionRate = totalProcessedLoans > 0 ? (convertedLoans / totalProcessedLoans) * 100 : 0;

    // Average processing time - calculate from actual loan data
    const completedLoans = cskhLoans.filter(loan => {
      // Loans that have moved past CSKH stage
      return !['pending_cskh', 'draft'].includes(loan.status) && 
             loan.createdAt && loan.updatedAt &&
             loan.updatedAt.getTime() !== loan.createdAt.getTime();
    });

    let avgProcessingTime = 'Chưa có dữ liệu';
    if (completedLoans.length > 0) {
      const totalProcessingTimeMs = completedLoans.reduce((sum, loan) => {
        const processingTime = loan.updatedAt.getTime() - loan.createdAt.getTime();
        return sum + processingTime;
      }, 0);
      
      const avgMs = totalProcessingTimeMs / completedLoans.length;
      const avgHours = avgMs / (1000 * 60 * 60);
      
      if (avgHours < 1) {
        const avgMinutes = Math.round(avgMs / (1000 * 60));
        avgProcessingTime = `${avgMinutes} phút`;
      } else if (avgHours < 24) {
        const hours = Math.floor(avgHours);
        const minutes = Math.round((avgHours - hours) * 60);
        avgProcessingTime = minutes > 0 ? `${hours}h ${minutes}ph` : `${hours} giờ`;
      } else {
        const days = Math.floor(avgHours / 24);
        const hours = Math.round(avgHours % 24);
        avgProcessingTime = hours > 0 ? `${days} ngày ${hours}h` : `${days} ngày`;
      }
    }

    return {
      totalCustomers: uniqueCustomers,
      activeLoans,
      pendingReviews,
      completedToday,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgProcessingTime,
      supplementLoans
    };
  }, [loans, user]);

  // Calculate recent activities from actual loan data
  const recentActivities: RecentActivity[] = useMemo(() => {
    const cskhLoans = loans
      .filter(loan => loan.createdBy === user?.id)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10); // Get last 10 activities

    return cskhLoans.map(loan => ({
      id: loan.id,
      action: getActivityAction(loan.status),
      customer: loan.customer.fullName,
      amount: loan.loanAmount,
      timestamp: loan.updatedAt,
      status: loan.status
    }));
  }, [loans, user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshLoans();
      } catch (error) {
        console.error('Failed to load CSKH dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshLoans]);

  const getActivityAction = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'Tạo hồ sơ vay mới';
      case 'pending_cskh':
        return 'Đang xử lý hồ sơ';
      case 'pending_assessment':
        return 'Gửi hồ sơ thẩm định';
      case 'pending_security':
        return 'Chờ kiểm tra bảo mật';
      case 'pending_admin':
        return 'Chờ phê duyệt admin';
      case 'pending_disbursement':
        return 'Chờ giải ngân';
      case 'disbursed':
        return 'Đã giải ngân';
      case 'rejected':
        return 'Từ chối hồ sơ';
      case 'cancelled':
        return 'Hủy hồ sơ';
      default:
        return 'Cập nhật hồ sơ';
    }
  };

  const dashboardStats: DashboardStat[] = [
    {
      label: 'Tổng khách hàng',
      value: stats.totalCustomers.toLocaleString(),
      trend: 'up',
      trendValue: '+5%',
      icon: 'Users'
    },
    {
      label: 'Hồ sơ đang xử lý',
      value: stats.activeLoans.toString(),
      trend: 'neutral',
      trendValue: '12 mới',
      icon: 'FileStack'
    },
    {
      label: 'Chờ xem xét',
      value: stats.pendingReviews.toString(),
      trend: 'down',
      trendValue: '-3',
      icon: 'Clock'
    },
    {
      label: 'Cần bổ sung',
      value: stats.supplementLoans.toString(),
      trend: stats.supplementLoans > 0 ? 'up' : 'neutral',
      trendValue: stats.supplementLoans > 0 ? `${stats.supplementLoans} hồ sơ` : '0',
      icon: 'FileStack'
    },
    {
      label: 'Hoàn thành hôm nay',
      value: stats.completedToday.toString(),
      trend: 'up',
      trendValue: '+8',
      icon: 'CheckCircle'
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      value: `${stats.conversionRate}%`,
      trend: 'up',
      trendValue: '+2.1%',
      icon: 'Target'
    },
    {
      label: 'Thời gian xử lý TB',
      value: stats.avgProcessingTime,
      trend: 'down',
      trendValue: '-15min',
      icon: 'Zap'
    }
  ];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'forwarded': return <FileStack className="w-4 h-4 text-blue-500" />;
      case 'inquiry': return <Phone className="w-4 h-4 text-purple-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Users, FileStack, Clock, CheckCircle, Target, Zap
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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard CSKH</h1>
          <p className="text-slate-600">Quản lý khách hàng và hồ sơ vay</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hôm nay: {stats.completedToday} hồ sơ
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
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            <FilePlus2 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/cs/create-loan')}
              className="p-6 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group shadow-sm hover:shadow-md"
            >
              <FilePlus2 className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold text-slate-900">Tạo hồ sơ mới</span>
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="mt-0.5">
                  {getActivityIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">
                    {activity.customer}
                    {activity.amount && ` • ${activity.amount.toLocaleString()} VND`}
                    {' • '}{formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hiệu suất hôm nay</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.completedToday}</div>
            <p className="text-sm text-slate-600">Hồ sơ hoàn thành</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.conversionRate}%</div>
            <p className="text-sm text-slate-600">Tỷ lệ chuyển đổi</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgProcessingTime}</div>
            <p className="text-sm text-slate-600">Thời gian xử lý TB</p>
          </div>
        </div>
      </div>
    </div>
  );
};
