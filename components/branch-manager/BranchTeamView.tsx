'use client';
import React, { useState } from 'react';
import { Users, Mail, Phone, Award, TrendingUp } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  loansProcessed: number;
  performance: number;
  status: 'active' | 'leave' | 'inactive';
}

export const BranchTeamView: React.FC = () => {
  const [team] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      role: 'CS',
      email: 'nguyenvana@company.com',
      phone: '0901234567',
      loansProcessed: 45,
      performance: 92,
      status: 'active'
    },
    {
      id: '2',
      name: 'Trần Thị B',
      role: 'CA',
      email: 'tranthib@company.com',
      phone: '0902345678',
      loansProcessed: 38,
      performance: 88,
      status: 'active'
    },
    {
      id: '3',
      name: 'Lê Văn C',
      role: 'CS',
      email: 'levanc@company.com',
      phone: '0903456789',
      loansProcessed: 52,
      performance: 95,
      status: 'active'
    }
  ]);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Team</h1>
        <p className="text-slate-600 text-sm">
          Theo dõi và quản lý nhân sự chi nhánh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tổng nhân sự</div>
          <div className="text-2xl font-bold text-slate-900">{team.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Đang làm việc</div>
          <div className="text-2xl font-bold text-green-600">
            {team.filter(m => m.status === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">TB hiệu suất</div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(team.reduce((sum, m) => sum + m.performance, 0) / team.length)}%
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">HS xử lý</div>
          <div className="text-2xl font-bold text-slate-900">
            {team.reduce((sum, m) => sum + m.loansProcessed, 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>
                {member.performance}%
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="text-xs">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span className="text-xs">{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-4 h-4" />
                <span className="text-xs">{member.loansProcessed} hồ sơ đã xử lý</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
