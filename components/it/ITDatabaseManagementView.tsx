'use client';
import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, Clock, HardDrive } from 'lucide-react';

export const ITDatabaseManagementView: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const backups = [
    { id: '1', name: 'backup_2026_03_29_10_00.sql', size: '245 MB', date: '2026-03-29 10:00', status: 'completed', type: 'full' },
    { id: '2', name: 'backup_2026_03_28_10_00.sql', size: '243 MB', date: '2026-03-28 10:00', status: 'completed', type: 'full' },
    { id: '3', name: 'backup_2026_03_27_10_00.sql', size: '240 MB', date: '2026-03-27 10:00', status: 'completed', type: 'full' },
  ];

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => setIsBackingUp(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Management</h1>
          <p className="text-slate-600 text-sm">Quản lý backup, restore và health check</p>
        </div>
        <button
          onClick={handleBackup}
          disabled={isBackingUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isBackingUp ? 'Đang backup...' : 'Backup ngay'}
        </button>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Database Size</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">245 MB</div>
          <div className="text-xs text-slate-600">+2.3% từ hôm qua</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Connections</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">12 / 100</div>
          <div className="text-xs text-slate-600">12% usage</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Health Status</span>
          </div>
          <div className="text-2xl font-bold text-green-600">Healthy</div>
          <div className="text-xs text-slate-600">All checks passed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-slate-500">Last Backup</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">2h ago</div>
          <div className="text-xs text-slate-600">Scheduled: Daily 10:00</div>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Backup Schedule</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Daily Full Backup</div>
                <div className="text-xs text-slate-600">Every day at 10:00 AM</div>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Hourly Incremental</div>
                <div className="text-xs text-slate-600">Every hour</div>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">Disabled</span>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Backup History</span>
          <button className="text-xs text-blue-600 hover:text-blue-700">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">File Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{backup.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{backup.size}</td>
                  <td className="px-4 py-3">{backup.date}</td>
                  <td className="px-4 py-3 text-center">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="p-1.5 rounded border border-slate-200 hover:bg-slate-100" title="Download">
                        <Download className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 rounded border border-slate-200 hover:bg-blue-50" title="Restore">
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
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
