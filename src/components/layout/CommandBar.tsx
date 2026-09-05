"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { COMMAND_ITEMS, COMMAND_OPEN_EVENT, type CommandItem } from "@/lib/command-bar";
import { readLeaveCache } from "@/lib/leave-requests";
import { defaultWallPosts, WALL_STORAGE_KEY } from "@/lib/company-wall";
import { readLocalJson } from "@/lib/session-store";
import type { WallPost } from "@/lib/company-wall";
import type { MessageKey } from "@/lib/i18n";

function peopleHits(query: string) {
  const names = new Set<string>();
  for (const row of readLeaveCache()) names.add(row.employee);
  const wall = readLocalJson<WallPost[]>(WALL_STORAGE_KEY, defaultWallPosts());
  for (const post of wall) names.add(post.name);
  const q = query.toLocaleLowerCase("tr");
  return [...names]
    .filter((name) => name && name.toLocaleLowerCase("tr").includes(q))
    .slice(0, 6)
    .map(
      (name): CommandItem => ({
        id: `p-${name}`,
        href: `/izin?employee=${encodeURIComponent(name)}`,
        titleKey: "leave.employee",
        hintKey: "cmd.hint.person",
        group: "people",
        keywords: name,
      }),
    );
}

export function CommandBar() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActive(0);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    function onOpen() {
      setOpen(true);
      setQuery("");
      setActive(0);
    }
    window.addEventListener(COMMAND_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_OPEN_EVENT, onOpen);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    const modules = COMMAND_ITEMS.filter((item) => {
      if (!q) return true;
      const blob = `${t(item.titleKey)} ${t(item.hintKey)} ${item.keywords}`.toLocaleLowerCase("tr");
      return blob.includes(q);
    });
    const people = q.length >= 2 ? peopleHits(q) : [];
    return [...modules, ...people];
  }, [query, t]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  function go(item: CommandItem) {
    setOpen(false);
    router.push(item.href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-[2px]">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={() => setOpen(false)} />
      <div
        role="dialog"
        className="relative flex min-h-[22rem] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
      >
        <div className="flex h-14 items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              }
              if (event.key === "Enter" && results[active]) go(results[active]);
            }}
            placeholder={t("cmd.placeholder")}
            className="h-10 w-full bg-transparent text-sm outline-none"
          />
          <kbd className="hidden rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline">
            ESC
          </kbd>
        </div>
        <ul className="min-h-[16rem] flex-1 space-y-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-slate-400">{t("cmd.empty")}</li>
          ) : (
            results.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-2.5 text-left text-sm ${
                    index === active ? "bg-[#123056] text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 truncate font-medium">
                    {item.group === "people" ? item.keywords : t(item.titleKey)}
                  </span>
                  <span className={`ms-3 shrink-0 text-[11px] ${index === active ? "text-sky-100" : "text-slate-400"}`}>
                    {item.group === "people" ? t("cmd.group.people") : t(`cmd.group.${item.group}` as MessageKey)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
