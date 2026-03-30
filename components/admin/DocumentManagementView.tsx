'use client';
import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Copy, Download } from 'lucide-react';

export const DocumentManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'documents'>('templates');

  const mockTemplates = [
    {
      id: '1',
      name: 'Hợp đồng vay tiêu dùng',
      code: 'CONTRACT_CONSUMER_LOAN',
      type: 'contract',
      description: 'Hợp đồng vay tiêu dùng chuẩn',
      variables: ['customerName', 'loanAmount', 'interestRate', 'duration'],
      version: 3,
      isActive: true
    },
    {
      id: '2',
      name: 'Thông báo giải ngân',
      code: 'NOTICE_DISBURSEMENT',
      type: 'notice',
      description: 'Thông báo giải ngân cho khách hàng',
      variables: ['customerName', 'loanAmount', 'disbursementDate'],
      version: 1,
      isActive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài liệu</h1>
          <p className="text-slate-600 text-sm">Quản lý templates và tài liệu sinh tự động</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Tạo template mới
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Templates ({mockTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Tài liệu (0)
          </button>
        </div>
      </div>

      {/* Templates List */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockTemplates.map(template => (
            <div key={template.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-xs text-slate-500">{template.code}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  v{template.version}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">{template.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {template.variables.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <Eye className="w-3 h-3" />
                  Xem
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                  <Edit className="w-3 h-3" />
                  Sửa
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-green-50 hover:text-green-600">
                  <Copy className="w-3 h-3" />
                  Nhân bản
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Chưa có tài liệu nào được tạo</p>
        </div>
      )}
    </div>
  );
};
