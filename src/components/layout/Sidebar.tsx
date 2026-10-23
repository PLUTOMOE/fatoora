"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, ScrollText, Receipt, Users, 
  Package, ArrowDownLeft, ArrowUpRight, Settings, 
  X, ChevronLeft, ArrowRightLeft, ChevronDown, FileSpreadsheet 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { CompanySwitcherModal } from '@/components/shared/CompanySwitcherModal';

export function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useStore();
  const { themeMode, settings, getActiveCompany } = useZajelStore();
  const pathname = usePathname();
  const activeCompany = getActiveCompany();
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const navItems = [
    { label: 'الرئيسية', href: '/', icon: Home },
    { label: 'عروض الأسعار', href: '/quotations', icon: ScrollText },
    { label: 'الفواتير', href: '/invoices', icon: Receipt },
    { label: 'العملاء', href: '/customers', icon: Users },
    { label: 'كشف حساب مشروع', href: '/customers/quick-statement', icon: FileSpreadsheet },
    { label: 'سندات القبض', href: '/receipt-vouchers', icon: ArrowDownLeft },
    { label: 'سندات الصرف', href: '/payment-vouchers', icon: ArrowUpRight },
    { label: 'الأصناف والخدمات', href: '/products', icon: Package },
    { label: 'الإعدادات', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isLight = themeMode === 'light';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 right-0 h-screen w-[220px] flex flex-col z-50 border-l shadow-2xl transition-all duration-300 print:hidden ${
          isLight 
            ? 'bg-white text-slate-800 border-slate-200 shadow-slate-200/50' 
            : 'bg-[#1E293B] text-slate-100 border-slate-700/50'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        dir="rtl"
      >
        {/* Top Logo & Branding Header */}
        <div className={`pt-5 pb-4 px-4 flex flex-col items-center justify-center border-b relative ${
          isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-700/40'
        }`}>
          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`lg:hidden absolute left-3 top-4 p-1.5 rounded-lg transition-colors ${
              isLight 
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="group flex flex-col items-center text-center">
            {activeCompany?.logoUrl ? (
              <img 
                src={activeCompany.logoUrl} 
                alt={activeCompany.name} 
                className="w-12 h-12 object-contain mb-1.5 rounded-full border border-[#C59A55]/30 p-0.5" 
              />
            ) : (
              <ZajelLogo variant={isLight ? 'light' : 'dark'} size="sm" showText={false} />
            )}
            <span className={`text-xs font-bold mt-1 line-clamp-1 max-w-[170px] ${
              isLight ? 'text-[#202D3B]' : 'text-slate-100'
            }`}>
              {activeCompany?.name || settings.name}
            </span>
          </Link>

          {/* Quick Company Switcher Pill */}
          <button
            type="button"
            onClick={() => setShowCompanyModal(true)}
            className={`mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
              isLight 
                ? 'bg-amber-50/80 text-[#C59A55] border-[#C59A55]/40 hover:bg-[#C59A55] hover:text-white' 
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="التبديل بين الشركات المسجلة"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>تبديل المنشأة</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none ${
                  active 
                    ? 'bg-[#C59A55] text-white shadow-md shadow-[#C59A55]/20 font-bold' 
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                <span className="flex-1 text-right">{item.label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom subtle watermark */}
        <div className={`p-3 border-t text-center ${
          isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-700/40'
        }`}>
          <p className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {activeCompany?.name || settings.name}
          </p>
          <p className="text-[10px] text-slate-400">إصدار الشركات v3.0</p>
        </div>
      </aside>

      {/* Interactive Modal for Quick Company Switching */}
      <CompanySwitcherModal 
        isOpen={showCompanyModal} 
        onClose={() => setShowCompanyModal(false)} 
      />
    </>
  );
}
