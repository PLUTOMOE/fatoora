"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, UserCheck, UserX, 
  FileSpreadsheet, Edit3, Trash2, Phone, 
  Building2, User, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { Customer } from '@/types/zajel';

export default function CustomersListPage() {
  const { customers, getCustomerBalance, toggleCustomerStatus, deleteCustomer } = useZajelStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'business' | 'individual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.taxNumber && c.taxNumber.includes(search));

      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, search, typeFilter, statusFilter]);

  const handleDelete = (id: string) => {
    const res = deleteCustomer(id);
    if (!res.success) {
      setDeleteError(res.message || 'لا يمكن حذف العميل');
      setTimeout(() => setDeleteError(null), 5000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">العملاء</h2>
          <p className="text-xs text-slate-500 mt-0.5">إدارة بيانات العملاء والشركات ومتابعة الأرصدة وكشوف الحساب</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/customers/quick-statement"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C59A55] text-[#C59A55] hover:bg-[#C59A55]/10 text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>كشف حساب مشروع (سريع)</span>
          </Link>

          <Link
            href="/customers/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>عميل جديد</span>
          </Link>
        </div>
      </div>

      {deleteError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الكود أو الجوال أو الرقم الضريبي..."
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
            <option value="all">جميع الأنواع</option>
            <option value="business">منشأة / شركة</option>
            <option value="individual">فرد</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">معطل</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">كود العميل</th>
                <th className="py-3 px-4">اسم العميل / المنشأة</th>
                <th className="py-3 px-4">رقم الجوال</th>
                <th className="py-3 px-4">الرقم الضريبي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">رصيد العميل</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا يوجد عملاء مطابقون للبحث
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const balance = getCustomerBalance(c.id);
                  const isDue = balance > 0;
                  const isCredit = balance < 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link 
                          href={`/customers/${c.id}`} 
                          className="font-bold text-[#202D3B] hover:text-[#C59A55] transition-colors flex items-center gap-1.5"
                        >
                          {c.type === 'business' ? (
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{c.name}</span>
                        </Link>
                        {c.city && <span className="text-[11px] text-slate-400 block mr-5">{c.city}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {c.taxNumber || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {c.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {isDue ? (
                          <span className="text-rose-600">
                            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                            <span className="text-[10px] font-normal text-rose-500 block">مستحق على العميل</span>
                          </span>
                        ) : isCredit ? (
                          <span className="text-emerald-600">
                            {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                            <span className="text-[10px] font-normal text-emerald-500 block">رصيد لصالح العميل</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0.00 ر.س</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Direct Statement Button */}
                          <Link
                            href={`/customers/${c.id}/statement`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C59A55]/10 hover:bg-[#C59A55] text-[#C59A55] hover:text-white font-bold text-[11px] transition-colors"
                            title="عرض كشف حساب العميل"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>كشف حساب</span>
                          </Link>

                          {/* Profile Link */}
                          <Link
                            href={`/customers/${c.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="الملف والتفاصيل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => toggleCustomerStatus(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title={c.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {c.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>

                          {/* Delete (Safe check) */}
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
