import React, { useState, useEffect } from 'react';
import {
  Ban, Search, Plus, Trash2, Edit, Eye, AlertTriangle,
  User, Phone, FileText, Calendar, UserCheck, X,
  Shield, Clock
} from 'lucide-react';

interface BlacklistEntry {
  id: string;
  customerName: string;
  phoneNumber: string;
  idNumber: string;
  reason: string;
  addedBy: string;
  addedAt: Date;
  expiryDate?: Date;
  status: 'active' | 'expired';
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AddBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<BlacklistEntry, 'id' | 'addedAt'>) => void;
  editEntry?: BlacklistEntry;
}

const AddBlacklistModal: React.FC<AddBlacklistModalProps> = ({
  isOpen, onClose, onSubmit, editEntry
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    idNumber: '',
    reason: '',
    expiryDate: '',
    notes: '',
    riskLevel: 'medium' as BlacklistEntry['riskLevel']
  });

  useEffect(() => {
    if (editEntry) {
      setFormData({
        customerName: editEntry.customerName,
        phoneNumber: editEntry.phoneNumber,
        idNumber: editEntry.idNumber,
        reason: editEntry.reason,
        expiryDate: editEntry.expiryDate ? editEntry.expiryDate.toISOString().split('T')[0] : '',
        notes: editEntry.notes || '',
        riskLevel: editEntry.riskLevel
      });
    } else {
      setFormData({
        customerName: '',
        phoneNumber: '',
        idNumber: '',
        reason: '',
        expiryDate: '',
        notes: '',
        riskLevel: 'medium'
      });
    }
  }, [editEntry, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      addedBy: 'Current User', // In real app, get from auth context
      status: 'active'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {editEntry ? 'Chỉnh sửa danh sách đen' : 'Thêm vào danh sách đen'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Họ tên khách hàng *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số CMND/CCCD *
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mức độ rủi ro *
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as BlacklistEntry['riskLevel'] }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lý do đưa vào danh sách đen *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Chọn lý do</option>
              <option value="fraud_detected">Phát hiện gian lận</option>
              <option value="multiple_rejections">Nhiều lần từ chối hồ sơ</option>
              <option value="debt_default">Chậm trả nợ</option>
              <option value="false_information">Cung cấp thông tin sai lệch</option>
              <option value="blacklist_request">Yêu cầu từ bên thứ ba</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ngày hết hạn (tùy chọn)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-slate-500 mt-1">Để trống nếu không có thời hạn</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ghi chú chi tiết
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Thông tin chi tiết về lý do đưa vào danh sách đen..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {editEntry ? 'Cập nhật' : 'Thêm vào danh sách đen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SecurityBlacklistView: React.FC = () => {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | undefined>();

  useEffect(() => {
    setLoading(true);
    // Load blacklist from API or storage
    setTimeout(() => {
      setBlacklist([]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBlacklist = blacklist.filter(entry => {
    const matchesSearch = entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.phoneNumber.includes(searchTerm) ||
                         entry.idNumber.includes(searchTerm);

    const matchesRisk = filterRisk === 'all' || entry.riskLevel === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const handleAddEntry = (entryData: Omit<BlacklistEntry, 'id' | 'addedAt'>) => {
    const newEntry: BlacklistEntry = {
      ...entryData,
      id: Date.now().toString(),
      addedAt: new Date()
    };
    setBlacklist(prev => [newEntry, ...prev]);
  };

  const handleEditEntry = (entryData: Omit<BlacklistEntry, 'id' | 'addedAt'>) => {
    if (!editingEntry) return;

    setBlacklist(prev => prev.map(entry =>
      entry.id === editingEntry.id
        ? { ...entry, ...entryData, addedAt: entry.addedAt }
        : entry
    ));
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này khỏi danh sách đen?')) {
      setBlacklist(prev => prev.filter(entry => entry.id !== entryId));
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

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      'fraud_detected': 'Phát hiện gian lận',
      'multiple_rejections': 'Nhiều lần từ chối',
      'debt_default': 'Chậm trả nợ',
      'false_information': 'Thông tin sai lệch',
      'blacklist_request': 'Yêu cầu từ bên thứ ba',
      'other': 'Lý do khác'
    };
    return reasons[reason] || reason;
  };

  const stats = {
    total: blacklist.length,
    highRisk: blacklist.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length,
    expired: blacklist.filter(e => e.expiryDate && e.expiryDate < new Date()).length,
    active: blacklist.filter(e => e.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách Đen</h1>
          <p className="text-slate-600">Quản lý khách hàng bị cấm và rủi ro cao</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm vào danh sách đen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tổng số</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <Ban className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rủi ro cao</p>
              <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Đã hết hạn</p>
              <p className="text-2xl font-bold text-slate-600">{stats.expired}</p>
            </div>
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số điện thoại, CMND..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Tất cả mức độ rủi ro</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Nghiêm trọng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blacklist Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thông tin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mức độ rủi ro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thêm bởi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ngày thêm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBlacklist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Ban className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {entry.customerName}
                          </div>
                          {entry.notes && (
                            <div className="text-xs text-slate-500 truncate max-w-xs">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {entry.phoneNumber}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3" />
                          {entry.idNumber}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {getReasonText(entry.reason)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(entry.riskLevel)}`}>
                        {entry.riskLevel === 'low' ? 'Thấp' :
                         entry.riskLevel === 'medium' ? 'Trung bình' :
                         entry.riskLevel === 'high' ? 'Cao' : 'Nghiêm trọng'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.addedBy}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.addedAt.toLocaleDateString('vi-VN')}
                      </div>
                      {entry.expiryDate && (
                        <div className="text-xs text-slate-500 mt-1">
                          Hết hạn: {entry.expiryDate.toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBlacklist.length === 0 && (
              <div className="text-center py-12">
                <Ban className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có khách hàng nào trong danh sách đen'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Khách hàng bị cấm sẽ hiển thị ở đây'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddBlacklistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(undefined);
        }}
        onSubmit={editingEntry ? handleEditEntry : handleAddEntry}
        editEntry={editingEntry}
      />
    </div>
  );
};
