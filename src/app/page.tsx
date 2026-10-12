"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { createClient } from '@/lib/supabase/client';
import { Plus, ChevronLeft, Sparkles, Upload, ScrollText, Receipt, Users, FileText, Package } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ invoices: 0, customers: 0, products: 0 });

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      
      // جلب أحدث 5 فواتير (استبعاد عروض الأسعار)
      const { data: inv } = await supabase
        .from('invoices')
        .select('*, customers(name)')
        .neq('type', 'quotation')
        .order('created_at', { ascending: false })
        .limit(5);
      if (inv) setInvoices(inv);

      // جلب الإحصائيات (الفواتير الفعلية فقط)
      const [{ count: invCount }, { count: custCount }, { count: prodCount }] = await Promise.all([
        supabase.from('invoices').select('*', { count: 'exact', head: true }).neq('type', 'quotation'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ invoices: invCount || 0, customers: custCount || 0, products: prodCount || 0 });
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-[14px] text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/invoices/new')}
          className="group relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] dark:from-[#1e1e30] dark:to-[#2a2a50] text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold mb-1">{t('dashboard.new_invoice')}</div>
              <div className="text-sm text-white/60">إنشاء فاتورة ضريبية جديدة</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/quotations/new')}
          className="group relative overflow-hidden bg-gradient-to-br from-[#5B5BD6] to-[#7B7BF6] dark:from-[#4a4ac0] dark:to-[#6a6ae0] text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ScrollText className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold mb-1">{t('dashboard.new_quotation')}</div>
              <div className="text-sm text-white/60">إنشاء عرض سعر احترافي</div>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#5B5BD6]/10 dark:bg-[#7b8fff]/10 flex items-center justify-center mx-auto mb-2">
            <Receipt className="w-5 h-5 text-[#5B5BD6] dark:text-[#7b8fff]" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{stats.invoices}</div>
          <div className="text-xs text-muted-foreground mt-0.5">فواتير</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{stats.customers}</div>
          <div className="text-xs text-muted-foreground mt-0.5">عملاء</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-2">
            <Package className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{stats.products}</div>
          <div className="text-xs text-muted-foreground mt-0.5">منتجات</div>
        </div>
      </div>

      {/* Latest Invoices */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-semibold text-foreground">{t('dashboard.latest_invoices')}</h3>
          <button onClick={() => router.push('/invoices')} className="text-[13px] text-[#5B5BD6] hover:underline flex items-center gap-1">
            {t('dashboard.view_all')}<ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد فواتير بعد</p>
            <button onClick={() => router.push('/invoices')} className="mt-3 text-sm text-[#5B5BD6] hover:underline">
              أنشئ فاتورتك الأولى →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground/80 uppercase tracking-wider">
                  <th className="text-right font-medium px-5 py-2.5">{t('dashboard.invoice')}</th>
                  <th className="text-right font-medium px-5 py-2.5">{t('dashboard.customer')}</th>
                  <th className="text-right font-medium px-5 py-2.5">{t('dashboard.status')}</th>
                  <th className="text-left font-medium px-5 py-2.5">{t('dashboard.amount')}</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {invoices.map((row, i) => (
                  <tr key={i} onClick={() => router.push(`/invoices/${row.id}`)} className="border-b border-border/50 last:border-0 hover:bg-background transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="font-mono text-[12px] text-foreground font-medium">{row.invoice_number || `INV-${String(i + 1).padStart(3, '0')}`}</div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{row.customers?.name || 'عميل غير محدد'}</td>
                    <td className="px-5 py-3"><StatusPill status={row.status || 'pending'} /></td>
                    <td className="px-5 py-3 text-left tabular-nums font-medium text-foreground">
                      {Number(row.total || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground/80 font-normal">{t('common.sar')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Reader Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FFE2A8] to-[#E8B96B] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#7A5A1A]" />
            </div>
            <h3 className="text-[14px] font-semibold text-foreground">قراءة AI</h3>
          </div>
          <span className="text-[10px] bg-[#FEF6E3] dark:bg-[#3a3520] text-[#7A5A1A] dark:text-[#E8B96B] px-2 py-0.5 rounded-full font-bold">جديد</span>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
            ارفع أي عرض سعر خارجي (PDF أو صورة) واترك الذكاء الاصطناعي يستخرج البيانات ويحوّلها لفاتورة.
          </p>
          <button onClick={() => router.push('/ai-reader')} className="w-full flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-[#A88732] to-[#D4AC4A] hover:from-[#B8972A] hover:to-[#E4BC5A] text-white rounded-xl text-[13px] font-semibold shadow-md transition-all hover:-translate-y-0.5">
            <Upload className="w-4 h-4" />
            <span>ارفع ملف</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3">الإجراءات السريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={Sparkles} title="قراءة عرض خارجي" desc="حوّل أي عرض لفاتورة" badge="AI" onClick={() => router.push('/ai-reader')} />
          <QuickAction icon={ScrollText} title={t('dashboard.new_quotation')} desc="أنشئ عرض احترافي" onClick={() => router.push('/quotations/new')} />
          <QuickAction icon={Receipt} title="فاتورة سريعة" desc="فاتورة ضريبية في ثواني" onClick={() => router.push('/invoices/new')} />
          <QuickAction icon={Users} title="إضافة عميل" desc="سجّل عميل جديد" onClick={() => router.push('/customers')} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, badge, onClick }: any) {
  return (
    <button onClick={onClick} className="text-right p-4 bg-card border border-border rounded-xl hover:border-[#5B5BD6]/30 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-[#5B5BD6] flex items-center justify-center transition-colors">
          <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-white transition-colors" />
        </div>
        {badge && <span className="text-[10px] bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] text-[#7A5A1A] px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
      </div>
      <div className="text-[13px] font-medium text-foreground mb-0.5">{title}</div>
      <div className="text-[11px] text-muted-foreground/80">{desc}</div>
    </button>
  );
}
