import { isLocale, type Locale } from "@/lib/i18n";

export const GEMINI_ENGLISH_RULE = "Respond strictly in professional English";

export function parseRequestLocale(value: unknown): Locale {
  if (typeof value === "string" && isLocale(value)) return value;
  return "tr";
}

/** Gemini system-prompt fragment. English uses the product’s strict professional-English rule. */
export function replyInLocaleInstruction(locale: Locale) {
  if (locale === "en") {
    return GEMINI_ENGLISH_RULE;
  }
  return "Respond strictly in professional Turkish (kurumsal İK Türkçesi). Do not mix English or any other language.";
}
