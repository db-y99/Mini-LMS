'use client';
import React from 'react';
import { Activity } from 'lucide-react';
import { ActivityLogView } from '../ActivityLogView';

export const ITAuditLogsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-7 h-7 text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-slate-600 mt-1">Nhật ký kiểm toán hoạt động hệ thống và người dùng</p>
      </div>
      <ActivityLogView />
    </div>
  );
};
