import React from 'react';
import { Users, Building2, UserCheck } from 'lucide-react';

export const BranchAssignmentView: React.FC = () => {
  const mockAssignments: any[] = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Phân bổ nhân sự theo Chi nhánh</h1>
          <p className="text-slate-600 text-sm">
            Xem nhanh tình hình phân bổ team CSKH, Thẩm định, Security, Kế toán tại từng chi nhánh.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <UserCheck className="w-6 h-6 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Không có dữ liệu phân bổ nhân sự.
          </p>
          <p className="text-xs text-slate-500">
            Dữ liệu sẽ được tải từ API hoặc storage.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">
            Danh sách phân bổ nhân sự
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Chi nhánh</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Số lượng NV</th>
                <th className="px-4 py-2 text-left">Team Lead</th>
              </tr>
            </thead>
            <tbody>
              {mockAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : mockAssignments.map((row, idx) => (
                <tr
                  key={`${row.branchCode}-${row.role}-${idx}`}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-slate-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-blue-600">
                        {row.branchCode}
                      </span>
                      <span>{row.branchName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {row.role}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    <div className="inline-flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{row.staffCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {row.leadName}
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


