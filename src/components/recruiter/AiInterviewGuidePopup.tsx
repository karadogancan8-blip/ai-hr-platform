"use client";

import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import type { InterviewGuide } from "@/lib/interview";
import type { StoredResume } from "@/lib/resumes";
import { btnPrimary } from "@/components/ui/surface";

type AiInterviewGuidePopupProps = {
  open: boolean;
  resume: StoredResume | null;
  guide: InterviewGuide | null;
  loading: boolean;
  error: string;
  onClose: () => void;
};

export function AiInterviewGuidePopup({ open, resume, guide, loading, error, onClose }: AiInterviewGuidePopupProps) {
  const { t } = useI18n();
  if (!open || !resume) return null;
  const questions = (guide?.technicalQuestions ?? []).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={onClose} />
      <div className="relative flex max-h-[88vh] min-h-[28rem] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{t("recruit.qsTitle")}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {t("recruit.qsLead", { name: resume.name, role: resume.role })}
        </p>
        <div className="mt-4 min-h-[18rem] flex-1 overflow-y-auto">
          {loading ? (
            <p className="flex min-h-[18rem] items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("recruit.qsLoading")}
            </p>
          ) : null}
          {error ? <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
          {!loading && questions.length ? (
            <ol className="space-y-3">
              {questions.map((item, index) => (
                <li key={item.id} className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                    {t("recruit.qsItem", { n: index + 1 })}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{item.question}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    <span className="font-semibold text-slate-600">{t("recruit.qsCriteria")}: </span>
                    {item.expectedAnswer}
                  </p>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        <AiDisclaimer className="mt-3" />
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className={`h-10 ${btnPrimary}`}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
