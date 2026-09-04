"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Sparkles, X } from "lucide-react";
import { HelpTitle } from "@/components/ui/HelpTip";
import { SelectField } from "@/components/ui/SelectField";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { isKnowledgeEditor } from "@/lib/access-control";
import type { MessageKey } from "@/lib/i18n";
import {
  KB_DEPARTMENTS,
  SECTORS,
  canSeeKnowledgeDoc,
  loadKnowledgeDocs,
  persistKnowledgeDocs,
  sectorKnowledgePack,
  type KbDepartment,
  type KbTab,
  type KnowledgeDoc,
} from "@/lib/knowledge-base";

export function KnowledgeWorkspace() {
  const { t, locale } = useI18n();
  const { role } = useAccessControl();
  const branding = useCompanyBranding();
  const editor = isKnowledgeEditor(role);
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [tab, setTab] = useState<KbTab>("all");
  const [department, setDepartment] = useState<KbDepartment>("general");
  const [sector, setSector] = useState<(typeof SECTORS)[number]>("Teknoloji");
  const [selected, setSelected] = useState<KnowledgeDoc | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [composer, setComposer] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftTab, setDraftTab] = useState<Exclude<KbTab, "all">>("guides");
  const [notice, setNotice] = useState("");

  const tabs: { id: KbTab; label: string }[] = [
    { id: "all", label: t("kb.tab.all") },
    { id: "hr", label: t("kb.tab.hr") },
    { id: "guides", label: t("kb.tab.guides") },
    { id: "templates", label: t("kb.tab.templates") },
  ];

  useEffect(() => {
    setDocs(loadKnowledgeDocs());
  }, []);

  const visible = useMemo(() => {
    const allowed = docs.filter((doc) => canSeeKnowledgeDoc(editor, doc) && doc.department === department);
    if (tab === "all") return allowed;
    if (!editor && (tab === "hr" || tab === "templates")) {
      return allowed.filter((doc) => doc.tab === "guides");
    }
    return allowed.filter((doc) => doc.tab === tab);
  }, [docs, editor, tab, department]);

  function remember(next: KnowledgeDoc[]) {
    setDocs(next);
    persistKnowledgeDocs(next);
  }

  function generateSectorPack() {
    const pack = sectorKnowledgePack(sector, branding.companyName);
    remember([...pack, ...docs.filter((doc) => !pack.some((item) => item.title === doc.title))]);
    setNotice(t("kb.packNotice", { sector }));
  }

  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!draftTitle.trim() || !draftBody.trim()) return;
    const existing = docs.find((item) => item.title === draftTitle.trim());
    const doc: KnowledgeDoc = {
      id: existing?.id ?? crypto.randomUUID(),
      title: draftTitle.trim(),
      summary: draftBody.trim().slice(0, 120),
      body: draftBody.trim(),
      tab: draftTab,
      audience: existing?.audience ?? (draftTab === "guides" ? "employee" : "hr_only"),
      department: existing?.department ?? department,
      tags: existing?.tags ?? [],
      custom: true,
    };
    remember([doc, ...docs.filter((item) => item.id !== doc.id)]);
    setComposer(false);
    setDraftTitle("");
    setDraftBody("");
    setNotice(t("kb.saved"));
  }

  async function ask(event?: FormEvent) {
    event?.preventDefault();
    if (!selected || !question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/knowledge-base/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          title: selected.title,
          document: selected.body,
          locale,
          department,
        }),
      });
      const raw = await response.text();
      let reply = "";
      try {
        const payload = JSON.parse(raw) as { reply?: string };
        reply = payload.reply?.trim() || "";
      } catch {
        reply = "";
      }
      setAnswer(reply || t("kb.noReply"));
    } catch {
      setAnswer(t("kb.offline"));
    } finally {
      setAsking(false);
    }
  }

  useEffect(() => {
    if (!selected || !question.trim() || !answer) return;
    void ask();
    // Re-run last knowledge answer in the newly selected language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const employeeTabs = tabs.filter((item) => item.id === "all" || item.id === "guides");
  const shownTabs = editor ? tabs : employeeTabs;

  function badge(doc: KnowledgeDoc) {
    if (doc.tab === "hr") return t("kb.badge.hr");
    if (doc.tab === "templates") return t("kb.badge.template");
    return t("kb.badge.guide");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("kb.kicker")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
            <HelpTitle hint={t("kb.hint")}>{t("kb.title")}</HelpTitle>
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("kb.description")}</p>
        </div>
        {editor ? (
          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              value={sector}
              onChange={(event) => setSector(event.target.value as (typeof SECTORS)[number])}
              wrapperClassName="min-w-[11rem]"
            >
              {SECTORS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
            <button
              type="button"
              onClick={generateSectorPack}
              className="inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              <Sparkles className="h-4 w-4" />
              {t("kb.sectorPack")}
            </button>
            <button
              type="button"
              onClick={() => setComposer(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              {t("kb.newDoc")}
            </button>
          </div>
        ) : null}
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">{t("kb.dept")}</span>
        {KB_DEPARTMENTS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setDepartment(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              department === id ? "bg-[#123056] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t(`kb.dept.${id}` as MessageKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {shownTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === item.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((doc) => (
          <button
            type="button"
            key={doc.id}
            onClick={() => {
              setSelected(doc);
              setQuestion("");
              setAnswer("");
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-start hover:border-slate-300"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <BookOpen className="h-3.5 w-3.5" />
              {badge(doc)}
            </span>
            <h2 className="mt-2 text-base font-semibold text-slate-900">{doc.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{doc.summary}</p>
            {doc.generated ? (
              <span className="mt-3 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                {t("kb.aiSet")}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {!visible.length ? <p className="text-sm text-slate-400">{t("kb.empty")}</p> : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={() => setSelected(null)} />
          <article
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfaf6] shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t("kb.doc")}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{selected.title}</h2>
              </div>
              <div className="flex items-center gap-1">
                {editor ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftTitle(selected.title);
                      setDraftBody(selected.body);
                      setDraftTab(selected.tab);
                      setComposer(true);
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-50"
                  >
                    {t("kb.edit")}
                  </button>
                ) : null}
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label={t("common.close")}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mx-auto max-w-prose whitespace-pre-wrap font-serif text-[15px] leading-7 text-slate-800">
                {selected.body}
              </div>
              <AiDisclaimer className="mt-6" />
            </div>
            <form onSubmit={(event) => void ask(event)} className="border-t border-slate-200 bg-white p-4">
              <label className="block text-xs font-medium text-slate-600">{t("kb.ask")}</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={t("kb.askPlaceholder")}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={asking}
                  className="rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {asking ? t("kb.asking") : t("kb.askBtn")}
                </button>
              </div>
              {answer ? <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{answer}</p> : null}
            </form>
          </article>
        </div>
      ) : null}

      {composer && editor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
          <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={() => setComposer(false)} />
          <form onSubmit={saveDraft} className="relative w-full max-w-lg space-y-3 rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">{t("kb.composer")}</h3>
            <input
              required
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder={t("kb.titlePh")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <SelectField
              value={draftTab}
              onChange={(event) => setDraftTab(event.target.value as Exclude<KbTab, "all">)}
            >
              <option value="guides">{t("kb.tab.guides")}</option>
              <option value="hr">{t("kb.tab.hr")}</option>
              <option value="templates">{t("kb.tab.templates")}</option>
            </SelectField>
            <textarea
              required
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              rows={8}
              placeholder={t("kb.bodyPh")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <button type="submit" className="w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white">
              {t("kb.save")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
