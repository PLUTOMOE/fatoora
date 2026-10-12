"use client";

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, FileSpreadsheet, Plus, Phone, 
  Mail, MapPin, Building2, User, Scale, 
  Receipt, ArrowDownLeft, ScrollText, Edit3 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { formatDate } from '@/lib/zajelUtils';

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { customers, invoices, quotations, receiptVouchers, getCustomerBalance, updateCustomer } = useZajelStore();

  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'quotations'>('invoices');

  // Edit Customer Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTax, setEditTax] = useState('');
  const [editCr, setEditCr] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNationalAddress, setEditNationalAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const customer = customers.find((c) => c.id === resolvedParams.id);
  const balance = customer ? getCustomerBalance(customer.id) : 0;

  const openEdit = () => {
    if (!customer) return;
    setEditName(customer.name);
    setEditTax(customer.taxNumber || '');
    setEditCr(customer.crNumber || '');
    setEditAddress(customer.address || '');
    setEditNationalAddress(customer.nationalAddress || '');
    setEditPhone(customer.phone || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !editName.trim()) return;
    updateCustomer(customer.id, {
      name: editName.trim(),
      taxNumber: editTax.trim() || undefined,
      crNumber: editCr.trim() || undefined,
      address: editAddress.trim() || undefined,
      nationalAddress: editNationalAddress.trim() || undefined,
      phone: editPhone.trim() || customer.phone,
    });
    setShowEditModal(false);
  };

  const customerInvoices = useMemo(() => {
    if (!customer) return [];
    return invoices.filter((i) => i.customerId === customer.id);
  }, [invoices, customer]);

  const customerReceipts = useMemo(() => {
    if (!customer) return [];
    return receiptVouchers.filter((r) => r.customerId === customer.id);
  }, [receiptVouchers, customer]);

  const customerQuotations = useMemo(() => {
    if (!customer) return [];
    return quotations.filter((q) => q.customerId === customer.id);
  }, [quotations, customer]);

  if (!customer) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 mb-4">العميل المطلوب غير موجود</p>
        <Link href="/customers" className="text-xs font-bold text-[#C59A55] hover:underline">
          العودة لقائمة العملاء
        </Link>
      </div>
    );
  }

  const isDue = balance > 0;
  const isCredit = balance < 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#202D3B]">{customer.name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                {customer.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {customer.type === 'business' ? 'منشأة تجارية' : 'عميل فرد'} • {customer.city || 'المملكة العربية السعودية'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#C59A55]" />
            <span>تعديل البيانات</span>
          </button>

          <Link
            href={`/customers/${customer.id}/statement`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>كشف حساب العميل</span>
          </Link>

          <Link
            href={`/invoices/new?customerId=${customer.id}`}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Receipt className="w-4 h-4 text-[#C59A55]" />
            <span>فاتورة جديدة</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Balance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">الرصيد المالي الحالي</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${isDue ? 'text-rose-600' : isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
              {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className={`text-[11px] font-bold ${isDue ? 'text-rose-600' : isCredit ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isDue ? 'مستحق على العميل' : isCredit ? 'رصيد لصالح العميل' : 'حساب خالص'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">إجمالي الفواتير</span>
            <div className="text-2xl font-bold text-[#202D3B] font-mono mt-1">
              {customerInvoices.reduce((acc, i) => acc + (i.total || 0), 0).toLocaleString('en-US')}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className="text-[11px] text-slate-400">{customerInvoices.length} فواتير مسجلة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#202D3B] flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Receipts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">إجمالي السدادات</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
              {customerReceipts.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString('en-US')}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className="text-[11px] text-emerald-600/80">{customerReceipts.length} سندات قبض معتمدة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Profile Details & Contact Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">رقم الجوال</span>
          <span className="font-mono font-bold text-slate-800">{customer.phone}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">الرقم الضريبي</span>
          <span className="font-mono text-slate-800">{customer.taxNumber || 'غير مسجل'}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">السجل التجاري</span>
          <span className="font-mono text-slate-800">{customer.crNumber || 'غير مسجل'}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">العنوان</span>
          <span className="text-slate-800">{customer.address || customer.city || 'غير محدد'}</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">العنوان الوطني</span>
          <span className="text-slate-800">{customer.nationalAddress || 'غير محدد'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3.5 px-6 border-b-2 transition-all ${
              activeTab === 'invoices' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            الفواتير ({customerInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`py-3.5 px-6 border-b-2 transition-all ${
              activeTab === 'receipts' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            سندات القبض ({customerReceipts.length})
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`py-3.5 px-6 border-b-2 transition-all ${
              activeTab === 'quotations' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            عروض الأسعار ({customerQuotations.length})
          </button>
        </div>

        <div className="p-4 overflow-x-auto text-xs">
          {activeTab === 'invoices' && (
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">رقم الفاتورة</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">الإجمالي</th>
                  <th className="py-2.5 px-3">المدفوع</th>
                  <th className="py-2.5 px-3">المتبقي</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerInvoices.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">لا توجد فواتير مسجلة</td></tr>
                ) : (
                  customerInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#202D3B]">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-[#C59A55]">{inv.number}</Link>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{formatDate(inv.date)}</td>
                      <td className="py-2.5 px-3 font-bold text-[#202D3B]">{inv.total.toLocaleString('en-US')} ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">{inv.paidAmount.toLocaleString('en-US')} ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600">{inv.remainingAmount.toLocaleString('en-US')} ر.س</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {inv.paymentStatus === 'paid' ? 'مدفوعة' : inv.paymentStatus === 'partial' ? 'جزئية' : 'غير مدفوعة'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'receipts' && (
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">رقم السند</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">طريقة الدفع</th>
                  <th className="py-2.5 px-3">البيان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerReceipts.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-400">لا توجد سندات قبض مسجلة</td></tr>
                ) : (
                  customerReceipts.map((rc) => (
                    <tr key={rc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#202D3B]">
                        <Link href={`/receipt-vouchers/${rc.id}`} className="hover:text-[#C59A55]">{rc.number}</Link>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{formatDate(rc.date)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{rc.amount.toLocaleString('en-US')} ر.س</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {rc.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : rc.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{rc.statement}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'quotations' && (
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">رقم العرض</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerQuotations.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">لا توجد عروض أسعار مسجلة</td></tr>
                ) : (
                  customerQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#202D3B]">
                        <Link href={`/quotations/${q.id}`} className="hover:text-[#C59A55]">{q.number}</Link>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{formatDate(q.date)}</td>
                      <td className="py-2.5 px-3 font-bold text-[#202D3B]">{q.total.toLocaleString('en-US')} ر.س</td>
                      <td className="py-2.5 px-3 text-slate-600">{q.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#202D3B]">تعديل بيانات العميل</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">تحديث بيانات المنشأة والعنوان والبيانات الضريبية</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الشركة أو المؤسسة *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#C59A55]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي (15 رقم)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editTax}
                    onChange={(e) => setEditTax(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono outline-none focus:border-[#C59A55]"
                    placeholder="300XXXXXXXXXXX3"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editCr}
                    onChange={(e) => setEditCr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono outline-none focus:border-[#C59A55]"
                    placeholder="1010XXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#C59A55]"
                    placeholder="الرياض - طريق الملك فهد"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">العنوان الوطني</label>
                  <input
                    type="text"
                    value={editNationalAddress}
                    onChange={(e) => setEditNationalAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#C59A55]"
                    placeholder="1234 الرياض 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم الجوال *</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono outline-none focus:border-[#C59A55]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C59A55] text-white font-bold hover:bg-[#B38944] shadow-md shadow-[#C59A55]/20"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
