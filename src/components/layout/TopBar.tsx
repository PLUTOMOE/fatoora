"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, Menu, Sparkles, RefreshCw, CheckCircle2, 
  UserCheck, Shield, ChevronDown, Building2, 
  Sun, Moon, Trash2, Plus, AlertCircle 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useZajelStore } from '@/store/zajelStore';

export function TopBar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useStore();
  const { 
    user, 
    themeMode, 
    toggleThemeMode, 
    companies, 
    activeCompanyId, 
    setActiveCompany, 
    getActiveCompany, 
    resetToDemoData, 
    clearAllData, 
    setUserRole 
  } = useZajelStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCompany = getActiveCompany();

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
    if (pathname.startsWith('/settings')) return { title: 'الإعدادات', subtitle: 'إعدادات المنشأة والحسابات والشركات' };
    return { title: 'النظام المالي', subtitle: 'إدارة الفواتير والحسابات' };
  };

  const pageInfo = getPageInfo();

  const handleResetDemo = () => {
    resetToDemoData();
    setShowDataMenu(false);
    setToastMessage('تم تحميل البيانات التجريبية بنجاح!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('هل أنت متأكد من حذف كافة البيانات والبدء بحساب نظيف تماماً؟')) {
      clearAllData();
      setShowDataMenu(false);
      setToastMessage('تم حذف كافة البيانات بنجاح والبدء ببيانات نظيفة!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const isLight = themeMode === 'light';

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 px-4 sm:px-6 lg:px-8 py-3 print:hidden" dir="rtl">
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
            <h1 className="text-base sm:text-lg font-bold text-[#202D3B] tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center / Left side: Company Selector, Theme Toggle, Data, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* 1. Multi-Company Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowCompanyMenu(!showCompanyMenu); setShowRoleMenu(false); setShowDataMenu(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all shadow-2xs"
              title="تغيير المنشأة / الشركة الحالية"
            >
              <div className="w-5 h-5 rounded-md bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeCompany?.name || 'اختر الشركة'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCompanyMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-right animate-in fade-in slide-in-from-top-1">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span>الشركات والمنشآت ({companies.length})</span>
                  <Link 
                    href="/settings?tab=companies" 
                    onClick={() => setShowCompanyMenu(false)}
                    className="text-[#C59A55] hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة شركة</span>
                  </Link>
                </div>
                <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                  {companies.map((comp) => {
                    const isSelected = comp.id === activeCompanyId;
                    return (
                      <button
                        key={comp.id}
                        onClick={() => {
                          setActiveCompany(comp.id);
                          setShowCompanyMenu(false);
                          setToastMessage(`تم التحويل إلى: ${comp.name}`);
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C59A55]' : 'text-slate-400'}`} />
                          <span className="truncate">{comp.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C59A55] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-100 px-1">
                  <Link
                    href="/settings?tab=companies"
                    onClick={() => setShowCompanyMenu(false)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#C59A55]" />
                    <span>إدارة وإضافة شركات جديدة</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. Light Mode / Dark Sidebar Toggle (الوضع الفاتح) */}
          <button
            onClick={toggleThemeMode}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              isLight
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-2xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 shadow-2xs'
            }`}
            title={isLight ? 'الوضع الفاتح نشط (اضغط للتحويل للقائمة الداكنة)' : 'الوضع الداكن نشط (اضغط للتحويل للوضع الفاتح)'}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span className="text-[11px] font-bold hidden md:inline">الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-300" />
                <span className="text-[11px] font-bold hidden md:inline">الوضع الداكن</span>
              </>
            )}
          </button>

          {/* 3. Data Management (Clean state / Demo dataset) */}
          <div className="relative">
            <button
              onClick={() => { setShowDataMenu(!showDataMenu); setShowCompanyMenu(false); setShowRoleMenu(false); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
              title="إدارة البيانات"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C59A55]" />
              <span className="hidden sm:inline">البيانات</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDataMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-right animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={handleClearData}
                  className="w-full text-right px-3 py-2 text-xs rounded-xl flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>حذف كافة البيانات (تصفير نظيف)</span>
                </button>
                <button
                  onClick={handleResetDemo}
                  className="w-full text-right px-3 py-2 text-xs rounded-xl flex items-center gap-2 hover:bg-amber-50 text-amber-800 font-semibold transition-colors mt-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C59A55] shrink-0" />
                  <span>تحميل بيانات تجريبية جاهزة</span>
                </button>
              </div>
            )}
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 left-6 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#C59A55]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#C59A55]" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* 4. User Profile Info */}
          <div className="relative">
            <button 
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowCompanyMenu(false); setShowDataMenu(false); }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#202D3B] to-[#33475B] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-300">
                أم
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#202D3B] flex items-center gap-1">
                  <span>{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-[#C59A55] font-medium">
                  {user.title} ({user.role === 'admin' ? 'مدير' : user.role === 'accountant' ? 'محاسب' : 'عرض'})
                </div>
              </div>
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-right animate-in fade-in slide-in-from-top-1">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">تبديل الصلاحية (للاختبار):</div>
                <button
                  onClick={() => { setUserRole('admin'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between ${user.role === 'admin' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>مدير (صلاحيات كاملة)</span>
                  {user.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setUserRole('accountant'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between ${user.role === 'accountant' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>محاسب (إنشاء واعتماد)</span>
                  {user.role === 'accountant' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setUserRole('viewer'); setShowRoleMenu(false); }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between ${user.role === 'viewer' ? 'bg-[#C59A55]/15 text-[#C59A55] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
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
