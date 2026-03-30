'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Search, Eye, AlertTriangle } from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

export const SecurityRejectedView: React.FC = () => {
  const router = useRouter();
  const { loans } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');

  const rejectedLoans = loans.filter(l => l.securityCheckStatus === 'failed');

  const filteredLoans = rejectedLoans.filter(loan =>
    loan.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer.phoneNumber.includes(searchTerm) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ đã từ chối</h1>
        <p className="text-slate-600 text-sm">
          Các hồ sơ không vượt qua kiểm tra bảo mật.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{rejectedLoans.length}</div>
              <div className="text-sm text-slate-600">Hồ sơ đã từ chối</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, mã hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          />
        </div>
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
                <th className="px-4 py-3 text-center">Ngày từ chối</th>
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
                  <td className="px-4 py-3 capitalize text-slate-700">
                    {loan.collateralType}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {(loan.loanAmount / 1000000).toFixed(1)}M
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
                    Không có hồ sơ đã từ chối
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900 text-sm mb-1">
              Lưu ý
            </div>
            <p className="text-sm text-red-800">
              Các hồ sơ bị từ chối do không đáp ứng yêu cầu bảo mật: CCCD không hợp lệ, 
              thiết bị báo mất, hoặc nằm trong danh sách đen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
