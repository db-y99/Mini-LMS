/**
 * Shared Kernel
 * Common utilities and base classes used across all modules
 */

// Domain
export { Entity } from './domain/Entity';
export type { DomainEvent } from './domain/DomainEvent';
export { BaseDomainEvent } from './domain/DomainEvent';

// Utils
export * from './utils/validation';
export * from './utils/formatting';
