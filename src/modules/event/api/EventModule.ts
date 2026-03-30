/**
 * Event Module - Public API
 * Handles event logging and audit trail
 */

import { eventLogger, LoanEvent, LoanEventType, EventFilter, EventStatistics } from '@/core/services/EventLogger';
import { User } from '@/types';

export class EventModule {
  /**
   * Log an event
   */
  async logEvent(
    eventType: LoanEventType,
    loanId: string,
    user: User,
    data?: Record<string, any>,
    correlationId?: string
  ): Promise<LoanEvent> {
    return eventLogger.log(
      loanId,
      eventType,
      data || {},
      user,
      correlationId ? { correlation_id: correlationId } : undefined
    );
  }

  /**
   * Get events for a loan
   */
  async getEventsByLoan(loanId: string): Promise<LoanEvent[]> {
    return eventLogger.getEvents({ loan_id: loanId });
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: LoanEventType): Promise<LoanEvent[]> {
    return eventLogger.getEvents({ event_types: [eventType] });
  }

  /**
   * Get events by user
   */
  async getEventsByUser(userId: string): Promise<LoanEvent[]> {
    return eventLogger.getEvents({ created_by: userId });
  }

  /**
   * Get events by correlation ID
   */
  async getEventsByCorrelation(correlationId: string): Promise<LoanEvent[]> {
    return eventLogger.getRelatedEvents(correlationId);
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limit: number = 100): Promise<LoanEvent[]> {
    const allEvents = await eventLogger.getEvents({});
    return allEvents.slice(-limit).reverse();
  }

  /**
   * Get event statistics (simple count by type)
   */
  async getEventStatistics(loanId?: string): Promise<Record<string, number>> {
    const filter = loanId ? { loan_id: loanId } : undefined;
    const stats = await eventLogger.getStatistics(filter);
    return stats.events_by_type;
  }

  /**
   * Get statistics with filter
   */
  async getStatistics(filter?: Partial<EventFilter>): Promise<EventStatistics> {
    return eventLogger.getStatistics(filter);
  }

  /**
   * Get timeline for loan
   */
  async getTimeline(loanId: string, limit?: number): Promise<LoanEvent[]> {
    return eventLogger.getTimeline(loanId, limit);
  }

  /**
   * Export events to JSON
   */
  async exportEvents(filter?: EventFilter): Promise<string> {
    return eventLogger.exportEvents(filter);
  }

  /**
   * Search events
   */
  async searchEvents(query: {
    loanId?: string;
    eventType?: LoanEventType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LoanEvent[]> {
    const filter: EventFilter = {
      loan_id: query.loanId,
      event_types: query.eventType ? [query.eventType] : undefined,
      created_by: query.userId,
      date_from: query.startDate,
      date_to: query.endDate
    };
    return eventLogger.getEvents(filter);
  }
}

// Export singleton instance
export const eventModule = new EventModule();
