"use client";

import { FormEvent, useEffect, useState } from "react";
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

export function SettingsWorkspace() {
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Ayarlar</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint="Logo ve kurumsal rengi kaydedin; menü ve PDF raporları bu kimliği kullanır. Alt kartta modül yetkilerini yönetirsiniz.">
            Şirket özelleştirme (White-Label)
          </HelpTitle>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Logo ve kurumsal renk, executive PDF raporları ile sol menüde görünür.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-400">Yükleniyor…</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Şirket adı</span>
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Logo URL</span>
            <input
              value={logoUrl}
              onChange={(event) => {
                setLogoUrl(event.target.value);
                setLogoBroken(false);
              }}
              type="text"
              placeholder="https://cdn.sirket.com/logo.png"
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Açık URL kullanın (PNG/SVG). CORS kapalı görseller PDF’de görünmeyebilir.
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Kurumsal tema rengi</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={previewColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                aria-label="Renk seç"
              />
              <input
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                placeholder="#123056"
                className="flex-1 rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 font-mono text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: previewColor }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
            {saving ? "Kaydediliyor…" : "Markayı kaydet"}
          </button>
        </section>

        <aside className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Önizleme</p>
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
                <p className="text-xs text-white/75">Executive PDF üst bilgisi</p>
              </div>
            </div>
            <div className="space-y-2 bg-slate-50 p-4 text-sm text-slate-600">
              <p>Aday eşleşme ve mülakat skorları bu renk vurgusuyla basılır.</p>
              {logoBroken ? <p className="text-xs text-rose-700">Logo yüklenemedi; URL’yi kontrol edin.</p> : null}
            </div>
          </div>
        </aside>
      </form>

      <AccessControlCard />

      <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Demo / sunum modu</p>
        <h2 className="mt-1 text-lg font-semibold text-[#0b1f3a]">Örnek kurumsal veriler</h2>
        <p className="mt-1 text-sm text-slate-500">
          3 aday CV’si, 2 onboarding planı, 2 performans raporu ve 3 mevzuat diyalogu yüklenir. Canlı demo ve test
          için tasarlanmıştır.
        </p>
        <button
          type="button"
          onClick={() => void loadDemo()}
          disabled={seeding}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Örnek Kurumsal Verileri Yükle
        </button>
      </section>
    </div>
  );
}
