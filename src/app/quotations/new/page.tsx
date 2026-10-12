"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Plus, Trash2, Save, Printer, 
  Calendar, Building2, User, CheckCircle2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { DocumentItem } from '@/types/zajel';

export default function NewQuotationPage() {
  const router = useRouter();
  const { customers, products, quotations, settings, addQuotation, addCustomer } = useZajelStore();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(settings.quotationTerms || '');

  // Quick Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Items
  const [items, setItems] = useState<DocumentItem[]>([
    {
      id: 'it-1',
      description: products[0]?.name || 'خدمة استشارية',
      unit: products[0]?.unit || 'جلسة',
      quantity: 1,
      unitPrice: products[0]?.price || 1000,
      discount: 0,
      taxRate: 15,
      taxAmount: (products[0]?.price || 1000) * 0.15,
      total: (products[0]?.price || 1000) * 1.15,
    }
  ]);

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    const rate = Number(item.taxRate) || 0;

    const baseAmount = Math.max(0, (qty * price) - disc);
    const tax = baseAmount * (rate / 100);
    const rowTotal = baseAmount + tax;

    item.taxAmount = tax;
    item.total = rowTotal;
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
        id: 'it-' + Date.now(),
        description: defaultProd?.name || 'بند جديد',
        unit: defaultProd?.unit || 'خدمة',
        quantity: 1,
        unitPrice: defaultProd?.price || 500,
        discount: 0,
        taxRate: 15,
        taxAmount: (defaultProd?.price || 500) * 0.15,
        total: (defaultProd?.price || 500) * 1.15,
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + ((it.quantity * it.unitPrice) - it.discount), 0);
  const vatAmount = items.reduce((acc, it) => acc + it.taxAmount, 0);
  const total = subtotal + vatAmount;

  const handleSave = (status: 'draft' | 'sent') => {
    if (!customerId) {
      alert('يرجى اختيار العميل');
      return;
    }

    const nextNum = `${settings.prefixQuotation}${String(quotations.length + 1).padStart(3, '0')}`;

    const newQuoId = addQuotation({
      number: nextNum,
      customerId,
      date,
      expiryDate,
      reference,
      items,
      subtotal,
      discount: 0,
      vatAmount,
      total,
      terms,
      notes,
      status,
    });

    router.push('/quotations');
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
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#202D3B]">إنشاء عرض سعر جديد</h2>
            <p className="text-xs text-slate-500 mt-0.5">تحديد بنود العرض والأسعار وشروط الدفع</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave('sent')}
            className="px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>حفظ واعتماد العرض</span>
          </button>
        </div>
      </div>

      {/* Basic Metadata */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#202D3B] border-b border-slate-100 pb-3">بيانات العرض الأساسية</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Customer */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600">العميل *</label>
              <button 
                type="button" 
                onClick={() => setShowAddCustomer(true)}
                className="text-[11px] text-[#C59A55] hover:underline"
              >
                + عميل جديد
              </button>
            </div>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">تاريخ العرض *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">تاريخ انتهاء الصلاحية</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            />
          </div>

          {/* Customer Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">مرجع العميل (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: PO-2026-09"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#202D3B] focus:outline-none focus:border-[#C59A55]"
            />
          </div>

        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#202D3B]">جدول البنود والخدمات</h3>
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
                <th className="py-2.5 px-3 w-5/12">الوصف / الصنف</th>
                <th className="py-2.5 px-3 w-1/12">الوحدة</th>
                <th className="py-2.5 px-3 w-1/12">الكمية</th>
                <th className="py-2.5 px-3 w-2/12">السعر (ر.س)</th>
                <th className="py-2.5 px-3 w-1/12">الخصم</th>
                <th className="py-2.5 px-3 w-2/12">الإجمالي</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <select
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 mb-1"
                      >
                        <option value="">اختيار من الأصناف المحفوظة...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.price} ر.س)</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="أو اكتب وصفاً مخصصاً للبند..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-[#202D3B] focus:border-[#C59A55] outline-none"
                        required
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-[#202D3B] outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-[#202D3B] font-mono outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-[#202D3B] font-mono outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="0"
                      value={item.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-[#202D3B] font-mono outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#202D3B] font-mono">
                    {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-slate-500">
            * تشمل الأسعار ضريبة القيمة المضافة بنسبة 15%
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono">{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span className="font-mono">{vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
            <div className="flex justify-between font-bold text-[#202D3B] text-sm pt-2 border-t border-slate-200">
              <span>الإجمالي النهائي:</span>
              <span className="font-mono text-[#C59A55]">{total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">الشروط والأحكام</label>
          <textarea
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#202D3B] outline-none focus:border-[#C59A55]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات داخلية</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات لا تظهر للعميل في الطباعة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#202D3B] outline-none focus:border-[#C59A55]"
          />
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
