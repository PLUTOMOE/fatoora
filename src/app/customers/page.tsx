"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, UserCheck, UserX, 
  FileSpreadsheet, Edit3, Trash2, Phone, 
  Building2, User, CheckCircle2, AlertCircle,
  FileText, Calendar, ArrowUpRight, Scale, Printer
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { Customer } from '@/types/zajel';
import { formatCurrency, formatDate } from '@/lib/zajelUtils';

export default function CustomersListPage() {
  const { 
    customers, 
    quickStatements,
    getCustomerBalance, 
    toggleCustomerStatus, 
    deleteCustomer,
    deleteQuickStatement 
  } = useZajelStore();

  const [activeTab, setActiveTab] = useState<'customers' | 'quickStatements'>('customers');

  // Customer filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'business' | 'individual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Quick Statements filters
  const [statementSearch, setStatementSearch] = useState('');
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Filtered regular customers
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((c) => {
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

  // Filtered quick statements
  const filteredStatements = useMemo(() => {
    return (quickStatements || []).filter((st) => {
      const q = statementSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        st.statementNumber.toLowerCase().includes(q) ||
        st.customerName.toLowerCase().includes(q) ||
        (st.projectName && st.projectName.toLowerCase().includes(q)) ||
        (st.projectCode && st.projectCode.toLowerCase().includes(q)) ||
        (st.customerPhone && st.customerPhone.includes(q))
      );
    });
  }, [quickStatements, statementSearch]);

  // Quick statements statistics summary
  const statementStats = useMemo(() => {
    const list = quickStatements || [];
    const count = list.length;
    const totalContract = list.reduce((sum, st) => sum + (st.totalWithTax || st.projectTotal || 0), 0);
    const totalPaid = list.reduce((sum, st) => {
      const paid = (st.payments || []).reduce((pSum, p) => pSum + (Number(p.amount) || 0), 0);
      return sum + paid;
    }, 0);
    const totalRemaining = totalContract - totalPaid;

    return { count, totalContract, totalPaid, totalRemaining };
  }, [quickStatements]);

  const handleDeleteCustomer = (id: string) => {
    const res = deleteCustomer(id);
    if (!res.success) {
      setDeleteError(res.message || 'لا يمكن حذف العميل');
      setTimeout(() => setDeleteError(null), 5000);
    }
  };

  const handleDeleteStatement = (id: string, statementNumber: string) => {
    if (confirm(`هل أنت متأكد من حذف كشف الحساب رقم (${statementNumber})؟`)) {
      deleteQuickStatement(id);
      setDeleteSuccessMsg(`تم حذف كشف الحساب ${statementNumber} بنجاح`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202D3B]">العملاء وكشوف الحساب</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة بيانات العملاء والشركات ومتابعة كشوف حساب المشاريع والدفعات المباشرة
          </p>
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

      {deleteSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'customers'
              ? 'bg-[#202D3B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <User className="w-4 h-4 text-[#C59A55]" />
          <span>دليل العملاء</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {customers?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quickStatements')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quickStatements'
              ? 'bg-[#202D3B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-[#C59A55]" />
          <span>كشوف حساب المشاريع (السريعة)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'quickStatements' ? 'bg-[#C59A55] text-white' : 'bg-amber-50 text-[#C59A55] font-bold'
          }`}>
            {quickStatements?.length || 0}
          </span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: REGULAR CUSTOMERS LIST
         ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          
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
                            {c.phone || '-'}
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
                                onClick={() => handleDeleteCustomer(c.id)}
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
      )}

      {/* =========================================================================
          VIEW 2: QUICK PROJECT STATEMENTS LIST
         ========================================================================= */}
      {activeTab === 'quickStatements' && (
        <div className="space-y-4">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">إجمالي كشوف المشاريع</span>
                <span className="text-xl font-bold font-mono text-[#202D3B]">{statementStats.count} كشف</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5 text-[#C59A55]" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">إجمالي القيمة التعاقدية</span>
                <span className="text-xl font-bold font-mono text-[#202D3B]">
                  {formatCurrency(statementStats.totalContract)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">إجمالي المسدد حتى تاريخه</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {formatCurrency(statementStats.totalPaid)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">المتبقي المستحق للتحصيل</span>
                <span className={`text-xl font-bold font-mono ${
                  statementStats.totalRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {formatCurrency(statementStats.totalRemaining)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Statements Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="البحث برقم الكشف، اسم العميل، أو اسم المشروع..."
                value={statementSearch}
                onChange={(e) => setStatementSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
              />
            </div>

            <Link
              href="/customers/quick-statement"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202D3B] hover:bg-[#15202B] text-white text-xs font-bold transition-all shadow-xs self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4 text-[#C59A55]" />
              <span>إنشاء كشف حساب مشروع جديد</span>
            </Link>
          </div>

          {/* Quick Statements Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">رقم الكشف</th>
                    <th className="py-3 px-4">تاريخ الإصدار</th>
                    <th className="py-3 px-4">اسم العميل</th>
                    <th className="py-3 px-4">المشروع / العقد</th>
                    <th className="py-3 px-4 text-center">إجمالي المشروع</th>
                    <th className="py-3 px-4 text-center">المسدد</th>
                    <th className="py-3 px-4 text-center">المتبقي</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStatements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-400">
                        <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600 mb-1">
                          {quickStatements?.length === 0 
                            ? 'لا توجد كشوف حساب مشاريع محفوظة حتى الآن' 
                            : 'لا توجد كشوف مطابقة لكلمات البحث'}
                        </p>
                        <p className="text-[11px] text-slate-400 mb-4">
                          يمكنك إنشاء كشف حساب فوري لمشروع برقم إجمالي ودفعات بالتواريخ بدون الحاجة لفواتير سابقة
                        </p>
                        <Link
                          href="/customers/quick-statement"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] text-white font-bold hover:bg-[#B38944] transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إنشاء أول كشف حساب الآن</span>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    filteredStatements.map((st) => {
                      const totalAmount = st.totalWithTax || st.projectTotal || 0;
                      const paidAmount = (st.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                      const remainingAmount = totalAmount - paidAmount;

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C59A55]">
                            <Link 
                              href={`/customers/quick-statement?id=${st.id}&tab=preview`}
                              className="hover:underline"
                              title="عرض ومعاينة كشف الحساب"
                            >
                              {st.statementNumber}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {formatDate(st.date)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#202D3B]">
                            {st.customerName}
                            {st.customerPhone && (
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">
                                {st.customerPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium block">{st.projectName || '-'}</span>
                            {st.projectCode && (
                              <span className="text-[10px] font-mono text-slate-400">مرجع: {st.projectCode}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-[#202D3B]">
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                            {formatCurrency(paidAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            <span className={remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                              {formatCurrency(remainingAmount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Preview & Print Button */}
                              <Link
                                href={`/customers/quick-statement?id=${st.id}&tab=preview`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C59A55]/10 hover:bg-[#C59A55] text-[#C59A55] hover:text-white font-bold text-[11px] transition-colors"
                                title="معاينة وطباعة كشف الحساب A4"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>طباعة ومعاينة</span>
                              </Link>

                              {/* Edit Button */}
                              <Link
                                href={`/customers/quick-statement?id=${st.id}&tab=editor`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="تعديل بيانات الكشف والدفعات"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Link>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteStatement(st.id, st.statementNumber)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="حذف كشف الحساب"
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
      )}

    </div>
  );
}
