'use client';
import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Search, Filter, Download, RefreshCw, Info, AlertCircle,
  ChevronDown, Clock, User, FileCode
} from 'lucide-react';

interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  timestamp: Date;
  user?: string;
  details?: string;
  stack?: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1', level: 'error', message: 'Database connection timeout', source: 'DatabaseService', timestamp: new Date(Date.now() - 15 * 60 * 1000), user: 'system', details: 'Connection pool exhausted' },
  { id: '2', level: 'warning', message: 'High memory usage detected', source: 'SystemMonitor', timestamp: new Date(Date.now() - 45 * 60 * 1000), details: 'Memory usage above 80%' },
  { id: '3', level: 'info', message: 'Scheduled backup completed', source: 'BackupService', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '4', level: 'error', message: 'Failed to send email notification', source: 'NotificationService', timestamp: new Date(Date.now() - 90 * 60 * 1000), user: 'cron', details: 'SMTP connection refused' },
  { id: '5', level: 'warning', message: 'Slow query detected', source: 'QueryMonitor', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), details: 'Query took 2.3s' },
  { id: '6', level: 'info', message: 'Cache cleared successfully', source: 'CacheManager', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: '7', level: 'error', message: 'API rate limit exceeded', source: 'ApiGateway', timestamp: new Date(Date.now() - 120 * 60 * 1000), user: 'api-client-xyz' }
];

export const ITErrorLogsView: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchLevel = levelFilter === 'all' || log.level === levelFilter;
      const matchSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [logs, levelFilter, search]);

  const formatTime = (d: Date) => {
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${Math.floor(diff)} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return d.toLocaleString('vi-VN');
  };

  const levelStyle = (level: LogEntry['level']) => ({
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[level]);

  const LevelIcon = ({ level }: { level: LogEntry['level'] }) => {
    if (level === 'error') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (level === 'warning') return <AlertCircle className="w-4 h-4 text-amber-600" />;
    return <Info className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Error Logs</h1>
          <p className="text-slate-600">Nhật ký lỗi, cảnh báo và sự kiện hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo message hoặc source..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value as typeof levelFilter)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((log) => (
            <div
              key={log.id}
              className={`p-4 hover:bg-slate-50/50 transition-colors ${expandedId === log.id ? 'bg-slate-50/80' : ''}`}
            >
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${levelStyle(log.level)}`}>
                  <LevelIcon level={log.level} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded uppercase ${levelStyle(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" />
                      {log.source}
                    </span>
                    {log.user && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {log.user}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-1">{log.message}</p>
                  {(log.details || expandedId === log.id) && (
                    <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(log.timestamp)}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${expandedId === log.id ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            Không có log nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};
