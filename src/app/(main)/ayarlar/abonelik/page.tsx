"use client";

import { Suspense } from "react";
import { PricingWorkspace } from "@/components/billing/PricingWorkspace";

export default function SubscriptionSettingsPage() {
  return (
    <div className="flex min-h-[720px] flex-1 flex-col">
      <Suspense fallback={<div className="min-h-[640px]" aria-hidden />}>
        <PricingWorkspace variant="account" />
      </Suspense>
    </div>
  );
}
