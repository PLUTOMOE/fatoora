"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { Download, Search, ScrollText, Filter, MoreHorizontal, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStore } from '@/store/useStore';
import { getInvoices } from '@/lib/supabase/services';

export default function QuotationsList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { activeEntity } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeEntity.name) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeEntity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (ent) {
        // Fetch only quotations
        const res = await getInvoices(ent.id);
        setData(res?.filter(i => i.type === 'quotation') || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[24px] font-semibold text-foreground tracking-tight">{t('pages.quotations.title')}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{data.length === 0 ? 'لا يوجد عروض أسعار بعد' : `${data.length} عرض سعر مسجل`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/ai-reader')} className="flex items-center justify-center gap-2 h-9 px-4 bg-card border-2 border-border hover:border-[#E8B96B] hover:bg-[#FFFAF0] text-foreground rounded-lg text-[12px] font-semibold transition-all group shadow-sm">
            <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-[#FFE2A8] to-[#E8B96B] flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-[#7A5A1A]" />
            </div>
            <span className="group-hover:text-[#7A5A1A] transition-colors">{t('pages.quotations.ai_upload')}</span>
          </button>
          <button onClick={() => router.push('/quotations/new')} className="flex items-center justify-center gap-2 h-9 px-4 bg-gradient-to-r from-[#5B5BD6] to-[#4A4AC4] hover:from-[#4A4AC4] hover:to-[#3838A6] text-primary-foreground rounded-lg text-[13px] font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <ScrollText className="w-3.5 h-3.5" />
            <span>إنشاء عرض سعر يدوي</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-border flex flex-wrap gap-2 items-center justify-between bg-background">
          <div className="flex items-center gap-1.5">
            <button className="h-7 px-3 bg-card border border-border rounded-md text-[11px] font-medium text-foreground shadow-sm">الكل ({data.length})</button>
            <button className="h-7 px-3 bg-transparent text-muted-foreground hover:text-foreground rounded-md text-[11px] font-medium transition-colors">مقبول (0)</button>
            <button className="h-7 px-3 bg-transparent text-muted-foreground hover:text-foreground rounded-md text-[11px] font-medium transition-colors">مرفوض (0)</button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-[240px]">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
              <input type="text" placeholder="بحث برقم العرض..." className="w-full pr-8 pl-3 h-7 bg-card border border-border rounded-md text-[11px] focus:outline-none focus:border-[#5B5BD6]" />
            </div>
            <button className="h-7 px-2.5 bg-card border border-border rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ScrollText className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-[13px]">لا يوجد عروض أسعار في هذا الكيان</p>
              <button onClick={() => router.push('/quotations/new')} className="mt-4 text-[12px] text-[#5B5BD6] font-medium hover:underline">
                أضف أول عرض سعر الآن
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
<table className="w-full text-right">
              <thead>
                <tr className="border-b border-border text-[11px] font-medium text-muted-foreground bg-card">
                  <th className="py-2.5 px-4 w-12 text-center"><input type="checkbox" className="rounded-sm border-border accent-[#5B5BD6]" /></th>
                  <th className="py-2.5 px-4 font-medium">{t('pages.quotations.number')}</th>
                  <th className="py-2.5 px-4 font-medium">{t('pages.quotations.customer')}</th>
                  <th className="py-2.5 px-4 font-medium">تاريخ العرض</th>
                  <th className="py-2.5 px-4 font-medium">{t('pages.quotations.status')}</th>
                  <th className="py-2.5 px-4 font-medium text-left w-32">الإجمالي</th>
                  <th className="py-2.5 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((q) => (
                  <tr key={q.id} className="border-b border-border/50 last:border-0 hover:bg-background transition-colors group text-[13px]">
                    <td className="py-3 px-4 text-center"><input type="checkbox" className="rounded-sm border-border accent-[#5B5BD6] opacity-50 group-hover:opacity-100" /></td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-foreground">{q.invoice_number}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground">عميل غير محدد</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(q.created_at).toLocaleDateString('ar-SA')}</td>
                    <td className="py-3 px-4"><StatusPill status={q.status as any} /></td>
                    <td className="py-3 px-4 text-left font-medium text-foreground tabular-nums">{q.total} ر.س</td>
                    <td className="py-3 px-4 text-left">
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 inline-flex items-center justify-center hover:bg-border rounded transition-all">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          )}
        </div>
      </div>
    </div>
  );
}
