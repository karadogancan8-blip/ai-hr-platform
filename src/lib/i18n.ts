import { dictionaries as translationTables, type MessageKey as TranslationKey } from "./i18n/translations";

export const LOCALES = ["tr", "en"] as const;

export type Locale = (typeof LOCALES)[number];
export type MessageKey = TranslationKey;
export type LocaleDir = "ltr" | "rtl";

export type LocaleMeta = {
  code: Locale;
  short: string;
  nativeName: string;
  flag: string;
  dir: LocaleDir;
  htmlLang: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  tr: { code: "tr", short: "TR", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr", htmlLang: "tr" },
  en: { code: "en", short: "EN", nativeName: "English", flag: "🇬🇧", dir: "ltr", htmlLang: "en" },
};

export const LOCALE_STORAGE_KEY = "nexus-locale";

export const dictionaries = translationTables;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "tr" || value === "en";
}

export function dirForLocale(locale: Locale): LocaleDir {
  return localeMeta[locale].dir;
}

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key]),
  );
}

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  return interpolate(dictionaries[locale][key] ?? dictionaries.tr[key] ?? key, vars);
}
