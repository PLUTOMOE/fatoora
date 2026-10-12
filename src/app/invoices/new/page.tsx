"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Plus, Trash2, Save, Printer, 
  CheckCircle2, FileText, UserPlus 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { DocumentItem } from '@/types/zajel';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { formatDate } from '@/lib/zajelUtils';

export default function NewInvoicePage() {
  const router = useRouter();
  const { customers, products, invoices, settings, addInvoice, addCustomer } = useZajelStore();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [date, setDate] = useState('2026-10-12'); // Defaults to mockup date or today
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(settings.invoiceTerms || '');

  // Quick Customer modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Default items matching mockup 3
  const [items, setItems] = useState<DocumentItem[]>([
    {
      id: 'ii-1',
      description: 'خدمة استشارية',
      unit: 'جلسة',
      quantity: 2,
      unitPrice: 1000,
      discount: 0,
      taxRate: 15,
      taxAmount: 300,
      total: 2000, // Matching mockup items table
    },
    {
      id: 'ii-2',
      description: 'دعم فني',
      unit: 'شهر',
      quantity: 1,
      unitPrice: 500,
      discount: 0,
      taxRate: 15,
      taxAmount: 75,
      total: 500,
    }
  ]);

  const [discountTotal, setDiscountTotal] = useState(0);

  // Auto invoice number
  const nextInvoiceNum = useMemo(() => {
    return `${settings.prefixInvoice}${String(invoices.length + 1).padStart(3, '0')}`;
  }, [settings.prefixInvoice, invoices.length]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === customerId) || customers[0] || null;
  }, [customers, customerId]);

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    const rate = Number(item.taxRate) || 0;

    const baseAmount = Math.max(0, (qty * price) - disc);
    const tax = baseAmount * (rate / 100);

    item.taxAmount = tax;
    item.total = baseAmount; // Base total displayed in row
    updated[index] = item;
    setItems(updated);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    handleItemChange(index, 'description', prod.name);
    handleItemChange(index, 'unit', prod.unit);
    handleItemChange(index, 'unitPrice', prod.price);
    handleItemChange(index, 'taxRate', prod.taxRate);
  };

  const addItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        id: 'ii-' + Date.now(),
        description: defaultProd?.name || 'خدمة جديدة',
        unit: defaultProd?.unit || 'خدمة',
        quantity: 1,
        unitPrice: defaultProd?.price || 500,
        discount: 0,
        taxRate: 15,
        taxAmount: (defaultProd?.price || 500) * 0.15,
        total: defaultProd?.price || 500,
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const netBeforeTax = Math.max(0, subtotal - discountTotal);
  const vatAmount = netBeforeTax * (settings.vatRate / 100);
  const total = netBeforeTax + vatAmount;

  const handleSave = (status: 'draft' | 'approved', shouldPrint = false) => {
    if (!customerId) {
      alert('يرجى اختيار العميل');
      return;
    }

    const newId = addInvoice({
      number: nextInvoiceNum,
      customerId,
      date,
      dueDate: dueDate || undefined,
      items: items.map(it => ({
        ...it,
        total: (it.quantity * it.unitPrice) - it.discount + it.taxAmount,
      })),
      subtotal,
      discount: discountTotal,
      vatAmount,
      total,
      paidAmount: 0,
      remainingAmount: total,
      documentStatus: status,
      paymentStatus: 'unpaid',
      terms,
      notes,
      snapshotCustomer: selectedCustomer ? {
        name: selectedCustomer.name,
        taxNumber: selectedCustomer.taxNumber,
        crNumber: selectedCustomer.crNumber,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
      } : undefined,
      snapshotCompany: {
        name: settings.name,
        taxNumber: settings.taxNumber,
        crNumber: settings.crNumber,
        phone: settings.phone,
        iban: settings.iban,
        bankName: settings.bankName,
      },
    });

    if (shouldPrint) {
      router.push(`/invoices/${newId}?print=true`);
    } else {
      router.push(`/invoices/${newId}`);
    }
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newId = addCustomer({
      code: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '0500000000',
      type: 'business',
      status: 'active',
      openingBalance: 0,
      openingBalanceType: 'debit',
      openingBalanceDate: date,
    });

    setCustomerId(newId);
    setShowAddCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#202D3B]">إنشاء فاتورة جديدة</h2>
            <p className="text-xs text-slate-500 mt-0.5">إصدار فاتورة مبيعات جديدة للعميل مع اعتمادها وتحديث الأرصدة</p>
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

      {/* Split Screen Layout (Matching Mockup 3: Form on right, Live Preview on left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right Column: Invoice Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Info Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">رقم الفاتورة</label>
                <input
                  type="text"
                  readOnly
                  value={nextInvoiceNum}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#202D3B] cursor-not-allowed text-center"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">التاريخ *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:border-[#C59A55] outline-none"
                />
              </div>

              {/* Customer */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">العميل *</label>
                  <button 
                    type="button" 
                    onClick={() => setShowAddCustomer(true)}
                    className="text-[11px] text-[#C59A55] hover:underline"
                  >
                    + جديد
                  </button>
                </div>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:border-[#C59A55] outline-none font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Items Table (Mockup 3) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#202D3B]">بنود الفاتورة</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C59A55]/10 text-[#C59A55] hover:bg-[#C59A55] hover:text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صنف</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-5/12">الصنف</th>
                    <th className="py-2.5 px-3 w-2/12 text-center">الكمية</th>
                    <th className="py-2.5 px-3 w-2/12 text-center">السعر (ر.س)</th>
                    <th className="py-2.5 px-3 w-2/12 text-left">الإجمالي (ر.س)</th>
                    <th className="py-2.5 px-2 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="وصف الصنف..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#202D3B] outline-none focus:border-[#C59A55]"
                          required
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-mono outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-mono outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold font-mono text-[#202D3B]">
                        {item.total.toLocaleString('en-US')}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-20 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal, Discount & Totals (Mockup 3 right side) */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold text-[#202D3B]">{subtotal.toLocaleString('en-US')} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>الخصم:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={discountTotal}
                      onChange={(e) => setDiscountTotal(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-mono outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ر.س</span>
                  </div>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الضريبة ({settings.vatRate}%):</span>
                  <span className="font-mono font-bold text-[#202D3B]">{vatAmount.toLocaleString('en-US')} ر.س</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#202D3B] pt-2 border-t border-slate-200">
                  <span>الإجمالي:</span>
                  <span className="font-mono text-[#C59A55] text-base">{total.toLocaleString('en-US')} ر.س</span>
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
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
              اعتماد الفاتورة
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

        {/* Left Column: Live Invoice Preview (Mockup 3 - 5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md sticky top-20 text-xs space-y-5">
            
            <div className="text-center pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">معاينة الفاتورة الحية</span>
            </div>

            {/* Preview Header with Zajel Logo */}
            <div className="flex items-start justify-between">
              <div>
                <ZajelLogo variant="light" size="sm" />
                <h4 className="font-bold text-xs text-[#202D3B] mt-2">فاتورة مبيعات</h4>
              </div>

              <div className="text-left text-[11px] text-slate-500 font-mono space-y-0.5">
                <div className="font-bold text-[#202D3B]">{nextInvoiceNum}</div>
                <div>{date}</div>
              </div>
            </div>

            {/* Customer in Preview */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-[11px] flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[10px]">العميل:</span>
                <span className="font-bold text-[#202D3B]">{selectedCustomer?.name || 'شركة الأفق'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                معتمدة
              </span>
            </div>

            {/* Live Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-2.5">البند</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-center">السعر</th>
                    <th className="py-2 px-2.5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 font-medium text-slate-800">{it.description}</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">{it.quantity}</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">{it.unitPrice}</td>
                      <td className="py-2 px-2.5 text-left font-mono font-bold text-[#202D3B]">
                        {it.total.toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live Totals Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{subtotal.toLocaleString('en-US')} ر.س</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>الخصم:</span>
                  <span className="font-mono">-{discountTotal.toLocaleString('en-US')} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>الضريبة (15%):</span>
                <span className="font-mono">{vatAmount.toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-[#202D3B] pt-1.5 border-t border-slate-200">
                <span>الإجمالي:</span>
                <span className="font-mono text-[#C59A55] text-sm">{total.toLocaleString('en-US')} ر.س</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400">
              زاجل النخبة • فواتير مبيعات معتمدة
            </div>

          </div>
        </div>

      </div>

      {/* Quick Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-[#202D3B] mb-3">إضافة عميل جديد سريعاً</h3>
            <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم العميل أو المنشأة *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#C59A55]"
                  placeholder="مثال: شركة التطوير الحديثة"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم الجوال *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#C59A55]"
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C59A55] text-white font-bold hover:bg-[#B38944]"
                >
                  إضافة العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
