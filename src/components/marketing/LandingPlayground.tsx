"use client";

import { useState } from "react";
import { Briefcase, ClipboardList, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { btnPrimary, cardSurfaceFlush } from "@/components/ui/surface";
import type { MessageKey } from "@/lib/i18n";

type PlayTab = "recruit" | "leave" | "perf";

const TABS: { id: PlayTab; icon: typeof Briefcase; labelKey: MessageKey; promptKey: MessageKey; resultKey: MessageKey }[] = [
  { id: "recruit", icon: Briefcase, labelKey: "landing.play.tab.recruit", promptKey: "landing.play.prompt.recruit", resultKey: "landing.play.result.recruit" },
  { id: "leave", icon: ClipboardList, labelKey: "landing.play.tab.leave", promptKey: "landing.play.prompt.leave", resultKey: "landing.play.result.leave" },
  { id: "perf", icon: TrendingUp, labelKey: "landing.play.tab.perf", promptKey: "landing.play.prompt.perf", resultKey: "landing.play.result.perf" },
];

export function LandingPlayground() {
  const { t } = useI18n();
  const [tab, setTab] = useState<PlayTab>("recruit");
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState<PlayTab | null>(null);

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  function run() {
    setRunning(true);
    setShown(null);
    window.setTimeout(() => {
      setShown(tab);
      setRunning(false);
    }, 700);
  }

  return (
    <section id="playground" className={`${cardSurfaceFlush} grid min-h-[32rem] overflow-hidden lg:grid-cols-12`}>
      <div className="flex min-h-[32rem] flex-col border-b border-slate-100 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-e">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{t("landing.playKicker")}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0b1f3a] sm:text-2xl">{t("landing.playTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t("landing.playLead")}</p>

        <div className="mt-6 flex h-12 w-full gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1">
          {TABS.map((item) => {
            const Icon = item.icon;
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setShown(null);
                }}
                className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full px-2 text-xs font-medium transition-none sm:text-sm ${
                  selected ? "bg-white text-[#0b1f3a] shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 min-h-[7.5rem] rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
          {t(active.promptKey)}
        </div>

        <button
          type="button"
          onClick={run}
          disabled={running}
          className={`mt-5 h-11 w-full ${btnPrimary}`}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {running ? t("landing.play.thinking") : t("landing.play.run")}
        </button>
      </div>

      <div className="flex min-h-[32rem] flex-col bg-[#f8fafc] p-6 sm:p-8 lg:col-span-7">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("landing.play.output")}</p>
        <div className="mt-3 min-h-[22rem] flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {running ? (
            <p className="text-sm text-slate-500">{t("landing.play.thinking")}</p>
          ) : shown ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{t(active.resultKey)}</p>
          ) : (
            <p className="text-sm leading-7 text-slate-500">{t("landing.play.idle")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
