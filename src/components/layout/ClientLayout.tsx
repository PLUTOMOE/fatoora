"use client";

import { useStore } from "@/store/useStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AUTH_ROUTES = new Set(['/login', '/update-password']);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, [language]);

  if (AUTH_ROUTES.has(pathname)) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-800 antialiased" dir="rtl">
      {/* Sidebar (Desktop fixed right, mobile drawer) */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area (Offset by 220px on desktop) */}
      <div className="lg:mr-[220px] min-h-screen flex flex-col transition-all duration-300 print:m-0 print:p-0">
        <div className="print:hidden">
          <TopBar />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {children}
        </main>
      </div>

      <div className="print:hidden">
        <CommandPalette />
      </div>
    </div>
  );
}
