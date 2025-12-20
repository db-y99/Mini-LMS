import React from 'react';
import { FileClock, FileCheck, FileX, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const DashboardWidgets: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Hồ sơ tạo hôm nay</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">24</h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>+12% so với hôm qua</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Hồ sơ chờ xử lý</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">8</h3>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <FileClock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400">
          <span>Cập nhật 5 phút trước</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Hồ sơ bị trả về</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">2</h3>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <FileX className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-red-600">
          <ArrowDownRight className="w-3 h-3" />
          <span>+1 so với tuần trước</span>
        </div>
      </div>
    </div>
  );
};