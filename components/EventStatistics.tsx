/**
 * Event Statistics Component
 * Displays analytics and statistics for loan events
 */

import React, { useState, useEffect } from 'react';
import { eventModule } from '@modules';
import { EventStatistics as EventStats, EventFilter } from '../core/services/EventLogger';

interface EventStatisticsProps {
  loanId?: string;
  filter?: EventFilter;
}

export const EventStatistics: React.FC<EventStatisticsProps> = ({
  loanId,
  filter
}) => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [loanId, filter]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const eventFilter = loanId ? { ...filter, loan_id: loanId } : filter;
      const statistics = await eventModule.getStatistics(eventFilter);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8 text-gray-500">
        Không có dữ liệu thống kê
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Tổng sự kiện</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">
            {stats.total_events.toLocaleString('vi-VN')}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Loại sự kiện</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {Object.keys(stats.events_by_type).length}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Người dùng hoạt động</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {Object.keys(stats.events_by_user).length}
          </div>
        </div>
      </div>

      {/* Events by Type */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Sự kiện theo loại</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {Object.entries(stats.events_by_type)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([type, count]) => {
              const percentage = ((count as number) / stats.total_events) * 100;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type}</span>
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Events by User */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt động theo người dùng</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {Object.entries(stats.events_by_user)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([user, count]) => {
              const percentage = ((count as number) / stats.total_events) * 100;
              return (
                <div key={user} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{user}</span>
                      <span className="text-sm text-gray-600">
                        {count} sự kiện ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Events by Date */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Hoạt động theo ngày</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {stats.events_by_date
            .slice(-14) // Last 14 days
            .reverse()
            .map(({ date, count }) => {
              const maxCount = Math.max(...stats.events_by_date.map(d => d.count));
              const percentage = (count / maxCount) * 100;
              return (
                <div key={date} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('vi-VN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 ml-3 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Most Active Loans */}
      {!loanId && stats.most_active_loans.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Khoản vay hoạt động nhiều nhất</h3>
          <div className="space-y-2">
            {stats.most_active_loans.map(({ loan_id, event_count }, index) => (
              <div key={loan_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{loan_id}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {event_count} sự kiện
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-center">
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Làm mới thống kê
        </button>
      </div>
    </div>
  );
};
