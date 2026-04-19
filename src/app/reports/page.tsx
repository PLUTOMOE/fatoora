"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { 
  TrendingUp, TrendingDown, Receipt, Users, DollarSign, 
  CalendarRange, Download, Loader2, CheckCircle2, Clock, AlertCircle, BarChart3
} from 'lucide-react';

type Period = 'month' | 'quarter' | 'year';

interface InvoiceRow {
  id: string;
  status: string;
  total: number;
  tax_total: number;
  subtotal: number;
  issue_date: string;
  due_date: string | null;
  customer_name: string | null;
  created_at: string;
}

export default function Reports() {
  const { activeEntity } = useStore();
  const supabase = createClient();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    const fetchAll = async () => {
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
            .select('id, status, total, tax_total, subtotal, issue_date, due_date, customer_name, created_at')
            .eq('entity_id', entId)
            .order('created_at', { ascending: true });
          setInvoices((data || []).filter(i => i.status !== 'draft'));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, [activeEntity]);

  // ─── Period filter ───────────────────────────────────────────
  const now = new Date();
  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const d = new Date(inv.issue_date || inv.created_at);
      if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3);
        return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [invoices, period]);

  // ─── Stats ────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    const paid = filtered.filter(i => i.status === 'paid');
    const pending = filtered.filter(i => i.status === 'pending' && (!i.due_date || i.due_date >= today));
    const overdue = filtered.filter(i => i.status === 'pending' && i.due_date && i.due_date < today);
    const sum = (arr: InvoiceRow[]) => arr.reduce((s, i) => s + (Number(i.total) || 0), 0);
    const taxSum = filtered.reduce((s, i) => s + (Number(i.tax_total) || 0), 0);
    const collectRate = filtered.length ? Math.round((paid.length / filtered.length) * 100) : 0;
    return {
      total: sum(filtered), paid: sum(paid), pending: sum(pending), overdue: sum(overdue),
      taxTotal: taxSum, invoiceCount: filtered.length, paidCount: paid.length,
      pendingCount: pending.length, overdueCount: overdue.length, collectRate
    };
  }, [filtered, today]);

  // ─── Monthly chart data (last 6 months) ──────────────────────
  const chartData = useMemo(() => {
    const months: { label: string; revenue: number; tax: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthInvoices = invoices.filter(inv => {
        const id = new Date(inv.issue_date || inv.created_at);
        return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth();
      });
      months.push({
        label: d.toLocaleDateString('ar-SA', { month: 'short' }),
        revenue: monthInvoices.reduce((s, i) => s + (Number(i.total) || 0), 0),
        tax: monthInvoices.reduce((s, i) => s + (Number(i.tax_total) || 0), 0),
        count: monthInvoices.length,
      });
    }
    return months;
  }, [invoices]);

  const maxRevenue = Math.max(...chartData.map(m => m.revenue), 1);

  // ─── Top customers ────────────────────────────────────────────
  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    filtered.forEach(inv => {
      const k = inv.customer_name || 'غير محدد';
      if (!map[k]) map[k] = { name: k, total: 0, count: 0 };
      map[k].total += Number(inv.total) || 0;
      map[k].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filtered]);

  // ─── ZATCA Tax summary ────────────────────────────────────────
  const vatRate = 0.15;
  const netSales = stats.total / (1 + vatRate);
  const vatCollected = stats.taxTotal;

  const periodLabels: Record<Period, string> = {
    month: 'هذا الشهر',
    quarter: 'هذا الربع',
    year: 'هذه السنة',
  };

  const exportCSV = () => {
    const rows = [['رقم الفاتورة', 'العميل', 'التاريخ', 'المبلغ', 'الضريبة', 'الإجمالي', 'الحالة']];
    filtered.forEach(inv => {
      rows.push([
        inv.id.substring(0, 8), inv.customer_name || '—', inv.issue_date || inv.created_at,
        String(inv.subtotal || 0), String(inv.tax_total || 0), String(inv.total || 0), inv.status
      ]);
    });
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `تقرير-${periodLabels[period]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-muted-foreground/60" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">التقارير المالية</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">تحليل أداء فوترتك وإيراداتك</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['month', 'quarter', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${period === p ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {periodLabels[p]}
            </button>
          ))}
          <button onClick={exportCSV} className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border rounded-lg text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" />تصدير CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard icon={DollarSign} label="إجمالي الإيرادات" value={stats.total} color="blue" sub={`${stats.invoiceCount} فاتورة`} />
        <KPICard icon={CheckCircle2} label="المحصّل" value={stats.paid} color="green" sub={`${stats.paidCount} فاتورة · ${stats.collectRate}%`} />
        <KPICard icon={Clock} label="مستحق السداد" value={stats.pending} color="amber" sub={`${stats.pendingCount} فاتورة`} />
        <KPICard icon={AlertCircle} label="متأخر الدفع" value={stats.overdue} color="red" sub={`${stats.overdueCount} فاتورة`} />
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">الإيرادات الشهرية</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">آخر 6 أشهر</p>
          </div>
          <BarChart3 className="w-4 h-4 text-muted-foreground/60" />
        </div>
        <div className="flex items-end gap-2 h-40">
          {chartData.map((m, i) => {
            const h = maxRevenue > 0 ? Math.max((m.revenue / maxRevenue) * 100, 2) : 2;
            const isCurrent = i === 5;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="text-[10px] text-muted-foreground/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {m.revenue > 0 ? `${Number(m.revenue).toLocaleString()} ر.س` : ''}
                </div>
                <div className="w-full flex items-end" style={{ height: '120px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${isCurrent ? 'bg-[#5B5BD6]' : 'bg-[#5B5BD6]/25 group-hover:bg-[#5B5BD6]/50'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">{m.label}</div>
                {m.count > 0 && <div className="text-[10px] text-muted-foreground/50">{m.count}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ZATCA Tax Summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">ملخص ضريبة القيمة المضافة</h2>
              <p className="text-[11px] text-muted-foreground">مطابق لمتطلبات هيئة الزكاة (ZATCA)</p>
            </div>
          </div>
          <div className="space-y-3">
            <TaxRow label="إجمالي المبيعات (قبل الضريبة)" value={netSales} color="text-foreground" />
            <TaxRow label="ضريبة القيمة المضافة المحصّلة (15%)" value={vatCollected} color="text-emerald-600 dark:text-emerald-400" />
            <div className="border-t border-border pt-3">
              <TaxRow label="الإجمالي الكلي (شامل الضريبة)" value={stats.total} color="text-[#5B5BD6] font-bold" bold />
            </div>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-4 text-[12px] text-muted-foreground">لا توجد فواتير في هذه الفترة</div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">أعلى العملاء</h2>
              <p className="text-[11px] text-muted-foreground">حسب إجمالي المشتريات</p>
            </div>
          </div>
          {topCustomers.length === 0 ? (
            <div className="text-center py-6 text-[13px] text-muted-foreground">لا توجد بيانات</div>
          ) : (
            <div className="space-y-2.5">
              {topCustomers.map((c, i) => {
                const pct = stats.total > 0 ? Math.round((c.total / stats.total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums w-4">{i + 1}</span>
                        {c.name}
                      </span>
                      <span className="tabular-nums text-foreground font-semibold">{c.total.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">ر.س</span></span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#5B5BD6] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground">{c.count} فاتورة · {pct}% من الإيرادات</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Collection Rate Visual */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">معدل التحصيل</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="#5B5BD6" strokeWidth="3"
                strokeDasharray={`${stats.collectRate} ${100 - stats.collectRate}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[18px] font-bold text-foreground">{stats.collectRate}%</span>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5B5BD6] inline-block" />مدفوعة</span>
              <span className="font-medium text-foreground">{stats.paid.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />مستحقة</span>
              <span className="font-medium text-foreground">{stats.pending.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E5484D] inline-block" />متأخرة</span>
              <span className="font-medium text-foreground">{stats.overdue.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color, sub }: any) {
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
      <div className="text-[18px] font-bold text-foreground tabular-nums">
        {Number(value || 0).toLocaleString()}
        <span className="text-[11px] font-normal text-muted-foreground mr-1">ر.س</span>
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function TaxRow({ label, value, color, bold }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className={`text-[13px] tabular-nums ${color} ${bold ? 'font-bold' : 'font-medium'}`}>
        {Number(value || 0).toLocaleString()} <span className="text-[10px] font-normal opacity-70">ر.س</span>
      </span>
    </div>
  );
}
