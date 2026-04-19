"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { Plus, Search, Receipt, Loader2, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';

type TabKey = 'all' | 'paid' | 'pending' | 'overdue';

export default function InvoicesList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { activeEntity } = useStore();
  const supabase = createClient();

  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let entId: string | null = null;
      if (activeEntity?.name) {
        const { data } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
        entId = data?.id || null;
      }
      if (!entId) {
        const { data } = await supabase.from('entities').select('id').limit(1).single();
        entId = data?.id || null;
      }
      if (entId) {
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('entity_id', entId)
          .order('created_at', { ascending: false });
        setAllInvoices((data || []).filter(i => i.type !== 'quotation'));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeEntity]);

  useEffect(() => { fetchData(); }, [activeEntity]);

  // ─── Computed Stats ───────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    const paid = allInvoices.filter(i => i.status === 'paid');
    const pending = allInvoices.filter(i => i.status === 'pending' && (!i.due_date || i.due_date >= today));
    const overdue = allInvoices.filter(i => i.status === 'pending' && i.due_date && i.due_date < today);
    const sum = (arr: any[]) => arr.reduce((s, i) => s + (Number(i.total) || 0), 0);
    return {
      total: sum(allInvoices),
      paid: { count: paid.length, amount: sum(paid) },
      pending: { count: pending.length, amount: sum(pending) },
      overdue: { count: overdue.length, amount: sum(overdue) },
    };
  }, [allInvoices, today]);

  // ─── Filtering ───────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = allInvoices;
    if (activeTab === 'paid') list = list.filter(i => i.status === 'paid');
    else if (activeTab === 'pending') list = list.filter(i => i.status === 'pending' && (!i.due_date || i.due_date >= today));
    else if (activeTab === 'overdue') list = list.filter(i => i.status === 'pending' && i.due_date && i.due_date < today);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.invoice_number || '').toLowerCase().includes(q) ||
        (i.customer_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allInvoices, activeTab, search, today]);

  // ─── Mark as paid ────────────────────────────────────────────
  const markAsPaid = async (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    setUpdatingId(invoiceId);
    try {
      await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);
      setAllInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' } : i));
    } catch (err: any) { alert(err.message); }
    setUpdatingId(null);
  };

  if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: allInvoices.length },
    { key: 'paid', label: 'مدفوعة', count: stats.paid.count },
    { key: 'pending', label: 'مستحقة', count: stats.pending.count },
    { key: 'overdue', label: 'متأخرة', count: stats.overdue.count },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t('pages.invoices.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {allInvoices.length === 0 ? 'لا يوجد فواتير بعد' : `${allInvoices.length} فاتورة مسجلة`}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>{t('pages.invoices.new')}</span>
          </button>
          {showCreateMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
              <div className="absolute top-11 left-0 w-48 bg-card border border-border shadow-xl rounded-xl z-50 overflow-hidden py-1">
                <button onClick={() => { setShowCreateMenu(false); router.push('/invoices/new'); }} className="w-full text-right px-4 py-2.5 text-[13px] text-foreground hover:bg-muted flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />فاتورة جديدة
                </button>
                <button onClick={() => { setShowCreateMenu(false); router.push('/quotations'); }} className="w-full text-right px-4 py-2.5 text-[13px] text-foreground hover:bg-muted flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" />من عرض سعر
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="إجمالي الإيرادات" amount={stats.total} color="blue" />
        <StatCard icon={CheckCircle2} label="مدفوعة" amount={stats.paid.amount} count={stats.paid.count} color="green" />
        <StatCard icon={Clock} label="مستحقة" amount={stats.pending.amount} count={stats.pending.count} color="amber" />
        <StatCard icon={AlertCircle} label="متأخرة" amount={stats.overdue.amount} count={stats.overdue.count} color="red" />
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-3 border-b border-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`h-10 px-3 text-[13px] border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === tab.key
                  ? 'text-foreground border-[#5B5BD6] font-semibold'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#5B5BD6]/10 text-[#5B5BD6]' : 'bg-muted text-muted-foreground/80'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الفاتورة أو اسم العميل..."
              className="w-full h-9 pr-10 pl-4 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Receipt className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-[13px]">{search ? 'لا توجد نتائج' : 'لا يوجد فواتير في هذا التصنيف'}</p>
            {!search && activeTab === 'all' && (
              <button onClick={() => router.push('/invoices/new')} className="text-[13px] text-[#5B5BD6] font-medium hover:underline">
                أنشئ فاتورتك الأولى
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="divide-y divide-border/50 lg:hidden">
              {displayed.map(row => (
                <div
                  key={row.id}
                  onClick={() => router.push(`/invoices/${row.id}`)}
                  className="p-4 hover:bg-muted/30 active:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-[12px] font-semibold text-foreground">{row.invoice_number || `INV-${String(row.id).padStart(4, '0')}`}</div>
                      <div className="text-[13px] text-foreground mt-0.5">{row.customer_name || '—'}</div>
                    </div>
                    <StatusPill status={row.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-foreground tabular-nums">
                      {Number(row.total || 0).toLocaleString()} <span className="text-[11px] font-normal text-muted-foreground">ر.س</span>
                    </span>
                    {row.status !== 'paid' && (
                      <button
                        onClick={e => markAsPaid(e, row.id)}
                        disabled={updatingId === row.id}
                        className="flex items-center gap-1 text-[12px] text-[#22C55E] font-medium border border-[#22C55E]/30 px-2.5 py-1 rounded-lg hover:bg-[#22C55E]/10 transition-colors disabled:opacity-50"
                      >
                        {updatingId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        تم الدفع
                      </button>
                    )}
                  </div>
                  {row.due_date && (
                    <div className="text-[11px] text-muted-foreground/70 mt-1.5">
                      استحقاق: {new Date(row.due_date).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted-foreground/80 uppercase tracking-wider">
                    <th className="text-right font-medium px-5 py-3">الفاتورة</th>
                    <th className="text-right font-medium px-5 py-3">العميل</th>
                    <th className="text-right font-medium px-5 py-3">الحالة</th>
                    <th className="text-right font-medium px-5 py-3">التاريخ</th>
                    <th className="text-right font-medium px-5 py-3">الاستحقاق</th>
                    <th className="text-left font-medium px-5 py-3">المبلغ</th>
                    <th className="w-28 px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-[13px]">
                  {displayed.map(row => (
                    <tr
                      key={row.id}
                      onClick={() => router.push(`/invoices/${row.id}`)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-mono text-[12px] text-foreground font-medium">
                        {row.invoice_number || `INV-${String(row.id).padStart(4, '0')}`}
                      </td>
                      <td className="px-5 py-3.5 text-foreground">{row.customer_name || '—'}</td>
                      <td className="px-5 py-3.5"><StatusPill status={row.status} /></td>
                      <td className="px-5 py-3.5 text-muted-foreground text-[12px]">
                        {new Date(row.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-5 py-3.5 text-[12px]">
                        {row.due_date ? (
                          <span className={row.due_date < today && row.status !== 'paid' ? 'text-[#E5484D] font-medium' : 'text-muted-foreground'}>
                            {new Date(row.due_date).toLocaleDateString('ar-SA')}
                          </span>
                        ) : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-left font-semibold tabular-nums text-foreground">
                        {Number(row.total || 0).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">ر.س</span>
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        {row.status !== 'paid' && (
                          <button
                            onClick={e => markAsPaid(e, row.id)}
                            disabled={updatingId === row.id}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[12px] text-[#22C55E] font-medium border border-[#22C55E]/30 px-2.5 py-1 rounded-lg hover:bg-[#22C55E]/10 transition-all disabled:opacity-50"
                          >
                            {updatingId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            تم الدفع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, amount, count, color }: any) {
  const styles: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-muted-foreground font-medium leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${styles[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-[18px] font-bold text-foreground tabular-nums leading-none">
        {Number(amount || 0).toLocaleString()}
        <span className="text-[11px] font-normal text-muted-foreground mr-1">ر.س</span>
      </div>
      {count !== undefined && (
        <div className="text-[11px] text-muted-foreground mt-1">{count} فاتورة</div>
      )}
    </div>
  );
}
