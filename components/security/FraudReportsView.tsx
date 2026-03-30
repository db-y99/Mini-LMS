'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, Search, Filter, ShieldAlert, Eye, Ban,
  Calendar, User, Phone, CheckCircle2, Clock, XCircle, Info
} from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'duplicate_ip' | 'fake_phone' | 'mismatched_info' | 'blacklist_hit' | 'suspicious_pattern';
  customer: {
    id: string;
    name: string;
    phone: string;
    idNumber: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

export const FraudReportsView: React.FC = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setAlerts([
        {
          id: 'FRD-9901',
          type: 'duplicate_ip',
          customer: { 
            id: 'CUST-001', 
            name: 'Lê Hoàng Minh', 
            phone: '0901234567', 
            idNumber: '001928374421' 
          },
          severity: 'high',
          description: 'Trùng địa chỉ IP với 3 hồ sơ khác đã bị từ chối trước đó.',
          evidence: ['IP: 113.190.23.45', 'Device Fingerprint matched'],
          timestamp: new Date(),
          status: 'active'
        },
        {
          id: 'FRD-8822',
          type: 'blacklist_hit',
          customer: { 
            id: 'CUST-002', 
            name: 'Trần Minh Tâm', 
            phone: '0811223344', 
            idNumber: '034293847522' 
          },
          severity: 'critical',
          description: 'Định danh trùng khớp với danh sách đen hệ thống.',
          evidence: ['Blacklist ID Match', 'Phone Number Blocked'],
          timestamp: new Date(Date.now() - 3600000),
          status: 'investigating',
          assignedTo: 'Admin SEC'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.customer.phone.includes(searchTerm) ||
      alert.customer.idNumber.includes(searchTerm) ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-amber-100 text-amber-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Nguy hiểm';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return severity;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Chưa xử lý
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Đang điều tra
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đã xử lý
          </span>
        );
      case 'false_positive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <XCircle className="w-3 h-3 mr-1" />
            Sai dương
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'duplicate_ip': return 'IP trùng lặp';
      case 'fake_phone': return 'SĐT giả mạo';
      case 'mismatched_info': return 'Thông tin không khớp';
      case 'blacklist_hit': return 'Trùng Blacklist';
      case 'suspicious_pattern': return 'Hành vi bất thường';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Báo cáo gian lận</h1>
        <p className="text-slate-600 text-sm">
          Phát hiện và xử lý các hành vi gian lận, làm giả hồ sơ.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-600">Cảnh báo</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Mới</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
          <div className="text-xs text-slate-600">Chưa xử lý</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Đang xử lý</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.investigating}</div>
          <div className="text-xs text-slate-600">Điều tra</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Hoàn thành</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.resolved}</div>
          <div className="text-xs text-slate-600">Đã xử lý</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, mã cảnh báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="critical">Nguy hiểm</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Chưa xử lý</option>
          <option value="investigating">Đang điều tra</option>
          <option value="resolved">Đã xử lý</option>
          <option value="false_positive">Sai dương</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">{alert.id}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {getSeverityLabel(alert.severity)}
                      </span>
                      {getStatusBadge(alert.status)}
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      {getTypeLabel(alert.type)}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      {alert.description}
                    </p>
                    
                    {/* Customer Info */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{alert.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono">{alert.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{alert.timestamp.toLocaleString('vi-VN')}</span>
                      </div>
                      {alert.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Phụ trách: {alert.assignedTo}</span>
                        </div>
                      )}
                    </div>

                    {/* Evidence */}
                    {alert.evidence.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {alert.evidence.map((ev, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  {alert.status === 'active' && (
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1"
                    >
                      <Ban className="w-4 h-4" />
                      Chặn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy cảnh báo</h3>
            <p className="text-sm text-slate-500">
              Không có cảnh báo gian lận nào phù hợp với bộ lọc của bạn.
            </p>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 text-sm mb-1">
              Hệ thống phát hiện tự động
            </div>
            <p className="text-sm text-blue-800">
              Các cảnh báo được tạo tự động bởi AI khi phát hiện hành vi bất thường: 
              IP trùng lặp, thông tin không khớp, hoặc trùng với danh sách đen. 
              Vui lòng xem xét và xử lý kịp thời.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
