'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Settings } from 'lucide-react';

interface RiskRule {
  id: string;
  name: string;
  category: 'credit_score' | 'income' | 'debt_ratio' | 'employment' | 'fraud';
  condition: string;
  action: 'approve' | 'reject' | 'manual_review';
  priority: number;
  enabled: boolean;
}

export const RiskManagementView: React.FC = () => {
  const [riskRules] = useState<RiskRule[]>([
    {
      id: '1',
      name: 'High Credit Score Auto-Approve',
      category: 'credit_score',
      condition: 'credit_score >= 750',
      action: 'approve',
      priority: 1,
      enabled: true
    },
    {
      id: '2',
      name: 'Low Credit Score Reject',
      category: 'credit_score',
      condition: 'credit_score < 500',
      action: 'reject',
      priority: 2,
      enabled: true
    },
    {
      id: '3',
      name: 'High Debt Ratio Review',
      category: 'debt_ratio',
      condition: 'debt_to_income > 0.5',
      action: 'manual_review',
      priority: 3,
      enabled: true
    },
    {
      id: '4',
      name: 'Fraud Pattern Detection',
      category: 'fraud',
      condition: 'fraud_score > 70',
      action: 'reject',
      priority: 1,
      enabled: true
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'credit_score': return 'bg-blue-100 text-blue-700';
      case 'income': return 'bg-green-100 text-green-700';
      case 'debt_ratio': return 'bg-yellow-100 text-yellow-700';
      case 'employment': return 'bg-purple-100 text-purple-700';
      case 'fraud': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'bg-green-100 text-green-700';
      case 'reject': return 'bg-red-100 text-red-700';
      case 'manual_review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk Management</h1>
        <p className="text-slate-600 mt-1">Quản lý rủi ro và credit scoring rules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Rules</p>
              <p className="text-2xl font-bold text-slate-900">
                {riskRules.filter(r => r.enabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Credit Score</p>
              <p className="text-2xl font-bold text-slate-900">685</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">High Risk Loans</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Default Rate</p>
              <p className="text-2xl font-bold text-slate-900">2.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Rules */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Risk Scoring Rules</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rule Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {riskRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-semibold">
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{rule.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(rule.category)}`}>
                      {rule.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{rule.condition}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getActionColor(rule.action)}`}>
                      {rule.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={rule.enabled} readOnly />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Score Distribution */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Credit Score Distribution</h2>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Excellent (750+)</span>
              <span className="text-sm font-semibold text-slate-900">25%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Good (650-749)</span>
              <span className="text-sm font-semibold text-slate-900">45%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Fair (550-649)</span>
              <span className="text-sm font-semibold text-slate-900">20%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Poor (500-549)</span>
              <span className="text-sm font-semibold text-slate-900">8%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '8%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Very Poor (&lt;500)</span>
              <span className="text-sm font-semibold text-slate-900">2%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
