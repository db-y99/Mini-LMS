'use client';
import React, { useState } from 'react';
import { FileText, Download, Eye, Edit, Plus, Search } from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  type: 'loan' | 'collateral' | 'guarantee' | 'other';
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdDate: Date;
  lastModified: Date;
  usageCount: number;
}

export const ContractsView: React.FC = () => {
  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      name: 'Hợp đồng vay tín chấp',
      type: 'loan',
      version: 'v2.1',
      status: 'active',
      createdDate: new Date('2025-01-10'),
      lastModified: new Date('2026-02-15'),
      usageCount: 245
    },
    {
      id: '2',
      name: 'Hợp đồng thế chấp xe máy',
      type: 'collateral',
      version: 'v1.5',
      status: 'active',
      createdDate: new Date('2025-03-20'),
      lastModified: new Date('2026-01-10'),
      usageCount: 189
    },
    {
      id: '3',
      name: 'Hợp đồng bảo lãnh',
      type: 'guarantee',
      version: 'v1.0',
      status: 'draft',
      createdDate: new Date('2026-03-01'),
      lastModified: new Date('2026-03-15'),
      usageCount: 0
    }
  ]);

  const [search, setSearch] = useState('');

  const filteredContracts = contracts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const labels = {
      loan: 'Hợp đồng vay',
      collateral: 'Hợp đồng thế chấp',
      guarantee: 'Hợp đồng bảo lãnh',
      other: 'Khác'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-amber-100 text-amber-700'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Hợp đồng</h1>
          <p className="text-slate-600 text-sm">
            Soạn thảo, quản lý và theo dõi các mẫu hợp đồng.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Tạo hợp đồng mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className="block text-xs font-medium text-slate-600 mb-2">
          <Search className="inline w-3 h-3 mr-1" />
          Tìm kiếm hợp đồng
        </label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm theo tên hợp đồng..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map(contract => (
          <div key={contract.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                {contract.status === 'draft' ? 'Nháp' : contract.status === 'active' ? 'Đang dùng' : 'Lưu trữ'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{contract.name}</h3>
            <div className="text-xs text-slate-500 mb-3">
              {getTypeLabel(contract.type)} • {contract.version}
            </div>
            <div className="text-xs text-slate-600 mb-3">
              Sử dụng: {contract.usageCount} lần
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Eye className="w-3 h-3" />
                Xem
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Edit className="w-3 h-3" />
                Sửa
              </button>
              <button className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
