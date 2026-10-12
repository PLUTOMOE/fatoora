"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, ArrowDownLeft, Printer, 
  Eye, CheckCircle2, Clock, XCircle 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { formatDate } from '@/lib/zajelUtils';

export default function ReceiptVouchersListPage() {
  const { receiptVouchers, customers, cancelReceiptVoucher } = useZajelStore();

  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredVouchers = useMemo(() => {
    return receiptVouchers.filter((rc) => {
      const customer = customers.find((c) => c.id === rc.customerId);
      const custName = customer?.name || '';

      const matchesSearch = 
        rc.number.toLowerCase().includes(search.toLowerCase()) ||
        custName.toLowerCase().includes(search.toLowerCase()) ||
        rc.statement.toLowerCase().includes(search.toLowerCase());

      const matchesCust = customerFilter === 'all' || rc.customerId === customerFilter;
      const matchesMethod = methodFilter === 'all' || rc.paymentMethod === methodFilter;

      return matchesSearch && matchesCust && matchesMethod;
    });
  }, [receiptVouchers, customers, search, customerFilter, methodFilter]);

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
          <h2 className="text-xl font-bold text-[#202D3B]">سندات القبض</h2>
          <p className="text-xs text-slate-500 mt-0.5">تسجيل تحصيلات العملاء وتوزيع الدفعات على الفواتير المستحقة</p>
        </div>

        <Link
          href="/receipt-vouchers/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>سند قبض جديد</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم السند أو العميل أو البيان..."
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
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="cash">نقدي</option>
            <option value="card">بطاقة</option>
            <option value="cheque">شيك</option>
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
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">الحساب المستلم</th>
                <th className="py-3 px-4">البيان</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد سندات قبض مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((rc) => {
                  const customer = customers.find((c) => c.id === rc.customerId);

                  return (
                    <tr key={rc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                        <Link href={`/receipt-vouchers/${rc.id}`} className="hover:text-[#C59A55]">
                          {rc.number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatDate(rc.date)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {customer?.name || 'العميل'}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-600">
                        {rc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {paymentMethodLabel(rc.paymentMethod)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {rc.account === 'alrajhi_bank' ? 'مصرف الراجحي' : rc.account === 'snb_bank' ? 'البنك الأهلي' : 'الصندوق الرئيسي'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {rc.statement}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rc.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : rc.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rc.status === 'approved' ? 'معتمد' : rc.status === 'cancelled' ? 'ملغي' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/receipt-vouchers/${rc.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="معاينة السند"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/receipt-vouchers/${rc.id}?print=true`}
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
