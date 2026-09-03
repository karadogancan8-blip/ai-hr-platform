"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LOCALE_STORAGE_KEY,
  dirForLocale,
  isLocale,
  localeMeta,
  translate,
  type Locale,
  type LocaleDir,
  type MessageKey,
} from "@/lib/i18n";

type TranslateVars = Record<string, string | number>;

type LocaleContextValue = {
  locale: Locale;
  dir: LocaleDir;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: TranslateVars) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "tr",
  dir: "ltr",
  setLocale: () => undefined,
  t: (key, vars) => translate("tr", key, vars),
});

/** Alias used by language switcher and workspaces to apply locale immediately. */
export const i18nContext = LocaleContext;

export function useI18n() {
  return useContext(LocaleContext);
}

function applyDocumentLocale(locale: Locale) {
  const meta = localeMeta[locale];
  const root = document.documentElement;
  root.lang = meta.htmlLang;
  root.dir = meta.dir;
  root.dataset.locale = locale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) {
      setLocaleState(saved);
      applyDocumentLocale(saved);
      return;
    }
    if (saved) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, "tr");
    }
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: dirForLocale(locale),
      setLocale: (next) => {
        setLocaleState(next);
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        applyDocumentLocale(next);
      },
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <div dir={dirForLocale(locale)} lang={localeMeta[locale].htmlLang} className="min-h-full">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}
