'use client';
import React from 'react';
import { CreditCard, CheckCircle, XCircle, Activity, DollarSign, TrendingUp } from 'lucide-react';

export const PaymentGatewayView: React.FC = () => {
  const gateways = [
    { id: '1', name: 'VNPay', status: 'active', transactions: 1234, amount: 5600000000, fee: 1.5 },
    { id: '2', name: 'MoMo', status: 'active', transactions: 890, amount: 3200000000, fee: 1.8 },
    { id: '3', name: 'ZaloPay', status: 'inactive', transactions: 0, amount: 0, fee: 2.0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Gateway</h1>
        <p className="text-slate-600 text-sm">Quản lý cổng thanh toán và giao dịch</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng giao dịch', value: '2,124', icon: Activity, color: 'blue' },
          { label: 'Thành công', value: '2,089', icon: CheckCircle, color: 'green' },
          { label: 'Thất bại', value: '35', icon: XCircle, color: 'red' },
          { label: 'Tổng tiền', value: '8.8B VND', icon: DollarSign, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              <span className="text-xs font-medium text-slate-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{gw.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                gw.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {gw.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Giao dịch:</span>
                <span className="font-medium">{gw.transactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tổng tiền:</span>
                <span className="font-medium">{(gw.amount / 1000000000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phí:</span>
                <span className="font-medium">{gw.fee}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <button className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50">
                Cấu hình
              </button>
              <button className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-blue-50 hover:text-blue-600">
                Xem logs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
