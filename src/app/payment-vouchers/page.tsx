"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, ArrowUpRight, Printer, 
  Eye, CheckCircle2, Building2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { formatDate } from '@/lib/zajelUtils';

export default function PaymentVouchersListPage() {
  const { paymentVouchers, customers } = useZajelStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'refund'>('all');

  const filteredVouchers = useMemo(() => {
    return paymentVouchers.filter((pv) => {
      const matchesSearch = 
        pv.number.toLowerCase().includes(search.toLowerCase()) ||
        pv.beneficiary.toLowerCase().includes(search.toLowerCase()) ||
        pv.reason.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'all' || pv.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [paymentVouchers, search, typeFilter]);

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'تحويل بنكي';
      case 'cash': return 'نقدي';
      case 'card': return 'بطاقة';
      case 'cheque': return 'شيك';
      default: return method;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">سندات الصرف</h2>
          <p className="text-xs text-slate-500 mt-0.5">تسجيل المدفوعات للموردين والمصروفات العامة ورد المبالغ للعملاء</p>
        </div>

        <Link
          href="/payment-vouchers/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>سند صرف جديد</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم السند أو اسم المستفيد أو سبب الصرف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="expense">مصروف عام</option>
            <option value="refund">رد مبلغ لعميل</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم السند</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">اسم المستفيد</th>
                <th className="py-3 px-4">نوع العملية</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">سبب الصرف</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد سندات صرف مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((pv) => {
                  const linkedCustomer = pv.customerId ? customers.find(c => c.id === pv.customerId) : null;

                  return (
                    <tr key={pv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                        <Link href={`/payment-vouchers/${pv.id}`} className="hover:text-[#C59A55]">
                          {pv.number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatDate(pv.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {pv.beneficiary}
                        {linkedCustomer && (
                          <span className="text-[11px] text-slate-400 block">
                            (العميل: {linkedCustomer.name})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          pv.type === 'refund' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pv.type === 'refund' ? 'رد مبلغ لعميل' : 'مصروف عام'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-rose-600">
                        {pv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {paymentMethodLabel(pv.paymentMethod)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {pv.reason}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          pv.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {pv.status === 'approved' ? 'معتمد' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/payment-vouchers/${pv.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="معاينة السند"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/payment-vouchers/${pv.id}?print=true`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#C59A55] hover:bg-[#C59A55]/10 transition-colors"
                            title="طباعة A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
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

    </div>
  );
}
