'use client';
import React, { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle, AlertTriangle, Clock, HardDrive,
  Zap, Copy, ChevronRight, Activity
} from 'lucide-react';

interface Replica {
  name: string;
  role: string;
  lag: number;
  status: 'healthy' | 'warning' | 'error';
}

export const ITDatabaseStatusView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [status, setStatus] = useState({
    health: 'healthy' as 'healthy' | 'warning' | 'error',
    responseTime: 8,
    connections: 45,
    maxConnections: 100,
    queriesPerSec: 234,
    activeQueries: 12,
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000),
    size: '2.4 GB',
    version: 'PostgreSQL 15.x'
  });
  const [replicas, setReplicas] = useState<Replica[]>([
    { name: 'Primary', role: 'primary', lag: 0, status: 'healthy' },
    { name: 'Replica-1', role: 'replica', lag: 2, status: 'healthy' },
    { name: 'Replica-2', role: 'replica', lag: 15, status: 'warning' }
  ]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    setLastCheck(new Date());
    setTimeout(() => setLoading(false), 400);
  };

  const formatTimeAgo = (date: Date) => {
    const min = Math.floor((Date.now() - date.getTime()) / 60000);
    if (min < 1) return 'Vừa xong';
    if (min < 60) return `${min} phút trước`;
    return `${Math.floor(min / 60)} giờ trước`;
  };

  const healthConfig = {
    healthy: { label: 'Hoạt động tốt', class: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    warning: { label: 'Cảnh báo', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    error: { label: 'Lỗi', class: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle }
  };
  const h = healthConfig[status.health];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Status</h1>
          <p className="text-slate-600">Trạng thái kết nối, hiệu năng và backup database</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Kiểm tra lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Tổng quan
            </h3>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${h.class}`}>
              <h.icon className="w-4 h-4" />
              {h.label}
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Response Time', value: `${status.responseTime} ms`, icon: Zap },
              { label: 'Connections', value: `${status.connections} / ${status.maxConnections}`, icon: Database },
              { label: 'Queries / giây', value: status.queriesPerSec, icon: Activity },
              { label: 'Active queries', value: status.activeQueries, icon: Clock },
              { label: 'Last backup', value: formatTimeAgo(status.lastBackup), icon: HardDrive },
              { label: 'DB size', value: status.size, icon: HardDrive },
              { label: 'Version', value: status.version, icon: Database }
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <row.icon className="w-4 h-4 text-slate-400" />
                  {row.label}
                </span>
                <span className="text-sm font-medium text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Copy className="w-5 h-5 text-slate-600" />
            Replication & Replicas
          </h3>
          <div className="space-y-3">
            {replicas.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{r.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.lag > 0 && (
                    <span className="text-xs text-slate-500">Lag: {r.lag}s</span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'healthy' ? 'bg-green-100 text-green-700' :
                    r.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.status === 'healthy' ? 'OK' : r.status === 'warning' ? 'Warning' : 'Error'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">Cập nhật lúc: {lastCheck.toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </div>
  );
};
