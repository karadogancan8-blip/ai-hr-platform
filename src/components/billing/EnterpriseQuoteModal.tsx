"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";

const HEADCOUNT = ["1–50", "51–250", "251–1000", "1000+"] as const;

type EnterpriseQuoteModalProps = {
  open: boolean;
  onClose: () => void;
};

export function EnterpriseQuoteModal({ open, onClose }: EnterpriseQuoteModalProps) {
  const { t } = useI18n();
  const [companyTitle, setCompanyTitle] = useState("");
  const [headcount, setHeadcount] = useState<(typeof HEADCOUNT)[number]>("251–1000");
  const [needs, setNeeds] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompanyTitle("");
    setHeadcount("251–1000");
    setNeeds("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setPending(false);
    setSent(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!companyTitle.trim() || !contactName.trim() || !contactEmail.trim()) return;
    setPending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setPending(false);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={onClose} disabled={pending} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("quote.kicker")}</p>
            <h2 id="quote-title" className="mt-1 text-lg font-semibold text-slate-900">
              {t("quote.title")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{t("quote.lead")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm text-emerald-900">
            {t("quote.sent", { email: contactEmail })}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 block w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white"
            >
              {t("common.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("quote.companyTitle")}</span>
              <input
                required
                value={companyTitle}
                onChange={(event) => setCompanyTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t("quote.companyPh")}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("quote.headcount")}</span>
              <SelectField
                value={headcount}
                onChange={(event) => setHeadcount(event.target.value as (typeof HEADCOUNT)[number])}
              >
                {HEADCOUNT.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("quote.needs")}</span>
              <textarea
                required
                value={needs}
                onChange={(event) => setNeeds(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t("quote.needsPh")}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">{t("quote.contactName")}</span>
                <input
                  required
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("quote.contactNamePh")}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">{t("quote.phone")}</span>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t("quote.phonePh")}
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("quote.email")}</span>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t("quote.emailPh")}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              {pending ? t("quote.sending") : t("quote.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
