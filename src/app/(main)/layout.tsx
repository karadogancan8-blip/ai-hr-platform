import { AppShell } from "@/components/layout/AppShell";
import { AccessControlProvider } from "@/components/access/AccessControlProvider";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { FeedbackModal } from "@/components/feedback-modal";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <BrandingProvider>
        <AccessControlProvider>
          <AppShell>{children}</AppShell>
          <FeedbackModal />
        </AccessControlProvider>
      </BrandingProvider>
    </LocaleProvider>
  );
}
