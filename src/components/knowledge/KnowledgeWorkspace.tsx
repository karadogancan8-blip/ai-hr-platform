"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Sparkles, X } from "lucide-react";
import { HelpTitle } from "@/components/ui/HelpTip";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { isKnowledgeEditor } from "@/lib/access-control";
import {
  SECTORS,
  canSeeKnowledgeDoc,
  loadKnowledgeDocs,
  persistKnowledgeDocs,
  sectorKnowledgePack,
  type KbTab,
  type KnowledgeDoc,
} from "@/lib/knowledge-base";

const TABS: { id: KbTab; label: string }[] = [
  { id: "all", label: "Tüm Dökümanlar" },
  { id: "hr", label: "İK & Yönetim" },
  { id: "guides", label: "Çalışan Rehberleri" },
  { id: "templates", label: "Şablonlar & Formlar" },
];

export function KnowledgeWorkspace() {
  const { role } = useAccessControl();
  const branding = useCompanyBranding();
  const editor = isKnowledgeEditor(role);
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [tab, setTab] = useState<KbTab>("all");
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

  useEffect(() => {
    setDocs(loadKnowledgeDocs());
  }, []);

  const visible = useMemo(() => {
    const allowed = docs.filter((doc) => canSeeKnowledgeDoc(editor, doc));
    if (tab === "all") return allowed;
    if (!editor && (tab === "hr" || tab === "templates")) {
      return allowed.filter((doc) => doc.tab === "guides");
    }
    return allowed.filter((doc) => doc.tab === tab);
  }, [docs, editor, tab]);

  function remember(next: KnowledgeDoc[]) {
    setDocs(next);
    persistKnowledgeDocs(next);
  }

  function generateSectorPack() {
    const pack = sectorKnowledgePack(sector, branding.companyName);
    remember([...pack, ...docs.filter((doc) => !pack.some((item) => item.title === doc.title))]);
    setNotice(`${sector} sektörüne özel örnek politika ve rehberler yüklendi.`);
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
      tags: existing?.tags ?? [],
      custom: true,
    };
    remember([doc, ...docs.filter((item) => item.id !== doc.id)]);
    setComposer(false);
    setDraftTitle("");
    setDraftBody("");
    setNotice("Döküman bilgi üssüne eklendi.");
  }

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!selected || !question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/knowledge-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          title: selected.title,
          document: selected.body,
        }),
      });
      const payload = (await response.json()) as { reply?: string };
      setAnswer(payload.reply || "Yanıt üretilemedi.");
    } catch {
      setAnswer("Bağlantı kurulamadı. Belge özetini okuyarak ilerleyin.");
    } finally {
      setAsking(false);
    }
  }

  const employeeTabs = TABS.filter((item) => item.id === "all" || item.id === "guides");
  const tabs = editor ? TABS : employeeTabs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Knowledge Base</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
            <HelpTitle hint="Şirket politikaları, rehberler ve İK şablonları. Çalışanlar yalnızca açık kartları görür.">
              📚 Bilgi Üssü & Dökümanlar
            </HelpTitle>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {editor
              ? "İK ve yöneticiler tüm mevzuat, şablon ve rehberleri görür, ekler ve düzenler."
              : "Size açık çalışan rehberi, görev tanımları ve şirket politikalarını okuyabilirsiniz."}
          </p>
        </div>
        {editor ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sector}
              onChange={(event) => setSector(event.target.value as (typeof SECTORS)[number])}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {SECTORS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generateSectorPack}
              className="inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              <Sparkles className="h-4 w-4" />
              ✨ Sektöre Özel Döküman Seti Oluştur
            </button>
            <button
              type="button"
              onClick={() => setComposer(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Yeni döküman
            </button>
          </div>
        ) : null}
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
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
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-slate-300"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <BookOpen className="h-3.5 w-3.5" />
              {doc.tab === "hr" ? "İK & Yönetim" : doc.tab === "templates" ? "Şablon" : "Rehber"}
            </span>
            <h2 className="mt-2 text-base font-semibold text-slate-900">{doc.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{doc.summary}</p>
            {doc.generated ? (
              <span className="mt-3 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                Sektörel AI seti
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {!visible.length ? <p className="text-sm text-slate-400">Bu sekmede görüntülenecek döküman yok.</p> : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={() => setSelected(null)} />
          <article
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#fbfaf6] shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Döküman</p>
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
                    Düzenle
                  </button>
                ) : null}
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label="Kapat">
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
            <form onSubmit={ask} className="border-t border-slate-200 bg-white p-4">
              <label className="block text-xs font-medium text-slate-600">AI’ya bu dökümanla ilgili soru sor</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Bu belgede izin süresi nasıl yazıyor?"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={asking}
                  className="rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {asking ? "…" : "Sor"}
                </button>
              </div>
              {answer ? <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{answer}</p> : null}
            </form>
          </article>
        </div>
      ) : null}

      {composer && editor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
          <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={() => setComposer(false)} />
          <form
            onSubmit={saveDraft}
            className="relative w-full max-w-lg space-y-3 rounded-3xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900">Yeni döküman</h3>
            <input
              required
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Başlık"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <select
              value={draftTab}
              onChange={(event) => setDraftTab(event.target.value as Exclude<KbTab, "all">)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="guides">Çalışan Rehberleri</option>
              <option value="hr">İK & Yönetim</option>
              <option value="templates">Şablonlar & Formlar</option>
            </select>
            <textarea
              required
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              rows={8}
              placeholder="Metin"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <button type="submit" className="w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white">
              Kaydet
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
