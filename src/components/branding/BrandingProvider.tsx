"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BRANDING_UPDATED_EVENT,
  DEFAULT_PRIMARY_COLOR,
  fetchCompanyBranding,
  type CompanyBranding,
} from "@/lib/branding";
import { isSupabaseConfigured } from "@/lib/supabase";

const fallbackBranding: CompanyBranding = {
  companyId: "",
  companyName: "Nexus HR",
  logoUrl: "",
  primaryColor: DEFAULT_PRIMARY_COLOR,
};

const BrandingContext = createContext<CompanyBranding>(fallbackBranding);

export function useCompanyBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<CompanyBranding>(fallbackBranding);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void fetchCompanyBranding()
      .then(setBranding)
      .catch(() => setBranding(fallbackBranding));

    function onUpdate(event: Event) {
      const detail = (event as CustomEvent<CompanyBranding>).detail;
      if (detail) setBranding(detail);
    }
    window.addEventListener(BRANDING_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(BRANDING_UPDATED_EVENT, onUpdate);
  }, []);

  const value = useMemo(() => branding, [branding]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}
