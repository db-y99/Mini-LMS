'use client';
import React, { useState, useEffect } from 'react';
import {
  Ban, Search, Plus, Trash2, Edit, AlertTriangle, User, Phone, 
  FileText, Calendar, X, Info, Shield
} from 'lucide-react';

interface BlacklistEntry {
  id: string;
  customerName: string;
  phoneNumber: string;
  idNumber: string;
  reason: string;
  addedBy: string;
  addedAt: Date;
  status: 'active' | 'expired';
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityBlacklistView: React.FC = () => {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | undefined>();
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    idNumber: '',
    reason: '',
    notes: '',
    riskLevel: 'medium' as BlacklistEntry['riskLevel']
  });

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setBlacklist([
        {
          id: '1',
          customerName: 'Nguyễn Văn Mạnh',
          phoneNumber: '0912345678',
          idNumber: '001928374655',
          reason: 'fraud_detected',
          addedBy: 'Admin SEC',
          addedAt: new Date(),
          status: 'active',
          riskLevel: 'critical',
          notes: 'Phát hiện can thiệp vào ảnh CCCD'
        },
        {
          id: '2',
          customerName: 'Trần Thị Thúy',
          phoneNumber: '0866554433',
          idNumber: '034293847563',
          reason: 'debt_default',
          addedBy: 'Hệ thống AI',
          addedAt: new Date(Date.now() - 86400000),
          status: 'active',
          riskLevel: 'high',
          notes: 'Bùng nợ nhiều app khác theo dữ liệu CIC'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        customerName: editingEntry.customerName,
        phoneNumber: editingEntry.phoneNumber,
        idNumber: editingEntry.idNumber,
        reason: editingEntry.reason,
        notes: editingEntry.notes || '',
        riskLevel: editingEntry.riskLevel
      });
    } else {
      setFormData({
        customerName: '',
        phoneNumber: '',
        idNumber: '',
        reason: '',
        notes: '',
        riskLevel: 'medium'
      });
    }
  }, [editingEntry, isModalOpen]);

  const filteredBlacklist = blacklist.filter(entry => {
    const matchesSearch = 
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.phoneNumber.includes(searchTerm) ||
      entry.idNumber.includes(searchTerm);
    const matchesRisk = filterRisk === 'all' || entry.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      // Update existing entry
      setBlacklist(prev => prev.map(entry =>
        entry.id === editingEntry.id 
          ? { ...entry, ...formData, status: 'active' as const }
          : entry
      ));
    } else {
      // Add new entry
      const newEntry: BlacklistEntry = {
        ...formData,
        id: Date.now().toString(),
        addedAt: new Date(),
        addedBy: 'Admin SEC',
        status: 'active'
      };
      setBlacklist(prev => [newEntry, ...prev]);
    }
    
    setIsModalOpen(false);
    setEditingEntry(undefined);
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm('Xác nhận gỡ khách hàng khỏi Blacklist?')) {
      setBlacklist(prev => prev.filter(entry => entry.id !== entryId));
    }
  };

  const getRiskBadge = (level: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Thấp' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trung bình' },
      high: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Cao' },
      critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Nguy hiểm' }
    };
    const config = configs[level] || configs.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      fraud_detected: 'Phát hiện gian lận',
      false_information: 'Thông tin giả',
      debt_default: 'Nợ xấu/Bùng nợ',
      multiple_rejections: 'Liên tục bị từ chối',
      other: 'Lý do khác'
    };
    return reasons[reason] || reason;
  };

  const stats = {
    total: blacklist.length,
    critical: blacklist.filter(e => e.riskLevel === 'critical').length,
    today: blacklist.filter(e => 
      e.addedAt.toDateString() === new Date().toDateString()
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Danh sách đen (Blacklist)</h1>
        <p className="text-slate-600 text-sm">
          Quản lý khách hàng có rủi ro cao, hệ thống tự động chặn khi phát hiện.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-600">Định danh</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Nguy hiểm</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.critical}</div>
          <div className="text-xs text-slate-600">Mức độ cao nhất</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Hôm nay</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.today}</div>
          <div className="text-xs text-slate-600">Thêm mới</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="critical">Nguy hiểm</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        <button
          onClick={() => {
            setEditingEntry(undefined);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm vào Blacklist
        </button>
      </div>

      {/* Blacklist Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : filteredBlacklist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Lý do</th>
                  <th className="px-4 py-3 text-center">Mức độ</th>
                  <th className="px-4 py-3 text-left">Thêm bởi</th>
                  <th className="px-4 py-3 text-center">Ngày thêm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlacklist.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          entry.riskLevel === 'critical' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {entry.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{entry.customerName}</div>
                          <div className="text-xs text-slate-500 font-mono">{entry.idNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono text-xs">{entry.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 text-xs">
                        {getReasonLabel(entry.reason)}
                      </div>
                      {entry.notes && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {entry.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getRiskBadge(entry.riskLevel)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-slate-600">{entry.addedBy}</div>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-600">
                      {entry.addedAt.toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Ban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy</h3>
            <p className="text-sm text-slate-500">
              Không có định danh nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 text-sm mb-1">
              Tự động hóa bảo mật
            </div>
            <p className="text-sm text-blue-800">
              Các định danh trong Blacklist sẽ được AI quét tự động qua toàn bộ hồ sơ. 
              Nếu trùng khớp, hồ sơ sẽ được gắn cờ "Critical Risk" hoặc tự động từ chối.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEntry ? 'Cập nhật Blacklist' : 'Thêm vào Blacklist'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Đưa khách hàng vào danh sách rủi ro
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEntry(undefined);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono"
                    placeholder="0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    CMND/CCCD *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono"
                    placeholder="001234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mức độ rủi ro *
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium"
                  >
                    <option value="low">Rủi ro Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Rủi ro Cao</option>
                    <option value="critical">Nguy hiểm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do *
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-medium"
                >
                  <option value="">Chọn lý do...</option>
                  <option value="fraud_detected">Phát hiện gian lận</option>
                  <option value="false_information">Thông tin giả</option>
                  <option value="debt_default">Nợ xấu/Bùng nợ</option>
                  <option value="multiple_rejections">Liên tục bị từ chối</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                  placeholder="Mô tả chi tiết hành vi, mã hồ sơ liên quan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(undefined);
                  }}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                >
                  {editingEntry ? 'Cập nhật' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
