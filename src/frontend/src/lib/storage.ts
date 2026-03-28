/**
 * Safe localStorage utilities that handle BigInt serialization/deserialization.
 * BigInt values are stored as strings with a "__bigint__:" prefix.
 */

const BIGINT_PREFIX = "__bigint__:";

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return `${BIGINT_PREFIX}${value.toString()}`;
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(BIGINT_PREFIX)) {
    return BigInt(value.slice(BIGINT_PREFIX.length));
  }
  return value;
}

export function safeStringify(data: unknown): string {
  return JSON.stringify(data, replacer);
}

export function safeParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str, reviver) as T;
  } catch {
    return null;
  }
}

export function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = safeParse<T[]>(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function lsGetOne<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return safeParse<T>(raw);
  } catch {
    return null;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, safeStringify(value));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

/** Generate a stable string ID based on current timestamp + random suffix */
export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Safely convert any ID value to string for comparison */
export function idStr(id: unknown): string {
  if (id === null || id === undefined) return "";
  if (typeof id === "bigint") return id.toString();
  return String(id);
}
