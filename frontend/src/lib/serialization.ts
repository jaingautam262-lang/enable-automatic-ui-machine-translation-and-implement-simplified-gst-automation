/**
 * Serialization utilities for safe JSON handling of BigInt and numeric types
 * Converts Motoko numeric types (Nat, Int, Time.Time) to JSON-safe formats
 */

/**
 * Convert BigInt to string for JSON serialization
 */
export function bigIntToString(value: bigint): string {
  return value.toString();
}

/**
 * Parse string back to BigInt
 */
export function stringToBigInt(value: string): bigint {
  return BigInt(value);
}

/**
 * Convert BigInt to number (use with caution for large values)
 */
export function bigIntToNumber(value: bigint): number {
  return Number(value);
}

/**
 * Safely convert any numeric value to number for calculations
 */
export function toNumber(value: bigint | number | string): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string') {
    return parseFloat(value);
  }
  return value;
}

/**
 * Convert Time.Time (nanoseconds as BigInt) to JavaScript Date
 */
export function timeToDate(time: bigint): Date {
  // Time.Time is in nanoseconds, convert to milliseconds
  return new Date(Number(time) / 1000000);
}

/**
 * Convert JavaScript Date to Time.Time (nanoseconds as BigInt)
 */
export function dateToTime(date: Date): bigint {
  return BigInt(date.getTime() * 1000000);
}

/**
 * Serialize object with BigInt values to JSON-safe format
 */
export function serializeWithBigInt<T>(obj: T): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
}

/**
 * Deserialize JSON with string numbers back to BigInt where needed
 */
export function deserializeWithBigInt<T>(obj: any, bigIntFields: string[]): T {
  const result = { ...obj };
  
  for (const field of bigIntFields) {
    if (result[field] !== undefined && result[field] !== null) {
      if (typeof result[field] === 'string') {
        result[field] = BigInt(result[field]);
      }
    }
  }
  
  return result as T;
}

/**
 * Custom JSON replacer for BigInt serialization
 */
export const bigIntReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

/**
 * Custom JSON reviver for BigInt deserialization
 */
export const bigIntReviver = (bigIntFields: Set<string>) => {
  return (key: string, value: any) => {
    if (bigIntFields.has(key) && typeof value === 'string' && /^\d+$/.test(value)) {
      return BigInt(value);
    }
    return value;
  };
};

/**
 * Safe localStorage operations with BigInt support
 */
export const safeLocalStorage = {
  setItem: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value, bigIntReplacer);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  },

  getItem: <T>(key: string, bigIntFields: string[] = []): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Convert specified fields back to BigInt
      if (bigIntFields.length > 0 && Array.isArray(parsed)) {
        return parsed.map(obj => deserializeWithBigInt(obj, bigIntFields)) as T;
      } else if (bigIntFields.length > 0) {
        return deserializeWithBigInt(parsed, bigIntFields);
      }
      
      return parsed as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },
};

/**
 * Format BigInt as string for display
 */
export function formatBigInt(value: bigint, decimals: number = 0): string {
  const num = Number(value);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
