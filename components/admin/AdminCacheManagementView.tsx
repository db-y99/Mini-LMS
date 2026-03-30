'use client';
import React, { useState } from 'react';
import {
  Database, Zap, Trash2, RefreshCw, HardDrive,
  Clock, AlertTriangle, CheckCircle, Activity
} from 'lucide-react';

export const AdminCacheManagementView: React.FC = () => {
  const [cacheStats, setCacheStats] = useState({
    totalSize: '2.4 GB',
    itemsCount: 15420,
    hitRate: 94.7,
    missRate: 5.3,
    avgResponseTime: '45ms'
  });

  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cacheTypes = [
    {
      name: 'Application Cache',
      size: '1.2 GB',
      items: 8920,
      lastCleared: '2 giờ trước',
      status: 'active'
    },
    {
      name: 'Database Query Cache',
      size: '680 MB',
      items: 4520,
      lastCleared: '30 phút trước',
      status: 'active'
    },
    {
      name: 'File Cache',
      size: '520 MB',
      items: 1980,
      lastCleared: '1 ngày trước',
      status: 'warning'
    },
    {
      name: 'Session Cache',
      size: '45 MB',
      items: 1200,
      lastCleared: '5 phút trước',
      status: 'active'
    }
  ];

  const clearCache = async (cacheType?: string) => {
    setIsClearing(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`${cacheType ? `Đã xóa cache ${cacheType}` : 'Đã xóa tất cả cache'} thành công!`);
    setIsClearing(false);
  };

  const refreshStats = async () => {
    setIsRefreshing(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Cache</h1>
          <p className="text-slate-600">Giám sát và tối ưu hóa hiệu năng cache</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshStats}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={() => clearCache()}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? 'Đang xóa...' : 'Xóa tất cả'}
          </button>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Tổng dung lượng</p>
              <p className="text-2xl font-bold text-slate-900">{cacheStats.totalSize}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Số items</p>
              <p className="text-2xl font-bold text-slate-900">{cacheStats.itemsCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Tỷ lệ hit</p>
              <p className="text-2xl font-bold text-slate-900">{cacheStats.hitRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Thời gian phản hồi</p>
              <p className="text-2xl font-bold text-slate-900">{cacheStats.avgResponseTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Types */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Các loại Cache</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {cacheTypes.map((cache, index) => (
            <div key={index} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Database className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{cache.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    <span>Dung lượng: {cache.size}</span>
                    <span>Items: {cache.items.toLocaleString()}</span>
                    <span>Lần cuối xóa: {cache.lastCleared}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(cache.status)}`}>
                  {getStatusIcon(cache.status)}
                  <span className="capitalize">
                    {cache.status === 'active' ? 'Hoạt động' :
                     cache.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                  </span>
                </div>

                <button
                  onClick={() => clearCache(cache.name)}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa cache
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Cấu hình Cache</h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thời gian hết hạn mặc định (phút)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dung lượng cache tối đa (GB)
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số connections tối đa
              </label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Compression level (0-9)
              </label>
              <input
                type="number"
                min="0"
                max="9"
                defaultValue="6"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Lưu cấu hình
            </button>
            <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Chỉ số hiệu năng</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">94.7%</div>
              <div className="text-sm text-slate-600">Cache Hit Rate</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '94.7%'}}></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">45ms</div>
              <div className="text-sm text-slate-600">Average Response Time</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.4GB</div>
              <div className="text-sm text-slate-600">Memory Usage</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '48%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
