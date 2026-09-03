"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

type HelpTipProps = {
  text: string;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

function popoverStyle(
  rect: DOMRect,
  side: "top" | "bottom",
  align: "start" | "center" | "end",
  sideOffset: number,
): CSSProperties {
  const left =
    align === "end" ? rect.right : align === "center" ? rect.left + rect.width / 2 : rect.left;
  const top = side === "bottom" ? rect.bottom + sideOffset : rect.top - sideOffset;
  const x = align === "end" ? "-100%" : align === "center" ? "-50%" : "0";
  const y = side === "bottom" ? "0" : "-100%";
  return {
    position: "fixed",
    top,
    left,
    transform: `translate(${x}, ${y})`,
    pointerEvents: "none",
    zIndex: 80,
  };
}

export function HelpTip({ text, side = "top", align = "start", sideOffset = 8 }: HelpTipProps) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function place() {
    const node = buttonRef.current;
    if (!node) return;
    setStyle(popoverStyle(node.getBoundingClientRect(), side, align, sideOffset));
  }

  function show() {
    place();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onScrollOrResize() {
      place();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, side, align, sideOffset]);

  return (
    <span className="relative inline-flex shrink-0 align-middle">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Help"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") show();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hide();
        }}
        onFocus={show}
        onBlur={hide}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          if (open) hide();
          else show();
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[13px] leading-none text-sky-700 hover:bg-sky-50"
      >
        ℹ️
      </button>
      {mounted && open && style
        ? createPortal(
            <span
              id={id}
              role="tooltip"
              style={style}
              className="w-64 max-w-[min(16rem,calc(100vw-1.25rem))] rounded-xl border border-slate-200 bg-white px-3 py-2 text-start text-xs leading-5 text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}

export function HelpTitle({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2 text-start">
      <HelpTip text={hint} side="top" align="start" sideOffset={8} />
      <span className="min-w-0">{children}</span>
    </span>
  );
}
