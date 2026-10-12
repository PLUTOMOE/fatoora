"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Send, Download, MoreHorizontal, CheckCircle, Loader2, Printer } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStore } from '@/store/useStore';
import { getInvoiceDetails } from '@/lib/supabase/services';
import { formatCurrency } from '@/lib/format';
import { ZatcaQRCode } from '@/components/ui/ZatcaQRCode';
import { ClassicTemplate } from '@/components/invoice-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/invoice-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/invoice-templates/MinimalTemplate';
import { EliteTemplate } from '@/components/invoice-templates/EliteTemplate';
import { CorporateTemplate } from '@/components/invoice-templates/CorporateTemplate';
import { CompactTemplate } from '@/components/invoice-templates/CompactTemplate';
import { RoyalTemplate } from '@/components/invoice-templates/RoyalTemplate';
import { ExecutiveTemplate } from '@/components/invoice-templates/ExecutiveTemplate';
import { createClient } from '@/lib/supabase/client';
import QRCode from 'qrcode';
import { getZatcaQRCode } from '@/lib/zatca';

export default function InvoiceDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { activeEntity } = useStore();
  
  const [data, setData] = useState<{ invoice: any, items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [entityData, setEntityData] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [settings, setSettings] = useState<any>({
    template: 'elite',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    default_notes: ''
  });

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('invoice_settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Fetch entity data
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
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const result = await getInvoiceDetails(id);
        setData(result);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  // توليد رمز ZATCA QR Code بصيغة DataURL لدمجه بالقالب
  useEffect(() => {
    if (data?.invoice && data.invoice.type !== 'quotation') {
      const inv = data.invoice;
      const seller = entityData?.name || activeEntity?.name || 'الشركة';
      const vatNum = entityData?.tax_number || activeEntity?.tax_number || '300000000000003';
      const time = inv.created_at || (inv.issue_date ? `${inv.issue_date}T12:00:00Z` : new Date().toISOString());
      const totalStr = Number(inv.total || 0).toFixed(2);
      const vatStr = Number(inv.tax_total || 0).toFixed(2);
      try {
        const base64TLV = getZatcaQRCode(seller, vatNum, time, totalStr, vatStr);
        QRCode.toDataURL(base64TLV, { errorCorrectionLevel: 'medium', margin: 1, width: 140 })
          .then(url => setQrCodeDataUrl(url))
          .catch(err => console.error('QR toDataURL error:', err));
      } catch (e) {
        console.error('Zatca QR generation error:', e);
      }
    }
  }, [data, entityData, activeEntity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">لم يتم العثور على الفاتورة</p>
        <button onClick={() => router.push('/invoices')} className="text-primary hover:underline">
          العودة للفواتير
        </button>
      </div>
    );
  }

  const { invoice, items } = data;
  const customer = invoice.customers;
  const issueDateStr = invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const dueDateStr = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const isQuotation = invoice.type === 'quotation';

  // Build template data from DB
  const templateData = {
    entity: {
      name: entityData?.name || activeEntity?.name || '',
      address: entityData?.address || '',
      phone: entityData?.phone || '',
      tax_number: entityData?.tax_number || '',
      cr_number: entityData?.cr_number || '',
      logo_url: entityData?.logo_url || settings.logo_url
    },
    customer: {
      name: customer?.name || '',
      address: customer?.address || '',
      phone: customer?.phone || '',
      tax_number: customer?.tax_number || ''
    },
    items: items && items.length > 0 ? items.map(item => ({
      name: item.description,
      qty: item.quantity,
      price: item.unit_price,
      tax_rate: item.tax_rate
    })) : [{ name: 'بند فارغ', qty: 0, price: 0, tax_rate: 0 }],
    invoice: {
      number: invoice.invoice_number,
      date: invoice.issue_date,
      due_date: invoice.due_date || '',
      subtotal: invoice.subtotal,
      tax: invoice.tax_total,
      discount: invoice.discount || 0,
      total: invoice.total
    },
    settings: {
      stamp_url: settings.stamp_url || '',
      signature_url: settings.signature_url || '',
      notes: invoice.notes || '',
      template: settings.template
    },
    type: (isQuotation ? 'quotation' : 'invoice') as 'quotation' | 'invoice',
    qrCodeDataUrl: qrCodeDataUrl || undefined
  };

  const renderTemplate = () => {
    switch (settings.template) {
      case 'classic': return <ClassicTemplate {...templateData} />;
      case 'modern': return <ModernTemplate {...templateData} />;
      case 'minimal': return <MinimalTemplate {...templateData} />;
      case 'elite': return <EliteTemplate {...templateData} />;
      case 'corporate': return <CorporateTemplate {...templateData} />;
      case 'compact': return <CompactTemplate {...templateData} />;
      case 'royal': return <RoyalTemplate {...templateData} />;
      case 'executive': return <ExecutiveTemplate {...templateData} />;
      default: return <EliteTemplate {...templateData} />;
    }
  };

  return (
    <div className="space-y-5 print:space-y-0">
      {/* Header - hidden in print */}
      <div className="flex items-center justify-between no-print">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => router.push('/invoices')} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[20px] font-semibold text-foreground">{isQuotation ? 'عرض سعر' : 'فاتورة'} #{invoice.invoice_number}</h1>
              <StatusPill status={invoice.status} />
            </div>
            <div className="text-[12px] text-muted-foreground/80">
              صادرة بتاريخ {issueDateStr} · {activeEntity?.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>إرسال</span>
          </button>
          <button onClick={() => window.print()} className="h-8 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:block">
        {/* Template + QR */}
        <div className="lg:col-span-2 space-y-4 print:space-y-0">
          {/* Template */}
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card print:border-none print:rounded-none">
            <div className="w-full overflow-x-auto p-0">
              <div className="min-w-[750px] w-full print:min-w-0">
                {renderTemplate()}
              </div>
            </div>
          </div>

          {/* ZATCA QR Code preview card - hidden in print because template contains integrated QR */}
          {!isQuotation && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 no-print">
              <ZatcaQRCode 
                sellerName={activeEntity?.name} 
                vatNumber={activeEntity?.tax_number || entityData?.tax_number}
                timestamp={invoice.issue_date || new Date().toISOString()}
                invoiceTotal={invoice.total.toString()}
                vatTotal={invoice.tax_total.toString()}
              />
              <div className="text-[11px] text-muted-foreground">
                <div className="font-semibold text-foreground mb-1">رمز ZATCA</div>
                <div>رمز الاستجابة السريعة المتوافق مع هيئة الزكاة والضريبة والجمارك</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - hidden in print */}
        <div className="space-y-3 no-print">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-[12px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3">تفاصيل الحالة</h3>
            <div className="text-[20px] font-semibold text-[#22C55E] tabular-nums mb-1">{formatCurrency(invoice.total)}</div>
            <div className="text-[11px] text-muted-foreground mb-4">
              {invoice.status === 'paid' ? 'تم الدفع بالكامل' : invoice.status === 'draft' ? 'مسودة' : 'في الانتظار'}
            </div>
            
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between"><span className="text-muted-foreground">طريقة الدفع</span><span>--</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تاريخ الاستحقاق</span><span>{dueDateStr || '--'}</span></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-[12px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3">الجدول الزمني</h3>
            <div className="space-y-3">
              <Timeline icon={CheckCircle} color="#9B9B9B" title="تم الإصدار" desc={`بواسطة النظام - ${issueDateStr}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline({ icon: Icon, color, title, desc }: any) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground/80 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
