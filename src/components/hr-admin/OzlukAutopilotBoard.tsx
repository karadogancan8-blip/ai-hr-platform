"use client";

import { useState } from "react";
import { ArrowLeftRight, Receipt } from "lucide-react";
import { ExpenseDesk } from "@/components/hr-admin/ExpenseDesk";
import { ShiftSwapPanel } from "@/components/hr-admin/ShiftSwapPanel";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { cardSurface } from "@/components/ui/surface";

type OpsTab = "expense" | "swap";

export function OzlukAutopilotBoard() {
  const { t } = useI18n();
  const [tab, setTab] = useState<OpsTab>("expense");

  return (
    <section className={`${cardSurface} min-h-[640px] p-6 transition-none`}>
      <div className="min-h-[4.25rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("ozluk.opsKicker")}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#0b1f3a]">{t("ozluk.opsTitle")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("ozluk.opsLead")}</p>
      </div>

      <div className="mt-5 flex h-12 w-full gap-2 rounded-full border border-slate-200/90 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab("expense")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-none ${
            tab === "expense" ? "bg-white text-[#0b1f3a] shadow-[0_4px_16px_rgba(15,37,64,0.08)]" : "text-slate-500"
          }`}
        >
          <Receipt className="h-4 w-4" />
          {t("ozluk.tab.expense")}
        </button>
        <button
          type="button"
          onClick={() => setTab("swap")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-none ${
            tab === "swap" ? "bg-white text-[#0b1f3a] shadow-[0_4px_16px_rgba(15,37,64,0.08)]" : "text-slate-500"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {t("ozluk.tab.swap")}
        </button>
      </div>

      <div className="mt-5 min-h-[520px]">
        <div hidden={tab !== "expense"} className="min-h-[520px] border-l-4 border-amber-300 pl-4">
          {tab === "expense" ? <ExpenseDesk /> : null}
        </div>
        <div hidden={tab !== "swap"} className="min-h-[520px] border-l-4 border-indigo-300 pl-4">
          {tab === "swap" ? <ShiftSwapPanel /> : null}
        </div>
      </div>
    </section>
  );
}
