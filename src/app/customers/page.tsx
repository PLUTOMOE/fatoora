"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Download, Plus, Search, Users, MoreHorizontal, 
  Loader2, Sparkles, ChevronRight, FileText, ArrowLeft
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getCustomers } from '@/lib/supabase/services';

function CustomersListContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeEntity } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoiceCounts, setInvoiceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      let ent: { id: string } | null = null;
      if (activeEntity?.name) {
        const { data } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
        ent = data;
      }
      if (!ent) {
        const { data } = await supabase.from('entities').select('id').limit(1).single();
        ent = data;
      }
      
      if (ent) {
        const [custData, invData] = await Promise.all([
          getCustomers(ent.id),
          supabase.from('invoices').select('id, customer_id').eq('entity_id', ent.id)
        ]);

        setCustomers(custData || []);

        const counts: Record<string, number> = {};
        invData?.data?.forEach((inv: any) => {
          if (inv.customer_id) {
            counts[inv.customer_id] = (counts[inv.customer_id] || 0) + 1;
          }
        });
        setInvoiceCounts(counts);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeEntity, searchParams]);

  // Filtered list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = !searchQuery || 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tax_number?.includes(searchQuery);

      const matchesType = typeFilter === 'all' || c.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [customers, searchQuery, typeFilter]);

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['الاسم', 'النوع', 'البريد', 'الجوال', 'المدينة', 'الرقم الضريبي', 'عدد الفواتير'];
    const rows = customers.map(c => [
      c.name,
      c.type === 'company' ? 'شركة / مؤسسة' : 'فرد',
      c.email || '',
      c.phone || '',
      c.city || '',
      c.tax_number || '',
      invoiceCounts[c.id] || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex h-60 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-0" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('pages.customers.title')}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {customers.length === 0 ? 'لا يوجد عملاء بعد' : `${customers.length} عميل في قاعدة البيانات`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border rounded-md text-[12px] text-foreground hover:border-foreground/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>
          <button onClick={() => router.push('/customers/new')} className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground rounded-md text-[12px] font-medium hover:opacity-90">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('pages.customers.add')}</span>
          </button>
          
          <button 
            onClick={() => router.push('/customers/new?mode=ai')} 
            className="flex items-center gap-1.5 h-8 px-3 bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] hover:opacity-90 text-[#7A5A1A] rounded-md text-[12px] font-bold shadow-sm transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إضافة بملف (AI)</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <div className="relative flex-1 min-w-[220px] max-w-[360px]">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الجوال، أو الرقم الضريبي..."
              className="w-full pr-9 pl-3 h-9 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-9 px-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">كل الأنواع</option>
              <option value="company">شركات / مؤسسات</option>
              <option value="individual">أفراد</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
              <Users className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-[13px]">
                {customers.length === 0 ? 'لا يوجد عملاء مضافين في الكيان الحالي' : 'لا توجد نتائج مطابقة لبحثك'}
              </p>
              {customers.length === 0 && (
                <button onClick={() => router.push('/customers/new')} className="mt-4 text-[12px] text-primary font-medium hover:underline">
                  أضف عميلك الأول الآن
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[650px] text-right">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground/80 uppercase tracking-wider bg-muted/30">
                  <th className="font-semibold px-4 py-3">{t('pages.customers.name')}</th>
                  <th className="font-semibold px-4 py-3">معلومات التواصل</th>
                  <th className="font-semibold px-4 py-3 text-center">عدد الفواتير</th>
                  <th className="font-semibold px-4 py-3">{t('pages.customers.city')}</th>
                  <th className="font-semibold px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {filteredCustomers.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => router.push(`/customers/${row.id}/statement`)}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {row.name?.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{row.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.type === 'company' ? 'شركة / مؤسسة' : 'فرد'}
                            {row.tax_number ? ` · ضريبي: ${row.tax_number}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[12px] text-foreground font-mono">{row.phone || '-'}</div>
                      <div className="text-[11px] text-muted-foreground">{row.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground tabular-nums">
                        {invoiceCounts[row.id] || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground text-xs">
                      {row.city || row.address || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/customers/${row.id}/statement`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                        title="عرض وطباعة كشف الحساب"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>كشف حساب</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomersList() {
  return (
    <Suspense fallback={<div className="flex h-60 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>}>
      <CustomersListContent />
    </Suspense>
  );
}
