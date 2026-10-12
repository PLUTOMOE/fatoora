"use client";

import React, { useEffect, use, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Printer, ArrowDownLeft, 
  Copy, XCircle, CheckCircle2, AlertCircle, Building2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { formatDate, tafqeetArabic } from '@/lib/zajelUtils';

function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invoices, customers, settings, approveInvoice, cancelInvoice, duplicateInvoice } = useZajelStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const invoice = invoices.find((inv) => inv.id === resolvedParams.id);
  const customer = invoice ? customers.find((c) => c.id === invoice.customerId) : null;

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  if (!invoice) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 mb-4">الفاتورة المطلوبة غير موجودة</p>
        <Link href="/invoices" className="text-xs font-bold text-[#C59A55] hover:underline">
          العودة لقائمة الفواتير
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    approveInvoice(invoice.id);
  };

  const handleConfirmCancel = () => {
    cancelInvoice(invoice.id, cancelReason);
    setShowCancelModal(false);
  };

  const handleDuplicate = () => {
    const newId = duplicateInvoice(invoice.id);
    if (newId) {
      router.push(`/invoices/${newId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#202D3B]">فاتورة مبيعات: {invoice.number}</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                invoice.documentStatus === 'approved' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : invoice.documentStatus === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {invoice.documentStatus === 'approved' ? 'معتمدة' : invoice.documentStatus === 'cancelled' ? 'ملغاة' : 'مسودة'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              حالة السداد: {invoice.paymentStatus === 'paid' ? 'مدفوعة بالكامل' : invoice.paymentStatus === 'partial' ? 'مدفوعة جزئياً' : 'غير مدفوعة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.documentStatus === 'draft' && (
            <button
              onClick={handleApprove}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              اعتماد الفاتورة الآن
            </button>
          )}

          {invoice.documentStatus === 'approved' && invoice.remainingAmount > 0 && (
            <Link
              href={`/receipt-vouchers/new?customerId=${invoice.customerId}&invoiceId=${invoice.id}&amount=${invoice.remainingAmount}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>تسجيل دفعة (سند قبض)</span>
            </Link>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة A4</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            title="نسخ الفاتورة"
          >
            <Copy className="w-4 h-4" />
          </button>

          {invoice.documentStatus === 'approved' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors"
              title="إلغاء الفاتورة"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Formal A4 Printable Document */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#202D3B] pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#202D3B] tracking-tight">فاتورة مبيعات ضريبية</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">TAX INVOICE</p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">رقم الفاتورة:</span>
                <span className="font-mono font-bold text-[#202D3B]">{invoice.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">تاريخ الإصدار:</span>
                <span className="font-mono text-slate-700">{formatDate(invoice.date)}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">تاريخ الاستحقاق:</span>
                  <span className="font-mono text-slate-700">{formatDate(invoice.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-left flex flex-col items-end">
            <ZajelLogo variant="light" size="md" />
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 text-left" dir="ltr">
              <p className="font-bold text-[#202D3B]">{invoice.snapshotCompany?.name || settings.name}</p>
              <p>CR: {invoice.snapshotCompany?.crNumber || settings.crNumber}</p>
              <p>VAT: {invoice.snapshotCompany?.taxNumber || settings.taxNumber}</p>
              <p>{invoice.snapshotCompany?.phone || settings.phone}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">فاتورة موجهة إلى:</span>
            <div className="font-bold text-sm text-[#202D3B]">
              {customer?.name || invoice.snapshotCustomer?.name || 'العميل'}
            </div>
            <div className="text-slate-600 mt-0.5">
              {customer?.address || invoice.snapshotCustomer?.address}
            </div>
            <div className="text-slate-500 mt-0.5 font-mono">
              {customer?.phone || invoice.snapshotCustomer?.phone}
            </div>
          </div>
          <div className="text-left" dir="ltr">
            {(customer?.taxNumber || invoice.snapshotCustomer?.taxNumber) && (
              <div className="text-slate-600">
                <span className="text-slate-400">الرقم الضريبي: </span>
                <span className="font-mono">{customer?.taxNumber || invoice.snapshotCustomer?.taxNumber}</span>
              </div>
            )}
            {(customer?.crNumber || invoice.snapshotCustomer?.crNumber) && (
              <div className="text-slate-600 mt-0.5">
                <span className="text-slate-400">السجل التجاري: </span>
                <span className="font-mono">{customer?.crNumber || invoice.snapshotCustomer?.crNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#202D3B] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">الصنف / الخدمة</th>
                <th className="py-3 px-4 text-center">الوحدة</th>
                <th className="py-3 px-4 text-center">الكمية</th>
                <th className="py-3 px-4 text-center">السعر</th>
                <th className="py-3 px-4 text-center">الضريبة (15%)</th>
                <th className="py-3 px-4 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{item.unit || 'حبة'}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{(item.taxAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-[#202D3B]">
                    {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tafqeet & Bank details */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 mb-8">
          <div className="space-y-3 flex-1">
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">المبلغ كتابة:</div>
              <div className="text-xs font-bold text-[#202D3B] bg-slate-50 p-3 rounded-xl border border-slate-100">
                {tafqeetArabic(invoice.total)}
              </div>
            </div>

            {/* Bank details for wire transfer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-700">بيانات السداد البنكي:</div>
              <div className="text-slate-600">البنك: {settings.bankName}</div>
              <div className="font-mono text-slate-700">IBAN: {settings.iban}</div>
            </div>

            {invoice.notes && (
              <p className="text-[11px] text-slate-500 italic">ملاحظة: {invoice.notes}</p>
            )}
          </div>

          <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع قبل الخصم:</span>
              <span className="font-mono">{invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم:</span>
                <span className="font-mono">-{invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>صافي المبلغ الخاضع للضريبة:</span>
              <span className="font-mono">{(invoice.subtotal - invoice.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="font-mono">{invoice.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between font-bold text-base text-[#202D3B] pt-2 border-t border-slate-200">
              <span>الإجمالي النهائي:</span>
              <span className="font-mono text-[#C59A55]">{invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
              <span>المدفوع:</span>
              <span className="font-mono">{invoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold">
              <span>المتبقي:</span>
              <span className="font-mono">{invoice.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
          <div>
            <div className="font-bold text-[#202D3B] mb-12">اعتماد منشأة زاجل النخبة</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">الختم والتوقيع الرسمي</div>
          </div>
          <div>
            <div className="font-bold text-[#202D3B] mb-12">استلام وتأكيد العميل</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">التوقيع والتاريخ</div>
          </div>
        </div>

      </div>

      {/* Cancel Invoice Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-right">
            <h3 className="text-base font-bold text-rose-600 mb-2">إلغاء الفاتورة: {invoice.number}</h3>
            <p className="text-xs text-slate-500 mb-4">
              سيتم تسجيل سبب الإلغاء في السجل المحاسبي ولن يتم حذف الفاتورة للحفاظ على التسلسل الرقمي والأثر المالي.
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
                onClick={() => setShowCancelModal(false)}
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

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل الفاتورة...</div>}>
      <InvoiceDetail params={params} />
    </Suspense>
  );
}
