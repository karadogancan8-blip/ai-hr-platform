"use client";

import { type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { selectControlClass } from "@/components/ui/surface";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function SelectField({ className = "", wrapperClassName = "", ...props }: SelectFieldProps) {
  return (
    <div className={`relative isolate overflow-hidden rounded-xl ${wrapperClassName}`}>
      <select {...props} className={`${selectControlClass} ${className}`} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
        strokeWidth={1.75}
      />
    </div>
  );
}
