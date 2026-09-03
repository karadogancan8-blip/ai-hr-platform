import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Noto_Sans_Arabic, Noto_Sans_SC } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const notoSc = Noto_Sans_SC({
  variable: "--font-zh",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nexus HR · AI İnsan Kaynakları",
  description: "Recruiter, Policy ve HR Admin ajanlarıyla kurumsal İK SaaS platformu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} ${notoArabic.variable} ${notoSc.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
