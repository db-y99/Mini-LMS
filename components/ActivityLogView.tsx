'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Download, User, FileText, Settings, Shield, LogIn, CheckCircle2, AlertCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useAudit } from '../contexts/AuditContext';
import { useAuth } from '../contexts/AuthContext';

export const ActivityLogView: React.FC = () => {
  const { auditLogs, getRecentLogs, getLogsByUser } = useAudit();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Convert audit logs to activity format
    const convertAuditLogsToActivities = () => {
      // Với CSKH: chỉ hiển thị log của chính user hiện tại (không dùng mock data mặc định)
      const logs = user && user.role === 'cskh'
        ? getLogsByUser(user.id)
        : getRecentLogs(50); // các vai trò khác vẫn xem 50 log gần nhất
      const groupedActivities: any[] = [];

      // Group by date
      const groupedByDate = logs.reduce((acc, log) => {
        const dateKey = log.timestamp.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(log);
        return acc;
      }, {} as Record<string, typeof logs>);

      // Convert to activity format
      Object.entries(groupedByDate).forEach(([dateKey, dateLogs]) => {
        const date = new Date(dateKey);
        const isToday = date.toDateString() === new Date().toDateString();
        const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();

        let dateLabel = date.toLocaleDateString('vi-VN');
        if (isToday) dateLabel = 'Hôm nay';
        else if (isYesterday) dateLabel = 'Hôm qua';

        const items = dateLogs.map(log => ({
          id: log.id,
          type: getActivityType(log.action),
          user: log.userName,
          action: getActionDescription(log.action),
          target: log.resourceId || '',
          time: log.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          detail: getActionDetail(log)
        }));

        groupedActivities.push({
          date: `${dateLabel}, ${date.toLocaleDateString('vi-VN')}`,
          items
        });
      });

      setActivities(groupedActivities);
      setLoading(false);
    };

    convertAuditLogsToActivities();
  }, [auditLogs, user, getLogsByUser, getRecentLogs]);

  const getActivityType = (action: string) => {
    switch (action) {
      case 'CREATE_LOAN': return 'create';
      case 'UPDATE_LOAN_STATUS':
      case 'APPROVE_LOAN': return 'update';
      case 'REJECT_LOAN': return 'reject';
      case 'CREATE_USER': return 'create';
      case 'UPDATE_COMMISSION_RULE': return 'update';
      default: return 'system';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'CREATE_LOAN': return 'đã tạo hồ sơ vay mới';
      case 'UPDATE_LOAN_STATUS': return 'cập nhật trạng thái hồ sơ';
      case 'APPROVE_LOAN': return 'duyệt hồ sơ vay';
      case 'REJECT_LOAN': return 'từ chối hồ sơ vay';
      case 'CREATE_USER': return 'tạo tài khoản mới';
      case 'UPDATE_COMMISSION_RULE': return 'cập nhật quy tắc hoa hồng';
      default: return action.toLowerCase().replace('_', ' ');
    }
  };

  const getActionDetail = (log: any) => {
    switch (log.action) {
      case 'CREATE_LOAN':
        return `Khoản vay: ${log.newValues?.loanAmount?.toLocaleString() || 'N/A'}đ`;
      case 'UPDATE_LOAN_STATUS':
        return `Trạng thái: ${log.oldValues?.status} → ${log.newValues?.status}`;
      case 'APPROVE_LOAN':
        return `Điểm rủi ro: ${log.newValues?.riskScore || 'N/A'}`;
      case 'REJECT_LOAN':
        return `Lý do: ${log.newValues?.rejectionReason || 'N/A'}`;
      case 'CREATE_USER':
        return `Tài khoản: ${log.newValues?.username || 'N/A'}`;
      case 'UPDATE_COMMISSION_RULE':
        return `Tỷ lệ: ${log.oldValues?.commissionRate}% → ${log.newValues?.commissionRate}%`;
      default:
        return '';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'create': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'update': return <Settings className="w-5 h-5 text-amber-600" />;
      case 'system': return <Shield className="w-5 h-5 text-indigo-600" />;
      case 'login': return <LogIn className="w-5 h-5 text-slate-600" />;
      case 'reject': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'upload': return <Download className="w-5 h-5 text-green-600 transform rotate-180" />; // Upload icon workaround
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBgColor = (type: string) => {
      switch (type) {
        case 'create': return 'bg-blue-100 border-blue-200';
        case 'update': return 'bg-amber-100 border-amber-200';
        case 'system': return 'bg-indigo-100 border-indigo-200';
        case 'login': return 'bg-slate-100 border-slate-200';
        case 'reject': return 'bg-red-100 border-red-200';
        case 'warning': return 'bg-orange-100 border-orange-200';
        case 'upload': return 'bg-green-100 border-green-200';
        default: return 'bg-slate-50 border-slate-200';
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nhật ký hoạt động</h2>
          <p className="text-slate-500 mt-1 text-sm">Theo dõi lịch sử thao tác và sự kiện hệ thống.</p>
        </div>
        <div className="flex gap-3">
             <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Xuất Log</span>
             </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Tìm theo user, mã hồ sơ..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
             <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-3 py-2">
                 <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                 <span className="text-sm text-slate-700 font-medium whitespace-nowrap">7 ngày qua</span>
             </div>
             
             <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                 <option>Tất cả hành động</option>
                 <option>Tạo mới</option>
                 <option>Cập nhật</option>
                 <option>Hệ thống</option>
                 <option>Cảnh báo</option>
             </select>

             <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                 <option>Tất cả nhân viên</option>
                 {user?.role === 'cskh' && (
                   <option value={user.fullName}>{user.fullName}</option>
                 )}
             </select>
         </div>
      </div>

      {/* Timeline Content - Full Width */}
      <div className="w-full">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-sm">Không có nhật ký hoạt động nào</p>
            <p className="text-slate-400 text-xs mt-1">Các hoạt động sẽ được ghi lại tự động khi bạn thực hiện thao tác</p>
          </div>
        ) : activities.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8 last:mb-0">
                <div className="sticky top-20 z-10 bg-slate-50/95 backdrop-blur-sm py-2 mb-4 border-b border-slate-200 inline-block pr-6 rounded-r-full">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {group.date}
                    </span>
                </div>

                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                    {group.items.map((item: { id: string; type: string; user: string; action: string; target: string; time: string; detail: string }) => (
                        <div key={item.id} className="relative pl-8 group">
                            {/* Connector Dot */}
                            <div className={`absolute -left-[11px] top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${getBgColor(item.type)}`}>
                                {item.type === 'warning' || item.type === 'reject' ? (
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                            </div>

                            {/* Card */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group-hover:border-blue-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getBgColor(item.type)}`}>
                                            {getIcon(item.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-900 leading-snug">
                                                <span className="font-bold">{item.user}</span> {item.action} 
                                                {item.target && (
                                                    <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-blue-600 font-semibold text-xs border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                                        {item.target}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{item.detail}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        
        {activities.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
              Xem thêm hoạt động cũ hơn
            </button>
          </div>
        )}
      </div>

    </div>
  );
};