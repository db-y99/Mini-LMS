/**
 * Shared Validation Utilities
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate required field
 */
export function required(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate ID card number (Vietnamese CCCD)
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /^[0-9]{9,12}$/;
  return idCardRegex.test(idCard);
}

/**
 * Validate amount (positive number)
 */
export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate;
}
