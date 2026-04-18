"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Send, Download, MoreHorizontal, CheckCircle2, CheckCircle, Loader2 } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStore } from '@/store/useStore';
import { getInvoiceDetails } from '@/lib/supabase/services';
import { formatCurrency } from '@/lib/format';
import { ZatcaQRCode } from '@/components/ui/ZatcaQRCode';

export default function QuotationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { activeEntity } = useStore();
  
  const [data, setData] = useState<{ invoice: any, items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const result = await getInvoiceDetails(id);
        setData(result);
      } catch (error) {
        console.error('Error fetching quotation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

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
        <p className="text-muted-foreground">لم يتم العثور على عرض السعر</p>
        <button onClick={() => router.push('/quotations')} className="text-primary hover:underline">
          العودة لعروض الأسعار
        </button>
      </div>
    );
  }

  const { invoice, items } = data;
  const customer = invoice.customers;
  const issueDateStr = invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const dueDateStr = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="space-y-5 print:space-y-0">
      <div className="flex items-center justify-between no-print">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => router.push('/quotations')} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[20px] font-semibold text-foreground">{(invoice.type === 'quotation' ? 'عرض سعر' : 'فاتورة')} #{invoice.invoice_number}</h1>
              <StatusPill status={invoice.status} />
            </div>
            <div className="text-[12px] text-muted-foreground/80">
              صادرة بتاريخ {issueDateStr} · {activeEntity?.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push(`/invoices/new?source_quotation_id=${invoice.id}`)}
            className="h-8 px-3 bg-primary text-primary-foreground rounded-md text-[12px] hover:bg-primary/90 flex items-center gap-1.5 font-medium"
            title="إنشاء فاتورة من هذا العرض"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>تحويل لفاتورة</span>
          </button>
          {/* Action buttons */}
          <button className="h-8 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>إرسال</span>
          </button>
          <button onClick={() => window.print()} className="h-8 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-card border border-border rounded-md hover:border-border/80">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:block">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-8 print:border-none print:p-0">
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* Fallback avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-md flex items-center justify-center text-primary-foreground font-bold text-[16px]">
                  {activeEntity?.name?.substring(0, 3)}
                </div>
                <div>
                  <div className="font-semibold text-[16px] text-foreground">{activeEntity?.name}</div>
                  <div className="text-[11px] text-muted-foreground/80">منصة فاتورة</div>
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground space-y-0.5">
                {activeEntity?.address && <div>{activeEntity.address}</div>}
                <div>الرقم الضريبي: <span className="font-mono">{activeEntity?.tax_number || '-'}</span></div>
                <div>السجل التجاري: <span className="font-mono">{activeEntity?.cr_number || '-'}</span></div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-1">
                {invoice.type === 'quotation' ? 'عرض سعر' : 'فاتورة ضريبية'}
              </div>
              <div className="font-mono text-[20px] font-semibold text-foreground mb-2">{invoice.invoice_number}</div>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>التاريخ: <span className="text-foreground">{issueDateStr}</span></div>
                {dueDateStr && <div>الاستحقاق: <span className="text-foreground">{dueDateStr}</span></div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-b border-border">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                 مقدمة إلى
              </div>
              <div className="font-semibold text-[14px] text-foreground mb-1">{customer?.name}</div>
              <div className="text-[12px] text-muted-foreground space-y-0.5">
                {customer?.address && <div>{customer.address}</div>}
                {customer?.tax_number && <div>الرقم الضريبي: <span className="font-mono">{customer.tax_number}</span></div>}
              </div>
            </div>
            <div className="flex justify-end">
              <ZatcaQRCode 
                sellerName={activeEntity?.name} 
                vatNumber={activeEntity?.tax_number}
                timestamp={invoice.issue_date || new Date().toISOString()}
                invoiceTotal={invoice.total.toString()}
                vatTotal={invoice.tax_total.toString()}
              />
            </div>
          </div>

          <div className="py-6 border-b border-border">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                    <th className="text-right font-medium py-2">#</th>
                    <th className="text-right font-medium py-2">الصنف</th>
                    <th className="text-center font-medium py-2 w-16">الكمية</th>
                    <th className="text-center font-medium py-2 w-20">السعر</th>
                    <th className="text-center font-medium py-2 w-16">الضريبة</th>
                    <th className="text-left font-medium py-2 w-24">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items && items.map((item, index) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-3 text-muted-foreground/80">{index + 1}</td>
                      <td className="py-3">
                        <div className="font-medium text-foreground mb-0.5">{item.description}</div>
                      </td>
                      <td className="py-3 text-center tabular-nums">{item.quantity}</td>
                      <td className="py-3 text-center tabular-nums">{item.unit_price}</td>
                      <td className="py-3 text-center text-muted-foreground">{item.tax_rate}%</td>
                      <td className="py-3 text-left tabular-nums font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  {(!items || items.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">لا توجد بنود</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end py-6">
            <div className="w-72 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإجمالي قبل الضريبة</span>
                <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ضريبة القيمة المضافة</span>
                <span className="tabular-nums">{formatCurrency(invoice.tax_total)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الخصم</span>
                  <span className="tabular-nums">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">الإجمالي النهائي</span>
                <span className="text-[18px] font-semibold text-foreground tabular-nums">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-background rounded-md p-4 text-[12px] mt-4 print:bg-transparent print:p-0">
              <div className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">الملاحظات والشروط</div>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

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
