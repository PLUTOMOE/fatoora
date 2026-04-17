"use client";

import { useStore } from "@/store/useStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { EntitySwitcher } from "./EntitySwitcher";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, activeEntity, setActiveEntity, language } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const checkUserEntities = async () => {
      // لا نفحص في صفحات الدخول أو الإعداد
      if (pathname === '/login' || pathname === '/setup') {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // فحص وجود شركات للمستخدم
        const { data } = await supabase.from('entities').select('*').limit(1);
        
        if (!data || data.length === 0) {
          // إذا المستخدم اختار التخطي مسبقاً، ننشئ له شركة افتراضية لكي يعمل النظام
          const skipped = typeof window !== 'undefined' && localStorage.getItem('setup_skipped');
          if (skipped) {
            try {
              const { data: newEnt } = await supabase.from('entities').insert({
                user_id: session.user.id,
                name: 'الشركة الافتراضية',
                status: 'active'
              }).select().single();
              if (newEnt) {
                setActiveEntity({ name: newEnt.name, short: 'افتراضي' });
              }
            } catch (err) { console.error('Failed to auto-create entity', err); }
          } else {
            router.push('/setup');
          }
        } else {
          // إذا كان لديه شركة ولم نفعلها في المتجر العام، نفعل الأولى
          if (!activeEntity.name || activeEntity.name === 'عاصمة المجد للتجارة') {
            setActiveEntity({ name: data[0].name, short: data[0].name.substring(0, 3) });
          }
          // إذا كان تخطى سابقاً والآن عنده شركة، امسح العلامة
          if (typeof window !== 'undefined') localStorage.removeItem('setup_skipped');
        }
      } catch (error) {
        console.error("Error checking entities:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserEntities();
  }, [pathname, activeEntity.name, router, setActiveEntity]);

  if (pathname === '/login' || pathname === '/setup') {
    return <main>{children}</main>;
  }

  // إظهار اللودر أثناء فحص الإجبار بالتوجه لإنشاء شركة
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
      <Sidebar />
      <div className={`transition-[margin] duration-300 ml-0 mr-0 ${sidebarCollapsed ? 'lg:mr-[60px]' : 'lg:mr-[240px]'}`}>
        <TopBar />
        <main className="px-4 lg:px-8 py-6 max-w-[1400px] overflow-x-hidden">
          {children}
        </main>
      </div>
      <CommandPalette />
      <EntitySwitcher />
    </>
  );
}
