import { AppShell } from "@/components/layout/AppShell";
import { AccessControlProvider } from "@/components/access/AccessControlProvider";
import { BrandingProvider } from "@/components/branding/BrandingProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandingProvider>
      <AccessControlProvider>
        <AppShell>{children}</AppShell>
      </AccessControlProvider>
    </BrandingProvider>
  );
}
