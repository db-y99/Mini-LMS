'use client';
import React, { useState, useEffect } from 'react';
import {
  DollarSign, Plus, Edit, Trash2, Save, X,
  Percent, Calendar, TrendingUp, AlertTriangle
} from 'lucide-react';
import { CommissionRule, CollateralType } from '../../types';

interface CommissionSettingsViewProps {
  activeView: string;
}

export const CommissionSettingsView: React.FC<CommissionSettingsViewProps> = ({ activeView }) => {
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [formData, setFormData] = useState<Partial<CommissionRule>>({});

  useEffect(() => {
    // Load commission rules from API or storage
    setTimeout(() => {
      setCommissionRules([]);
      setLoading(false);
    }, 1000);
  }, []);

  const getProductTypeLabel = (type: CollateralType) => {
    switch (type) {
      case 'car': return 'Ô tô';
      case 'bike': return 'Xe máy';
      case 'phone': return 'Điện thoại';
      case 'computer': return 'Máy tính';
      case 'house': return 'Nhà đất';
      case 'land': return 'Đất';
      default: return type;
    }
  };

  const getProductTypeColor = (type: CollateralType) => {
    switch (type) {
      case 'car': return 'bg-blue-100 text-blue-800';
      case 'bike': return 'bg-green-100 text-green-800';
      case 'phone': return 'bg-purple-100 text-purple-800';
      case 'computer': return 'bg-orange-100 text-orange-800';
      case 'house': return 'bg-red-100 text-red-800';
      case 'land': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleCreateRule = () => {
    setFormData({
      productType: 'car',
      minAmount: 0,
      maxAmount: 0,
      commissionRate: 0,
      effectiveFrom: new Date(),
      isActive: true
    });
    setEditingRule(null);
    setShowCreateModal(true);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setFormData({ ...rule });
    setEditingRule(rule);
    setShowCreateModal(true);
  };

  const handleSaveRule = () => {
    if (!formData.productType || !formData.minAmount || !formData.maxAmount || !formData.commissionRate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.minAmount >= formData.maxAmount) {
      alert('Số tiền tối thiểu phải nhỏ hơn số tiền tối đa');
      return;
    }

    const newRule: CommissionRule = {
      id: editingRule?.id || `rule_${Date.now()}`,
      productType: formData.productType,
      minAmount: formData.minAmount,
      maxAmount: formData.maxAmount,
      commissionRate: formData.commissionRate,
      effectiveFrom: formData.effectiveFrom || new Date(),
      isActive: formData.isActive ?? true,
      createdBy: 'admin',
      createdAt: editingRule?.createdAt || new Date()
    };

    if (editingRule) {
      setCommissionRules(prev => prev.map(rule =>
        rule.id === editingRule.id ? newRule : rule
      ));
    } else {
      setCommissionRules(prev => [...prev, newRule]);
    }

    setShowCreateModal(false);
    setFormData({});
    setEditingRule(null);
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    setCommissionRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quy tắc hoa hồng này?')) {
      setCommissionRules(prev => prev.filter(rule => rule.id !== ruleId));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt hoa hồng</h1>
          <p className="text-slate-600">Quản lý tỷ lệ hoa hồng theo sản phẩm và khoản vay</p>
        </div>
        <button
          onClick={handleCreateRule}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm quy tắc
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tổng quy tắc</p>
              <p className="text-2xl font-bold text-slate-900">{commissionRules.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Quy tắc hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {commissionRules.filter(r => r.isActive).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tỷ lệ trung bình</p>
              <p className="text-2xl font-bold text-purple-600">
                {(commissionRules.reduce((sum, rule) => sum + rule.commissionRate, 0) / commissionRules.length * 100).toFixed(1)}%
              </p>
            </div>
            <Percent className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Commission Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Khoảng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tỷ lệ hoa hồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hiệu lực từ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commissionRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProductTypeColor(rule.productType)}`}>
                      {getProductTypeLabel(rule.productType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatCurrency(rule.minAmount)} - {formatCurrency(rule.maxAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">
                      {(rule.commissionRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(rule.effectiveFrom)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      rule.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rule.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          rule.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {rule.isActive ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        </div>

        {commissionRules.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có quy tắc hoa hồng</h3>
            <p className="text-slate-500 mb-4">Tạo quy tắc hoa hồng đầu tiên để bắt đầu.</p>
            <button
              onClick={handleCreateRule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo quy tắc đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingRule ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loại sản phẩm
                </label>
                <select
                  value={formData.productType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value as CollateralType }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn loại sản phẩm</option>
                  <option value="car">Ô tô</option>
                  <option value="bike">Xe máy</option>
                  <option value="phone">Điện thoại</option>
                  <option value="computer">Máy tính</option>
                  <option value="house">Nhà đất</option>
                  <option value="land">Đất</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số tiền tối thiểu
                  </label>
                  <input
                    type="number"
                    value={formData.minAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số tiền tối đa
                  </label>
                  <input
                    type="number"
                    value={formData.maxAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="200000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tỷ lệ hoa hồng (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.commissionRate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.5"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">
                  Kích hoạt quy tắc
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveRule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
