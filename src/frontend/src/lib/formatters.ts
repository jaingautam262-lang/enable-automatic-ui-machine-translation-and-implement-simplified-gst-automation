import { timeToDate, toNumber } from "./serialization";

// Currency formatter for Indian Rupees
export function formatINR(amount: number | bigint): string {
  const numAmount = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
  const numValue = typeof num === "bigint" ? Number(num) : num;
  return new Intl.NumberFormat("en-IN").format(numValue);
}

/**
 * Convert any date-like value to a JavaScript Date.
 * Handles: Date objects, bigint (ns), numbers (ms or ns), strings.
 */
function anyToDate(date: bigint | number | string | Date): Date {
  if (date instanceof Date) return date;
  let ms: number;
  if (typeof date === "bigint") {
    const n = Number(date);
    // Nanoseconds if > year 3000 in ms (~32503680000000)
    ms = n > 1e14 ? Math.floor(n / 1_000_000) : n;
  } else if (typeof date === "number") {
    ms = date > 1e14 ? Math.floor(date / 1_000_000) : date;
  } else {
    // string — could be a plain ms number or ISO
    const n = Number(date);
    if (!Number.isNaN(n)) {
      ms = n > 1e14 ? Math.floor(n / 1_000_000) : n;
    } else {
      return new Date(date);
    }
  }
  return new Date(ms);
}

// Date formatter with locale support
export function formatDate(
  date: bigint | number | string | Date,
  locale = "en-IN",
): string {
  try {
    const dateObj = anyToDate(date as any);
    if (Number.isNaN(dateObj.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch {
    return "—";
  }
}

// DateTime formatter with locale support
export function formatDateTime(
  date: bigint | number | string | Date,
  locale = "en-IN",
): string {
  try {
    const dateObj = anyToDate(date as any);
    if (Number.isNaN(dateObj.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch {
    return "—";
  }
}

// Time formatter with locale support
export function formatTime(
  date: bigint | number | string | Date,
  locale = "en-IN",
): string {
  try {
    const dateObj = anyToDate(date as any);
    if (Number.isNaN(dateObj.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(dateObj);
  } catch {
    return "—";
  }
}

// Percentage formatter
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Compact number formatter (e.g., 1.2K, 3.4M)
export function formatCompactNumber(num: number | bigint): string {
  const numValue = typeof num === "bigint" ? Number(num) : num;
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(numValue);
}
