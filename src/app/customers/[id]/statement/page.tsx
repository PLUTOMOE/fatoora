"use client";

import React, { useState, useMemo, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Printer, Download, Share2, 
  Calendar, Scale, ArrowUp, ArrowDown, 
  Building2, Phone, FileText, CheckCircle2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { formatDate, tafqeetArabic } from '@/lib/zajelUtils';

function CustomerStatementDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, settings, getCustomerStatement } = useZajelStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState(resolvedParams.id);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-10-18');

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  const customer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  // Compute Statement Data accurately
  const statement = useMemo(() => {
    if (!customer) return { openingBalance: 0, movements: [], totalDebit: 0, totalCredit: 0, closingBalance: 0 };
    return getCustomerStatement(customer.id, fromDate || undefined, toDate || undefined);
  }, [customer, fromDate, toDate, getCustomerStatement]);

  const handleCustomerChange = (newId: string) => {
    setSelectedCustomerId(newId);
    router.push(`/customers/${newId}/statement`);
  };

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Filter and Actions Toolbar (Matching Mockup 4) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        
        {/* Customer & Date Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">العميل:</span>
            <select
              value={customer.id}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#202D3B] focus:border-[#C59A55] outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">من تاريخ:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">إلى تاريخ:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
            />
          </div>
        </div>

        {/* Action Buttons: طباعة الكشف - تصدير PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C59A55] text-[#C59A55] hover:bg-[#C59A55] hover:text-white text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الكشف</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير PDF</span>
          </button>
        </div>

      </div>

      {/* 3 Summary KPI Cards (Mockup 4: إجمالي المشتريات مدين، إجمالي المدفوعات دائن، الرصيد الحالي) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        
        {/* Card 1: إجمالي المشتريات (مدين) - Red Arrow Up */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">إجمالي المشتريات (مدين)</span>
            <div className="text-2xl font-bold text-rose-600 mt-1 font-mono tracking-tight">
              {statement.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className="text-[11px] text-slate-400">الفواتير المعتمدة خلال الفترة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: إجمالي المدفوعات (دائن) - Green Arrow Down */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">إجمالي المدفوعات (دائن)</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tracking-tight">
              {statement.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className="text-[11px] text-slate-400">سندات القبض المسددة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: الرصيد الحالي - Gold Balance Scales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">الرصيد الحالي</span>
            <div className="text-2xl font-bold text-[#202D3B] mt-1 font-mono tracking-tight">
              {statement.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-400 mr-1.5">ر.س</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-600">
              {statement.closingBalance > 0 
                ? 'مستحق على العميل' 
                : statement.closingBalance < 0 
                ? 'رصيد دائن لصالح العميل' 
                : 'الحساب متوازن (0.00)'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Formal A4 Statement Sheet & Movements Table (Mockup 4) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Printable Letterhead (Shown in Print) */}
        <div className="flex items-start justify-between border-b-2 border-[#202D3B] pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#202D3B]">كشف حساب عميل</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">CUSTOMER STATEMENT OF ACCOUNT</p>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <p><span className="text-slate-400">العميل: </span><span className="font-bold text-[#202D3B]">{customer.name}</span> ({customer.code})</p>
              <p><span className="text-slate-400">الفترة: </span>من <span className="font-mono">{formatDate(fromDate)}</span> إلى <span className="font-mono">{formatDate(toDate)}</span></p>
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

        {/* Movements Table (Matching exact rows in Mockup 4) */}
        <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#202D3B] text-white font-semibold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">م</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">رقم المستند</th>
                <th className="py-3 px-4">البيان</th>
                <th className="py-3 px-3 text-center">مدين (ر.س)</th>
                <th className="py-3 px-3 text-center">دائن (ر.س)</th>
                <th className="py-3 px-3 text-left">الرصيد (ر.س)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Opening balance row if any */}
              {statement.openingBalance !== 0 && (
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td className="py-3 px-3 text-center font-mono">-</td>
                  <td className="py-3 px-3 font-mono">{formatDate(fromDate)}</td>
                  <td className="py-3 px-3 font-mono">-</td>
                  <td className="py-3 px-4">رصيد افتتاحي ما قبل الفترة</td>
                  <td className="py-3 px-3 text-center font-mono">{statement.openingBalance > 0 ? statement.openingBalance.toLocaleString('en-US') : '-'}</td>
                  <td className="py-3 px-3 text-center font-mono">{statement.openingBalance < 0 ? Math.abs(statement.openingBalance).toLocaleString('en-US') : '-'}</td>
                  <td className="py-3 px-3 text-left font-mono font-bold">{statement.openingBalance.toLocaleString('en-US')}</td>
                </tr>
              )}

              {statement.movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا توجد حركات مالية مسجلة للعميل خلال هذه الفترة
                  </td>
                </tr>
              ) : (
                statement.movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{m.seq}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{formatDate(m.date)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#202D3B]">
                      {m.documentRoute ? (
                        <Link href={m.documentRoute} className="hover:text-[#C59A55] transition-colors print:no-underline">
                          {m.documentNumber}
                        </Link>
                      ) : (
                        m.documentNumber
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{m.statement}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">
                      {m.debit > 0 ? m.debit.toLocaleString('en-US') : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                      {m.credit > 0 ? m.credit.toLocaleString('en-US') : '-'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-bold text-[#202D3B]">
                      {m.runningBalance.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer with Totals */}
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right text-slate-700">
                  إجمالي الحركات والرصيد الختامي للفترة:
                </td>
                <td className="py-3 px-3 text-center font-mono text-rose-600">
                  {statement.totalDebit.toLocaleString('en-US')} ر.س
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-600">
                  {statement.totalCredit.toLocaleString('en-US')} ر.س
                </td>
                <td className="py-3 px-3 text-left font-mono text-base text-[#C59A55]">
                  {statement.closingBalance.toLocaleString('en-US')} ر.س
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Closing Balance Explanation & Tafqeet */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">صافي الرصيد المستحق كتابة:</span>
            <span className="font-bold text-[#202D3B]">
              {tafqeetArabic(Math.abs(statement.closingBalance))}
            </span>
            <span className="text-slate-500 mr-1.5 font-semibold">
              ({statement.closingBalance > 0 ? 'مستحق على العميل' : statement.closingBalance < 0 ? 'رصيد لصالح العميل' : 'حساب خالص'})
            </span>
          </div>

          <div className="text-left shrink-0">
            <div className="text-[11px] text-slate-400">تاريخ إصدار الكشف:</div>
            <div className="font-mono text-slate-600">{new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Formal Signature Lines */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs pt-10">
          <div>
            <div className="font-bold text-[#202D3B] mb-12">المحاسب المسؤول</div>
            <div className="w-36 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">التوقيع والاعتماد</div>
          </div>
          <div>
            <div className="font-bold text-[#202D3B] mb-12">مصادقة حسابات العميل</div>
            <div className="w-36 border-b border-dashed border-slate-400 mx-auto" />
            <div className="text-[11px] text-slate-400 mt-1">ختم وتوقيع المفوض</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function CustomerStatementPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل كشف الحساب...</div>}>
      <CustomerStatementDetail params={params} />
    </Suspense>
  );
}
