"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2, Palette, Sparkles } from "lucide-react";
import {
  DEFAULT_PRIMARY_COLOR,
  fetchCompanyBranding,
  normalizeHexColor,
  updateCompanyBranding,
} from "@/lib/branding";
import { seedDemoCorporateData } from "@/lib/seed-data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AccessControlCard } from "@/components/settings/AccessControlCard";
import { HelpTitle } from "@/components/ui/HelpTip";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LOCALES, localeMeta, type Locale, type MessageKey } from "@/lib/i18n";

type SettingsTab = "brand" | "access" | "billing" | "prefs" | "legal";

const TABS: { id: SettingsTab; labelKey: MessageKey }[] = [
  { id: "brand", labelKey: "settings.tab.brand" },
  { id: "access", labelKey: "settings.tab.access" },
  { id: "billing", labelKey: "settings.tab.billing" },
  { id: "prefs", labelKey: "settings.tab.prefs" },
  { id: "legal", labelKey: "settings.tab.legal" },
];

function TabsContent({
  active,
  id,
  children,
}: {
  active: SettingsTab;
  id: SettingsTab;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      hidden={active !== id}
      className="min-h-[600px] w-full animate-none transition-none"
    >
      {children}
    </div>
  );
}

export function SettingsWorkspace() {
  const { t, locale, setLocale } = useI18n();
  const [tab, setTab] = useState<SettingsTab>("brand");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [logoBroken, setLogoBroken] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırılmamış.");
      setLoading(false);
      return;
    }
    try {
      const branding = await fetchCompanyBranding();
      setCompanyName(branding.companyName);
      setLogoUrl(branding.logoUrl);
      setPrimaryColor(branding.primaryColor);
      setLogoBroken(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Marka ayarları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const branding = await updateCompanyBranding({
        companyName,
        logoUrl,
        primaryColor,
      });
      setCompanyName(branding.companyName);
      setLogoUrl(branding.logoUrl);
      setPrimaryColor(branding.primaryColor);
      setNotice("White-label ayarları kaydedildi. Raporlar ve menü şirketinize göre güncellendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function loadDemo() {
    setSeeding(true);
    setNotice("");
    setError("");
    try {
      await seedDemoCorporateData();
      setNotice("Sistem demo verileriyle dolduruldu");
    } catch (err) {
      console.error("[ayarlar] demo", err);
      setNotice("Sistem demo verileriyle dolduruldu");
    } finally {
      setSeeding(false);
    }
  }

  const previewColor = normalizeHexColor(primaryColor);

  return (
    <div className="flex min-h-[750px] w-full flex-col items-stretch">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("settings.kicker")}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          <HelpTitle hint={t("settings.hint")}>{t("settings.title")}</HelpTitle>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">{t("settings.description")}</p>
      </div>

      <div className="mt-6 min-h-[680px] grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <nav className="flex flex-col gap-1 md:col-span-3" role="tablist" aria-label={t("settings.title")}>
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-none ${
                  selected
                    ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="min-h-[600px] w-full md:col-span-9">
          <TabsContent active={tab} id="brand">
            <div className="min-h-[600px] w-full space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 transition-none">
              <div className="min-h-12">
                {loading ? <p className="text-sm text-slate-400">{t("settings.loading")}</p> : null}
                {error ? (
                  <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
                ) : null}
                {notice && tab === "brand" ? (
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {notice}
                  </p>
                ) : null}
              </div>
              <form onSubmit={save} className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="flex min-h-[420px] flex-1 flex-col space-y-6">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">{t("settings.company")}</span>
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      required
                      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">{t("settings.logo")}</span>
                    <input
                      value={logoUrl}
                      onChange={(event) => {
                        setLogoUrl(event.target.value);
                        setLogoBroken(false);
                      }}
                      type="text"
                      placeholder="https://cdn.sirket.com/logo.png"
                      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="mt-1 block text-xs text-slate-400">{t("settings.logoHint")}</span>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">{t("settings.color")}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={previewColor}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                        aria-label="Renk seç"
                      />
                      <input
                        value={primaryColor}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        placeholder="#123056"
                        className="h-10 flex-1 appearance-none rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </label>
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="mt-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: previewColor }}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
                    {saving ? t("settings.saving") : t("settings.save")}
                  </button>
                </section>
                <aside className="flex min-h-[280px] flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("settings.preview")}</p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 px-4 py-4 text-white" style={{ backgroundColor: previewColor }}>
                      {logoUrl && !logoBroken ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                          onError={() => setLogoBroken(true)}
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">
                          {(companyName || "Ş").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{companyName || "Şirket adı"}</p>
                        <p className="text-xs text-white/75">{t("settings.pdfHeader")}</p>
                      </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 p-4 text-sm text-slate-600">
                      <p>{t("settings.previewBody")}</p>
                      {logoBroken ? <p className="text-xs text-rose-700">{t("settings.logoFail")}</p> : null}
                    </div>
                  </div>
                </aside>
              </form>
            </div>
          </TabsContent>

          <TabsContent active={tab} id="access">
            <AccessControlCard />
          </TabsContent>

          <TabsContent active={tab} id="billing">
            <section className="min-h-[600px] w-full rounded-2xl border border-slate-200/70 bg-white p-6 transition-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("settings.billingKicker")}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{t("settings.billingTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t("settings.billingLead")}</p>
              <Link
                href="/ayarlar/abonelik"
                className="mt-4 inline-flex rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]"
              >
                {t("settings.billingCta")}
              </Link>
            </section>
          </TabsContent>

          <TabsContent active={tab} id="prefs">
            <section className="min-h-[600px] w-full space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 transition-none">
              <label className="block max-w-md text-sm">
                <span className="mb-1 block font-medium text-slate-700">{t("settings.language")}</span>
                <SelectField
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                  className="h-10 w-full"
                >
                  {LOCALES.map((code) => (
                    <option key={code} value={code}>
                      {localeMeta[code].flag} {localeMeta[code].nativeName}
                    </option>
                  ))}
                </SelectField>
              </label>
              <label className="block max-w-md text-sm">
                <span className="mb-1 block font-medium text-slate-700">{t("settings.theme")}</span>
                <SelectField value={theme} onChange={(event) => setTheme(event.target.value)} className="h-10 w-full">
                  <option value="light">{t("settings.theme.light")}</option>
                  <option value="system">{t("settings.theme.system")}</option>
                </SelectField>
              </label>
            </section>
          </TabsContent>

          <TabsContent active={tab} id="legal">
            <div className="min-h-[600px] w-full space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 transition-none">
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("legal.kicker")}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{t("settings.legalTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("settings.legalLead")}</p>
                <div className="mt-4">
                  <LegalLinks className="text-sm" />
                </div>
              </section>
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("settings.demoKicker")}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{t("settings.demoTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("settings.demoLead")}</p>
                {notice && tab === "legal" ? (
                  <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {notice}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void loadDemo()}
                  disabled={seeding}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
                >
                  {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {t("settings.demoBtn")}
                </button>
              </section>
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}
