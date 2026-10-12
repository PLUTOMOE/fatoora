"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Save, Printer, ArrowUpRight, 
  Building2, CheckCircle2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { PaymentMethod, VoucherAccount, PaymentVoucherType } from '@/types/zajel';

export default function NewPaymentVoucherPage() {
  const router = useRouter();
  const { customers, paymentVouchers, settings, addPaymentVoucher } = useZajelStore();

  const [beneficiary, setBeneficiary] = useState('مؤسسة التوريد');
  const [date, setDate] = useState('2026-10-14');
  const [type, setType] = useState<PaymentVoucherType>('expense');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(750);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [account, setAccount] = useState<VoucherAccount>('main_cashbox');
  const [reason, setReason] = useState('مصروف خدمات');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('دفع قيمة خدمات خارجية');

  // Auto Voucher Number
  const nextNumber = useMemo(() => {
    return `${settings.prefixPayment}${String(paymentVouchers.length + 1).padStart(3, '0')}`;
  }, [settings.prefixPayment, paymentVouchers.length]);

  const handleSave = (status: 'draft' | 'approved', shouldPrint = false) => {
    if (!beneficiary.trim()) {
      alert('يرجى تحديد اسم المستفيد');
      return;
    }
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (type === 'refund' && !customerId) {
      alert('يرجى اختيار العميل المراد رد المبلغ إليه');
      return;
    }

    const newId = addPaymentVoucher({
      number: nextNumber,
      date,
      beneficiary: beneficiary.trim(),
      type,
      customerId: type === 'refund' ? customerId : undefined,
      amount: Number(amount),
      paymentMethod,
      account,
      reference,
      reason: reason.trim() || 'صرف مالي',
      notes,
      status,
    });

    if (shouldPrint) {
      router.push(`/payment-vouchers/${newId}?print=true`);
    } else {
      router.push('/payment-vouchers');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/payment-vouchers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#202D3B]">سند صرف</h2>
            <p className="text-xs text-slate-500 mt-0.5">تسجيل دفعة إلى مورد أو مصاريف تشغيلية أو رد مبالغ للعملاء</p>
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

      {/* Main Form (Matching Mockup 6) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          
          {/* Voucher Number */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">رقم سند الصرف</label>
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

          {/* Operation Type */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">نوع العملية *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentVoucherType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-semibold outline-none focus:border-[#C59A55]"
            >
              <option value="expense">مصروف عام (لا يؤثر على أرصدة العملاء)</option>
              <option value="refund">رد مبلغ لعميل (يؤثر على كشف الحساب)</option>
            </select>
          </div>

          {/* Beneficiary Name */}
          <div className={type === 'refund' ? '' : 'sm:col-span-2'}>
            <label className="block font-semibold text-slate-600 mb-1">اسم المستفيد *</label>
            <input
              type="text"
              required
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="مثال: مؤسسة التوريد"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-semibold outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Customer Selection (Only for refund) */}
          {type === 'refund' && (
            <div className="sm:col-span-2">
              <label className="block font-semibold text-purple-700 mb-1">العميل المرتبط برد المبلغ *</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const c = customers.find(x => x.id === e.target.value);
                  if (c) setBeneficiary(c.name);
                }}
                className="w-full bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-[#202D3B] font-semibold outline-none focus:border-purple-500"
              >
                <option value="">اختر العميل...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-base text-rose-600 outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Expense Reason */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">سبب الصرف *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: مصروف خدمات، إيجار..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">طريقة الدفع *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            >
              <option value="cash">نقدي</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="card">بطاقة</option>
              <option value="cheque">شيك</option>
            </select>
          </div>

          {/* Source Account */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">الحساب المصروف منه *</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value as VoucherAccount)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
            >
              <option value="main_cashbox">الصندوق الرئيسي (كاش)</option>
              <option value="alrajhi_bank">مصرف الراجحي</option>
              <option value="snb_bank">البنك الأهلي السعودي</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">رقم المرجع (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: INV-SUPPLIER-88"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Notes (Mockup 6) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-600 mb-1">ملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: دفع قيمة خدمات خارجية"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
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
