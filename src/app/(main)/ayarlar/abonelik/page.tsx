"use client";

import { PricingWorkspace } from "@/components/billing/PricingWorkspace";

export default function SubscriptionSettingsPage() {
  return (
    <div className="flex min-h-[720px] flex-1 flex-col">
      <PricingWorkspace variant="account" />
    </div>
  );
}
