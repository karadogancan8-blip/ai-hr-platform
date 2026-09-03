"use client";

import { PricingWorkspace } from "@/components/billing/PricingWorkspace";

export default function PricingPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex min-h-[720px] flex-1 flex-col">
        <PricingWorkspace />
      </div>
    </div>
  );
}
