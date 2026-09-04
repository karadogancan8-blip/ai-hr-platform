"use client";

import { type SelectHTMLAttributes } from "react";
import { selectControlClass } from "@/components/ui/surface";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function SelectField({ className = "", wrapperClassName = "", ...props }: SelectFieldProps) {
  return (
    <div className={`isolate overflow-hidden rounded-xl ${wrapperClassName}`}>
      <select {...props} className={`${selectControlClass} ${className}`} />
    </div>
  );
}
