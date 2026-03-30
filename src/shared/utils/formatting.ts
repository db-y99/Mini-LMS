/**
 * Shared Formatting Utilities
 */

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format date
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };

  return new Intl.DateTimeFormat('vi-VN', optionsMap[format]).format(date);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
