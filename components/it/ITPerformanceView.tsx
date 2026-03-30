'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Clock, Zap, Activity, RefreshCw,
  Calendar, ArrowUp, ArrowDown
} from 'lucide-react';

export const ITPerformanceView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1h' | '24h' | '7d'>('24h');
  const [metrics, setMetrics] = useState({
    avgResponseTime: 45,
    p95: 120,
    p99: 280,
    requestsPerMin: 156,
    errorRate: 0.02,
    throughput: 2340
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Mock time series for chart placeholder
  const series = [42, 45, 48, 44, 46, 43, 47, 45, 46, 44, 45, 43, 46, 45, 44, 47, 46, 45, 44, 46];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
          <p className="text-slate-600">Hiệu suất API và thời gian phản hồi theo thời gian</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as '1h' | '24h' | '7d')}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <option value="1h">1 giờ</option>
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Avg Response Time</span>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.avgResponseTime} ms</p>
          <p className="text-xs text-green-600 flex items-center gap-0.5 mt-1">
            <ArrowDown className="w-3.5 h-3.5" />
            -5% so với 24h trước
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">P95</span>
            <Zap className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.p95} ms</p>
          <p className="text-xs text-slate-500 mt-1">95th percentile</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Requests / phút</span>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.requestsPerMin}</p>
          <p className="text-xs text-green-600 flex items-center gap-0.5 mt-1">
            <ArrowUp className="w-3.5 h-3.5" />
            +2% so với 24h trước
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Error Rate</span>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.errorRate}%</p>
          <p className="text-xs text-green-600 mt-1">Rất thấp</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Response Time (ms) — {period === '1h' ? '1 giờ' : period === '24h' ? '24 giờ' : '7 ngày'}
        </h3>
        <div className="h-64 flex items-end gap-1">
          {series.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-500/80 hover:bg-blue-600 rounded-t min-h-[4px] transition-colors"
              style={{ height: `${(val / Math.max(...series)) * 100}%` }}
              title={`${val} ms`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Bắt đầu</span>
          <span>Hiện tại</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Throughput (requests/giờ)</h3>
          <p className="text-3xl font-bold text-slate-900">{metrics.throughput.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-1">Trung bình 24h qua</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Khoảng thời gian</h3>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-5 h-5" />
            <span>
              {period === '1h' && '1 giờ qua'}
              {period === '24h' && '24 giờ qua'}
              {period === '7d' && '7 ngày qua'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
