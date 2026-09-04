"use client";

import { Trash2 } from "lucide-react";

type DeleteIconButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function DeleteIconButton({ label, onClick, className = "" }: DeleteIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-md p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-70 hover:text-rose-600 hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-70 ${className}`}
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}
