/** Soft, low-contrast surfaces used across workspaces. */
export const cardSurface =
  "rounded-2xl border border-slate-200/70 bg-white";

export const mutedSurface =
  "rounded-2xl border border-slate-200/70 bg-slate-50";

const SELECT_CHEVRON =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-[length:1.05rem] bg-[right_0.75rem_center] bg-no-repeat";

/** Native selects: hide OS chrome so hover/focus rings stay inside rounded corners. */
export const selectControlClass = [
  "w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white",
  SELECT_CHEVRON,
  "px-3 py-2.5 pe-10 text-sm outline-none transition-all bg-clip-padding",
  "hover:border-slate-300",
  "focus:border-primary focus:ring-2 focus:ring-primary/20",
].join(" ");
