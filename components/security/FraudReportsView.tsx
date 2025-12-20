import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, Filter, Download, Eye, Ban,
  TrendingUp, Calendar, User, Phone, MapPin, Shield,
  ChevronDown, X, AlertCircle
} from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'duplicate_ip' | 'fake_phone' | 'mismatched_info' | 'blacklist_hit' | 'suspicious_pattern';
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    idNumber: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
}

export const FraudReportsView: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<FraudAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.customer.phone.includes(searchTerm) ||
        alert.customer.idNumber.includes(searchTerm) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'duplicate_ip': return 'IP trùng lặp';
      case 'fake_phone': return 'Số điện thoại giả';
      case 'mismatched_info': return 'Thông tin không khớp';
      case 'blacklist_hit': return 'Danh sách đen';
      case 'suspicious_pattern': return 'Mẫu nghi ngờ';
      default: return type;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Gần đây';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo Gian lận</h1>
          <p className="text-slate-600">Giám sát và xử lý các cảnh báo gian lận</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tổng cảnh báo</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-red-600">{stats.active}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đang điều tra</p>
              <p className="text-2xl font-bold text-amber-600">{stats.investigating}</p>
            </div>
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Đã xử lý</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Mức nghiêm trọng</p>
              <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
            </div>
            <Ban className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Nguy hiểm</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã xử lý</option>
              <option value="false_positive">Sai dương tính</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Danh sách cảnh báo</h3>
            <span className="text-sm text-slate-500">{filteredAlerts.length} kết quả</span>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-red-400' :
                        alert.severity === 'medium' ? 'text-amber-500' : 'text-green-500'
                      }`} />
                      <h4 className="font-semibold text-slate-900">{getTypeLabel(alert.type)}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity === 'low' ? 'Thấp' :
                         alert.severity === 'medium' ? 'Trung bình' :
                         alert.severity === 'high' ? 'Cao' : 'Nguy hiểm'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status === 'active' ? 'Hoạt động' :
                         alert.status === 'investigating' ? 'Điều tra' :
                         alert.status === 'resolved' ? 'Đã xử lý' : 'Sai dương tính'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{alert.customer.name}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {alert.customer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {alert.customer.idNumber}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">{alert.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {alert.evidence.slice(0, 2).map((evidence, index) => (
                          <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            {evidence}
                          </span>
                        ))}
                        {alert.evidence.length > 2 && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            +{alert.evidence.length - 2} nữa
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy cảnh báo</h3>
              <p className="text-slate-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Chi tiết cảnh báo</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Thông tin khách hàng</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Họ tên:</span> {selectedAlert.customer.name}</p>
                      <p><span className="font-medium">Số điện thoại:</span> {selectedAlert.customer.phone}</p>
                      <p><span className="font-medium">Email:</span> {selectedAlert.customer.email || 'N/A'}</p>
                      <p><span className="font-medium">CMND/CCCD:</span> {selectedAlert.customer.idNumber}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Thông tin cảnh báo</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Loại:</span> {getTypeLabel(selectedAlert.type)}</p>
                      <p><span className="font-medium">Mức độ:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(selectedAlert.severity)}`}>
                          {selectedAlert.severity === 'low' ? 'Thấp' :
                           selectedAlert.severity === 'medium' ? 'Trung bình' :
                           selectedAlert.severity === 'high' ? 'Cao' : 'Nguy hiểm'}
                        </span>
                      </p>
                      <p><span className="font-medium">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedAlert.status)}`}>
                          {selectedAlert.status === 'active' ? 'Hoạt động' :
                           selectedAlert.status === 'investigating' ? 'Điều tra' :
                           selectedAlert.status === 'resolved' ? 'Đã xử lý' : 'Sai dương tính'}
                        </span>
                      </p>
                      <p><span className="font-medium">Thời gian:</span> {formatTimeAgo(selectedAlert.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Mô tả</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedAlert.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Bằng chứng</h4>
                  <div className="space-y-2">
                    {selectedAlert.evidence.map((evidence, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 font-medium mt-0.5">•</span>
                        <span className="text-slate-700">{evidence}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAlert.resolution && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Quyết định xử lý</h4>
                    <p className="text-sm text-slate-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                      {selectedAlert.resolution}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  {selectedAlert.status === 'active' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Bắt đầu điều tra
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
