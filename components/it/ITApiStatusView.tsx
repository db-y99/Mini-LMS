'use client';
import React, { useState, useEffect } from 'react';
import {
  Globe, RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock,
  ExternalLink, BarChart3
} from 'lucide-react';

interface ApiEndpoint {
  name: string;
  path: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

export const ITApiStatusView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: 'Loans API', path: '/api/loans', status: 'up', responseTime: 45, uptime: 99.9, lastCheck: new Date() },
    { name: 'Users API', path: '/api/users', status: 'up', responseTime: 23, uptime: 99.8, lastCheck: new Date() },
    { name: 'Auth API', path: '/api/auth', status: 'up', responseTime: 12, uptime: 99.95, lastCheck: new Date() },
    { name: 'Reports API', path: '/api/reports', status: 'degraded', responseTime: 234, uptime: 98.5, lastCheck: new Date() },
    { name: 'Audit API', path: '/api/audit', status: 'up', responseTime: 67, uptime: 99.7, lastCheck: new Date() },
    { name: 'Webhooks', path: '/api/webhooks', status: 'up', responseTime: 89, uptime: 99.6, lastCheck: new Date() },
    { name: 'Health Check', path: '/api/health', status: 'up', responseTime: 5, uptime: 100, lastCheck: new Date() }
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const upCount = endpoints.filter(e => e.status === 'up').length;
  const downCount = endpoints.filter(e => e.status === 'down').length;
  const degradedCount = endpoints.filter(e => e.status === 'degraded').length;

  const statusRender = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'up':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Online
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Offline
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Degraded
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Status</h1>
          <p className="text-slate-600">Trạng thái các endpoint API và thời gian phản hồi</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Kiểm tra tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Online</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{upCount}</p>
          <p className="text-xs text-slate-500">/{endpoints.length} endpoints</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium">Degraded</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{degradedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Offline</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{downCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Endpoints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Endpoint</th>
                <th className="px-6 py-3">Path</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Response</th>
                <th className="px-6 py-3">Uptime (30d)</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{ep.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{ep.path}</td>
                  <td className="px-6 py-4">{statusRender(ep.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{ep.responseTime} ms</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ep.uptime.toFixed(2)}%</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Mở endpoint"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
