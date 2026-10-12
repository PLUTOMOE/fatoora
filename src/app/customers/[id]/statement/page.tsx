"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { 
  Printer, ArrowRight, Download, Calendar, Filter, 
  CreditCard, CheckCircle2, AlertCircle, Clock, 
  FileText, Building2, Phone, Mail, MapPin, Hash,
  Share2, RefreshCw, FileSpreadsheet, Loader2
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  city?: string;
  tax_number?: string;
  address?: string;
  cr_number?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  type: string;
  status: string;
  subtotal: number;
  tax_total: number;
  discount: number;
  total: number;
  notes?: string;
}

export default function CustomerStatementPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const router = useRouter();
  const { activeEntity } = useStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'invoices_only'>('invoices_only');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch customer
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (custErr || !custData) {
        throw new Error('لم يتم العثور على بيانات العميل');
      }
      setCustomer(custData);

      // 2. Fetch invoices for this customer
      const { data: invData, error: invErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('issue_date', { ascending: true });

      if (invErr) throw invErr;
      setInvoices(invData || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  // Filtered transactions
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Document type filter
      if (docTypeFilter === 'invoices_only' && inv.type === 'quotation') {
        return false;
      }

      // Status filter
      if (statusFilter === 'paid' && inv.status !== 'paid') return false;
      if (statusFilter === 'unpaid' && inv.status === 'paid') return false;

      // Date range
      if (startDate && inv.issue_date < startDate) return false;
      if (endDate && inv.issue_date > endDate) return false;

      return true;
    });
  }, [invoices, statusFilter, docTypeFilter, startDate, endDate]);

  // Financial calculations
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalTax = 0;

    filteredInvoices.forEach(inv => {
      if (inv.type !== 'quotation') {
        const val = Number(inv.total) || 0;
        totalInvoiced += val;
        totalTax += Number(inv.tax_total) || 0;
        if (inv.status === 'paid') {
          totalPaid += val;
        }
      }
    });

    const totalBalance = Math.round((totalInvoiced - totalPaid) * 100) / 100;

    return {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalBalance,
      totalTax: Math.round(totalTax * 100) / 100,
      count: filteredInvoices.length
    };
  }, [filteredInvoices]);

  // Running balance calculation
  const ledgerRows = useMemo(() => {
    let balance = 0;
    return filteredInvoices.map(inv => {
      const isQuotation = inv.type === 'quotation';
      const debit = isQuotation ? 0 : (Number(inv.total) || 0);
      const credit = (!isQuotation && inv.status === 'paid') ? (Number(inv.total) || 0) : 0;
      balance += (debit - credit);
      return {
        ...inv,
        debit,
        credit,
        runningBalance: Math.round(balance * 100) / 100
      };
    });
  }, [filteredInvoices]);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!customer || ledgerRows.length === 0) return;
    const headers = ['رقم المستند', 'النوع', 'التاريخ', 'تاريخ الاستحقاق', 'مدين (المستحق)', 'دائن (المسدد)', 'الرصيد التراكمي', 'الحالة'];
    const rows = ledgerRows.map(r => [
      r.invoice_number,
      r.type === 'quotation' ? 'عرض سعر' : 'فاتورة',
      r.issue_date,
      r.due_date || '-',
      r.debit.toFixed(2),
      r.credit.toFixed(2),
      r.runningBalance.toFixed(2),
      r.status === 'paid' ? 'مدفوعة' : 'مستحقة'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement-${customer.name}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp share summary
  const handleShareWhatsApp = () => {
    if (!customer) return;
    const phone = customer.phone?.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `كشف حساب العميل: ${customer.name}\n` +
      `المنشأة: ${activeEntity?.name || 'فاتورة'}\n` +
      `إجمالي الفواتير: ${stats.totalInvoiced.toLocaleString()} ر.س\n` +
      `المبالغ المسددة: ${stats.totalPaid.toLocaleString()} ر.س\n` +
      `الرصيد المستحق الحالي: ${stats.totalBalance.toLocaleString()} ر.س\n` +
      `تاريخ الكشف: ${new Date().toLocaleDateString('ar-SA')}`
    );
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">جاري استخراج كشف الحساب...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">{error || 'العميل غير موجود'}</h2>
        <button 
          onClick={() => router.push('/customers')}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
        >
          العودة لقائمة العملاء
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16" dir="rtl">
      
      {/* Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/customers')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all"
            title="رجوع"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <span>كشف حساب: {customer.name}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              تتبع العمليات والمطالبات المالية والرصيد المستحق
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة عبر واتساب</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-card border border-border hover:bg-muted text-foreground rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 h-9 px-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الحساب / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Controls (Hidden on Print) */}
      <div className="no-print bg-card border border-border p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
          <Filter className="w-3.5 h-3.5" />
          <span>تصفية وتخصيص الكشف</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">نوع المستندات</label>
            <select
              value={docTypeFilter}
              onChange={e => setDocTypeFilter(e.target.value as any)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="invoices_only">الفواتير فقط (المطالبات المؤكدة)</option>
              <option value="all">الكل (الفواتير + عروض الأسعار)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">حالة السداد</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="unpaid">المستحقة وغير المسددة</option>
              <option value="paid">المسددة فقط</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards (Hidden on Print or displayed in compact view) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">إجمالي المطالبات</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {stats.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-muted-foreground mr-1">ر.س</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">المبلغ الإجمالي لجميع الفواتير</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">المبالغ المسددة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-muted-foreground mr-1">ر.س</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">المدفوعات المستلمة فعلياً</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">الرصيد المستحق</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-xl font-extrabold tabular-nums ${stats.totalBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-muted-foreground mr-1">ر.س</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {stats.totalBalance > 0 ? 'مبلغ بانتظار التحصيل' : 'الحساب خالص'}
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">عدد الحركات</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-foreground tabular-nums">
            {stats.count}
            <span className="text-xs font-normal text-muted-foreground mr-1">مستند</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">شامل الفترة المحددة</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Official Printable Statement Document Container */}
      {/* ======================================================== */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm print:p-0 print:border-0 print:shadow-none bg-white text-slate-900 print:text-black">
        
        {/* Printable Header */}
        <div className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            
            {/* Company Info */}
            <div className="space-y-1">
              {activeEntity?.logo_url ? (
                <img 
                  src={activeEntity.logo_url} 
                  alt="Company Logo" 
                  className="h-16 w-auto object-contain mb-3" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-3">
                  {activeEntity?.name?.slice(0, 2) || 'فا'}
                </div>
              )}
              <h2 className="text-xl font-extrabold text-slate-900">{activeEntity?.name || 'فاتورة'}</h2>
              {activeEntity?.tax_number && (
                <p className="text-xs text-slate-600 font-mono">الرقم الضريبي: {activeEntity.tax_number}</p>
              )}
              {activeEntity?.cr_number && (
                <p className="text-xs text-slate-600 font-mono">السجل التجاري: {activeEntity.cr_number}</p>
              )}
              {activeEntity?.address && (
                <p className="text-xs text-slate-600">{activeEntity.address}</p>
              )}
              {activeEntity?.phone && (
                <p className="text-xs text-slate-600 font-mono">هاتف: {activeEntity.phone}</p>
              )}
            </div>

            {/* Document Title & Metadata */}
            <div className="text-left sm:text-left space-y-1">
              <div className="inline-block bg-slate-100 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-black mb-2">
                كشف حساب عميل
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">STATEMENT OF ACCOUNT</p>
              <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                <div><strong>تاريخ الإصدار:</strong> {new Date().toLocaleDateString('ar-SA')}</div>
                <div><strong>الفترة:</strong> {startDate || 'البداية'} إلى {endDate || 'الآن'}</div>
                <div><strong>العملة:</strong> ريال سعودي (SAR)</div>
              </div>
            </div>

          </div>
        </div>

        {/* Customer Information Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">اسم العميل:</span>
              <strong className="text-sm text-slate-900 font-bold">{customer.name}</strong>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                {customer.type === 'company' ? 'شركة / مؤسسة' : 'فرد'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">الرقم الضريبي:</span>
              <strong className="font-mono text-slate-800">{customer.tax_number || 'غير مسجل'}</strong>
              {customer.cr_number && (
                <span className="block text-[11px] text-slate-600 font-mono mt-0.5">
                  س.ت: {customer.cr_number}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">معلومات التواصل والعنوان:</span>
              <div className="text-slate-800 font-mono">{customer.phone || '-'}</div>
              <div className="text-slate-600 text-[11px]">{customer.city || customer.address || '-'}</div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">رقم المستند</th>
                <th className="py-3 px-3">نوع الحركة</th>
                <th className="py-3 px-3">البيان</th>
                <th className="py-3 px-3 text-left">مدين (المستحق)</th>
                <th className="py-3 px-3 text-left">دائن (المسدد)</th>
                <th className="py-3 px-3 text-left">الرصيد التراكمي</th>
                <th className="py-3 px-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    لا توجد فواتير أو حركات مسجلة لهذا العميل في الفترة المحددة
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">{row.issue_date}</td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">{row.invoice_number}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {row.type === 'quotation' ? (
                        <span className="text-amber-600 font-medium">عرض سعر</span>
                      ) : (
                        <span className="text-slate-700">فاتورة ضريبية</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate text-slate-600">
                      {row.notes || (row.type === 'quotation' ? 'عرض سعر مقدم للعميل' : 'فاتورة مبيعات')}
                    </td>
                    <td className="py-3 px-3 text-left font-mono tabular-nums font-semibold">
                      {row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono tabular-nums text-emerald-600 font-semibold">
                      {row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono tabular-nums font-bold text-slate-900">
                      {row.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.status === 'paid' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          مدفوعة
                        </span>
                      ) : row.type === 'quotation' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          عرض سعر
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          مستحقة
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statement Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end items-end gap-6 border-t border-slate-200 pt-4 mb-10">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 py-1">
              <span>إجمالي المطالبات المفوترة:</span>
              <span className="font-mono font-bold text-slate-900">
                {stats.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between text-slate-600 py-1">
              <span>إجمالي المبالغ المسددة:</span>
              <span className="font-mono font-bold text-emerald-600">
                {stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between text-slate-600 py-1 border-t border-slate-200 pt-2 text-sm font-extrabold">
              <span className="text-slate-900">الرصيد المستحق النهائي:</span>
              <span className={`font-mono ${stats.totalBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Signatures & Approvals (Designed specifically for printing) */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div className="space-y-12">
            <p className="font-bold text-slate-800">إعداد المحاسب</p>
            <div className="border-b border-dashed border-slate-300 w-32 mx-auto"></div>
          </div>

          <div className="space-y-12">
            <p className="font-bold text-slate-800">المدير المالي / الاعتماد</p>
            <div className="border-b border-dashed border-slate-300 w-32 mx-auto"></div>
          </div>

          <div className="space-y-12">
            <p className="font-bold text-slate-800">ختم المنشأة</p>
            <div className="border-b border-dashed border-slate-300 w-32 mx-auto"></div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-[10px] text-slate-400">
          تم إنشاء هذا الكشف آلياً بواسطة منصة فاتورة لإدارة الفوترة الإلكترونية المعتمدة · لا يعتبر هذا المستند إشعار دائن أو مدين ضريبي
        </div>

      </div>

    </div>
  );
}
