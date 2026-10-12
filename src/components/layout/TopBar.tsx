"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bell, Menu, Sparkles, RefreshCw, CheckCircle2, 
  UserCheck, Shield, ChevronDown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useZajelStore } from '@/store/zajelStore';

export function TopBar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useStore();
  const { user, resetToDemoData, setUserRole } = useZajelStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [demoNotice, setDemoNotice] = useState(false);

  // Page title resolution
  const getPageInfo = () => {
    if (pathname === '/') return { title: 'الرئيسية', subtitle: 'نظرة سريعة على نشاطك اليوم' };
    if (pathname.startsWith('/quotations/new')) return { title: 'عرض سعر جديد', subtitle: 'إصدار عرض سعر مالي جديد' };
    if (pathname.startsWith('/quotations')) return { title: 'عروض الأسعار', subtitle: 'إدارة عروض الأسعار ومتابعتها' };
    if (pathname.startsWith('/invoices/new')) return { title: 'إنشاء فاتورة جديدة', subtitle: 'إصدار فاتورة مبيعات جديدة للعميل' };
    if (pathname.startsWith('/invoices')) return { title: 'الفواتير', subtitle: 'إدارة الفواتير المعتمدة والمسودات' };
    if (pathname.includes('/statement')) return { title: 'كشف حساب العميل', subtitle: 'عرض حركة حساب العميل ومتابعة أرصدته' };
    if (pathname.startsWith('/customers')) return { title: 'العملاء', subtitle: 'إدارة بيانات العملاء والأرصدة' };
    if (pathname.startsWith('/receipt-vouchers/new')) return { title: 'سند قبض جديد', subtitle: 'تسجيل تحصيل مالي من العميل' };
    if (pathname.startsWith('/receipt-vouchers')) return { title: 'سندات القبض', subtitle: 'إدارة تحصيلات وسندات القبض' };
    if (pathname.startsWith('/payment-vouchers/new')) return { title: 'سند صرف جديد', subtitle: 'تسجيل دفعة لمورد أو مصروفات عامة' };
    if (pathname.startsWith('/payment-vouchers')) return { title: 'سندات الصرف', subtitle: 'إدارة المدفوعات والمصروفات' };
    if (pathname.startsWith('/products')) return { title: 'الأصناف والخدمات', subtitle: 'قائمة بنود الفواتير وعروض الأسعار' };
    if (pathname.startsWith('/settings')) return { title: 'الإعدادات', subtitle: 'إعدادات المنشأة والحسابات البنكية' };
    return { title: 'زاجل النخبة', subtitle: 'نظام الإدارة المالية المعتمد' };
  };

  const pageInfo = getPageInfo();

  const handleResetDemo = () => {
    resetToDemoData();
    setDemoNotice(true);
    setTimeout(() => setDemoNotice(false), 3000);
  };

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 px-4 sm:px-6 lg:px-8 py-3.5 print:hidden" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        
        {/* Right side: Page Title & Mobile Menu toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#202D3B] tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Left side: Demo Data Badge + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Demo Data Quick Action (As requested in section 16 and visible in mockup top right!) */}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C59A55]/10 text-[#C59A55] border border-[#C59A55]/30 hover:bg-[#C59A55] hover:text-white transition-all shadow-xs"
            title="إعادة تحميل البيانات التجريبية المطابقة للمواصفات"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بيانات تجريبية</span>
            <span className="sm:hidden">تجريبي</span>
          </button>

          {demoNotice && (
            <div className="fixed top-16 left-6 bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تحميل بيانات زاجل النخبة التجريبية بنجاح!</span>
            </div>
          )}

          {/* Notification Icon */}
          <div className="relative">
            <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#C59A55]" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Info */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#202D3B] to-[#33475B] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-300">
                أم
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#202D3B] flex items-center gap-1">
                  <span>{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[11px] text-[#C59A55] font-medium">
                  {user.title} ({user.role === 'admin' ? 'مدير' : user.role === 'accountant' ? 'محاسب' : 'عرض'})
                </div>
              </div>
            </button>

            {/* Quick Role Switcher Dropdown (Requirements section 14: مدير، محاسب، مستخدم عرض) */}
            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-right">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">تبديل الصلاحية (للاختبار):</div>
                <button
                  onClick={() => { setUserRole('admin'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${user.role === 'admin' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>مدير (صلاحيات كاملة)</span>
                  {user.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setUserRole('accountant'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${user.role === 'accountant' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>محاسب (إنشاء واعتماد)</span>
                  {user.role === 'accountant' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setUserRole('viewer'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${user.role === 'viewer' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>مستخدم عرض (اطلاع وطباعة)</span>
                  {user.role === 'viewer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
