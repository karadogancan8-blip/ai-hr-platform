import { isLocale, type Locale } from "@/lib/i18n";

export const AI_LANGUAGE_NAME: Record<Locale, string> = {
  tr: "Turkish",
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  ru: "Russian",
  zh: "Simplified Chinese",
};

export function parseRequestLocale(value: unknown): Locale {
  return isLocale(typeof value === "string" ? value : "") ? value : "tr";
}

export function replyInLocaleInstruction(locale: Locale) {
  const name = AI_LANGUAGE_NAME[locale];
  return `Write the entire response in ${name} (locale code: ${locale}). Keep a professional HR tone. Do not mix languages.`;
}
