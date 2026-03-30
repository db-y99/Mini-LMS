'use client';
import React from 'react';
import { History, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

export const CollectionHistoryView: React.FC = () => {
  // Mock history data
  const history = [
    {
      id: '1',
      loanId: 'loan-001',
      customerName: 'Nguyễn Văn A',
      action: 'Gọi điện',
      result: 'Khách hàng hứa trả trong 3 ngày',
      date: new Date('2026-03-25'),
      officer: 'Thu hồi viên 1'
    },
    {
      id: '2',
      loanId: 'loan-002',
      customerName: 'Trần Thị B',
      action: 'Gửi email nhắc nhở',
      result: 'Email đã gửi',
      date: new Date('2026-03-24'),
      officer: 'Thu hồi viên 1'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử Thu hồi</h1>
        <p className="text-slate-600 text-sm">
          Theo dõi các hoạt động thu hồi nợ đã thực hiện.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">
            Lịch sử hoạt động
          </span>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-semibold text-slate-900">{item.action}</div>
                      <div className="text-sm text-slate-600">
                        {item.customerName} - {item.loanId}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.date.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 mb-1">{item.result}</div>
                  <div className="text-xs text-slate-500">Bởi: {item.officer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Lưu ý:</span> Đây là dữ liệu demo. 
          Trong phiên bản đầy đủ sẽ lưu trữ đầy đủ lịch sử liên hệ, ghi chú, và kết quả thu hồi.
        </p>
      </div>
    </div>
  );
};
