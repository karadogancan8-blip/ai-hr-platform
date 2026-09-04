/** Soft, low-contrast surfaces used across workspaces. */
export const cardSurface =
  "rounded-2xl border border-sky-100 bg-white";

export const mutedSurface =
  "rounded-2xl border border-sky-100 bg-slate-50/80";

/** Native selects: hide OS chrome; ChevronDown is drawn by SelectField. */
export const selectControlClass = [
  "h-10 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white",
  "px-3 pe-10 text-sm leading-10 outline-none bg-clip-padding",
  "hover:border-slate-300",
  "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
].join(" ");
