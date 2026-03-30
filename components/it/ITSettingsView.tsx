'use client';
import React, { useState } from 'react';
import {
  Settings, Save, RotateCcw, Bell, Database, Clock, Shield,
  Mail, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';

export const ITSettingsView: React.FC = () => {
  const [settings, setSettings] = useState({
    logRetentionDays: 90,
    auditLogRetentionDays: 365,
    monitoringIntervalSeconds: 30,
    alertOnErrorRate: true,
    errorRateThreshold: 1,
    alertOnHighCpu: true,
    cpuThresholdPercent: 85,
    alertOnHighMemory: true,
    memoryThresholdPercent: 90,
    emailAlertsEnabled: true,
    slackWebhookEnabled: false,
    backupEnabled: true,
    backupSchedule: '0 2 * * *', // 2h sáng hàng ngày
    cacheExpirationMinutes: 30
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const save = () => {
    setHasChanges(false);
    // Mock save
  };

  const reset = () => {
    setSettings(prev => ({
      ...prev,
      logRetentionDays: 90,
      auditLogRetentionDays: 365,
      monitoringIntervalSeconds: 30,
      alertOnErrorRate: true,
      errorRateThreshold: 1,
      alertOnHighCpu: true,
      cpuThresholdPercent: 85,
      alertOnHighMemory: true,
      memoryThresholdPercent: 90,
      emailAlertsEnabled: true,
      slackWebhookEnabled: false,
      backupEnabled: true,
      backupSchedule: '0 2 * * *',
      cacheExpirationMinutes: 30
    }));
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IT Settings</h1>
          <p className="text-slate-600">Cấu hình giám sát, cảnh báo và bảo trì hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              Có thay đổi chưa lưu
            </span>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục
          </button>
          <button
            onClick={save}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Log & Retention
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Log retention (ngày)</label>
              <input
                type="number"
                min={7}
                max={365}
                value={settings.logRetentionDays}
                onChange={e => handleChange('logRetentionDays', parseInt(e.target.value, 10) || 90)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Audit log retention (ngày)</label>
              <input
                type="number"
                min={30}
                max={730}
                value={settings.auditLogRetentionDays}
                onChange={e => handleChange('auditLogRetentionDays', parseInt(e.target.value, 10) || 365)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monitoring interval (giây)</label>
              <input
                type="number"
                min={10}
                max={300}
                value={settings.monitoringIntervalSeconds}
                onChange={e => handleChange('monitoringIntervalSeconds', parseInt(e.target.value, 10) || 30)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Cảnh báo
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alertOnErrorRate}
                onChange={e => handleChange('alertOnErrorRate', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Cảnh báo khi Error rate vượt ngưỡng</span>
            </label>
            {settings.alertOnErrorRate && (
              <div className="ml-6">
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={100}
                  value={settings.errorRateThreshold}
                  onChange={e => handleChange('errorRateThreshold', parseFloat(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                />
                <span className="ml-2 text-sm text-slate-500">%</span>
              </div>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alertOnHighCpu}
                onChange={e => handleChange('alertOnHighCpu', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Cảnh báo CPU cao</span>
            </label>
            {settings.alertOnHighCpu && (
              <div className="ml-6">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={settings.cpuThresholdPercent}
                  onChange={e => handleChange('cpuThresholdPercent', parseInt(e.target.value, 10) || 85)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                />
                <span className="ml-2 text-sm text-slate-500">%</span>
              </div>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alertOnHighMemory}
                onChange={e => handleChange('alertOnHighMemory', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Cảnh báo Memory cao</span>
            </label>
            {settings.alertOnHighMemory && (
              <div className="ml-6">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={settings.memoryThresholdPercent}
                  onChange={e => handleChange('memoryThresholdPercent', parseInt(e.target.value, 10) || 90)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                />
                <span className="ml-2 text-sm text-slate-500">%</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-600" />
            Kênh thông báo
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlertsEnabled}
                onChange={e => handleChange('emailAlertsEnabled', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Email cảnh báo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.slackWebhookEnabled}
                onChange={e => handleChange('slackWebhookEnabled', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Slack webhook</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Backup & Cache
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                onChange={e => handleChange('backupEnabled', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Tự động backup</span>
            </label>
            {settings.backupEnabled && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cron schedule</label>
                <input
                  type="text"
                  value={settings.backupSchedule}
                  onChange={e => handleChange('backupSchedule', e.target.value)}
                  placeholder="0 2 * * *"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cache expiration (phút)</label>
              <input
                type="number"
                min={5}
                max={1440}
                value={settings.cacheExpirationMinutes}
                onChange={e => handleChange('cacheExpirationMinutes', parseInt(e.target.value, 10) || 30)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
