export function readSessionList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSessionList<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(items));
  } catch {
    // kota veya gizli mod
  }
}

export function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // kota veya gizli mod
  }
}

export function mergeById<T extends { id: string }>(primary: T[], secondary: T[]) {
  const map = new Map<string, T>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return [...map.values()];
}
