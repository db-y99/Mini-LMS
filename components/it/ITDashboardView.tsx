import React, { useState, useEffect, useMemo } from 'react';
import {
  Server, Database, Activity, AlertTriangle, CheckCircle, Clock,
  Users, FileText, TrendingUp, TrendingDown, Zap, Shield, BarChart3,
  HardDrive, Cpu, Wifi, Globe, Settings, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoanApplication, UserRole } from '../../types';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  requestsPerMinute: number;
}

interface DatabaseStatus {
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  connections: number;
  queriesPerSecond: number;
  lastBackup: Date;
}

interface APIStatus {
  endpoint: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  timestamp: Date;
  user?: string;
  details?: string;
}

export const ITDashboardView: React.FC = () => {
  const { loans, refreshLoans } = useWorkflow();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Mock system metrics
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    diskUsage: 38.5,
    networkLatency: 12,
    activeConnections: 234,
    requestsPerMinute: 156
  });

  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    status: 'healthy',
    responseTime: 8,
    connections: 45,
    queriesPerSecond: 234,
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  });

  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { endpoint: '/api/loans', status: 'up', responseTime: 45, uptime: 99.9, lastCheck: new Date() },
    { endpoint: '/api/users', status: 'up', responseTime: 23, uptime: 99.8, lastCheck: new Date() },
    { endpoint: '/api/auth', status: 'up', responseTime: 12, uptime: 99.95, lastCheck: new Date() },
    { endpoint: '/api/reports', status: 'degraded', responseTime: 234, uptime: 98.5, lastCheck: new Date() },
    { endpoint: '/api/audit', status: 'up', responseTime: 67, uptime: 99.7, lastCheck: new Date() }
  ]);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    {
      id: '1',
      level: 'error',
      message: 'Database connection timeout',
      source: 'DatabaseService',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: 'system',
      details: 'Connection pool exhausted'
    },
    {
      id: '2',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'SystemMonitor',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      details: 'Memory usage above 80%'
    },
    {
      id: '3',
      level: 'info',
      message: 'Scheduled backup completed',
      source: 'BackupService',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  // Calculate system statistics from loans
  const systemStats = useMemo(() => {
    const totalLoans = loans.length;
    const loansByStatus = loans.reduce((acc, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const loansToday = loans.filter(loan => {
      const created = new Date(loan.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    return {
      totalLoans,
      loansToday,
      loansByStatus,
      pendingLoans: Object.values(loansByStatus).reduce((sum, count) => {
        if (typeof count === 'number') return sum + count;
        return sum;
      }, 0)
    };
  }, [loans]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshLoans();
        // Simulate fetching system metrics
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to load IT dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshLoans]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshLoans();
      // Simulate updating metrics
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        requestsPerMinute: Math.max(100, Math.min(300, prev.requestsPerMinute + (Math.random() - 0.5) * 20))
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshLoans]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'degraded':
        return 'text-amber-600 bg-amber-50';
      case 'error':
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error':
      case 'down':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IT System Dashboard</h1>
          <p className="text-slate-600">Giám sát và kiểm tra toàn bộ hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {autoRefresh ? 'Đang tự động làm mới' : 'Tắt tự động làm mới'}
          </button>
          <button
            onClick={() => refreshLoans()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tổng hồ sơ</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{systemStats.totalLoans.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">+{systemStats.loansToday} hôm nay</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">CPU Usage</p>
            <Cpu className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{systemMetrics.cpuUsage.toFixed(1)}%</p>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${systemMetrics.cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Memory Usage</p>
            <HardDrive className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{systemMetrics.memoryUsage.toFixed(1)}%</p>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all"
              style={{ width: `${systemMetrics.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Requests/min</p>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{systemMetrics.requestsPerMinute}</p>
          <p className="text-xs text-slate-500 mt-1">Active: {systemMetrics.activeConnections}</p>
        </div>
      </div>

      {/* Database & API Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Database Status
            </h3>
            {getStatusIcon(databaseStatus.status)}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Trạng thái</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(databaseStatus.status)}`}>
                {databaseStatus.status === 'healthy' ? 'Hoạt động tốt' : databaseStatus.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Response Time</span>
              <span className="text-sm font-medium text-slate-900">{databaseStatus.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Connections</span>
              <span className="text-sm font-medium text-slate-900">{databaseStatus.connections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Queries/sec</span>
              <span className="text-sm font-medium text-slate-900">{databaseStatus.queriesPerSecond}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Backup</span>
              <span className="text-sm font-medium text-slate-900">{formatTimeAgo(databaseStatus.lastBackup)}</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              API Endpoints
            </h3>
            <span className="text-sm text-slate-500">
              {apiStatuses.filter(s => s.status === 'up').length}/{apiStatuses.length} Online
            </span>
          </div>
          <div className="space-y-2">
            {apiStatuses.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(api.status)}
                    <span className="text-sm font-medium text-slate-900">{api.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>{api.responseTime}ms</span>
                    <span>Uptime: {formatUptime(api.uptime)}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(api.status)}`}>
                  {api.status === 'up' ? 'Online' : api.status === 'down' ? 'Offline' : 'Degraded'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Logs & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Error Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Error Logs
            </h3>
            <span className="text-sm text-slate-500">
              {errorLogs.filter(e => e.level === 'error').length} errors
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errorLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-lg border-l-4 border-l-red-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        log.level === 'error' ? 'bg-red-100 text-red-700' :
                        log.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">{log.source}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{log.message}</p>
                    {log.details && (
                      <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(log.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-600" />
              System Information
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Server Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Network Latency</span>
              <span className="text-sm font-medium text-slate-900">{systemMetrics.networkLatency}ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Disk Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${systemMetrics.diskUsage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900 w-12 text-right">
                  {systemMetrics.diskUsage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Active Users</span>
              <span className="text-sm font-medium text-slate-900">{systemMetrics.activeConnections}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">System Uptime</span>
              <span className="text-sm font-medium text-slate-900">99.9%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Last Restart</span>
              <span className="text-sm font-medium text-slate-900">7 ngày trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loans by Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Hồ sơ theo trạng thái
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(systemStats.loansByStatus).map(([status, count]) => (
            <div key={status} className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">{status}</p>
              <p className="text-xl font-bold text-slate-900">{count as number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

