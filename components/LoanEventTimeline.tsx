/**
 * Loan Event Timeline Component
 * Displays complete event history for a loan
 */

import React, { useState, useEffect } from 'react';
import { eventModule } from '@modules';
import { LoanEvent, LoanEventType, EventFilter } from '../core/services/EventLogger';

interface LoanEventTimelineProps {
  loanId: string;
  limit?: number;
  showFilters?: boolean;
}

export const LoanEventTimeline: React.FC<LoanEventTimelineProps> = ({
  loanId,
  limit,
  showFilters = true
}) => {
  const [events, setEvents] = useState<LoanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventFilter>({ loan_id: loanId });
  const [selectedEvent, setSelectedEvent] = useState<LoanEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, [loanId, filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const timeline = await eventModule.getTimeline(loanId, limit);
      setEvents(timeline);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: LoanEventType): string => {
    const iconMap: Record<string, string> = {
      STATUS_CHANGED: '🔄',
      LOAN_CREATED: '✨',
      APPROVAL_GRANTED: '✅',
      REJECTION_RECORDED: '❌',
      DOCUMENT_UPLOADED: '📄',
      ASSESSMENT_COMPLETED: '📊',
      SECURITY_CHECK_PASSED: '🔒',
      SECURITY_CHECK_FAILED: '⚠️',
      FRAUD_DETECTED: '🚨',
      DEVICE_LOCKED: '📱',
      CONTRACT_SENT: '📝',
      CONTRACT_SIGNED: '✍️',
      DISBURSEMENT_COMPLETED: '💰',
      DISBURSEMENT_FAILED: '❗',
      PAYMENT_RECEIVED: '💵',
      PAYMENT_OVERDUE: '⏰',
      COLLECTION_STARTED: '📞',
      LOAN_FROZEN: '❄️',
      LOAN_UNFROZEN: '🔥',
      VERSION_CREATED: '📦',
      SYSTEM_ERROR: '⚠️'
    };

    return iconMap[eventType] || '📌';
  };

  const getEventColor = (eventType: LoanEventType): string => {
    if (eventType.includes('APPROVAL') || eventType.includes('COMPLETED') || eventType.includes('PASSED')) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (eventType.includes('REJECTION') || eventType.includes('FAILED') || eventType.includes('ERROR')) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    if (eventType.includes('OVERDUE') || eventType.includes('FRAUD')) {
      return 'bg-orange-100 border-orange-300 text-orange-800';
    }
    if (eventType.includes('FROZEN') || eventType.includes('COLLECTION')) {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
    if (eventType.includes('PAYMENT') || eventType.includes('DISBURSEMENT')) {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateString);
  };

  const handleEventClick = (event: LoanEvent) => {
    setSelectedEvent(event);
  };

  const handleExport = async () => {
    const json = await eventModule.exportEvents({ loan_id: loanId });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-${loanId}-events.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Chưa có sự kiện nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lịch sử sự kiện</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Xuất JSON
          </button>
          <button
            onClick={loadEvents}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-600">Tổng sự kiện</div>
          <div className="text-2xl font-bold">{events.length}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Sự kiện gần nhất</div>
          <div className="text-sm font-medium">{formatRelativeTime(events[0].created_at)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Sự kiện đầu tiên</div>
          <div className="text-sm font-medium">
            {formatRelativeTime(events[events.length - 1].created_at)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-4">
          {events.map((event: LoanEvent, index: number) => (
            <div key={event.id} className="relative pl-14">
              {/* Icon */}
              <div className="absolute left-0 w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-200 rounded-full text-2xl">
                {getEventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getEventColor(event.event_type)}`}
                onClick={() => handleEventClick(event)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {event.event_description || event.event_type}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.created_by_name || event.created_by} • {event.created_by_role}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{formatRelativeTime(event.created_at)}</div>
                    <div className="text-xs">{formatDate(event.created_at)}</div>
                  </div>
                </div>

                {/* Event data preview */}
                {Object.keys(event.event_data).length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium mb-1">Chi tiết:</div>
                    <div className="space-y-1">
                      {Object.entries(event.event_data).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                      {Object.keys(event.event_data).length > 3 && (
                        <div className="text-gray-500">
                          ... và {Object.keys(event.event_data).length - 3} trường khác
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Correlation indicator */}
                {event.correlation_id && (
                  <div className="mt-2 text-xs text-gray-500">
                    🔗 Correlation ID: {event.correlation_id.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-3xl">{getEventIcon(selectedEvent.event_type)}</span>
                Chi tiết sự kiện
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Loại sự kiện</div>
                  <div className="font-medium">{selectedEvent.event_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Mô tả</div>
                  <div className="font-medium">{selectedEvent.event_description}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Người thực hiện</div>
                  <div className="font-medium">
                    {selectedEvent.created_by_name} ({selectedEvent.created_by_role})
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                  <div className="font-medium">{formatDate(selectedEvent.created_at)}</div>
                </div>
                {selectedEvent.branch_id && (
                  <div>
                    <div className="text-sm text-gray-600">Chi nhánh</div>
                    <div className="font-medium">{selectedEvent.branch_id}</div>
                  </div>
                )}
                {selectedEvent.ip_address && (
                  <div>
                    <div className="text-sm text-gray-600">IP Address</div>
                    <div className="font-medium">{selectedEvent.ip_address}</div>
                  </div>
                )}
              </div>

              {/* Event data */}
              <div>
                <div className="font-medium mb-2">Dữ liệu sự kiện:</div>
                <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(selectedEvent.event_data, null, 2)}
                </pre>
              </div>

              {/* Metadata */}
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <div className="font-medium mb-2">Metadata:</div>
                  <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* IDs */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Event ID:</span> {selectedEvent.id}
                </div>
                <div>
                  <span className="font-medium">Loan ID:</span> {selectedEvent.loan_id}
                </div>
                {selectedEvent.correlation_id && (
                  <div>
                    <span className="font-medium">Correlation ID:</span> {selectedEvent.correlation_id}
                  </div>
                )}
                {selectedEvent.parent_event_id && (
                  <div>
                    <span className="font-medium">Parent Event ID:</span> {selectedEvent.parent_event_id}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
