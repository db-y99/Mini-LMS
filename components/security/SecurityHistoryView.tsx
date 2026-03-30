'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, CheckCircle, XCircle, Calendar, User, Eye } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const SecurityHistoryView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const checkedLoans = loans.filter(l => 
    l.securityCheckStatus === 'passed' || l.securityCheckStatus === 'failed'
  );

  const filteredLoans = checkedLoans.filter(loan => {
    const matchesSearch = 
      loan.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.phoneNumber.includes(searchTerm) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || loan.securityCheckStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: checkedLoans.length,
    passed: checkedLoans.filter(l => l.securityCheckStatus === 'passed').length,
    failed: checkedLoans.filter(l => l.securityCheckStatus === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử kiểm tra</h1>
        <p className="text-slate-600 text-sm">
          Xem lại các hồ sơ đã được xác thực bảo mật.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <History className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-600">Đã kiểm tra</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Đạt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.passed}</div>
          <div className="text-xs text-slate-600">Đã phê duyệt</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium text-slate-500">Không đạt</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.failed}</div>
          <div className="text-xs text-slate-600">Đã từ chối</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, mã hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="passed">Đã duyệt</option>
          <option value="failed">Đã từ chối</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Mã hồ sơ</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-center">Kết quả</th>
                <th className="px-4 py-3 text-center">Ngày kiểm tra</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => (
                <tr key={loan.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {loan.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{loan.customer.fullName}</div>
                    <div className="text-xs text-slate-500">{loan.customer.phoneNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    {loan.securityCheckStatus === 'passed' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Đạt
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Không đạt
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {new Date(loan.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/sec/verify/${loan.id}`)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Không có lịch sử kiểm tra
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
