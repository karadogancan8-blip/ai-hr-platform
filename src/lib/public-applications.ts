export const PUBLIC_APPLICATIONS_KEY = "nexus-public-applications";

export type PublicApplication = {
  id: string;
  slug: string;
  name: string;
  email: string;
  role: string;
  cvText: string;
  createdAt: string;
};

export function readPublicApplications(): PublicApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PUBLIC_APPLICATIONS_KEY);
    return raw ? (JSON.parse(raw) as PublicApplication[]) : [];
  } catch {
    return [];
  }
}

export function writePublicApplications(rows: PublicApplication[]) {
  window.localStorage.setItem(PUBLIC_APPLICATIONS_KEY, JSON.stringify(rows));
}

export function applicationsForSlug(slug: string) {
  return readPublicApplications().filter((row) => row.slug === slug);
}

export function takePublicApplication(id: string) {
  const next = readPublicApplications().filter((row) => row.id !== id);
  writePublicApplications(next);
  return next;
}
