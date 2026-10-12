"use client";

import React, { useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Printer, ArrowRightLeft, 
  Copy, Download, Building2, CheckCircle2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { formatDate, tafqeetArabic } from '@/lib/zajelUtils';

function QuotationDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quotations, customers, settings, convertQuotationToInvoice, duplicateQuotation } = useZajelStore();

  const quotation = quotations.find((q) => q.id === resolvedParams.id);
  const customer = quotation ? customers.find((c) => c.id === quotation.customerId) : null;

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  if (!quotation) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 mb-4">عرض السعر المطلوب غير موجود</p>
        <Link href="/quotations" className="text-xs font-bold text-[#C59A55] hover:underline">
          العودة لقائمة عروض الأسعار
        </Link>
      </div>
    );
  }

  const handleConvert = () => {
    try {
      const invId = convertQuotationToInvoice(quotation.id);
      router.push(`/invoices/${invId}`);
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء التحويل');
    }
  };

  const handleDuplicate = () => {
    const newId = duplicateQuotation(quotation.id);
    if (newId) {
      router.push(`/quotations/${newId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-[#202D3B]">عرض سعر: {quotation.number}</h2>
            <p className="text-xs text-slate-500">حالة العرض: {quotation.status === 'converted' ? 'تم تحويله لفاتورة' : quotation.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quotation.status !== 'converted' ? (
            <button
              onClick={handleConvert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>تحويل إلى فاتورة</span>
            </button>
          ) : (
            <Link
              href={`/invoices/${quotation.convertedToInvoiceId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>الفاتورة المرتبطة</span>
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            title="نسخ العرض"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formal A4 Document Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-[#202D3B] pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#202D3B] tracking-tight">عرض سعر</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">QUOTATION</p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">رقم العرض:</span>
                <span className="font-mono font-bold text-[#202D3B]">{quotation.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">تاريخ الإصدار:</span>
                <span className="font-mono text-slate-700">{formatDate(quotation.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">صالح حتى:</span>
                <span className="font-mono text-slate-700">{formatDate(quotation.expiryDate)}</span>
              </div>
              {quotation.reference && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">مرجع العميل:</span>
                  <span className="font-mono text-slate-700">{quotation.reference}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-left flex flex-col items-end">
            <ZajelLogo variant="light" size="md" />
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 text-left" dir="ltr">
              <p className="font-bold text-[#202D3B]">{settings.name}</p>
              <p>CR: {settings.crNumber}</p>
              <p>VAT: {settings.taxNumber}</p>
              <p>{settings.phone} | {settings.city}</p>
            </div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">بيانات العميل الموجه إليه العرض:</span>
            <div className="font-bold text-sm text-[#202D3B]">{customer?.name || 'العميل'}</div>
            {customer?.address && <div className="text-slate-600 mt-0.5">{customer.address}</div>}
            {customer?.phone && <div className="text-slate-500 mt-0.5 font-mono">{customer.phone}</div>}
          </div>
          <div className="text-left" dir="ltr">
            {customer?.taxNumber && (
              <div className="text-slate-600">
                <span className="text-slate-400">الرقم الضريبي: </span>
                <span className="font-mono">{customer.taxNumber}</span>
              </div>
            )}
            {customer?.crNumber && (
              <div className="text-slate-600 mt-0.5">
                <span className="text-slate-400">السجل التجاري: </span>
                <span className="font-mono">{customer.crNumber}</span>
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
                <th className="py-3 px-4">الوصف</th>
                <th className="py-3 px-4 text-center">الوحدة</th>
                <th className="py-3 px-4 text-center">الكمية</th>
                <th className="py-3 px-4 text-center">سعر الوحدة</th>
                <th className="py-3 px-4 text-center">الخصم</th>
                <th className="py-3 px-4 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{item.unit}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{item.discount > 0 ? item.discount.toLocaleString('en-US') : '-'}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-[#202D3B]">
                    {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tafqeet */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 mb-8">
          <div className="space-y-2 flex-1">
            <div className="text-xs font-semibold text-slate-400">المبلغ كتابة:</div>
            <div className="text-xs font-bold text-[#202D3B] bg-slate-50 p-3 rounded-xl border border-slate-100">
              {tafqeetArabic(quotation.total)}
            </div>
            {quotation.terms && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-400 mb-1">الشروط والأحكام:</div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  {quotation.terms}
                </p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono">{quotation.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم:</span>
                <span className="font-mono">-{quotation.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="font-mono">{quotation.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between font-bold text-base text-[#202D3B] pt-2 border-t border-slate-200">
              <span>المبلغ الإجمالي:</span>
              <span className="font-mono text-[#C59A55]">{quotation.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
          </div>
        </div>

        {/* Signatures Area */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
          <div>
            <div className="font-bold text-[#202D3B] mb-12">اعتماد منشأة زاجل النخبة</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">الختم والتوقيع الرسمي</div>
          </div>
          <div>
            <div className="font-bold text-[#202D3B] mb-12">موافقة وقبول العميل</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">اسم المفوض والتوقيع</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل عرض السعر...</div>}>
      <QuotationDetail params={params} />
    </Suspense>
  );
}
