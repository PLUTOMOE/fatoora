"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Download, Plus, Search, Users, MoreHorizontal, Loader2, Sparkles } from 'lucide-react';
import { FilterButton } from '@/components/ui/FilterButton';
import { useStore } from '@/store/useStore';
import { getCustomers, createCustomer } from '@/lib/supabase/services';
import { QuickAddCustomerModal } from '@/components/ui/QuickAddCustomerModal';

export default function CustomersList() {
  const { t } = useTranslation();
  const { activeEntity } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'none' | 'normal' | 'ai'>('none');

  useEffect(() => {
    if (activeEntity.name) {
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, [activeEntity]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (ent) {
        const data = await getCustomers(ent.id);
        setCustomers(data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };


  if (loading) {
    return <div className="flex h-60 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t('pages.customers.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {customers.length === 0 ? 'لا يوجد عملاء بعد' : `${customers.length} عميل في قاعدة البيانات`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border rounded-md text-[12px] text-foreground hover:border-foreground/20">
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>
          <button onClick={() => setModalMode('normal')} className="flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground rounded-md text-[12px] font-medium hover:opacity-90">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('pages.customers.add')}</span>
          </button>
          
          <button 
            onClick={() => setModalMode('ai')} 
            className="flex items-center gap-1.5 h-8 px-3 bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] hover:opacity-90 text-[#7A5A1A] rounded-md text-[12px] font-bold shadow-sm transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إضافة بملف (AI)</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
            <input
              type="text"
              placeholder={t('pages.customers.search')}
              className="w-full pr-8 pl-3 h-8 bg-background border border-border rounded-md text-[12px] focus:outline-none focus:border-[#5B5BD6]"
            />
          </div>
          <FilterButton label="النوع" />
          <FilterButton label={t('pages.customers.city')} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
              <Users className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-[13px]">لا يوجد عملاء مضافين في الكيان الحالي</p>
              <button onClick={() => setModalMode('normal')} className="mt-4 text-[12px] text-[#5B5BD6] font-medium hover:underline">
                أضف عميلك الأول الآن
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  <th className="text-right font-medium px-4 py-2.5">{t('pages.customers.name')}</th>
                  <th className="text-right font-medium px-4 py-2.5">معلومات التواصل</th>
                  <th className="text-center font-medium px-4 py-2.5">الفواتير</th>
                  <th className="text-right font-medium px-4 py-2.5">{t('pages.customers.city')}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {customers.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors group cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-[11px] text-muted-foreground">{row.name?.substring(0,2)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{row.name}</div>
                          <div className="text-[11px] text-muted-foreground/80">{row.type === 'company' ? 'شركة / مؤسسة' : 'فرد'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-foreground">{row.email || '-'}</div>
                      <div className="text-[11px] font-mono text-muted-foreground/80">{row.phone || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">0</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.city || '-'}</td>
                    <td className="px-4 py-3">
                      <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center hover:bg-border rounded transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <QuickAddCustomerModal 
        isOpen={modalMode !== 'none'}
        initialAiMode={modalMode === 'ai'}
        onClose={() => setModalMode('none')}
        initialName=""
        onSuccess={() => {
          fetchCustomers();
          setModalMode('none');
        }}
      />
    </div>
  );
}
