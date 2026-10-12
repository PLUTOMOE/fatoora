"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, Building2, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { CustomerType } from '@/types/zajel';

export default function NewCustomerPage() {
  const router = useRouter();
  const { customers, addCustomer } = useZajelStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('business');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nationalAddress, setNationalAddress] = useState('');
  const [city, setCity] = useState('الرياض');
  const [taxNumber, setTaxNumber] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<'debit' | 'credit'>('debit');
  const [openingBalanceDate, setOpeningBalanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const nextCode = `CUST-${String(customers.length + 1).padStart(3, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = addCustomer({
      code: nextCode,
      name: name.trim(),
      type,
      phone: phone.trim() || '0500000000',
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      nationalAddress: nationalAddress.trim() || undefined,
      city: city.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      crNumber: crNumber.trim() || undefined,
      status: 'active',
      openingBalance: Number(openingBalance) || 0,
      openingBalanceType,
      openingBalanceDate,
      notes: notes.trim() || undefined,
    });

    router.push('/customers');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#202D3B]">إضافة عميل جديد</h2>
            <p className="text-xs text-slate-500 mt-0.5">تسجيل بيانات العميل أو المنشأة وتحديد الرصيد الافتتاحي</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>حفظ العميل</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202D3B] border-b border-slate-100 pb-3">البيانات الأساسية</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            {/* Code */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">كود العميل</label>
              <input
                type="text"
                readOnly
                value={nextCode}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">اسم العميل أو المنشأة *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: شركة التطوير الحديثة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">نوع العميل *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomerType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              >
                <option value="business">منشأة / شركة</option>
                <option value="individual">فرد</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">رقم الجوال *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono outline-none focus:border-[#C59A55]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>

          </div>
        </div>

        {/* Commercial & Tax Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202D3B] border-b border-slate-100 pb-3">البيانات الضريبية والتجارية</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">الرقم الضريبي (15 رقم)</label>
              <input
                type="text"
                maxLength={15}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="300XXXXXXXXXXX3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono outline-none focus:border-[#C59A55]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">السجل التجاري (10 أرقام)</label>
              <input
                type="text"
                maxLength={10}
                value={crNumber}
                onChange={(e) => setCrNumber(e.target.value)}
                placeholder="1010XXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono outline-none focus:border-[#C59A55]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">المدينة</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="الرياض"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">العنوان</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: الرياض - طريق الملك فهد - حي العليا"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">العنوان الوطني</label>
              <input
                type="text"
                value={nationalAddress}
                onChange={(e) => setNationalAddress(e.target.value)}
                placeholder="مثال: 1234 الرياض 5678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>
          </div>
        </div>

        {/* Opening Balance (Section 5 requirements) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202D3B] border-b border-slate-100 pb-3">الرصيد الافتتاحي</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">قيمة الرصيد الافتتاحي (ر.س)</label>
              <input
                type="number"
                min="0"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono outline-none focus:border-[#C59A55]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">طبيعة الرصيد</label>
              <select
                value={openingBalanceType}
                onChange={(e) => setOpeningBalanceType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              >
                <option value="debit">مدين (مستحق على العميل)</option>
                <option value="credit">دائن (رصيد لصالح العميل)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">تاريخ الرصيد الافتتاحي</label>
              <input
                type="date"
                value={openingBalanceDate}
                onChange={(e) => setOpeningBalanceDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] outline-none focus:border-[#C59A55]"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-semibold text-slate-600 mb-1">ملاحظات عامة</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات حول العميل..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#202D3B] outline-none focus:border-[#C59A55]"
          />
        </div>

      </form>

    </div>
  );
}
