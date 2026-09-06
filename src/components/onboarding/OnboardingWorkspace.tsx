"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { IconSend } from "@/components/icons";
import {
  fetchOnboardingPlans,
  updateOnboardingTasks,
  type StoredOnboardingPlan,
} from "@/lib/onboarding";
import { DEMO_ONBOARDING_KEY, DEMO_SEEDED_EVENT } from "@/lib/seed-data";
import { mergeById, readSessionList, writeSessionList } from "@/lib/session-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HelpTip, HelpTitle } from "@/components/ui/HelpTip";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ItProvisioningList } from "@/components/onboarding/ItProvisioningList";
import { btnPrimary, cardSurface, cardSurfaceFlush, cardTitle, fieldLabel, moduleStripe, pageKicker, pageLead, pageTitle } from "@/components/ui/surface";

const SESSION_KEY = DEMO_ONBOARDING_KEY;

export function OnboardingWorkspace() {
  const { t, locale } = useI18n();
  const [plans, setPlans] = useState<StoredOnboardingPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("Ürün Analisti");
  const [department, setDepartment] = useState("Ürün");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatPending, setChatPending] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function remember(next: StoredOnboardingPlan[]) {
    setPlans(next);
    writeSessionList(SESSION_KEY, next);
  }

  const selected = useMemo(
    () => plans.find((item) => item.id === selectedId) ?? plans[0] ?? null,
    [plans, selectedId],
  );

  const progress = selected
    ? Math.round((selected.tasks.filter((task) => task.done).length / Math.max(selected.tasks.length, 1)) * 100)
    : 0;

  async function load() {
    const session = readSessionList<StoredOnboardingPlan>(SESSION_KEY);
    if (session.length) {
      setPlans(session);
      setSelectedId(session[0].id);
    }
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const rows = await fetchOnboardingPlans();
      const merged = mergeById(session, rows);
      remember(merged);
      if (merged[0]) setSelectedId(merged[0].id);
    } catch (err) {
      console.error("[onboarding] liste:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    function onSeed() {
      void load();
    }
    window.addEventListener(DEMO_SEEDED_EVENT, onSeed);
    return () => window.removeEventListener(DEMO_SEEDED_EVENT, onSeed);
  }, []);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!employeeName.trim()) {
      setNotice(t("onb.needName"));
      return;
    }
    setGenerating(true);
    setNotice("");
    try {
      const response = await fetch("/api/generate-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeName, role, department, locale }),
      });
      const payload = (await response.json()) as { saved?: StoredOnboardingPlan; plan?: StoredOnboardingPlan };
      const saved = payload.saved;
      if (!saved) throw new Error(t("onb.fail"));
      remember([saved, ...plans.filter((item) => item.id !== saved.id)]);
      setSelectedId(saved.id);
      setNotice(t("onb.ready", { name: saved.employeeName }));
      setChat([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("onb.fail"));
    } finally {
      setGenerating(false);
    }
  }

  async function toggleTask(taskId: string) {
    if (!selected) return;
    const tasks = selected.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task));
    const next = plans.map((item) => (item.id === selected.id ? { ...item, tasks } : item));
    remember(next);
    if (selected.persisted === false) return;
    try {
      const updated = await updateOnboardingTasks(selected.id, tasks);
      remember(next.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      console.error("[onboarding] checklist:", err);
    }
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || !selected) return;
    setChatInput("");
    setChat((prev) => [...prev, { role: "user", content: text }]);
    setChatPending(true);
    try {
      const response = await fetch("/api/onboarding-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          employeeName: selected.employeeName,
          role: selected.role,
          department: selected.department,
          summary: selected.summary,
          locale,
        }),
      });
      const payload = (await response.json()) as { reply?: string };
      setChat((prev) => [...prev, { role: "assistant", content: payload.reply || "Yanıt üretildi." }]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Bağlantı kesildi. İlk 30 günde kültür, gölge çalışma, sahiplik ve 30. gün değerlendirmesini sırayla ilerletin.",
        },
      ]);
    } finally {
      setChatPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className={`${pageKicker} text-indigo-700`}>{t("onb.kicker")}</p>
        <h1 className={pageTitle}>
          <HelpTitle hint={t("onb.hint")}>{t("onb.title")}</HelpTitle>
        </h1>
        <p className={pageLead}>{t("onb.description")}</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <form
        onSubmit={generate}
        className={`grid gap-3 ${cardSurface} ${moduleStripe.performance} md:grid-cols-2 lg:grid-cols-4`}
      >
        <label className="text-sm">
          <span className={fieldLabel}>{t("onb.name")}</span>
          <input
            value={employeeName}
            onChange={(event) => setEmployeeName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            placeholder="Elif Kaya"
          />
        </label>
        <label className="text-sm">
          <span className={fieldLabel}>{t("onb.role")}</span>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="text-sm">
          <span className={fieldLabel}>{t("onb.dept")}</span>
          <input
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <div className="flex min-w-0 items-end gap-2 overflow-visible">
          <HelpTip text={t("onb.generateHint")} side="top" align="start" sideOffset={6} />
          <button
            type="submit"
            disabled={generating}
            className={`min-w-0 flex-1 ${btnPrimary}`}
          >
            {generating ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="h-4 w-4 shrink-0" />}
            <span className="min-w-0">{t("onb.generate")}</span>
          </button>
        </div>
      </form>

      {loading ? <p className="text-sm text-slate-500">{t("onb.loading")}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr_1fr]">
        <section className="space-y-3">
          {plans.map((plan) => {
            const done = plan.tasks.filter((task) => task.done).length;
            const active = selected?.id === plan.id;
            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => {
                  setSelectedId(plan.id);
                  setChat([]);
                }}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-all ${
                  active
                    ? "border-indigo-300 bg-indigo-50/60 border-l-4 border-l-indigo-500"
                    : "border-slate-200/90 bg-white hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.employeeName}</p>
                    <p className="text-xs text-slate-500">
                      {plan.role} · {plan.department}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {plan.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Checklist {done}/{plan.tasks.length}
                </p>
              </button>
            );
          })}
          {!loading && !plans.length ? <p className="text-sm text-slate-500">{t("onb.empty")}</p> : null}
        </section>

        <section className={`${cardSurface} ${moduleStripe.performance} min-h-[28rem]`}>
          {selected ? (
            <>
              <div className={cardTitle}>
                <h2>{t("onb.checklist")}</h2>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-800">
                  {t("onb.progress", { value: progress })}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selected.summary}</p>
              <AiDisclaimer className="mt-3" />
              <div className="mt-4 space-y-4">
                {selected.weeks.map((week) => (
                  <div key={week.week} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-800">{week.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{week.focus}</p>
                    <ul className="mt-2 space-y-2">
                      {selected.tasks
                        .filter((task) => task.week === week.week)
                        .map((task) => (
                          <li key={task.id}>
                            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => void toggleTask(task.id)}
                                className="mt-1"
                              />
                              <span>
                                <span className="me-1 text-[11px] font-semibold text-slate-400">{t("onb.day", { day: task.day })}</span>
                                {task.title}
                              </span>
                            </label>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t("onb.pick")}</p>
          )}
        </section>

        <section className={`flex min-h-[420px] flex-col ${cardSurfaceFlush} ${moduleStripe.performance}`}>
          <div className="border-b border-sky-50 px-4 py-3">
            <p className="text-sm font-semibold text-[#0b1f3a]">{t("onb.chatTitle")}</p>
            <p className="text-xs text-slate-500">{t("onb.chatLead")}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {chat.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-sm leading-6 ${
                  item.role === "user" ? "ml-6 bg-indigo-600 text-white" : "mr-6 bg-indigo-50 text-slate-800"
                }`}
              >
                {item.content}
              </div>
            ))}
            {chatPending ? <p className="text-xs font-medium text-slate-500">{t("onb.typing")}</p> : null}
          </div>
          <form onSubmit={sendChat} className="flex gap-2 border-t border-sky-50 p-3">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              disabled={!selected}
              placeholder={t("onb.placeholder")}
              className="flex-1 rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={!selected || chatPending}
              className={btnPrimary}
            >
              <IconSend className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>

      <ItProvisioningList employeeName={selected?.employeeName ?? employeeName} />
    </div>
  );
}
