"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Receipt, CheckCircle2, Clock, ScrollText, 
  Plus, ArrowDownLeft, ArrowUpRight, ArrowLeft, 
  Printer, Eye, Calendar, Building2, User, ChevronLeft
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { formatCurrency, formatDate } from '@/lib/zajelUtils';

export default function DashboardPage() {
  const { invoices, quotations, customers, activeCompanyId, getCustomerBalance } = useZajelStore();
  const [period, setPeriod] = useState<'today' | 'month' | 'all'>('month');

  // Filter invoices and quotations by company and period
  const companyInvoices = useMemo(() => {
    return invoices.filter(inv => !inv.companyId || inv.companyId === activeCompanyId);
  }, [invoices, activeCompanyId]);

  const companyQuotations = useMemo(() => {
    return quotations.filter(q => !q.companyId || q.companyId === activeCompanyId);
  }, [quotations, activeCompanyId]);

  const companyCustomers = useMemo(() => {
    return customers.filter(c => !c.companyId || c.companyId === activeCompanyId);
  }, [customers, activeCompanyId]);

  // Filter invoices and quotations by period
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let periodInvoices = companyInvoices.filter(inv => inv.documentStatus === 'approved');
    let periodQuotations = companyQuotations;

    if (period === 'today') {
      periodInvoices = periodInvoices.filter(inv => inv.date === todayStr);
      periodQuotations = periodQuotations.filter(q => q.date === todayStr);
    } else if (period === 'month') {
      periodInvoices = periodInvoices.filter(inv => inv.date >= firstDayOfMonth);
      periodQuotations = periodQuotations.filter(q => q.date >= firstDayOfMonth);
    }

    const totalInvoicesAmount = periodInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const totalCollected = periodInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const totalDue = Math.max(0, totalInvoicesAmount - totalCollected);
    const quotationsCount = periodQuotations.length;

    return {
      periodInvoices,
      totalInvoicesAmount,
      totalCollected,
      totalDue,
      quotationsCount,
    };
  }, [companyInvoices, companyQuotations, period]);

  // Customers with due balances
  const customersWithDue = useMemo(() => {
    return companyCustomers
      .map(c => ({
        ...c,
        balance: getCustomerBalance(c.id),
      }))
      .filter(c => c.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [companyCustomers, getCustomerBalance]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Welcome & Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">مرحباً بك في زاجل النخبة</h2>
          <p className="text-xs text-slate-500 mt-0.5">نظرة سريعة وشاملة على مؤشراتك المالية ونشاطك التجاري</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'today' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            اليوم
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'month' ? 'bg-[#C59A55] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الشهر
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'all' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جميع الفترات
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards (Mockup 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: إجمالي الفواتير */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">إجمالي الفواتير</div>
            <div className="text-2xl font-bold text-[#202D3B] mt-1.5 tracking-tight">
              {filteredData.totalInvoicesAmount.toLocaleString('en-US')}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">الفواتير المعتمدة للفترة</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C59A55]/10 text-[#C59A55] flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: المبالغ المحصلة */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">المبالغ المحصلة</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1.5 tracking-tight">
              {filteredData.totalCollected.toLocaleString('en-US')}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-1">تم تحصيله من الفواتير</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: المبالغ المستحقة */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">المبالغ المستحقة</div>
            <div className="text-2xl font-bold text-amber-600 mt-1.5 tracking-tight">
              {filteredData.totalDue.toLocaleString('en-US')}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <div className="text-[11px] text-amber-600/80 mt-1">متبقي غير محصل</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: عروض الأسعار */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">عروض الأسعار</div>
            <div className="text-2xl font-bold text-[#202D3B] mt-1.5 tracking-tight">
              {filteredData.quotationsCount}
              <span className="text-xs font-normal text-slate-400 mr-1.5">عرض</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">عروض الأسعار الصادرة</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#202D3B] flex items-center justify-center shrink-0">
            <ScrollText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Actions Action Bar (Mockup 1) */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <Link
          href="/quotations/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>عرض سعر جديد</span>
        </Link>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-[#C59A55]/10 border border-slate-200 hover:border-[#C59A55]/40 text-[#202D3B] text-xs font-bold transition-all"
        >
          <Receipt className="w-4 h-4 text-[#C59A55]" />
          <span>فاتورة جديدة</span>
        </Link>
        <Link
          href="/receipt-vouchers/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          <span>سند قبض</span>
        </Link>
        <Link
          href="/payment-vouchers/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600" />
          <span>سند صرف</span>
        </Link>
      </div>

      {/* Two Column Layout: Recent Invoices & Due Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: أحدث الفواتير (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#202D3B] text-base">أحدث الفواتير</h3>
              <p className="text-xs text-slate-400 mt-0.5">سجل بآخر الفواتير الصادرة وحالات سدادها</p>
            </div>
            <Link 
              href="/invoices" 
              className="text-xs font-semibold text-[#C59A55] hover:underline flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">رقم الفاتورة</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-xs text-slate-600">لا توجد فواتير مسجلة بعد في هذه الشركة</p>
                      <p className="text-[11px] text-slate-400 mt-1">ابدأ بإصدار أول فاتورة مبيعات الآن</p>
                      <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-[#C59A55] text-white text-[11px] font-bold shadow-xs hover:bg-[#B38944]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>فاتورة جديدة</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  companyInvoices.slice(0, 5).map((inv) => {
                    const customer = companyCustomers.find(c => c.id === inv.customerId);
                  
                  // Status badge helper
                  const isPaid = inv.paymentStatus === 'paid';
                  const isPartial = inv.paymentStatus === 'partial';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-[#C59A55] transition-colors">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {customer?.name || inv.snapshotCustomer?.name || 'عميل نقدي'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(inv.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#202D3B]">
                        {inv.total.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            مدفوعة
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            جزئية
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            غير مدفوعة
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="معاينة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/invoices/${inv.id}?print=true`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#C59A55] hover:bg-[#C59A55]/10 transition-colors"
                            title="طباعة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: أصحاب الأرصدة المستحقة (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col p-5">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#202D3B] text-base">الأرصدة المستحقة</h3>
              <p className="text-xs text-slate-400 mt-0.5">عملاء لديهم مبالغ غير محصلة</p>
            </div>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-md">
              {customersWithDue.length} عملاء
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {customersWithDue.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                لا توجد مستحقات متأخرة على العملاء حالياً
              </div>
            ) : (
              customersWithDue.map((c) => (
                <div 
                  key={c.id} 
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#202D3B] truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{c.phone}</div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-xs font-bold text-rose-600">
                      {c.balance.toLocaleString('en-US')} ر.س
                    </div>
                    <Link
                      href={`/customers/${c.id}/statement`}
                      className="text-[11px] font-semibold text-[#C59A55] hover:underline inline-block mt-0.5"
                    >
                      كشف حساب
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link
              href="/customers"
              className="text-xs font-semibold text-slate-600 hover:text-[#C59A55] transition-colors"
            >
              عرض قائمة جميع العملاء ←
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
