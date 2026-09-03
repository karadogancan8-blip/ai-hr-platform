"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type HelpTipProps = {
  text: string;
};

export function HelpTip({ text }: HelpTipProps) {
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        aria-label="Kullanım kılavuzu"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[13px] leading-none text-sky-700 hover:bg-sky-50"
      >
        ℹ️
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs leading-5 text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function HelpTitle({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span>{children}</span>
      <HelpTip text={hint} />
    </span>
  );
}
