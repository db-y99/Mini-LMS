'use client';

import React, { useState } from 'react';
import { Clock, Play, Pause, Trash2, Plus, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'failed';
  successRate: number;
  executionCount: number;
  avgDuration: string;
}

export const ITSchedulerView: React.FC = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([
    {
      id: '1',
      name: 'Database Backup',
      schedule: '0 2 * * *',
      nextRun: '2026-03-30 02:00',
      lastRun: '2026-03-29 02:00',
      status: 'active',
      successRate: 100,
      executionCount: 89,
      avgDuration: '5m 23s'
    },
    {
      id: '2',
      name: 'Send Payment Reminders',
      schedule: '0 9 * * *',
      nextRun: '2026-03-30 09:00',
      lastRun: '2026-03-29 09:00',
      status: 'active',
      successRate: 98.5,
      executionCount: 365,
      avgDuration: '2m 15s'
    },
    {
      id: '3',
      name: 'Generate Daily Reports',
      schedule: '0 23 * * *',
      nextRun: '2026-03-29 23:00',
      lastRun: '2026-03-28 23:00',
      status: 'active',
      successRate: 95.2,
      executionCount: 180,
      avgDuration: '8m 45s'
    },
    {
      id: '4',
      name: 'Clean Temp Files',
      schedule: '0 3 * * 0',
      nextRun: '2026-03-30 03:00',
      lastRun: '2026-03-23 03:00',
      status: 'active',
      successRate: 100,
      executionCount: 52,
      avgDuration: '1m 30s'
    },
    {
      id: '5',
      name: 'Sync External Data',
      schedule: '*/30 * * * *',
      nextRun: '2026-03-29 11:00',
      lastRun: '2026-03-29 10:30',
      status: 'failed',
      successRate: 87.3,
      executionCount: 2880,
      avgDuration: '45s'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleToggleJob = (id: string) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, status: job.status === 'active' ? 'paused' as const : 'active' as const }
        : job
    ));
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Delete this scheduled job?')) {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  const handleRunNow = (id: string) => {
    alert(`Triggering job ${id} manually...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduler Management</h1>
          <p className="text-slate-600 mt-1">Quản lý scheduled jobs và cron tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900">
                {jobs.filter(j => j.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Failed Jobs</p>
              <p className="text-2xl font-bold text-slate-900">
                {jobs.filter(j => j.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {(jobs.reduce((sum, j) => sum + j.successRate, 0) / jobs.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Scheduled Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Job Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Next Run</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Last Run</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Success Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Avg Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{job.name}</div>
                    <div className="text-xs text-slate-500">{job.executionCount} executions</div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{job.schedule}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{job.nextRun}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{job.lastRun}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            job.successRate >= 95 ? 'bg-green-500' :
                            job.successRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${job.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 w-12">{job.successRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{job.avgDuration}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunNow(job.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Run now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleJob(job.id)}
                        className="text-yellow-600 hover:text-yellow-700"
                        title={job.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cron Expression Helper */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Cron Expression Helper</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-4">
            <code className="bg-slate-100 px-2 py-1 rounded">* * * * *</code>
            <span className="text-slate-600">Every minute</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="bg-slate-100 px-2 py-1 rounded">0 * * * *</code>
            <span className="text-slate-600">Every hour</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="bg-slate-100 px-2 py-1 rounded">0 0 * * *</code>
            <span className="text-slate-600">Every day at midnight</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="bg-slate-100 px-2 py-1 rounded">0 0 * * 0</code>
            <span className="text-slate-600">Every Sunday at midnight</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="bg-slate-100 px-2 py-1 rounded">*/15 * * * *</code>
            <span className="text-slate-600">Every 15 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
