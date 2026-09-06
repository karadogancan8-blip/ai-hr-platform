"use client";

import { Suspense } from "react";
import { PublicChrome } from "@/components/marketing/PublicChrome";
import { PricingWorkspace } from "@/components/billing/PricingWorkspace";

export default function PublicPricingPage() {
  return (
    <PublicChrome>
      <div className="flex min-h-[720px] flex-1 flex-col">
        <Suspense fallback={<div className="min-h-[640px]" aria-hidden />}>
          <PricingWorkspace variant="public" />
        </Suspense>
      </div>
    </PublicChrome>
  );
}
