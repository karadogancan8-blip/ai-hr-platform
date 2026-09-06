import type { MessageKey } from "@/lib/i18n";

export const COMMAND_OPEN_EVENT = "nexus-command-open";

export type CommandItem = {
  id: string;
  href: string;
  titleKey: MessageKey;
  hintKey: MessageKey;
  group: "module" | "action" | "people";
  keywords: string;
};

export const COMMAND_ITEMS: CommandItem[] = [
  { id: "pricing", href: "/fiyatlandirma", titleKey: "pricing.nav", hintKey: "cmd.hint.pricing", group: "module", keywords: "fiyat paket pricing" },
  { id: "login", href: "/login", titleKey: "pricing.login", hintKey: "cmd.hint.login", group: "action", keywords: "giris login" },
  { id: "dash", href: "/dashboard", titleKey: "dashboard.title", hintKey: "cmd.hint.dash", group: "module", keywords: "dashboard panel kontrol" },
  { id: "recruit", href: "/ise-alim", titleKey: "recruit.title", hintKey: "cmd.hint.recruit", group: "module", keywords: "cv ats ise alim aday" },
  { id: "leave", href: "/izin", titleKey: "leave.title", hintKey: "cmd.hint.leave", group: "module", keywords: "izin ozluk leave" },
  { id: "timesheet", href: "/puantaj", titleKey: "timesheet.title", hintKey: "cmd.hint.timesheet", group: "module", keywords: "puantaj vardiya mesai" },
  { id: "onb", href: "/onboarding", titleKey: "onb.title", hintKey: "cmd.hint.onb", group: "module", keywords: "onboarding uyum" },
  { id: "perf", href: "/performans", titleKey: "perf.title", hintKey: "cmd.hint.perf", group: "module", keywords: "performans" },
  { id: "wall", href: "/sosyal", titleKey: "wall.title", hintKey: "cmd.hint.wall", group: "module", keywords: "sosyal duvar kutlama" },
  { id: "settings", href: "/ayarlar", titleKey: "settings.title", hintKey: "cmd.hint.settings", group: "module", keywords: "ayarlar" },
  { id: "cv", href: "/ise-alim#cv-upload", titleKey: "cmd.action.cv", hintKey: "cmd.hint.cv", group: "action", keywords: "cv yukle analiz" },
  { id: "leave-new", href: "/izin#leave-form", titleKey: "cmd.action.leave", hintKey: "cmd.hint.leaveAction", group: "action", keywords: "izin tanimla talep" },
  { id: "expense", href: "/ozluk#expenses", titleKey: "cmd.action.expense", hintKey: "cmd.hint.expense", group: "action", keywords: "masraf harcama" },
  { id: "swap", href: "/puantaj#shift-swap", titleKey: "cmd.action.swap", hintKey: "cmd.hint.swap", group: "action", keywords: "vardiya takas" },
];
