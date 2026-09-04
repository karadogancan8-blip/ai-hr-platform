"use client";

import { PublicChrome } from "@/components/marketing/PublicChrome";
import { PricingWorkspace } from "@/components/billing/PricingWorkspace";

export default function PublicPricingPage() {
  return (
    <PublicChrome>
      <div className="flex min-h-[720px] flex-1 flex-col">
        <PricingWorkspace variant="public" />
      </div>
    </PublicChrome>
  );
}
