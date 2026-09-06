export function omitPayloadKey<T extends object>(payload: T, column: string): T {
  if (!(column in payload)) return payload;
  const next = { ...payload };
  delete next[column as keyof T];
  return next;
}
