import { AppShell } from "@/components/layout/AppShell";
import { AccessControlProvider } from "@/components/access/AccessControlProvider";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { FeedbackModal } from "@/components/feedback-modal";
import { CommandBar } from "@/components/ui/command-bar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandingProvider>
      <AccessControlProvider>
        <AppShell>{children}</AppShell>
        <CommandBar />
        <FeedbackModal />
      </AccessControlProvider>
    </BrandingProvider>
  );
}
