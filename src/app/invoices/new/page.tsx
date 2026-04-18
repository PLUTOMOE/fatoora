"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Save, LayoutTemplate, Eye, X, ArrowRight, Printer, Plus, Trash2, GripVertical, Stamp, PenTool, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { CustomerAutocomplete, CustomerData } from '@/components/ui/CustomerAutocomplete';
import { ProductAutocomplete, ProductData } from '@/components/ui/ProductAutocomplete';
import { NotesManager } from '@/components/ui/NotesManager';
import { ClassicTemplate } from '@/components/invoice-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/invoice-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/invoice-templates/MinimalTemplate';
import { EliteTemplate } from '@/components/invoice-templates/EliteTemplate';
import { CorporateTemplate } from '@/components/invoice-templates/CorporateTemplate';
import { CompactTemplate } from '@/components/invoice-templates/CompactTemplate';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';
import { getInvoiceDetails } from '@/lib/supabase/services';

interface InvoiceItem {
  name: string;
  description: string;
  qty: number;
  price: number;
  tax_rate: number;
}

function InvoiceFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeEntity } = useStore();
  const [showPreview, setShowPreview] = useState(false);
  const [entityData, setEntityData] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    template: 'elite',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    default_notes: ''
  });

  // Quotation Data States
  const [customerInfo, setCustomerInfo] = useState({ id: '', name: '', tax_number: '', address: '' });
  const [invoiceDates, setInvoiceDates] = useState({ date: new Date().toISOString().split('T')[0], due_date: '' });
  const [docNumber, setDocNumber] = useState(`INV-${new Date().getFullYear()}-001`);
  const [isSaving, setIsSaving] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', description: '', qty: 1, price: 0, tax_rate: 15 }
  ]);

  // Fetch real entity data from DB
  useEffect(() => {
    const fetchEntity = async () => {
      if (!activeEntity?.name) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('entities')
          .select('*')
          .eq('name', activeEntity.name)
          .single();
        if (data) setEntityData(data);
      } catch (e) { console.error('Failed to load entity', e); }
    };
    fetchEntity();
  }, [activeEntity?.name]);

  useEffect(() => {
    // Load general settings
    const stored = localStorage.getItem('invoice_settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }

    // Load Draft if returning from Customer Creation
    const draft = localStorage.getItem('invoice_draft_state');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.items) setItems(parsed.items);
        if (parsed.invoiceDates) setInvoiceDates(parsed.invoiceDates);
        localStorage.removeItem('invoice_draft_state'); // Clear draft
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }

    // Load New Customer if redirected back
    const newCustomerStr = searchParams.get('newCustomerData');
    if (newCustomerStr) {
      try {
        const cData = JSON.parse(newCustomerStr);
        setCustomerInfo({
          id: cData.id || '',
          name: cData.name || '',
          tax_number: cData.tax_number || '',
          address: cData.address || ''
        });
      } catch (e) {
        console.error("Error parsing newCustomerData", e);
      }
    }

    // Load from Quotation if converting
    const sourceQuotationId = searchParams.get('source_quotation_id');
    if (sourceQuotationId) {
      const loadQuotation = async () => {
        try {
          const { invoice, items: qItems } = await getInvoiceDetails(sourceQuotationId);
          if (invoice && qItems) {
            // Set Customer
            if (invoice.customers) {
               setCustomerInfo({
                 id: invoice.customers.id,
                 name: invoice.customers.name,
                 tax_number: invoice.customers.tax_number || '',
                 address: invoice.customers.address || ''
               });
            }
            // Set Items
            if (qItems.length > 0) {
              const mappedItems = qItems.map((qi: any) => ({
                name: qi.description.split('\n')[0] || qi.description,
                description: qi.description,
                qty: qi.quantity,
                price: qi.unit_price,
                tax_rate: qi.tax_rate
              }));
              setItems(mappedItems);
            }
            // Set Notes
            if (invoice.notes) {
              setNotes(invoice.notes);
            }
          }
        } catch (err) {
          console.error("Failed to load quotation for conversion", err);
        }
      };
      loadQuotation();
    }
  }, [searchParams]);

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
      name: entityData?.name || activeEntity?.name || '',
      address: entityData?.address || '',
      phone: entityData?.phone || '',
      tax_number: entityData?.tax_number || '',
      cr_number: entityData?.cr_number || '',
      logo_url: entityData?.logo_url || settings.logo_url
    },
    customer: {
      name: customerInfo.name || 'عميل غير محدد',
      address: customerInfo.address,
      phone: '',
      tax_number: customerInfo.tax_number
    },
    items: items.length > 0 && items[0].name ? items : [{ name: 'بند فارغ', qty: 0, price: 0, tax_rate: 0 }],
    invoice: {
      number: docNumber,
      date: invoiceDates.date,
      due_date: invoiceDates.due_date,
      subtotal,
      tax,
      discount: 0,
      total
    },
    settings: {
      stamp_url: showStamp ? settings.stamp_url : '',
      signature_url: showSignature ? settings.signature_url : '',
      notes: notes || settings.default_notes,
      template: settings.template
    },
    type: 'invoice' as const
  };

  const renderTemplate = () => {
    switch (settings.template) {
      case 'classic': return <ClassicTemplate {...invoiceDataPayload} />;
      case 'modern': return <ModernTemplate {...invoiceDataPayload} />;
      case 'minimal': return <MinimalTemplate {...invoiceDataPayload} />;
      case 'elite': return <EliteTemplate {...invoiceDataPayload} />;
      case 'corporate': return <CorporateTemplate {...invoiceDataPayload} />;
      case 'compact': return <CompactTemplate {...invoiceDataPayload} />;
      default: return <EliteTemplate {...invoiceDataPayload} />;
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!entityData?.id) {
      alert('البيانات غير مكتملة');
      return;
    }
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      
      let customerId = customerInfo.id;
      
      // If no customer ID but name exists, create the customer
      if (!customerId && customerInfo.name) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            entity_id: entityData.id,
            name: customerInfo.name,
            tax_number: customerInfo.tax_number,
            address: customerInfo.address,
            type: 'company'
          })
          .select()
          .single();
          
        if (!customerError && newCustomer) {
          customerId = newCustomer.id;
        }
      }

      if (!customerId) {
        alert('يرجى تحديد أو إدخال بيانات العميل');
        setIsSaving(false);
        return;
      }
      
      // Create Invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          entity_id: entityData.id,
          customer_id: customerId,
          invoice_number: docNumber,
          type: 'standard',
          status: isDraft ? 'draft' : 'pending',
          issue_date: invoiceDates.date,
          due_date: invoiceDates.due_date || null,
          subtotal: subtotal,
          tax_total: tax,
          discount: 0,
          total: total,
          notes: notes || settings.default_notes
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Create Items
      if (newInvoice && items.length > 0) {
        const itemsToInsert = items.filter(item => item.name).map(item => ({
          invoice_id: newInvoice.id,
          description: item.name,
          quantity: item.qty,
          unit_price: item.price,
          tax_rate: item.tax_rate,
          total: item.qty * item.price * (1 + item.tax_rate / 100)
        }));
        
        if (itemsToInsert.length > 0) {
          await supabase.from('invoice_items').insert(itemsToInsert);
        }
      }
      
      // Redirect
      router.push('/invoices');
      router.refresh();
      
    } catch (error) {
      console.error("Error saving:", error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
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
              <h1 className="text-2xl font-bold text-foreground">معاينة الفاتورة</h1>
              <p className="text-sm text-muted-foreground mt-1">تأكد من شكل الفاتورة قبل الإصدار</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors">
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button 
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'جاري التأكيد...' : 'تأكيد وإصدار'}
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mt-6">
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="w-full overflow-x-auto custom-scrollbar p-0">
              <div className="min-w-[750px] w-full border border-gray-200">
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
            <button onClick={() => router.back()} className="hover:text-foreground transition-colors">الفواتير</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">إنشاء فاتورة جديدة</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">إنشاء فاتورة جديدة</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={settings.template}
              onChange={(e) => setSettings((s: any) => ({ ...s, template: e.target.value }))}
              className="appearance-none flex items-center gap-2 h-10 px-4 pr-8 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer outline-none"
            >
              <option value="elite">⭐ Elite</option>
              <option value="corporate">🏢 Corporate</option>
              <option value="compact">📋 Compact</option>
              <option value="modern">🎨 Modern</option>
              <option value="classic">📄 Classic</option>
              <option value="minimal">✏️ Minimal</option>
            </select>
            <LayoutTemplate className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <Eye className="w-4 h-4 text-primary" />
            معاينة
          </button>
          <button 
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'جاري الإصدار...' : 'إصدار الفاتورة'}
          </button>
        </div>
      </div>

      {/* Form Area */}
      <div className="space-y-6">
        
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4">بيانات العميل والإصدار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">رقم الفاتورة (تسلسلي)</label>
              <input 
                type="text" 
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="INV-2026-001" 
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono outline-none focus:border-primary" 
              />
            </div>
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">اسم العميل (مطلوب)</label>
              <CustomerAutocomplete
                value={customerInfo.name}
                onChange={(customer, rawName) => {
                  if (customer) {
                    setCustomerInfo({
                      id: customer.id,
                      name: customer.name,
                      tax_number: customer.tax_number || '',
                      address: customer.address || ''
                    });
                  } else {
                    setCustomerInfo(prev => ({ ...prev, name: rawName, id: '' }));
                  }
                }}
                onOpenCreateNew={(nameQuery) => {
                  const stateToSave = {
                    items,
                    invoiceDates,
                  };
                  localStorage.setItem('invoice_draft_state', JSON.stringify(stateToSave));
                  router.push(`/customers/new?name=${encodeURIComponent(nameQuery)}&callback=/invoices/new`);
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
              <label className="text-xs font-semibold text-muted-foreground">تاريخ الاستحقاق</label>
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
            <h2 className="text-sm font-bold text-foreground">بنود الفاتورة</h2>
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
                          <ProductAutocomplete
                            value={item.name}
                            onChange={(product, rawName) => {
                              if (product) {
                                const newItems = [...items];
                                newItems[idx] = {
                                  ...newItems[idx],
                                  name: product.name,
                                  price: product.price || newItems[idx].price,
                                  tax_rate: product.tax_rate ?? 15,
                                  description: product.description || newItems[idx].description,
                                };
                                setItems(newItems);
                              } else {
                                handleItemChange(idx, 'name', rawName);
                              }
                            }}
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

        {/* Notes Manager */}
        <NotesManager
          docType="invoice"
          value={notes}
          onChange={setNotes}
        />

        {/* Stamp & Signature Toggle Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowSignature(!showSignature)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              showSignature 
                ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            <PenTool className="w-4 h-4" />
            {showSignature ? '✓ تم إضافة التوقيع' : 'إضافة التوقيع'}
          </button>
          <button
            type="button"
            onClick={() => setShowStamp(!showStamp)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              showStamp 
                ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            <Stamp className="w-4 h-4" />
            {showStamp ? '✓ تم إضافة الختم' : 'إضافة الختم'}
          </button>
          {(!settings.stamp_url && !settings.signature_url) && (
            <span className="text-[11px] text-muted-foreground/70 self-center mr-2">
              💡 ارفع التوقيع والختم من الإعدادات أولاً
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>}>
      <InvoiceFormContent />
    </Suspense>
  );
}
