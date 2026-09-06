/** High-contrast, color-coded surfaces (Deel / Rippling / HiBob). */

export const pageShell = "bg-slate-50/80 min-h-screen";

export const cardSurface =
  "rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md";

export const cardSurfaceFlush =
  "rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md";

export const mutedSurface =
  "rounded-2xl border border-slate-200/90 bg-slate-50";

export const pageKicker =
  "text-xs font-medium uppercase tracking-wide text-slate-500";

export const pageTitle =
  "mt-1 text-[1.65rem] font-bold tracking-tight text-slate-900";

export const pageLead =
  "mt-2 max-w-2xl text-sm leading-7 text-slate-700";

export const cardTitle =
  "mb-4 flex items-center justify-between border-b border-slate-100 pb-3 text-lg font-bold text-slate-900";

export const fieldLabel =
  "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

export const mutedText = "text-sm font-medium text-slate-500";

export const bodyText = "text-sm leading-6 text-slate-700";

export const tableShell =
  "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm";

export const panelMin = "min-h-[28rem]";
export const tabPaneMin = "min-h-[520px]";

export const moduleStripe = {
  recruit: "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent",
  performance: "border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50/30 to-transparent",
  leave: "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/30 to-transparent",
  ops: "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/30 to-transparent",
} as const;

export type ModuleToneId = keyof typeof moduleStripe;

export const moduleTone = {
  recruit: {
    kicker: "text-blue-700",
    badge: "rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-800",
    icon: "bg-blue-100 text-blue-700",
    ring: "border-blue-200",
    dash: "border-blue-500 bg-blue-50",
    stripe: moduleStripe.recruit,
  },
  performance: {
    kicker: "text-indigo-700",
    badge: "rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-800",
    icon: "bg-indigo-100 text-indigo-700",
    ring: "border-indigo-200",
    dash: "border-indigo-500 bg-indigo-50",
    stripe: moduleStripe.performance,
  },
  leave: {
    kicker: "text-emerald-700",
    badge: "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800",
    icon: "bg-emerald-100 text-emerald-700",
    ring: "border-emerald-200",
    dash: "border-emerald-500 bg-emerald-50",
    stripe: moduleStripe.leave,
  },
  ops: {
    kicker: "text-amber-700",
    badge: "rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800",
    icon: "bg-amber-100 text-amber-700",
    ring: "border-amber-200",
    dash: "border-amber-500 bg-amber-50",
    stripe: moduleStripe.ops,
  },
} as const;

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95 disabled:pointer-events-none disabled:opacity-50 rounded-xl";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-200";

export const btnSuccess =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-100";

export const btnPrimarySm =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50";

export const btnSuccessSm =
  "inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-emerald-700";

export const btnDangerSm =
  "inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-all hover:bg-rose-100";

/** Native selects: hide OS chrome; ChevronDown is drawn by SelectField. */
export const selectControlClass = [
  "h-10 w-full min-w-0 appearance-none overflow-hidden rounded-xl border border-slate-200 bg-white",
  "px-4 pe-10 text-sm leading-10 text-slate-900 outline-none bg-clip-padding",
  "hover:border-slate-300",
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
].join(" ");
