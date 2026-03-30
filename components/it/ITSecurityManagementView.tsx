'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Unlock, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'blocked_ip' | 'password_reset';
  user: string;
  ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface IpRule {
  id: string;
  ip: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  addedAt: string;
  addedBy: string;
}

export const ITSecurityManagementView: React.FC = () => {
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'failed_login',
      user: 'admin@example.com',
      ip: '192.168.1.100',
      timestamp: '2026-03-29 10:30:15',
      severity: 'medium',
      details: '5 failed login attempts'
    },
    {
      id: '2',
      type: 'suspicious_activity',
      user: 'user@example.com',
      ip: '103.45.67.89',
      timestamp: '2026-03-29 09:15:30',
      severity: 'high',
      details: 'Unusual API access pattern detected'
    }
  ]);

  const [ipRules, setIpRules] = useState<IpRule[]>([
    {
      id: '1',
      ip: '192.168.1.0/24',
      type: 'whitelist',
      reason: 'Office network',
      addedAt: '2026-03-01',
      addedBy: 'admin'
    },
    {
      id: '2',
      ip: '103.45.67.89',
      type: 'blacklist',
      reason: 'Suspicious activity',
      addedAt: '2026-03-29',
      addedBy: 'it_admin'
    }
  ]);

  const [showAddIpModal, setShowAddIpModal] = useState(false);

  const handleRemoveIpRule = (id: string) => {
    if (confirm('Remove this IP rule?')) {
      setIpRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security Management</h1>
        <p className="text-slate-600 mt-1">Quản lý bảo mật và giám sát hoạt động đáng ngờ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Failed Logins (24h)</p>
              <p className="text-2xl font-bold text-slate-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Blocked IPs</p>
              <p className="text-2xl font-bold text-slate-900">
                {ipRules.filter(r => r.type === 'blacklist').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Whitelisted IPs</p>
              <p className="text-2xl font-bold text-slate-900">
                {ipRules.filter(r => r.type === 'whitelist').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">2FA Enabled Users</p>
              <p className="text-2xl font-bold text-slate-900">45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Security Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {securityEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{event.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize">{event.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{event.user}</td>
                  <td className="px-4 py-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{event.ip}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded uppercase ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Rules */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">IP Whitelist / Blacklist</h2>
          <button
            onClick={() => setShowAddIpModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add IP Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Added By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Added At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ipRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{rule.ip}</code>
                  </td>
                  <td className="px-4 py-3">
                    {rule.type === 'whitelist' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        <Unlock className="w-3 h-3" />
                        Whitelist
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        <Lock className="w-3 h-3" />
                        Blacklist
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{rule.reason}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{rule.addedBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{rule.addedAt}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveIpRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-sm text-slate-600">Require 2FA for all admin users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Session Timeout</p>
              <p className="text-sm text-slate-600">Auto logout after inactivity</p>
            </div>
            <select className="px-3 py-2 border border-slate-300 rounded-lg">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Password Policy</p>
              <p className="text-sm text-slate-600">Minimum 8 characters, 1 uppercase, 1 number</p>
            </div>
            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
