"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Save, Printer, ArrowDownLeft, 
  Building2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { PaymentMethod, VoucherAccount } from '@/types/zajel';

function ReceiptVoucherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, invoices, receiptVouchers, settings, addReceiptVoucher } = useZajelStore();

  const queryCust = searchParams.get('customerId');
  const queryInv = searchParams.get('invoiceId');
  const queryAmt = searchParams.get('amount');

  const [customerId, setCustomerId] = useState(queryCust || customers[0]?.id || '');
  const [date, setDate] = useState('2026-10-13');
  const [amount, setAmount] = useState<number>(queryAmt ? parseFloat(queryAmt) : 2000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [account, setAccount] = useState<VoucherAccount>('alrajhi_bank');
  const [linkedInvoiceId, setLinkedInvoiceId] = useState(queryInv || 'inv-1');
  const [reference, setReference] = useState('TRX-987211');
  const [statement, setStatement] = useState('تحصيل دفعة مقدمة من الفاتورة رقم INV-001');
  const [notes, setNotes] = useState('تحويل بنكي مباشر لحساب مصرف الراجحي');

  // Auto Voucher Number
  const nextNumber = useMemo(() => {
    return `${settings.prefixReceipt}${String(receiptVouchers.length + 1).padStart(3, '0')}`;
  }, [settings.prefixReceipt, receiptVouchers.length]);

  // Customer open unpaid invoices
  const customerInvoices = useMemo(() => {
    return invoices.filter(i => i.customerId === customerId && i.documentStatus === 'approved' && i.remainingAmount > 0);
  }, [invoices, customerId]);

  useEffect(() => {
    if (linkedInvoiceId) {
      const inv = invoices.find(i => i.id === linkedInvoiceId);
      if (inv) {
        setStatement(`تحصيل دفعة من الفاتورة رقم ${inv.number}`);
      }
    }
  }, [linkedInvoiceId, invoices]);

  const handleSave = (status: 'draft' | 'approved', shouldPrint = false) => {
    if (!customerId) {
      alert('يرجى تحديد العميل');
      return;
    }
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const allocations = linkedInvoiceId ? [{ invoiceId: linkedInvoiceId, amount }] : [];

    const newId = addReceiptVoucher({
      number: nextNumber,
      customerId,
      date,
      amount: Number(amount),
      paymentMethod,
      account,
      reference,
      statement: statement || 'تحصيل من العميل',
      notes,
      allocations,
      status,
    });

    if (shouldPrint) {
      router.push(`/receipt-vouchers/${newId}?print=true`);
    } else {
      router.push('/receipt-vouchers');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/receipt-vouchers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#202D3B]">سند قبض</h2>
            <p className="text-xs text-slate-500 mt-0.5">تسجيل تحصيل من العميل وإيداع المبلغ في الحساب</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft', false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => handleSave('approved', true)}
            className="px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>حفظ وطباعة</span>
          </button>
        </div>
      </div>

      {/* Main Form (Matching Mockup 5) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          
          {/* Voucher Number */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">رقم سند القبض</label>
            <input
              type="text"
              readOnly
              value={nextNumber}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#202D3B] text-center cursor-not-allowed"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">التاريخ *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">العميل *</label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setLinkedInvoiceId('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-semibold outline-none focus:border-[#C59A55]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">المبلغ (ر.س) *</label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-base text-emerald-700 outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Linked Invoice (Optional) */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">رقم الفاتورة المرتبطة</label>
            <select
              value={linkedInvoiceId}
              onChange={(e) => setLinkedInvoiceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            >
              <option value="">دفعة مقدمة (غير مخصصة لفاتورة)</option>
              {customerInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.number} (متبقي: {inv.remainingAmount} ر.س)
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">طريقة الدفع *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            >
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="cash">نقدي</option>
              <option value="card">بطاقة مدى / ائتمان</option>
              <option value="cheque">شيك</option>
            </select>
          </div>

          {/* Target Account */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">الحساب المستلم *</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value as VoucherAccount)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            >
              <option value="alrajhi_bank">مصرف الراجحي</option>
              <option value="snb_bank">البنك الأهلي السعودي</option>
              <option value="main_cashbox">الصندوق الرئيسي (كاش)</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">رقم المرجع / الحوالة</label>
            <input
              type="text"
              placeholder="مثال: TRX-987211"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Statement */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-600 mb-1">البيان *</label>
            <input
              type="text"
              required
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="مثال: تحصيل دفعة مقدمة من الفاتورة رقم INV-001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-600 mb-1">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات حول التحصيل..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft', false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            حفظ كمسودة
          </button>
          <button
            type="button"
            onClick={() => handleSave('approved', false)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
          >
            اعتماد السند
          </button>
          <button
            type="button"
            onClick={() => handleSave('approved', true)}
            className="px-6 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>حفظ وطباعة</span>
          </button>
        </div>

      </div>

    </div>
  );
}

export default function NewReceiptVoucherPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل سند القبض...</div>}>
      <ReceiptVoucherContent />
    </Suspense>
  );
}
