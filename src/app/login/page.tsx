"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureCompanyForUser } from "@/lib/tenant";
import { LegalLinks } from "@/components/legal/LegalLinks";

type Mode = "login" | "register";

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const configured = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    setMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured) return;
    setPending(true);
    setError("");
    setNotice("");

    try {
      const supabase = createBrowserSupabase();
      if (mode === "register") {
        if (!companyName.trim()) {
          throw new Error("Şirket adı zorunludur.");
        }
        const origin = window.location.origin;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { company_name: companyName.trim() },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });
        if (signUpError) throw signUpError;

        if (data.session && data.user) {
          await ensureCompanyForUser(supabase, data.user, companyName.trim());
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setNotice("Kayıt alındı. E-posta doğrulaması açıksa gelen kutunuzdaki bağlantıyı onaylayın, ardından giriş yapın.");
        setMode("login");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Giriş başarısız.");
      await ensureCompanyForUser(supabase, data.user, companyName.trim() || undefined);
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#eef4fb]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(56,189,248,0.28),transparent_55%),radial-gradient(700px_circle_at_90%_10%,rgba(15,48,86,0.16),transparent_50%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_minmax(0,440px)]">
          <section className="hidden text-[#0b1f3a] lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Nexus HR</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight">
              Şirketinize özel yapay zeka İK operasyonları
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              Recruiter, Policy ve HR Admin ajanları şirketinizle izole çalışır. Veriler yalnızca sizin
              tenant’ınıza aittir.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-3">CV analizi şirket havuzunda saklanır</li>
              <li className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-3">İzin talepleri yalnızca kendi ekibinize görünür</li>
              <li className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-3">Supabase Auth ile güvenli oturum</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,55,95,0.12)] sm:p-8">
            <div className="mb-6 flex rounded-2xl bg-sky-50 p-1">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError("");
                    setNotice("");
                  }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    mode === item ? "bg-white text-[#123056] shadow-sm" : "text-slate-500"
                  }`}
                >
                  {item === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-[#0b1f3a]">
              {mode === "login" ? "Hesabınıza giriş yapın" : "Şirketinizi oluşturun"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? "E-posta ve şifrenizle panele geçin."
                : "Kayıt sırasında şirket kaydı otomatik açılır."}
            </p>

            {!configured ? (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Supabase ortam değişkenleri eksik.
              </p>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "register" ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Şirket adı</span>
                  <input
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="Örn. Atlas Holding"
                    required
                  />
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">E-posta</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  placeholder="ik@sirket.com"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Şifre</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  placeholder="En az 6 karakter"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={pending || !configured}
                className="w-full rounded-xl bg-[#123056] py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
              >
                {pending ? "Lütfen bekleyin…" : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            </form>
            {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
            {notice ? <p className="mt-4 text-sm text-sky-800">{notice}</p> : null}
            <div className="mt-6">
              <LegalLinks />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef4fb]" />}>
      <LoginScreen />
    </Suspense>
  );
}

