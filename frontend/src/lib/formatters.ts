import { timeToDate, toNumber } from './serialization';

// Currency formatter for Indian Rupees
export function formatINR(amount: number | bigint): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

// Alias for formatINR
export function formatCurrency(amount: number | bigint): string {
  return formatINR(amount);
}

// Number formatter with Indian comma separation
export function formatIndianNumber(num: number | bigint): string {
  const numValue = typeof num === 'bigint' ? Number(num) : num;
  return new Intl.NumberFormat('en-IN').format(numValue);
}

// Date formatter with locale support
export function formatDate(date: bigint | Date, locale: string = 'en-IN'): string {
  const dateObj = date instanceof Date ? date : timeToDate(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// DateTime formatter with locale support
export function formatDateTime(date: bigint | Date, locale: string = 'en-IN'): string {
  const dateObj = date instanceof Date ? date : timeToDate(date);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Time formatter with locale support
export function formatTime(date: bigint | Date, locale: string = 'en-IN'): string {
  const dateObj = date instanceof Date ? date : timeToDate(date);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

// Percentage formatter
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Compact number formatter (e.g., 1.2K, 3.4M)
export function formatCompactNumber(num: number | bigint): string {
  const numValue = typeof num === 'bigint' ? Number(num) : num;
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numValue);
}
