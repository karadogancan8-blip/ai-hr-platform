"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Megaphone, Star } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  ANNOUNCEMENTS_KEY,
  PULSE_UPDATED_EVENT,
  PULSE_VOTES_KEY,
  averagePulse,
  currentPulseMonth,
  type CompanyAnnouncement,
  type PulseVote,
} from "@/lib/pulse";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";

function persistAnnouncements(items: CompanyAnnouncement[]) {
  writeLocalJson(ANNOUNCEMENTS_KEY, items);
  window.dispatchEvent(new Event(PULSE_UPDATED_EVENT));
}

function persistVotes(items: PulseVote[]) {
  writeLocalJson(PULSE_VOTES_KEY, items);
  window.dispatchEvent(new Event(PULSE_UPDATED_EVENT));
}

export function CompanyPulseCard() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>([]);
  const [votes, setVotes] = useState<PulseVote[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const month = currentPulseMonth();

  function load() {
    setAnnouncements(readLocalJson<CompanyAnnouncement[]>(ANNOUNCEMENTS_KEY, []));
    setVotes(readLocalJson<PulseVote[]>(PULSE_VOTES_KEY, []));
  }

  useEffect(() => {
    load();
    window.addEventListener(PULSE_UPDATED_EVENT, load);
    return () => window.removeEventListener(PULSE_UPDATED_EVENT, load);
  }, []);

  const avg = useMemo(() => averagePulse(votes), [votes]);
  const monthVote = votes.find((item) => item.month === month);
  const votedThisMonth = Boolean(monthVote);
  const [hover, setHover] = useState(0);

  function vote(score: number) {
    if (votedThisMonth) return;
    const next = [
      { id: crypto.randomUUID(), month, score, createdAt: new Date().toISOString() },
      ...votes,
    ];
    setVotes(next);
    persistVotes(next);
  }

  return (
    <section className="grid min-h-[22rem] items-stretch gap-5 lg:grid-cols-2">
      <article className="flex min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.announce.title")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.announce.lead")}</p>
          </div>
          {hrDesk ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#123056] px-3 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              <Megaphone className="h-4 w-4" />
              {t("dashboard.announce.cta")}
            </button>
          ) : null}
        </div>
        <ul className="mt-4 min-h-[12rem] flex-1 space-y-2 overflow-y-auto">
          {announcements.length === 0 ? (
            <li className="flex min-h-[12rem] items-center rounded-xl border border-dashed border-slate-200 px-4 text-sm text-slate-400">
              {t("dashboard.announce.empty")}
            </li>
          ) : (
            announcements.slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">{item.body}</p>
                <p className="mt-2 text-[11px] text-slate-400">{item.createdAt.slice(0, 16).replace("T", " ")}</p>
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="flex min-h-[22rem] flex-col rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.pulse.title")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.pulse.lead")}</p>
        <div className="mt-6 flex min-h-[3.5rem] items-end gap-3">
          <p className="text-4xl font-semibold tracking-tight text-[#0b1f3a]">{avg ? avg.toFixed(1) : "—"}</p>
          <p className="pb-1 text-xs text-slate-500">{t("dashboard.pulse.avg")}</p>
        </div>
        <div className="mt-6 flex h-12 items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((score) => {
            const lit = (hover || monthVote?.score || 0) >= score;
            return (
              <button
                key={score}
                type="button"
                disabled={votedThisMonth}
                aria-label={t("dashboard.pulse.star", { score })}
                onMouseEnter={() => setHover(score)}
                onClick={() => vote(score)}
                className="flex h-10 w-10 items-center justify-center rounded-xl disabled:cursor-not-allowed"
              >
                <Star
                  className={`h-7 w-7 ${lit ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        <p className="mt-3 min-h-10 text-sm text-slate-500">
          {votedThisMonth ? t("dashboard.pulse.thanks") : t("dashboard.pulse.thisMonth")}
        </p>
      </article>

      {modalOpen ? (
        <AnnounceModal
          onClose={() => setModalOpen(false)}
          onPublish={(item) => {
            const next = [item, ...announcements];
            setAnnouncements(next);
            persistAnnouncements(next);
            setModalOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

function AnnounceModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (item: CompanyAnnouncement) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || body.trim().length < 8) {
      setError(t("dashboard.announce.need"));
      return;
    }
    onPublish({
      id: crypto.randomUUID(),
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
      >
        <h3 className="text-lg font-semibold text-slate-900">{t("dashboard.announce.modalTitle")}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.announce.modalLead")}</p>
        <div className="mt-4 min-h-8">{error ? <p className="text-sm text-rose-700">{error}</p> : null}</div>
        <label className="mt-1 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("dashboard.announce.fieldTitle")}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("dashboard.announce.fieldBody")}</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            className="min-h-[8rem] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700"
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="h-10 rounded-xl bg-[#123056] px-4 text-sm font-medium text-white">
            {t("dashboard.announce.publish")}
          </button>
        </div>
      </form>
    </div>
  );
}
