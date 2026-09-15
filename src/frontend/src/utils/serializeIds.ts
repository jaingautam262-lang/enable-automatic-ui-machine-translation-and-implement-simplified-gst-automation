export function idToString(id: number | bigint | string | undefined): string | undefined {
  if (id === undefined || id === null) return undefined;
  if (typeof id === 'string') return id;
  return String(id);
}
