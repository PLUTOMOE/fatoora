import type { Metadata } from 'next';
import type { Viewport } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: 'زاجل النخبة | نظام عروض الأسعار والفواتير وسندات القبض والصرف',
  description: 'نظام ويب عربي متكامل لإدارة عروض الأسعار، الفواتير، كشوف حساب العملاء، وسندات القبض والصرف',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://byckypheqbrcekoigspl.supabase.co" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
