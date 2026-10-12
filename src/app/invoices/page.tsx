"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Printer, Eye, 
  ArrowDownLeft, XCircle, CheckCircle2, 
  Clock, AlertCircle, FileText 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { InvoiceDocumentStatus, InvoicePaymentStatus } from '@/types/zajel';
import { formatDate } from '@/lib/zajelUtils';

export default function InvoicesListPage() {
  const { invoices, customers, approveInvoice, cancelInvoice } = useZajelStore();

  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [docStatusFilter, setDocStatusFilter] = useState<string>('all');
  const [payStatusFilter, setPayStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [cancelModalInvId, setCancelModalInvId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const customer = customers.find((c) => c.id === inv.customerId);
      const custName = customer?.name || inv.snapshotCustomer?.name || '';

      const matchesSearch = 
        inv.number.toLowerCase().includes(search.toLowerCase()) ||
        custName.toLowerCase().includes(search.toLowerCase());

      const matchesCust = customerFilter === 'all' || inv.customerId === customerFilter;
      const matchesDoc = docStatusFilter === 'all' || inv.documentStatus === docStatusFilter;
      const matchesPay = payStatusFilter === 'all' || inv.paymentStatus === payStatusFilter;
      const matchesFrom = !fromDate || inv.date >= fromDate;
      const matchesTo = !toDate || inv.date <= toDate;

      return matchesSearch && matchesCust && matchesDoc && matchesPay && matchesFrom && matchesTo;
    });
  }, [invoices, customers, search, customerFilter, docStatusFilter, payStatusFilter, fromDate, toDate]);

  const handleConfirmCancel = () => {
    if (!cancelModalInvId) return;
    cancelInvoice(cancelModalInvId, cancelReason);
    setCancelModalInvId(null);
    setCancelReason('');
  };

  const renderDocBadge = (status: InvoiceDocumentStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">مسودة</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">معتمدة</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">ملغاة</span>;
    }
  };

  const renderPayBadge = (status: InvoicePaymentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">مدفوعة</span>;
      case 'partial':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">جزئية</span>;
      case 'unpaid':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">غير مدفوعة</span>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">الفواتير</h2>
          <p className="text-xs text-slate-500 mt-0.5">إدارة فواتير المبيعات المعتمدة والمسودات ومتابعة السداد</p>
        </div>

        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>فاتورة جديدة</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم الفاتورة أو العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
          />
        </div>

        <div>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">جميع العملاء</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={docStatusFilter}
            onChange={(e) => setDocStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">حالة المستند (الكل)</option>
            <option value="approved">معتمدة</option>
            <option value="draft">مسودة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        <div>
          <select
            value={payStatusFilter}
            onChange={(e) => setPayStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">حالة السداد (الكل)</option>
            <option value="paid">مدفوعة</option>
            <option value="partial">مدفوعة جزئياً</option>
            <option value="unpaid">غير مدفوعة</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            title="من تاريخ"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            title="إلى تاريخ"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم الفاتورة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">المدفوع</th>
                <th className="py-3 px-4">المتبقي</th>
                <th className="py-3 px-4">حالة المستند</th>
                <th className="py-3 px-4">حالة السداد</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد فواتير مطابقة لخيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const customer = customers.find((c) => c.id === inv.customerId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-[#C59A55] transition-colors">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(inv.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {customer?.name || inv.snapshotCustomer?.name || 'عميل'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#202D3B]">
                        {inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                        {inv.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 font-semibold">
                        {inv.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-3.5 px-4">
                        {renderDocBadge(inv.documentStatus)}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderPayBadge(inv.paymentStatus)}
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
                            title="طباعة A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                          {inv.documentStatus === 'approved' && inv.remainingAmount > 0 && (
                            <Link
                              href={`/receipt-vouchers/new?customerId=${inv.customerId}&invoiceId=${inv.id}&amount=${inv.remainingAmount}`}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="تسجيل سند قبض / دفعة"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {inv.documentStatus === 'approved' && (
                            <button
                              onClick={() => setCancelModalInvId(inv.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="إلغاء الفاتورة"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Invoice Modal */}
      {cancelModalInvId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-right">
            <h3 className="text-base font-bold text-rose-600 mb-2">إلغاء فاتورة مبيعات معتمدة</h3>
            <p className="text-xs text-slate-500 mb-4">
              إلغاء الفاتورة سيقوم بإنشاء حركة قيد عكسية لحفظ الأثر المحاسبي وسجل التعديلات ولن يتم حذف الفاتورة نهائياً.
            </p>
            <div className="space-y-3 text-xs mb-4">
              <label className="block font-semibold text-slate-700">سبب الإلغاء:</label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="اكتب سبب إلغاء هذه الفاتورة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalInvId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shadow-xs"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
