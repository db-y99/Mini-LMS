import React from 'react';
import { Building2, FileStack, ArrowRight, Filter } from 'lucide-react';

export const BranchLoansView: React.FC = () => {
  const mockBranchLoanSummary: any[] = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ vay theo Chi nhánh</h1>
          <p className="text-slate-600 text-sm">
            Tổng hợp nhanh số lượng hồ sơ vay và dư nợ theo từng chi nhánh.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Tổng {mockBranchLoanSummary.length} chi nhánh
            </p>
            <p className="text-xs text-slate-500">
              Dữ liệu sẽ được tải từ API hoặc storage.
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="w-4 h-4" />
          Tuỳ chọn bộ lọc
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockBranchLoanSummary.length === 0 ? (
          <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            Không có dữ liệu chi nhánh
          </div>
        ) : mockBranchLoanSummary.map(branch => (
          <div
            key={branch.branchCode}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-blue-600">
                  {branch.branchCode}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {branch.branchName}
                </p>
              </div>
              <FileStack className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Tổng hồ sơ: <span className="font-semibold text-slate-900">{branch.totalLoans}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-50 rounded-lg px-2 py-1">
                <p className="text-[10px] text-blue-500">Chờ xử lý</p>
                <p className="font-semibold text-slate-900">{branch.pending}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg px-2 py-1">
                <p className="text-[10px] text-emerald-500">Đã duyệt</p>
                <p className="font-semibold text-slate-900">{branch.approved}</p>
              </div>
              <div className="bg-rose-50 rounded-lg px-2 py-1">
                <p className="text-[10px] text-rose-500">Từ chối</p>
                <p className="font-semibold text-slate-900">{branch.rejected}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Dư nợ ước tính:
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {(branch.totalAmount / 1_000_000_000).toFixed(1)}B
              </p>
            </div>
            <button className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
              Xem chi tiết hồ sơ
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


