"use client";

import { useStore } from "@/store/useStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { EntitySwitcher } from "./EntitySwitcher";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const AUTH_ROUTES = new Set(['/login', '/setup', '/update-password']);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, activeEntity, setActiveEntity, language } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  // Only run the auth check once per mount, not every route change
  const hasChecked = useRef(false);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Skip on auth pages immediately — no loading needed
    if (AUTH_ROUTES.has(pathname)) {
      setIsChecking(false);
      return;
    }

    // Already checked - don't re-check on every route change
    if (hasChecked.current) {
      setIsChecking(false);
      return;
    }

    const checkUserEntities = async () => {
      setIsChecking(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // فحص وجود شركات للمستخدم
        const { data } = await supabase.from('entities').select('id, name').limit(1);

        if (!data || data.length === 0) {
          router.push('/setup');
        } else if (!activeEntity.name || activeEntity.name === 'عاصمة المجد للتجارة') {
          setActiveEntity({ name: data[0].name, short: data[0].name.substring(0, 2) });
        }

        hasChecked.current = true;
      } catch (error) {
        console.error("Error checking entities:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserEntities();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (AUTH_ROUTES.has(pathname)) {
    return <main>{children}</main>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-[#5B5BD6] animate-spin mb-4" />
        <p className="text-[13px] text-muted-foreground">جاري تهيئة مساحة العمل...</p>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden"><Sidebar /></div>
      <div className={`transition-[margin] duration-300 ml-0 mr-0 ${sidebarCollapsed ? 'lg:mr-[60px]' : 'lg:mr-[240px]'} print:m-0`}>
        <div className="print:hidden"><TopBar /></div>
        <main className="px-4 lg:px-8 py-6 max-w-[1400px] overflow-x-hidden print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
      <div className="print:hidden"><CommandPalette /></div>
      <div className="print:hidden"><EntitySwitcher /></div>
    </>
  );
}
