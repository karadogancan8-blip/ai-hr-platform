/** Soft, low-contrast surfaces used across workspaces. */
export const cardSurface =
  "rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_40px_rgba(15,37,64,0.06)]";

export const mutedSurface =
  "rounded-2xl border border-slate-200/80 bg-slate-50/90";

export const pageKicker =
  "text-xs font-semibold uppercase tracking-[0.16em] text-sky-700";

export const pageTitle =
  "mt-1 text-[1.65rem] font-semibold tracking-tight text-[#0b1f3a]";

export const pageLead =
  "mt-2 max-w-2xl text-sm leading-7 text-slate-500";

export const tableShell =
  "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_24px_rgba(15,37,64,0.05)]";

/** Native selects: hide OS chrome; ChevronDown is drawn by SelectField. */
export const selectControlClass = [
  "h-10 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white",
  "px-3 pe-10 text-sm leading-10 outline-none bg-clip-padding",
  "hover:border-slate-300",
  "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
].join(" ");
