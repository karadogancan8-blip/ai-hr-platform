"use client";

import { FormEvent, useEffect, useState } from "react";
import { Award, Cake, HeartHandshake, PartyPopper, Sparkles, UserPlus } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { HelpTitle } from "@/components/ui/HelpTip";
import { btnPrimary, cardSurface, moduleStripe, pageKicker, pageLead, pageTitle } from "@/components/ui/surface";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  WALL_KIND_STYLES,
  WALL_STORAGE_KEY,
  WALL_UPDATED_EVENT,
  defaultWallPosts,
  type WallKind,
  type WallPost,
} from "@/lib/company-wall";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import type { MessageKey } from "@/lib/i18n";

const kindIcon: Record<WallKind, typeof Cake> = {
  joined: UserPlus,
  birthday: Cake,
  anniversary: PartyPopper,
  shoutout: HeartHandshake,
  badge: Award,
};

function persist(posts: WallPost[]) {
  writeLocalJson(WALL_STORAGE_KEY, posts);
  window.dispatchEvent(new Event(WALL_UPDATED_EVENT));
}

function loadPosts() {
  const stored = readLocalJson<WallPost[]>(WALL_STORAGE_KEY, []);
  if (stored.length) return stored;
  const seed = defaultWallPosts();
  writeLocalJson(WALL_STORAGE_KEY, seed);
  return seed;
}

type CompanyWallProps = {
  variant?: "page" | "compact";
};

export function CompanyWall({ variant = "compact" }: CompanyWallProps) {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<WallKind>("shoutout");

  useEffect(() => {
    function refresh() {
      setPosts(loadPosts());
    }
    refresh();
    window.addEventListener(WALL_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(WALL_UPDATED_EVENT, refresh);
  }, []);

  function clap(id: string) {
    const next = posts.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item));
    setPosts(next);
    persist(next);
  }

  function publish(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const post: WallPost = {
      id: crypto.randomUUID(),
      kind,
      name: name.trim(),
      message: message.trim(),
      badge: kind === "badge" ? message.trim() : undefined,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const next = [post, ...posts];
    setPosts(next);
    persist(next);
    setName("");
    setMessage("");
  }

  const visible = variant === "compact" ? posts.slice(0, 4) : posts;

  return (
    <section className={`${cardSurface} ${moduleStripe.ops} min-h-[22rem] w-full transition-none`}>
      <div className="flex min-h-[3.5rem] items-start justify-between gap-3">
        <div className="min-w-0">
          {variant === "page" ? (
            <>
              <p className={`${pageKicker} text-amber-700`}>{t("wall.kicker")}</p>
              <h1 className={pageTitle}>
                <HelpTitle hint={t("wall.hint")}>{t("wall.title")}</HelpTitle>
              </h1>
            </>
          ) : (
            <h2 className="text-lg font-bold text-slate-900">{t("wall.title")}</h2>
          )}
          <p className={pageLead}>{t("wall.lead")}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-amber-800">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>

      {hrDesk && variant === "page" ? (
        <form onSubmit={publish} className="mt-4 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 md:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("wall.person")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("wall.kind")}</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as WallKind)}
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              {(["shoutout", "badge", "joined", "birthday", "anniversary"] as WallKind[]).map((item) => (
                <option key={item} value={item}>
                  {t(`wall.kind.${item}` as MessageKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">{t("wall.message")}</span>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <div className="md:col-span-4">
            <button
              type="submit"
              className={btnPrimary}
            >
              {t("wall.publish")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 grid min-h-[16rem] gap-3 md:grid-cols-2">
        {visible.map((post) => {
          const Icon = kindIcon[post.kind];
          return (
            <article
              key={post.id}
              className={`flex min-h-[8.5rem] flex-col rounded-3xl border bg-gradient-to-br p-4 ${WALL_KIND_STYLES[post.kind]}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#123056] shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {t(`wall.kind.${post.kind}` as MessageKey)}
                  </p>
                  <p className="truncate text-sm font-semibold text-[#0b1f3a]">{post.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                    {post.kind === "joined"
                      ? t("wall.copy.joined", { name: post.name, role: post.message })
                      : post.kind === "birthday"
                        ? t("wall.copy.birthday", { name: post.name })
                        : post.kind === "anniversary"
                          ? t("wall.copy.anniversary", { name: post.name, years: post.message })
                          : post.kind === "badge"
                            ? t("wall.copy.badge", { name: post.name, badge: post.badge || post.message })
                            : t("wall.copy.shoutout", { name: post.name, message: post.message })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => clap(post.id)}
                className="mt-auto inline-flex h-9 w-fit items-center rounded-full bg-white/80 px-3 text-xs font-medium text-slate-700"
              >
                {t("wall.clap")} · {post.likes}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
