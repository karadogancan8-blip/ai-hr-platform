export const WALL_STORAGE_KEY = "nexus-company-wall";
export const WALL_UPDATED_EVENT = "nexus-company-wall-updated";

export type WallKind = "joined" | "birthday" | "anniversary" | "shoutout" | "badge";

export type WallPost = {
  id: string;
  kind: WallKind;
  name: string;
  message: string;
  badge?: string;
  likes: number;
  createdAt: string;
};

export const WALL_KIND_STYLES: Record<WallKind, string> = {
  joined: "from-sky-100 via-white to-indigo-50 border-sky-100",
  birthday: "from-fuchsia-100 via-white to-rose-50 border-fuchsia-100",
  anniversary: "from-amber-100 via-white to-orange-50 border-amber-100",
  shoutout: "from-emerald-50 via-white to-teal-50 border-emerald-100",
  badge: "from-violet-100 via-white to-indigo-50 border-violet-100",
};

export function defaultWallPosts(): WallPost[] {
  const now = Date.now();
  return [
    {
      id: "wall-join",
      kind: "joined",
      name: "Elif Kaya",
      message: "Product Analyst",
      likes: 12,
      createdAt: new Date(now - 36e5).toISOString(),
    },
    {
      id: "wall-bday",
      kind: "birthday",
      name: "Mert Demir",
      message: "People Ops",
      likes: 24,
      createdAt: new Date(now - 72e5).toISOString(),
    },
    {
      id: "wall-anniv",
      kind: "anniversary",
      name: "Ayşe Yılmaz",
      message: "3",
      likes: 18,
      createdAt: new Date(now - 108e5).toISOString(),
    },
    {
      id: "wall-badge",
      kind: "badge",
      name: "Can Öz",
      message: "Team player",
      badge: "Team player",
      likes: 9,
      createdAt: new Date(now - 144e5).toISOString(),
    },
  ];
}
