/** Rippling / HiBob style surfaces: clear border, soft shadow, generous padding. */
export const cardSurface =
  "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md";

export const cardSurfaceFlush =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md";

export const mutedSurface =
  "rounded-2xl border border-slate-200/80 bg-slate-50/90";

export const pageKicker =
  "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";

export const pageTitle =
  "mt-1 text-[1.65rem] font-semibold tracking-tight text-[#0b1f3a]";

export const pageLead =
  "mt-2 max-w-2xl text-sm leading-7 text-slate-500";

export const tableShell =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm";

export const panelMin = "min-h-[28rem]";
export const tabPaneMin = "min-h-[520px]";

export const moduleTone = {
  recruit: {
    kicker: "text-blue-700",
    icon: "bg-blue-50 text-blue-700",
    ring: "border-blue-100",
    dash: "border-blue-400 bg-blue-50",
  },
  performance: {
    kicker: "text-violet-700",
    icon: "bg-violet-50 text-violet-700",
    ring: "border-violet-100",
  },
  ops: {
    kicker: "text-emerald-700",
    icon: "bg-emerald-50 text-emerald-700",
    ring: "border-emerald-100",
  },
} as const;

/** Native selects: hide OS chrome; ChevronDown is drawn by SelectField. */
export const selectControlClass = [
  "h-10 w-full min-w-0 appearance-none overflow-hidden rounded-full border border-slate-200 bg-white",
  "px-4 pe-10 text-sm leading-10 outline-none bg-clip-padding",
  "hover:border-slate-300",
  "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
].join(" ");
