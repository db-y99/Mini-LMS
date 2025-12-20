import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Activity, Calendar, ArrowUp, ArrowDown, PieChart, Clock } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';

interface RecentLoan {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: string;
  avatar: string;
}

interface ActivityItem {
  user: string;
  action: string;
  target: string;
  time: string;
  icon: string;
}

export const DashboardView: React.FC = () => {
  const { loans, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Generate chart data from real loans data
  const chartData = useMemo(() => {
    const monthlyStats = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    loans.forEach(loan => {
      const loanDate = new Date(loan.createdAt);
      if (loanDate.getFullYear() === currentYear) {
        const month = loanDate.getMonth();
        monthlyStats[month]++;
      }
    });

    // Convert to percentage (max value = 100)
    const maxValue = Math.max(...monthlyStats, 1);
    return monthlyStats.map(count => Math.round((count / maxValue) * 100));
  }, [loans]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate real statistics
  const stats = useMemo(() => {
    const totalLoans = loans.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthLoans = loans.filter(loan => {
      const loanDate = new Date(loan.createdAt);
      return loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear;
    }).length;

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthLoans = loans.filter(loan => {
      const loanDate = new Date(loan.createdAt);
      return loanDate.getMonth() === lastMonth && loanDate.getFullYear() === currentYear;
    }).length;

    const monthlyGrowth = lastMonthLoans > 0 ? ((currentMonthLoans - lastMonthLoans) / lastMonthLoans * 100) : 0;

    const disbursedLoans = loans.filter(loan => loan.status === 'disbursed').length;
    const totalDisbursedAmount = loans
      .filter(loan => loan.status === 'disbursed')
      .reduce((sum, loan) => sum + loan.loanAmount, 0);

    const pendingLoans = loans.filter(loan =>
      ['pending_assessment', 'pending_security', 'pending_admin', 'pending_disbursement'].includes(loan.status)
    ).length;

    const rejectedLoans = loans.filter(loan => loan.status === 'rejected').length;
    const badDebtRate = totalLoans > 0 ? (rejectedLoans / totalLoans * 100) : 0;

    return [
      {
        label: 'Tổng hồ sơ tháng',
        value: currentMonthLoans.toLocaleString(),
        trend: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
        icon: Users,
        color: 'blue',
        sub: 'so với tháng trước'
      },
      {
        label: 'Doanh số giải ngân',
        value: `${(totalDisbursedAmount / 1000000000).toFixed(1)} Tỷ`,
        trend: '+8.2%',
        icon: DollarSign,
        color: 'green',
        sub: 'so với mục tiêu'
      },
      {
        label: 'Hồ sơ chờ duyệt',
        value: pendingLoans.toString(),
        trend: `${pendingLoans > 0 ? '-' : '+'}${(Math.abs(pendingLoans) / Math.max(totalLoans, 1) * 100).toFixed(1)}%`,
        icon: Activity,
        color: 'amber',
        sub: pendingLoans > 0 ? 'cần xử lý' : 'hoàn thành'
      },
      {
        label: 'Tỷ lệ nợ xấu',
        value: `${badDebtRate.toFixed(1)}%`,
        trend: `${badDebtRate > 1 ? '+' : '-'}${(Math.abs(badDebtRate) * 0.1).toFixed(1)}%`,
        icon: TrendingUp,
        color: 'indigo',
        sub: badDebtRate < 1 ? 'rất tốt' : 'cần cải thiện'
      }
    ];
  }, [loans]);

  // Get recent loans
  const recentLoans: RecentLoan[] = useMemo(() => {
    return loans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(loan => ({
        id: loan.id,
        name: loan.customer.fullName,
        amount: loan.loanAmount.toLocaleString(),
        date: new Date(loan.createdAt).toLocaleDateString('vi-VN'),
        status: loan.status,
        avatar: loan.customer.fullName.charAt(0).toUpperCase()
      }));
  }, [loans]);

  // Get recent activities
  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add loan creation activities
    loans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .forEach(loan => {
        activities.push({
          user: loan.createdBy === user?.id ? 'Bạn' : 'Hệ thống',
          action: 'đã tạo hồ sơ mới',
          target: loan.id,
          time: getTimeAgo(loan.createdAt),
          icon: '📝'
        });
      });

    return activities.slice(0, 4);
  }, [loans, user]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshLoans();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshLoans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h2>
          <p className="text-slate-500 mt-1">Chào mừng trở lại, {user?.fullName || 'Người dùng'}! Dưới đây là báo cáo hôm nay.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Tháng này</span>
            </button>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                <span>Xuất báo cáo</span>
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                {stat.trend.replace('+', '').replace('-', '')}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-slate-400 text-xs mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Chart & Table */}
        <div className="lg:col-span-2 space-y-6">
            {/* Chart Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Thống kê hiệu suất 2024</h3>
                        <p className="text-sm text-slate-500">Số lượng hồ sơ vay theo tháng</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-blue-300 transition-colors">
                        <option>Tất cả chi nhánh</option>
                        <option>Chi nhánh Hà Nội</option>
                        <option>Chi nhánh TP.HCM</option>
                    </select>
                </div>
                
                {/* Visual CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-3 px-2">
                    {chartData.map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full justify-end">
                             <div className="relative w-full flex justify-center items-end h-[85%]">
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                     {val} Hồ sơ
                                     <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                 </div>
                                 {/* Bar */}
                                 <div 
                                    style={{ height: `${val}%` }} 
                                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 group-hover:opacity-90 relative overflow-hidden ${i === 7 ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-200' : 'bg-slate-100 group-hover:bg-blue-200'}`}
                                 >
                                 </div>
                             </div>
                             <span className={`text-xs font-semibold ${i === 7 ? 'text-blue-600' : 'text-slate-400'}`}>{months[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Loans Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Hồ sơ gần đây</h3>
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        Xem tất cả
                    </button>
                </div>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-y border-slate-100">
                            <tr>
                                <th className="px-4 py-4 font-semibold">Mã HS</th>
                                <th className="px-4 py-4 font-semibold">Khách hàng</th>
                                <th className="px-4 py-4 font-semibold">Số tiền</th>
                                <th className="px-4 py-4 font-semibold">Ngày tạo</th>
                                <th className="px-4 py-4 font-semibold text-center">Trạng thái</th>
                                <th className="px-4 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentLoans.map((row, i) => (
                                <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-4 font-semibold text-slate-900">{row.id}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {row.avatar}
                                            </div>
                                            <span className="text-slate-700 font-medium">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-900 font-bold">{row.amount} đ</td>
                                    <td className="px-4 py-4 text-slate-500">{row.date}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
                                            ${row.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                                              row.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                              'bg-amber-50 text-amber-600 border-amber-100'}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                row.status === 'approved' ? 'bg-green-500' : 
                                                row.status === 'rejected' ? 'bg-red-500' : 
                                                'bg-amber-500'
                                            }`}></span>
                                            {row.status === 'approved' ? 'Đã duyệt' : row.status === 'rejected' ? 'Từ chối' : 'Chờ xử lý'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-600 font-medium text-sm transition-colors">Chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Right Column: Activity & Calendar */}
        <div className="space-y-6">
            {/* Calendar / Tasks */}
             <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-lg">Lịch làm việc</h3>
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Calendar className="w-5 h-5 text-blue-200" />
                    </div>
                </div>
                <div className="space-y-4 relative z-10">
                     {[
                         { title: `Duyệt ${loans.filter(l => l.status === 'pending_admin').length} hồ sơ chờ`, time: '09:00 - 10:00', type: 'task' },
                         { title: 'Gọi lại khách hàng VIP', time: '10:30 - 11:00', type: 'call' },
                         { title: `Thẩm định ${loans.filter(l => l.status === 'pending_assessment').length} hồ sơ mới`, time: '14:00 - 15:30', type: 'task' },
                     ].map((task, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                             <div className={`w-2 h-2 rounded-full mt-2 ${task.type === 'meeting' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : task.type === 'call' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`}></div>
                             <div>
                                 <p className="text-sm font-semibold text-white/90">{task.title}</p>
                                 <p className="text-xs text-white/50 mt-0.5">{task.time}</p>
                             </div>
                         </div>
                     ))}
                </div>
                <button className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    + Thêm công việc
                </button>
             </div>

             {/* Activity Feed */}
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 text-lg">Hoạt động mới</h3>
                    <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-7 pb-2">
                    {recentActivities.map((act, i) => (
                        <div key={i} className="ml-8 relative">
                            <div className="absolute -left-[41px] top-0 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm z-10">
                                {act.icon}
                            </div>
                            <p className="text-sm text-slate-600 leading-snug">
                                <span className="font-bold text-slate-900">{act.user}</span> {act.action} <span className="text-blue-600 font-semibold hover:underline cursor-pointer">{act.target}</span>
                            </p>
                            <span className="text-xs text-slate-400 mt-1 block font-medium">{act.time}</span>
                        </div>
                    ))}
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};