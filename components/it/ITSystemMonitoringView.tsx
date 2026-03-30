'use client';
import React, { useState, useEffect } from 'react';
import {
  Activity, Cpu, HardDrive, Wifi, Server, RefreshCw, TrendingUp,
  Users, Zap, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

interface MetricCard {
  label: string;
  value: string | number;
  unit?: string;
  percent?: number;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ElementType;
}

export const ITSystemMonitoringView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState({
    cpu: 42,
    memory: 58,
    disk: 38,
    networkIn: 1240,
    networkOut: 892,
    activeProcesses: 89,
    activeConnections: 234,
    uptime: '15d 7h'
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(85, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(40, Math.min(80, prev.memory + (Math.random() - 0.5) * 6)),
        disk: prev.disk,
        networkIn: Math.max(500, prev.networkIn + (Math.random() - 0.5) * 200),
        networkOut: Math.max(300, prev.networkOut + (Math.random() - 0.5) * 150),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 30))
      }));
      setLastUpdate(new Date());
      setLoading(false);
    };
    load();
  }, []);

  const getStatus = (value: number, warn = 70, critical = 90): 'normal' | 'warning' | 'critical' => {
    if (value >= critical) return 'critical';
    if (value >= warn) return 'warning';
    return 'normal';
  };

  const cards: MetricCard[] = [
    { label: 'CPU Usage', value: `${metrics.cpu.toFixed(1)}%`, percent: metrics.cpu, status: getStatus(metrics.cpu), icon: Cpu },
    { label: 'Memory', value: `${metrics.memory.toFixed(1)}%`, percent: metrics.memory, status: getStatus(metrics.memory), icon: HardDrive },
    { label: 'Disk', value: `${metrics.disk.toFixed(1)}%`, percent: metrics.disk, status: getStatus(metrics.disk), icon: Server },
    { label: 'Network In', value: (metrics.networkIn / 1024).toFixed(2), unit: 'MB/s', status: 'normal', icon: Wifi },
    { label: 'Network Out', value: (metrics.networkOut / 1024).toFixed(2), unit: 'MB/s', status: 'normal', icon: Wifi },
    { label: 'Processes', value: metrics.activeProcesses, status: 'normal', icon: Activity },
    { label: 'Connections', value: metrics.activeConnections, status: 'normal', icon: Users },
    { label: 'Uptime', value: metrics.uptime, status: 'normal', icon: Zap }
  ];

  const statusClass = (s: string) => ({
    normal: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200'
  }[s]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(85, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(40, Math.min(80, prev.memory + (Math.random() - 0.5) * 5))
      }));
      setLastUpdate(new Date());
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Monitoring</h1>
          <p className="text-slate-600">Giám sát tài nguyên và hoạt động hệ thống theo thời gian thực</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <card.icon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {card.value}
              {card.unit && <span className="text-sm font-normal text-slate-500 ml-1">{card.unit}</span>}
            </p>
            {card.percent != null && (
              <div className="mt-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      card.status === 'critical' ? 'bg-red-500' :
                      card.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, card.percent)}%` }}
                  />
                </div>
              </div>
            )}
            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusClass(card.status)}`}>
              {card.status === 'critical' && <AlertTriangle className="w-3 h-3" />}
              {card.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
              {card.status === 'normal' && <CheckCircle className="w-3 h-3" />}
              {card.status === 'normal' ? 'Bình thường' : card.status === 'warning' ? 'Cảnh báo' : 'Critical'}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Tổng quan hoạt động
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Requests / phút</p>
            <p className="text-xl font-bold text-slate-900">~156</p>
            <p className="text-xs text-green-600 mt-1">Ổn định</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Avg Response Time</p>
            <p className="text-xl font-bold text-slate-900">~45 ms</p>
            <p className="text-xs text-green-600 mt-1">Trong ngưỡng</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Error Rate (24h)</p>
            <p className="text-xl font-bold text-slate-900">0.02%</p>
            <p className="text-xs text-green-600 mt-1">Rất thấp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
