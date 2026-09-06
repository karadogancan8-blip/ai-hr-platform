"use client";

import { useState } from "react";
import { ArrowLeftRight, Receipt } from "lucide-react";
import { ExpenseDesk } from "@/components/hr-admin/ExpenseDesk";
import { ShiftSwapPanel } from "@/components/hr-admin/ShiftSwapPanel";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { cardSurface, cardTitle, moduleStripe, moduleTone, tabPaneMin } from "@/components/ui/surface";

type OpsTab = "expense" | "swap";

export function OzlukAutopilotBoard() {
  const { t } = useI18n();
  const [tab, setTab] = useState<OpsTab>("expense");

  return (
    <section className={`${cardSurface} ${moduleStripe.ops} min-h-[640px] transition-none`}>
      <div className="min-h-[4.25rem]">
        <p className={`text-xs font-medium uppercase tracking-wide ${moduleTone.ops.kicker}`}>{t("ozluk.opsKicker")}</p>
        <h2 className={cardTitle}>
          <span>{t("ozluk.opsTitle")}</span>
          <span className={moduleTone.ops.badge}>{t("ozluk.tab.expense")}</span>
        </h2>
        <p className="-mt-2 mb-4 text-sm leading-6 text-slate-700">{t("ozluk.opsLead")}</p>
      </div>

      <div className="mt-5 flex h-12 w-full gap-2 rounded-full border border-slate-200/90 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab("expense")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-none ${
            tab === "expense" ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          <Receipt className="h-4 w-4" />
          {t("ozluk.tab.expense")}
        </button>
        <button
          type="button"
          onClick={() => setTab("swap")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-none ${
            tab === "swap" ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {t("ozluk.tab.swap")}
        </button>
      </div>

      <div className={`mt-5 ${tabPaneMin}`}>
        <div hidden={tab !== "expense"} className={`${tabPaneMin} border-l-4 border-l-amber-500 pl-4`}>
          {tab === "expense" ? <ExpenseDesk /> : null}
        </div>
        <div hidden={tab !== "swap"} className={`${tabPaneMin} border-l-4 border-l-amber-500 pl-4`}>
          {tab === "swap" ? <ShiftSwapPanel /> : null}
        </div>
      </div>
    </section>
  );
}
