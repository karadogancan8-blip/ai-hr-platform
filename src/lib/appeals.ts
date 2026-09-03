export type AppealStatus = "beklemede" | "onaylandi" | "revize" | "reddedildi";
export type AppealModule = "leave" | "performance" | "onboarding" | "general";

export type EmployeeAppeal = {
  id: string;
  module: AppealModule;
  subjectLabel: string;
  reason: string;
  detail: string;
  status: AppealStatus;
  createdAt: string;
  decidedAt?: string;
};

export const APPEALS_STORAGE_KEY = "nexus-employee-appeals";
export const APPEALS_UPDATED_EVENT = "nexus-appeals-updated";

export function readAppeals(): EmployeeAppeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(APPEALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EmployeeAppeal[]) : [];
  } catch {
    return [];
  }
}

function persist(next: EmployeeAppeal[]) {
  window.sessionStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(APPEALS_UPDATED_EVENT));
}

export function submitAppeal(input: Omit<EmployeeAppeal, "id" | "status" | "createdAt">) {
  const row: EmployeeAppeal = {
    ...input,
    id: crypto.randomUUID(),
    status: "beklemede",
    createdAt: new Date().toISOString(),
  };
  persist([row, ...readAppeals()]);
  return row;
}

export function updateAppealStatus(id: string, status: AppealStatus) {
  const next = readAppeals().map((item) =>
    item.id === id ? { ...item, status, decidedAt: new Date().toISOString() } : item,
  );
  persist(next);
  return next;
}
