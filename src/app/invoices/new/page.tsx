"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Save, LayoutTemplate, Printer } from 'lucide-react';
import { ClassicTemplate } from '@/components/invoice-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/invoice-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/invoice-templates/MinimalTemplate';
import { EliteTemplate } from '@/components/invoice-templates/EliteTemplate';

export default function NewInvoicePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>({
    template: 'elite',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    default_notes: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('invoice_settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  const dummyData = {
    entity: {
      name: 'Global Elite',
      address: '123 Corporate Blvd, Suite 400\nNew York, NY 10001',
      phone: '+1 800 555 0199',
      tax_number: '300123456700003',
      cr_number: '1010123456',
      logo_url: settings.logo_url
    },
    customer: {
      name: 'Acme Corp International',
      address: 'Attn: Jane Doe, VP Procurement',
      phone: '',
      tax_number: '310987654300003'
    },
    items: [
      { name: 'Enterprise Architecture Audit', qty: 1, price: 25000, tax_rate: 15 },
      { name: 'Cloud Migration Strategy Phase I', qty: 1, price: 45000, tax_rate: 15 },
      { name: 'Security Compliance Review', qty: 1, price: 18500, tax_rate: 15 }
    ],
    invoice: {
      number: 'INV-2026-001',
      date: new Date().toLocaleDateString('en-US'),
      due_date: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US'),
      subtotal: 88500,
      tax: 13275,
      discount: 0,
      total: 101775
    },
    settings: {
      stamp_url: settings.stamp_url,
      signature_url: settings.signature_url,
      notes: settings.default_notes,
      template: settings.template
    },
    type: 'invoice' as const
  };

  const renderTemplate = () => {
    switch (settings.template) {
      case 'classic': return <ClassicTemplate {...dummyData} />;
      case 'modern': return <ModernTemplate {...dummyData} />;
      case 'minimal': return <MinimalTemplate {...dummyData} />;
      case 'elite': return <EliteTemplate {...dummyData} />;
      default: return <EliteTemplate {...dummyData} />;
    }
  };

  return (
    <div className="space-y-6">
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
          <button 
            onClick={() => router.push('/settings/invoicing')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            تغيير القالب
          </button>
          <button className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Save className="w-4 h-4" />
            حفظ وإصدار
          </button>
        </div>
      </div>

      {/* Split layout: Form on right, Preview on left (or block mode if needed) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Form Area */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">بيانات العميل</h2>
            <div className="space-y-4">
              <input type="text" placeholder="اسم العميل" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <input type="text" placeholder="الرقم الضريبي" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">البنود</h2>
            <div className="p-4 border border-border border-dashed rounded-lg text-center text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
              + أضف بند جديد
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="xl:col-span-7">
          <div className="sticky top-24">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">معاينة حية (Live Preview)</span>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">Template: {settings.template.toUpperCase()}</span>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
              {/* Scale down the preview so it fits nicely on screen */}
              <div style={{ transform: 'scale(1)', transformOrigin: 'top center', width: '100%' }}>
                 {renderTemplate()}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
