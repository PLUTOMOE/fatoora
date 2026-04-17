"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { Download, Plus, Search, Receipt, MoreHorizontal, Loader2 } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { FilterButton } from '@/components/ui/FilterButton';
import { useStore } from '@/store/useStore';
import { getInvoices } from '@/lib/supabase/services';

export default function InvoicesList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { activeEntity } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

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
        // Fetch only invoices
        const res = await getInvoices(ent.id);
        setData(res?.filter(i => i.type !== 'quotation') || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-foreground tracking-tight">t('pages.invoices.title')</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{data.length === 0 ? 'لا يوجد فواتير بعد' : `${data.length} فاتورة مسجلة`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80">
            <Download className="w-3.5 h-3.5" />
            <span>تصدير</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowCreateMenu(!showCreateMenu)} 
              className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary text-primary-foreground rounded-md text-[12px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('pages.invoices.new')}</span>
            </button>
            
            {showCreateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)}></div>
                <div className="absolute top-10 left-0 w-48 bg-card border border-border shadow-lg rounded-lg outline-none z-50 overflow-hidden py-1">
                  <button 
                    onClick={() => { setShowCreateMenu(false); router.push('/invoices/new'); }}
                    className="w-full text-right px-4 py-2.5 text-[12px] text-foreground hover:bg-muted font-medium flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    فاتورة جديدة كلياً
                  </button>
                  <button 
                    onClick={() => { setShowCreateMenu(false); alert('سيتم فتح نافذة اختيار عرض السعر'); }}
                    className="w-full text-right px-4 py-2.5 text-[12px] text-foreground hover:bg-muted font-medium flex items-center gap-2"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    من عرض سعر موجود
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatStrip label="الإجمالي" value="0" unit="ر.س" />
        <StatStrip label={t('pages.invoices.paid')} value="0" unit="ر.س" color="#22C55E" />
        <StatStrip label="مستحقة" value="0" unit="ر.س" color="#F59E0B" />
        <StatStrip label={t('pages.invoices.overdue')} value="0" unit="ر.س" color="#E5484D" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center px-3 border-b border-border">
          <div className="flex items-center gap-1">
            <Tab active>t('pages.invoices.all')<span className="text-[10px] text-muted-foreground/80 mr-1">{data.length}</span></Tab>
            <Tab>t('pages.invoices.paid')<span className="text-[10px] text-muted-foreground/80 mr-1">0</span></Tab>
            <Tab>مستحقة <span className="text-[10px] text-muted-foreground/80 mr-1">0</span></Tab>
            <Tab>t('pages.invoices.overdue')<span className="text-[10px] text-muted-foreground/80 mr-1">0</span></Tab>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <div className="relative flex-1 max-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
            <input type="text" placeholder="ابحث برقم الفاتورة أو العميل..." className="w-full pr-8 pl-3 h-8 bg-background border border-border rounded-md text-[12px] focus:outline-none focus:border-[#5B5BD6] focus:bg-card" />
          </div>
          <FilterButton label="النوع" />
          <FilterButton label={t('pages.invoices.date')} />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Receipt className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-[13px]">لا يوجد فواتير مُصدرة في هذا الكيان</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
<table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  <th className="text-right font-medium px-3 py-2.5">الفاتورة</th>
                  <th className="text-right font-medium px-3 py-2.5">النوع</th>
                  <th className="text-right font-medium px-3 py-2.5">t('pages.invoices.status')</th>
                  <th className="text-right font-medium px-3 py-2.5">t('pages.invoices.date')</th>
                  <th className="text-left font-medium px-3 py-2.5">t('pages.invoices.amount')</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {data.map((row, i) => (
                  <tr key={i} onClick={() => router.push(`/invoices/${row.invoice_number}`)} className="border-b border-border/50 last:border-0 hover:bg-background transition-colors group cursor-pointer">
                    <td className="px-3 py-3 font-mono text-[12px]">{row.invoice_number}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F0F7FF] text-[#1E40AF]`}>
                        {row.type || 'قياسية'}
                      </span>
                    </td>
                    <td className="px-3 py-3"><StatusPill status={row.status as any} /></td>
                    <td className="px-3 py-3 text-muted-foreground text-[12px]">{new Date(row.created_at).toLocaleDateString('ar-SA')}</td>
                    <td className="px-3 py-3 text-left tabular-nums font-medium text-foreground">
                      {row.total} <span className="text-[10px] text-muted-foreground/80 font-normal">ر.س</span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center hover:bg-border rounded">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
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

function StatStrip({ label, value, unit, color }: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {color && <div className="w-2 h-2 rounded-sm" style={{ background: color }}></div>}
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[18px] font-semibold text-foreground tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground/80">{unit}</span>
      </div>
    </div>
  );
}

function Tab({ children, active }: any) {
  return (
    <button className={`h-9 px-3 text-[12px] border-b-2 transition-colors ${
      active ? 'text-foreground border-[#1A1A1A] font-medium' : 'text-muted-foreground border-transparent hover:text-foreground'
    }`}>
      {children}
    </button>
  );
}
