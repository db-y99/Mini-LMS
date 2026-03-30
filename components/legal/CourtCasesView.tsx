'use client';
import React, { useState } from 'react';
import { Gavel, Calendar, FileText, User, Phone, DollarSign } from 'lucide-react';

interface CourtCase {
  id: string;
  caseNumber: string;
  loanId: string;
  customerName: string;
  amount: number;
  filedDate: Date;
  courtName: string;
  status: 'filed' | 'hearing' | 'judgment' | 'appeal';
  nextHearing?: Date;
  lawyer: string;
}

export const CourtCasesView: React.FC = () => {
  const [cases] = useState<CourtCase[]>([
    {
      id: '1',
      caseNumber: 'LS-2026-001',
      loanId: 'loan-001',
      customerName: 'Nguyễn Văn A',
      amount: 80000000,
      filedDate: new Date('2026-01-15'),
      courtName: 'TAND Quận 1, TP.HCM',
      status: 'hearing',
      nextHearing: new Date('2026-04-10'),
      lawyer: 'Luật sư Trần Văn B'
    },
    {
      id: '2',
      caseNumber: 'LS-2026-002',
      loanId: 'loan-002',
      customerName: 'Lê Thị C',
      amount: 120000000,
      filedDate: new Date('2026-02-20'),
      courtName: 'TAND Quận Đống Đa, Hà Nội',
      status: 'filed',
      nextHearing: new Date('2026-04-25'),
      lawyer: 'Luật sư Phạm Thị D'
    }
  ]);

  const getStatusLabel = (status: string) => {
    const labels = {
      filed: 'Đã nộp đơn',
      hearing: 'Đang xét xử',
      judgment: 'Đã có phán quyết',
      appeal: 'Kháng cáo'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      filed: 'bg-blue-100 text-blue-700',
      hearing: 'bg-amber-100 text-amber-700',
      judgment: 'bg-green-100 text-green-700',
      appeal: 'bg-purple-100 text-purple-700'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vụ kiện Tòa án</h1>
        <p className="text-slate-600 text-sm">
          Quản lý các vụ kiện đang trong quá trình xét xử tại tòa án.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tổng vụ kiện</div>
          <div className="text-2xl font-bold text-slate-900">{cases.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Đang xét xử</div>
          <div className="text-2xl font-bold text-amber-600">
            {cases.filter(c => c.status === 'hearing').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Đã nộp đơn</div>
          <div className="text-2xl font-bold text-blue-600">
            {cases.filter(c => c.status === 'filed').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">Tổng giá trị</div>
          <div className="text-2xl font-bold text-slate-900">
            {(cases.reduce((sum, c) => sum + c.amount, 0) / 1000000000).toFixed(1)}B
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">
            Danh sách vụ kiện ({cases.length})
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {cases.map(courtCase => (
            <div key={courtCase.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      {courtCase.caseNumber}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {courtCase.customerName} - {courtCase.courtName}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{(courtCase.amount / 1000000).toFixed(1)}M VND</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{courtCase.lawyer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Nộp: {courtCase.filedDate.toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(courtCase.status)}`}>
                  {getStatusLabel(courtCase.status)}
                </span>
              </div>
              {courtCase.nextHearing && (
                <div className="ml-13 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-900">
                      Phiên tòa tiếp theo: {courtCase.nextHearing.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
