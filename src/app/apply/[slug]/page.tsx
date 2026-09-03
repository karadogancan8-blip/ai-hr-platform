"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { sanitizeCvText } from "@/lib/cv-text";
import { readPublicApplications, writePublicApplications } from "@/lib/public-applications";

export default function PublicApplyPage() {
  const { t } = useI18n();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "company";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [cvText, setCvText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function ingestPdf(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/parse-pdf", { method: "POST", body: form });
    const payload = (await response.json()) as { text?: string };
    const text = sanitizeCvText(payload.text ?? "");
    if (text.length < 20) throw new Error(t("recruit.pdfFail"));
    setCvText(text);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || cvText.trim().length < 40) {
      setError(t("apply.invalid"));
      return;
    }
    setPending(true);
    setError("");
    try {
      const row = {
        id: crypto.randomUUID(),
        slug,
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || "Aday",
        cvText,
        createdAt: new Date().toISOString(),
      };
      const existing = readPublicApplications();
      writePublicApplications([row, ...existing]);
      setNotice(t("apply.sent"));
      setName("");
      setEmail("");
      setCvText("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f8fc]">
      <header className="h-16 shrink-0 border-b border-sky-100 bg-white">
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4">
          <span className="text-sm font-semibold text-[#0b1f3a]">Nexus HR</span>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#0b1f3a]">{t("apply.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("apply.lead")}</p>
        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4 rounded-2xl border border-sky-100 bg-white p-6">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("apply.name")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("apply.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("apply.role")}</span>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("recruit.cv")}</span>
            <textarea
              value={cvText}
              onChange={(event) => setCvText(event.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="inline-flex cursor-pointer rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium">
            PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void ingestPdf(file).catch((err) => setError(err instanceof Error ? err.message : t("recruit.pdfFail")));
              }}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {t("apply.submit")}
          </button>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-800">{notice}</p> : null}
        </form>
      </main>
      <footer className="border-t border-sky-100 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-2xl justify-end">
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
