"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Save, LayoutTemplate, Eye, X, ArrowRight, Printer, Plus, Trash2, GripVertical } from 'lucide-react';
import { CustomerAutocomplete, CustomerData } from '@/components/ui/CustomerAutocomplete';
import { ClassicTemplate } from '@/components/invoice-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/invoice-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/invoice-templates/MinimalTemplate';
import { EliteTemplate } from '@/components/invoice-templates/EliteTemplate';

interface InvoiceItem {
  name: string;
  description: string;
  qty: number;
  price: number;
  tax_rate: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<any>({
    template: 'elite',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    default_notes: ''
  });

  // Quotation Data States
  const [customerInfo, setCustomerInfo] = useState({ name: '', tax_number: '', address: '' });
  const [invoiceDates, setInvoiceDates] = useState({ date: new Date().toISOString().split('T')[0], due_date: '' });
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', description: '', qty: 1, price: 0, tax_rate: 15 }
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('invoice_settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleAddItem = () => {
    setItems([...items, { name: '', description: '', qty: 1, price: 0, tax_rate: 15 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const tax = items.reduce((acc, item) => acc + (item.qty * item.price * (item.tax_rate / 100)), 0);
  const total = subtotal + tax;

  const invoiceDataPayload = {
    entity: {
      name: 'عاصمة المجد للتجارة',
      address: 'المملكة العربية السعودية، الرياض',
      phone: '+966 50 000 0000',
      tax_number: '300123456700003',
      cr_number: '1010123456',
      logo_url: settings.logo_url
    },
    customer: {
      name: customerInfo.name || 'عميل غير محدد',
      address: customerInfo.address,
      phone: '',
      tax_number: customerInfo.tax_number
    },
    items: items.length > 0 && items[0].name ? items : [{ name: 'بند فارغ', qty: 0, price: 0, tax_rate: 0 }],
    invoice: {
      number: 'Q-2026-001',
      date: invoiceDates.date,
      due_date: invoiceDates.due_date,
      subtotal,
      tax,
      discount: 0,
      total
    },
    settings: {
      stamp_url: settings.stamp_url,
      signature_url: settings.signature_url,
      notes: settings.default_notes,
      template: settings.template
    },
    type: 'quotation' as const
  };

  const renderTemplate = () => {
    switch (settings.template) {
      case 'classic': return <ClassicTemplate {...invoiceDataPayload} />;
      case 'modern': return <ModernTemplate {...invoiceDataPayload} />;
      case 'minimal': return <MinimalTemplate {...invoiceDataPayload} />;
      case 'elite': return <EliteTemplate {...invoiceDataPayload} />;
      default: return <EliteTemplate {...invoiceDataPayload} />;
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowPreview(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">معاينة عرض السعر</h1>
              <p className="text-sm text-muted-foreground mt-1">تأكد من شكل عرض السعر قبل الإصدار</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              <Save className="w-4 h-4" />
              تأكيد وإصدار
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mt-6">
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="w-full overflow-x-auto custom-scrollbar p-0">
              <div className="min-w-[750px] w-full border border-border">
                 {renderTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button onClick={() => router.back()} className="hover:text-foreground transition-colors">عروض الأسعار</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">إنشاء عرض سعر جديد</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">إنشاء عرض سعر</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/settings/invoicing')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            إعدادات العرض
          </button>
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <Eye className="w-4 h-4 text-primary" />
            معاينة
          </button>
          <button className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Save className="w-4 h-4" />
            حفظ وإصدار
          </button>
        </div>
      </div>

      {/* Form Area */}
      <div className="space-y-6">
        
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4">بيانات العميل والإصدار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">اسم العميل (مطلوب)</label>
              <CustomerAutocomplete
                value={customerInfo.name}
                onChange={(customer, rawName) => {
                  if (customer) {
                    setCustomerInfo({
                      name: customer.name,
                      tax_number: customer.tax_number || '',
                      address: customer.address || ''
                    });
                  } else {
                    setCustomerInfo(prev => ({ ...prev, name: rawName }));
                  }
                }}
                onOpenCreateNew={(nameQuery) => {
                  router.push(`/customers/new?name=${encodeURIComponent(nameQuery)}&callback=/quotations/new`);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">الرقم الضريبي للعميل</label>
              <input 
                type="text" 
                value={customerInfo.tax_number}
                onChange={(e) => setCustomerInfo({...customerInfo, tax_number: e.target.value})}
                placeholder="الرقم الضريبي..." 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">صالح حتى (تاريخ الانتهاء)</label>
              <input 
                type="date" 
                value={invoiceDates.due_date}
                onChange={(e) => setInvoiceDates({...invoiceDates, due_date: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary text-foreground" 
              />
            </div>
          </div>
        </div>
        
        {/* Line Items Table (Odoo/Daftra Style) */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-bold text-foreground">بنود العرض</h2>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-right min-w-[800px]">
              <thead>
                <tr className="bg-muted/10 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="w-8 py-3 px-2"></th>
                  <th className="py-3 px-4 w-[40%]">المنتج / الخدمة</th>
                  <th className="py-3 px-4 w-24 text-center">الكمية</th>
                  <th className="py-3 px-4 w-32 text-center">سعر الوحدة</th>
                  <th className="py-3 px-4 w-24 text-center">الضريبة</th>
                  <th className="py-3 px-4 w-32 text-left">المجموع (ر.س)</th>
                  <th className="py-3 px-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemTotal = item.qty * item.price;
                  const itemTotalWithTax = itemTotal + (itemTotal * (item.tax_rate / 100));
                  
                  return (
                    <tr key={idx} className="border-b border-border/50 bg-background hover:bg-muted/20 transition-colors group">
                      <td className="py-3 px-2 align-top text-center cursor-move text-muted-foreground/30 hover:text-muted-foreground">
                        <GripVertical className="w-4 h-4 mx-auto mt-3" />
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder="ابحث عن منتج أو اكتب مباشرة..." 
                            className="w-full bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-3 py-2 text-sm outline-none focus:bg-background transition-all font-medium"
                          />
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="الوصف الإضافي (اختياري)..." 
                            className="w-full bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-3 py-1.5 text-[13px] outline-none text-muted-foreground focus:text-foreground focus:bg-background transition-all"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <input 
                          type="number" 
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-2 py-2 text-sm outline-none focus:bg-background transition-all"
                        />
                      </td>
                      <td className="py-3 px-4 align-top">
                        <input 
                          type="number" 
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-2 py-2 text-sm outline-none focus:bg-background transition-all tabular-nums"
                        />
                      </td>
                      <td className="py-3 px-4 align-top">
                        <select 
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(idx, 'tax_rate', parseFloat(e.target.value))}
                          className="w-full text-center bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-2 py-2 text-[13px] outline-none focus:bg-background transition-all appearance-none cursor-pointer"
                          style={{ WebkitAppearance: 'none' }}
                        >
                          <option value="15">15%</option>
                          <option value="0">0%</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 align-top pt-5 text-left font-semibold text-foreground tabular-nums">
                        {itemTotalWithTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 align-top pt-4">
                        <button 
                          onClick={() => handleRemoveItem(idx)}
                          className="w-8 h-8 mx-auto flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-background border-t border-border">
            <button 
              onClick={handleAddItem}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
            >
              <Plus className="w-4 h-4" />
              إضافة سطر
            </button>
          </div>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm w-full md:w-[400px]">
            <div className="space-y-4">
               <div className="flex justify-between text-[14px]">
                 <span className="text-muted-foreground">المجموع الفرعي (بدون ضريبة)</span>
                 <span className="font-medium tabular-nums">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</span>
               </div>
               <div className="flex justify-between text-[14px]">
                 <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                 <span className="font-medium tabular-nums text-primary">{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</span>
               </div>
               <div className="flex justify-between border-t border-border pt-4 mt-2">
                 <span className="text-base font-bold text-foreground uppercase tracking-wide">الإجمالي المستحق</span>
                 <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">
                   {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                 </span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
