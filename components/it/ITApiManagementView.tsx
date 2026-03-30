'use client';

import React, { useState } from 'react';
import { Key, Plus, Trash2, Copy, CheckCircle, AlertTriangle, Activity, BarChart3 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
  requestCount: number;
}

export const ITApiManagementView: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Mobile App',
      key: 'sk_live_51H...',
      permissions: ['read:loans', 'write:loans'],
      createdAt: '2026-03-01',
      lastUsed: '2026-03-29 10:30',
      status: 'active',
      requestCount: 15420
    },
    {
      id: '2',
      name: 'Partner Integration',
      key: 'sk_live_52K...',
      permissions: ['read:loans'],
      createdAt: '2026-02-15',
      lastUsed: '2026-03-28 18:45',
      status: 'active',
      requestCount: 8930
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard');
  };

  const handleRevokeKey = (id: string) => {
    if (confirm('Revoke this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Management</h1>
          <p className="text-slate-600 mt-1">Quản lý API keys và rate limiting</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Generate API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total API Keys</p>
              <p className="text-2xl font-bold text-slate-900">{apiKeys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Keys</p>
              <p className="text-2xl font-bold text-slate-900">
                {apiKeys.filter(k => k.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900">
                {apiKeys.reduce((sum, k) => sum + k.requestCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Requests/Day</p>
              <p className="text-2xl font-bold text-slate-900">2.4K</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">API Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Requests</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Last Used</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{apiKey.name}</div>
                    <div className="text-xs text-slate-500">Created {apiKey.createdAt}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">{apiKey.key}</code>
                      <button
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((perm, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-900">{apiKey.requestCount.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-600">{apiKey.lastUsed}</div>
                  </td>
                  <td className="px-4 py-3">
                    {apiKey.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {apiKey.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(apiKey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Rate Limiting</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Default Rate Limit</p>
              <p className="text-sm text-slate-600">Applies to all API keys</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">1000</p>
              <p className="text-sm text-slate-600">requests/hour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
