/**
 * Domain Event Interface
 * All domain events should implement this
 */

export interface DomainEvent {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  aggregateId: string; // ID of the entity that triggered the event
  data: Record<string, any>;
  correlationId?: string;
  causationId?: string;
}

/**
 * Base Domain Event
 */
export abstract class BaseDomainEvent implements DomainEvent {
  eventId: string;
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
  data: Record<string, any>;
  correlationId?: string;
  causationId?: string;

  constructor(
    eventType: string,
    aggregateId: string,
    data: Record<string, any>,
    correlationId?: string
  ) {
    this.eventId = this.generateId();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.data = data;
    this.occurredAt = new Date();
    this.correlationId = correlationId;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
