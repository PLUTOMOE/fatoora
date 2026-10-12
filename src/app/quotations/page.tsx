"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, Printer, Eye, 
  ArrowRightLeft, Copy, Trash2, Calendar, 
  FileText, CheckCircle2, Clock, XCircle, ArrowRight
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { Quotation, QuotationStatus } from '@/types/zajel';
import { formatCurrency, formatDate } from '@/lib/zajelUtils';

export default function QuotationsPage() {
  const { quotations, customers, convertQuotationToInvoice, duplicateQuotation, deleteQuotation } = useZajelStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedQuoId, setSelectedQuoId] = useState<string>(quotations[0]?.id || '');
  const [notice, setNotice] = useState<string | null>(null);

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const customer = customers.find((c) => c.id === q.customerId);
      const customerName = customer?.name || '';
      
      const matchesSearch = 
        q.number.toLowerCase().includes(search.toLowerCase()) ||
        customerName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      const matchesFrom = !fromDate || q.date >= fromDate;
      const matchesTo = !toDate || q.date <= toDate;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [quotations, customers, search, statusFilter, fromDate, toDate]);

  // Selected quotation
  const selectedQuo = useMemo(() => {
    return quotations.find((q) => q.id === selectedQuoId) || filteredQuotations[0] || null;
  }, [quotations, selectedQuoId, filteredQuotations]);

  const selectedCustomer = useMemo(() => {
    if (!selectedQuo) return null;
    return customers.find((c) => c.id === selectedQuo.customerId);
  }, [selectedQuo, customers]);

  const handleConvert = (id: string) => {
    try {
      const invoiceId = convertQuotationToInvoice(id);
      setNotice('تم تحويل عرض السعر إلى فاتورة مبيعات بنجاح!');
      setTimeout(() => {
        router.push(`/invoices/${invoiceId}`);
      }, 800);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التحويل');
    }
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicateQuotation(id);
    if (newId) {
      setSelectedQuoId(newId);
      setNotice('تم نسخ عرض السعر بنجاح كمسودة جديدة');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const statusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">مسودة</span>;
      case 'sent':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">مرسل</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">مقبول</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">مرفوض</span>;
      case 'expired':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">منتهي</span>;
      case 'converted':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">تم تحويله</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">عروض الأسعار</h2>
          <p className="text-xs text-slate-500 mt-0.5">إدارة عروض الأسعار ومتابعة الموافقات والتحويل إلى فواتير</p>
        </div>

        <Link
          href="/quotations/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>عرض سعر جديد</span>
        </Link>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter Toolbar (Mockup 2) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم العرض أو العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-xs text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسل</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="expired">منتهي</option>
            <option value="converted">تم تحويله لفاتورة</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            placeholder="من تاريخ"
          />
        </div>

        <div>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>

      {/* Main Grid: Quotations Table & Preview Panel (Mockup 2 Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">رقم العرض</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      لا توجد عروض أسعار مطابقة لخيارات البحث
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q) => {
                    const customer = customers.find((c) => c.id === q.customerId);
                    const isSelected = selectedQuo?.id === q.id;

                    return (
                      <tr 
                        key={q.id}
                        onClick={() => setSelectedQuoId(q.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#C59A55]/10 font-medium' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                          {q.number}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">
                          {customer?.name || 'عميل نقدي'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {formatDate(q.date)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#202D3B]">
                          {q.total.toLocaleString('en-US')} ر.س
                        </td>
                        <td className="py-3.5 px-4">
                          {statusBadge(q.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Quotation Details Panel (Mockup 2 Right/Left Panel - 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          {selectedQuo ? (
            <div className="space-y-6">
              
              {/* Header with status */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-medium text-slate-400">تفاصيل عرض السعر</div>
                  <h3 className="text-xl font-bold font-mono text-[#202D3B] mt-1">{selectedQuo.number}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(selectedQuo.status)}
                  <div className="w-10 h-10 rounded-xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Overview Details */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">العميل</span>
                  <span className="font-bold text-slate-800">{selectedCustomer?.name || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">تاريخ العرض</span>
                  <span className="font-mono text-slate-700">{formatDate(selectedQuo.date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">تاريخ الانتهاء</span>
                  <span className="font-mono text-slate-700">{formatDate(selectedQuo.expiryDate)}</span>
                </div>
                {selectedQuo.reference && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">مرجع العميل</span>
                    <span className="font-mono text-slate-700">{selectedQuo.reference}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-xl">
                  <span className="font-semibold text-slate-600">المبلغ الإجمالي</span>
                  <span className="text-base font-bold text-[#202D3B]">
                    {selectedQuo.total.toLocaleString('en-US')} ر.س
                  </span>
                </div>
              </div>

              {/* Items Summary list */}
              <div>
                <div className="text-xs font-bold text-[#202D3B] mb-2">البنود ({selectedQuo.items.length}):</div>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedQuo.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-800">{item.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.quantity} {item.unit} × {item.unitPrice.toLocaleString('en-US')} ر.س
                        </div>
                      </div>
                      <div className="font-bold text-[#202D3B]">
                        {item.total.toLocaleString('en-US')} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons (Mockup 2: «تحويل إلى فاتورة» - «طباعة» - «معاينة») */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {selectedQuo.status === 'converted' ? (
                  <Link
                    href={`/invoices/${selectedQuo.convertedToInvoiceId}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>عرض الفاتورة المرتبطة</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleConvert(selectedQuo.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>تحويل إلى فاتورة</span>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/quotations/${selectedQuo.id}?print=true`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </Link>
                  <Link
                    href={`/quotations/${selectedQuo.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </Link>
                  <button
                    onClick={() => handleDuplicate(selectedQuo.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    title="نسخ العرض كمسودة جديدة"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <span>اختر عرض سعر من القائمة لعرض تفاصيله</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
