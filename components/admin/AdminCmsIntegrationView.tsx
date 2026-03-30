'use client';
import React, { useState } from 'react';
import {
  Building, Link, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Settings, Globe, Key,
  Database, Upload, Download
} from 'lucide-react';

export const AdminCmsIntegrationView: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Lưu trữ tài liệu hồ sơ',
      status: 'connected',
      lastSync: '10 phút trước',
      apiKey: '••••••••••••••••',
      endpoint: 'https://www.googleapis.com/drive/v3'
    },
    {
      id: 'cms-external',
      name: 'CMS Bên ngoài',
      description: 'Đồng bộ dữ liệu khách hàng',
      status: 'disconnected',
      lastSync: 'Không có',
      apiKey: '',
      endpoint: ''
    },
    {
      id: 'notification-service',
      name: 'Dịch vụ thông báo',
      description: 'Gửi email và SMS',
      status: 'connected',
      lastSync: '2 phút trước',
      apiKey: '••••••••••••••••',
      endpoint: 'https://api.notifications.com/v1'
    },
    {
      id: 'credit-score-api',
      name: 'API Đánh giá tín dụng',
      description: 'Kiểm tra lịch sử tín dụng',
      status: 'warning',
      lastSync: '1 giờ trước',
      apiKey: '••••••••••••••••',
      endpoint: 'https://api.creditscore.vn/v2'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50';
      case 'disconnected': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Đã kết nối';
      case 'disconnected': return 'Chưa kết nối';
      case 'warning': return 'Cần kiểm tra';
      default: return 'Không xác định';
    }
  };

  const testConnection = (integrationId: string) => {
    alert(`Đang kiểm tra kết nối với ${integrationId}...`);
  };

  const syncData = (integrationId: string) => {
    alert(`Đang đồng bộ dữ liệu với ${integrationId}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tích hợp CMS</h1>
          <p className="text-slate-600">Quản lý kết nối với các hệ thống bên ngoài</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Đồng bộ tất cả
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Link className="w-4 h-4" />
            Thêm tích hợp
          </button>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tổng tích hợp</p>
              <p className="text-2xl font-bold text-slate-900">{integrations.length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Đã kết nối</p>
              <p className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Cần kiểm tra</p>
              <p className="text-2xl font-bold text-amber-600">
                {integrations.filter(i => i.status === 'warning').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Chưa kết nối</p>
              <p className="text-2xl font-bold text-red-600">
                {integrations.filter(i => i.status === 'disconnected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Danh sách tích hợp</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Building className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Đồng bộ cuối: {integration.lastSync}</span>
                      {integration.endpoint && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {integration.endpoint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span>{getStatusText(integration.status)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testConnection(integration.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Kiểm tra
                    </button>

                    {integration.status === 'connected' && (
                      <button
                        onClick={() => syncData(integration.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Đồng bộ
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedIntegration(selectedIntegration === integration.id ? null : integration.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Cấu hình
                    </button>
                  </div>
                </div>
              </div>

              {/* Configuration Panel */}
              {selectedIntegration === integration.id && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h5 className="font-medium text-slate-900 mb-4">Cấu hình {integration.name}</h5>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        API Endpoint
                      </label>
                      <input
                        type="url"
                        defaultValue={integration.endpoint}
                        placeholder="https://api.example.com/v1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          defaultValue={integration.apiKey}
                          placeholder="Nhập API key"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                          <Key className="w-4 h-4" />
                          Test
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tự động đồng bộ
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Khoảng cách đồng bộ (phút)
                        </label>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Lưu thay đổi
                      </button>
                      <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hành động nhanh</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Import dữ liệu</h4>
              <p className="text-sm text-slate-600">Đồng bộ từ hệ thống bên ngoài</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="p-2 bg-green-50 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Export dữ liệu</h4>
              <p className="text-sm text-slate-600">Xuất dữ liệu cho backup</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
            <div className="p-2 bg-purple-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Kiểm tra sức khỏe</h4>
              <p className="text-sm text-slate-600">Test tất cả kết nối</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
