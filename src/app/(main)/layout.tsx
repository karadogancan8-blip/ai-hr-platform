import { AppShell } from "@/components/layout/AppShell";
import { BrandingProvider } from "@/components/branding/BrandingProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandingProvider>
      <AppShell>{children}</AppShell>
    </BrandingProvider>
  );
}
