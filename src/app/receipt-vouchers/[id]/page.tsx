"use client";

import React, { useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Printer, CheckCircle2, Building2 } from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { formatDate, tafqeetArabic } from '@/lib/zajelUtils';

function ReceiptVoucherDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { receiptVouchers, customers, invoices, settings } = useZajelStore();

  const voucher = receiptVouchers.find((r) => r.id === resolvedParams.id);
  const customer = voucher ? customers.find((c) => c.id === voucher.customerId) : null;

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  if (!voucher) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 mb-4">سند القبض المطلوب غير موجود</p>
        <Link href="/receipt-vouchers" className="text-xs font-bold text-[#C59A55] hover:underline">
          العودة لقائمة سندات القبض
        </Link>
      </div>
    );
  }

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'تحويل بنكي';
      case 'cash': return 'نقدي';
      case 'card': return 'بطاقة مدى / ائتمان';
      case 'cheque': return 'شيك مصرفي';
      default: return method;
    }
  };

  const accountLabel = (acc: string) => {
    switch (acc) {
      case 'alrajhi_bank': return 'مصرف الراجحي';
      case 'snb_bank': return 'البنك الأهلي السعودي';
      default: return 'الصندوق الرئيسي';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
      
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/receipt-vouchers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#202D3B]">سند قبض: {voucher.number}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {voucher.status === 'approved' ? 'معتمد' : voucher.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">تم تسجيل التحصيل في حساب العميل</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة A4</span>
        </button>
      </div>

      {/* Official A4 Voucher Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#202D3B] pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#202D3B] tracking-tight">سند قبض</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">RECEIPT VOUCHER</p>
            <div className="mt-3 space-y-1 text-xs">
              <div><span className="text-slate-400">رقم السند: </span><span className="font-mono font-bold text-[#202D3B]">{voucher.number}</span></div>
              <div><span className="text-slate-400">التاريخ: </span><span className="font-mono text-slate-700">{formatDate(voucher.date)}</span></div>
            </div>
          </div>

          <div className="text-left flex flex-col items-end">
            <ZajelLogo variant="light" size="md" />
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 text-left" dir="ltr">
              <p className="font-bold text-[#202D3B]">{settings.name}</p>
              <p>CR: {settings.crNumber} | VAT: {settings.taxNumber}</p>
              <p>{settings.phone} | {settings.city}</p>
            </div>
          </div>
        </div>

        {/* Voucher Fields Grid */}
        <div className="space-y-4 text-xs">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-slate-400 block text-[11px]">استلمنا من المكرم / السادة:</span>
              <span className="font-bold text-sm text-[#202D3B]">{customer?.name || 'العميل'}</span>
            </div>
            <div className="text-left font-mono">
              <span className="text-slate-400 block text-[11px]">كود العميل:</span>
              <span className="font-bold text-slate-700">{customer?.code}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-1">المبلغ رقماً:</span>
              <span className="font-mono font-bold text-lg text-emerald-700">
                {voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px] mb-1">طريقة الدفع والحساب:</span>
              <span className="font-bold text-slate-800">
                {paymentMethodLabel(voucher.paymentMethod)} • {accountLabel(voucher.account)}
              </span>
              {voucher.reference && (
                <span className="text-slate-500 block text-[11px] mt-0.5 font-mono">
                  مرجع: {voucher.reference}
                </span>
              )}
            </div>
          </div>

          {/* Tafqeet Amount */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-1">المبلغ كتابة:</span>
            <span className="font-bold text-slate-900 text-sm">
              {tafqeetArabic(voucher.amount)}
            </span>
          </div>

          {/* Statement */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-1">وذلك عن (البيان):</span>
            <span className="font-semibold text-slate-800">
              {voucher.statement}
            </span>
            {voucher.notes && (
              <p className="text-slate-500 text-[11px] mt-1 italic">ملاحظات: {voucher.notes}</p>
            )}
          </div>

          {/* Allocation details if linked to invoices */}
          {voucher.allocations && voucher.allocations.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">الفواتير المرتبطة بالسند:</span>
              <div className="space-y-1">
                {voucher.allocations.map((al, idx) => {
                  const inv = invoices.find(i => i.id === al.invoiceId);
                  return (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>فاتورة رقم: <span className="font-mono font-bold text-[#202D3B]">{inv?.number || al.invoiceId}</span></span>
                      <span className="font-mono font-bold text-emerald-700">{al.amount.toLocaleString('en-US')} ر.س</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-16">
          <div>
            <div className="font-bold text-[#202D3B] mb-12">أمين الصندوق / المحاسب</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">الختم والتوقيع</div>
          </div>
          <div>
            <div className="font-bold text-[#202D3B] mb-12">المستلم / الدافع</div>
            <div className="w-40 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">التوقيع والتاريخ</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ReceiptVoucherViewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل سند القبض...</div>}>
      <ReceiptVoucherDetail params={params} />
    </Suspense>
  );
}
