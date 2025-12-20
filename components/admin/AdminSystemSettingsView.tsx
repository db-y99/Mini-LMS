import React, { useState } from 'react';
import {
  Settings, Shield, Mail, Bell, Database, Clock,
  Save, RotateCcw, AlertTriangle, CheckCircle
} from 'lucide-react';

export const AdminSystemSettingsView: React.FC = () => {
  const [settings, setSettings] = useState({
    maxLoanAmount: 200000000,
    minLoanAmount: 10000000,
    defaultInterestRate: 12,
    maxLoanDuration: 60,
    minLoanDuration: 6,
    autoApprovalThreshold: 50000000,
    fraudDetectionEnabled: true,
    twoFactorAuthRequired: false,
    auditLogRetentionDays: 365,
    cacheExpirationMinutes: 30,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Mock save functionality
    alert('Cài đặt đã được lưu thành công!');
    setHasChanges(false);
  };

  const resetSettings = () => {
    // Mock reset functionality
    alert('Đã khôi phục cài đặt mặc định!');
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
          <p className="text-slate-600">Quản lý các thông số và cấu hình hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              Có thay đổi chưa lưu
            </div>
          )}
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Loan Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cài đặt khoản vay</h3>
              <p className="text-slate-600">Các giới hạn và quy tắc cơ bản cho khoản vay</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số tiền vay tối đa (VNĐ)
              </label>
              <input
                type="number"
                value={settings.maxLoanAmount}
                onChange={(e) => handleSettingChange('maxLoanAmount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số tiền vay tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                value={settings.minLoanAmount}
                onChange={(e) => handleSettingChange('minLoanAmount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lãi suất mặc định (%/năm)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultInterestRate}
                onChange={(e) => handleSettingChange('defaultInterestRate', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thời hạn tối đa (tháng)
              </label>
              <input
                type="number"
                value={settings.maxLoanDuration}
                onChange={(e) => handleSettingChange('maxLoanDuration', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thời hạn tối thiểu (tháng)
              </label>
              <input
                type="number"
                value={settings.minLoanDuration}
                onChange={(e) => handleSettingChange('minLoanDuration', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngưỡng tự động duyệt (VNĐ)
              </label>
              <input
                type="number"
                value={settings.autoApprovalThreshold}
                onChange={(e) => handleSettingChange('autoApprovalThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cài đặt bảo mật</h3>
              <p className="text-slate-600">Các tính năng bảo mật và chống gian lận</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Phát hiện gian lận</h4>
              <p className="text-sm text-slate-600">Tự động kiểm tra và cảnh báo gian lận</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.fraudDetectionEnabled}
                onChange={(e) => handleSettingChange('fraudDetectionEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Xác thực 2 yếu tố</h4>
              <p className="text-sm text-slate-600">Yêu cầu 2FA cho tất cả người dùng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuthRequired}
                onChange={(e) => handleSettingChange('twoFactorAuthRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cài đặt hệ thống</h3>
              <p className="text-slate-600">Cấu hình hệ thống và hiệu năng</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thời gian lưu audit log (ngày)
              </label>
              <input
                type="number"
                value={settings.auditLogRetentionDays}
                onChange={(e) => handleSettingChange('auditLogRetentionDays', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thời gian cache (phút)
              </label>
              <input
                type="number"
                value={settings.cacheExpirationMinutes}
                onChange={(e) => handleSettingChange('cacheExpirationMinutes', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Cài đặt thông báo</h3>
              <p className="text-slate-600">Quản lý các kênh thông báo hệ thống</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-slate-900">Email notifications</h4>
                <p className="text-sm text-slate-600">Gửi thông báo qua email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-slate-900">SMS notifications</h4>
                <p className="text-sm text-slate-600">Gửi thông báo qua SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotificationsEnabled}
                onChange={(e) => handleSettingChange('smsNotificationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
