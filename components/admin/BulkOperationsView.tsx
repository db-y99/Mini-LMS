'use client';

import React, { useState } from 'react';
import { Upload, Download, Zap, CheckCircle, AlertTriangle, FileText, Users, Mail } from 'lucide-react';

interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'update' | 'email' | 'sms';
  entity: 'users' | 'loans' | 'customers';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  failed: number;
  createdAt: string;
  completedAt?: string;
}

export const BulkOperationsView: React.FC = () => {
  const [operations] = useState<BulkOperation[]>([
    {
      id: '1',
      type: 'import',
      entity: 'users',
      status: 'completed',
      progress: 100,
      total: 150,
      processed: 148,
      failed: 2,
      createdAt: '2026-03-29 09:00',
      completedAt: '2026-03-29 09:15'
    },
    {
      id: '2',
      type: 'export',
      entity: 'loans',
      status: 'completed',
      progress: 100,
      total: 500,
      processed: 500,
      failed: 0,
      createdAt: '2026-03-28 14:30',
      completedAt: '2026-03-28 14:35'
    },
    {
      id: '3',
      type: 'email',
      entity: 'customers',
      status: 'processing',
      progress: 65,
      total: 1000,
      processed: 650,
      failed: 5,
      createdAt: '2026-03-29 10:00'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'import': return <Upload className="w-4 h-4" />;
      case 'export': return <Download className="w-4 h-4" />;
      case 'update': return <Zap className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Mail className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulk Operations</h1>
        <p className="text-slate-600 mt-1">Thao tác hàng loạt với users, loans, customers</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Bulk Import</h3>
              <p className="text-sm text-slate-600">Import users, loans, customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-green-300 cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Bulk Export</h3>
              <p className="text-sm text-slate-600">Export data to CSV/Excel</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-purple-300 cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Bulk Email/SMS</h3>
              <p className="text-sm text-slate-600">Send notifications in bulk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Operations</p>
              <p className="text-2xl font-bold text-slate-900">{operations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {operations.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Processing</p>
              <p className="text-2xl font-bold text-slate-900">
                {operations.filter(o => o.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Failed</p>
              <p className="text-2xl font-bold text-slate-900">
                {operations.filter(o => o.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Operations History */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Operations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Processed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Failed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {operations.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(op.type)}
                      <span className="text-sm capitalize">{op.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize">{op.entity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 w-24">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${op.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 w-12">{op.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{op.processed}/{op.total}</span>
                  </td>
                  <td className="px-4 py-3">
                    {op.failed > 0 ? (
                      <span className="text-sm text-red-600 font-semibold">{op.failed}</span>
                    ) : (
                      <span className="text-sm text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(op.status)}`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{op.createdAt}</td>
                  <td className="px-4 py-3">
                    {op.status === 'completed' && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Import/Export Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-slate-900">Users Template</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">CSV template for bulk user import</p>
            <button className="text-sm text-blue-600 hover:text-blue-700">Download Template</button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-slate-900">Loans Template</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">CSV template for bulk loan import</p>
            <button className="text-sm text-green-600 hover:text-green-700">Download Template</button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-slate-900">Customers Template</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">CSV template for bulk customer import</p>
            <button className="text-sm text-purple-600 hover:text-purple-700">Download Template</button>
          </div>
        </div>
      </div>
    </div>
  );
};
