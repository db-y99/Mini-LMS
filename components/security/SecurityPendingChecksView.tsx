'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, Filter, Shield, ChevronRight, Phone, FileText } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { LoanApplication } from '@/types';

export const SecurityPendingChecksView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const pendingLoans = loans.filter(l => l.canonicalStatus === 'REQUIRE_DEVICE_LOCK');

  const filteredLoans = pendingLoans.filter(loan => {
    const matchesSearch = 
      loan.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.phoneNumber.includes(searchTerm) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || loan.collateralType === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ chờ kiểm tra</h1>
        <p className="text-slate-600 text-sm">
          Xác thực danh tính và thiết bị cho các hồ sơ mới.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-500">Tổng</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingLoans.length}</div>
          <div className="text-xs text-slate-600">Hồ sơ chờ xử lý</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-slate-500">Ưu tiên</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pendingLoans.filter(l => l.collateralType === 'phone').length}
          </div>
          <div className="text-xs text-slate-600">Điện thoại</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-slate-500">Khác</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pendingLoans.filter(l => l.collateralType !== 'phone').length}
          </div>
          <div className="text-xs text-slate-600">Tài sản khác</div>
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
        >
          <option value="all">Tất cả tài sản</option>
          <option value="phone">Điện thoại</option>
          <option value="laptop">Laptop</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {/* Loans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Mã hồ sơ</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Tài sản</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-center">Ngày tạo</th>
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
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {loan.customer.phoneNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                      {loan.collateralType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {new Date(loan.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/sec/verify/${loan.id}`)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all"
                    >
                      Xác thực
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Không có hồ sơ chờ xác thực
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
