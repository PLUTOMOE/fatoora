import React from 'react';
import { InvoiceTemplateProps } from './types';

export function MinimalTemplate({ entity, customer, items, invoice, settings, type }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const docTitle = isQuotation ? 'عرض سعر' : 'فاتورة ضريبية';
  
  return (
    <div className="bg-white text-[#1a1a2e] w-full max-w-[800px] mx-auto shadow-lg" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="p-8 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{entity.name}</h1>
            <div className="text-sm text-[#999] mt-1 space-y-0.5">
              {entity.address && <p>{entity.address}</p>}
              {entity.phone && <p>{entity.phone}</p>}
              {entity.tax_number && <p>ض: {entity.tax_number}</p>}
            </div>
          </div>
          {entity.logo_url ? (
            <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
          ) : (
            <div className="w-14 h-14 border-2 border-[#e5e5e5] rounded-lg flex items-center justify-center text-xl font-black text-[#ccc]">
              {entity.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="mt-8 mb-6">
          <div className="text-4xl font-black tracking-tighter text-[#1a1a2e] uppercase">{docTitle}</div>
          <div className="text-sm text-[#999] mt-1">#{invoice.number}</div>
        </div>
      </div>

      {/* Info */}
      <div className="px-8 grid grid-cols-2 gap-8 pb-6 border-b border-[#e5e5e5]">
        <div>
          <div className="text-[10px] text-[#bbb] uppercase tracking-[0.15em] font-medium mb-2">إلى</div>
          <div className="font-bold">{customer.name}</div>
          {customer.address && <div className="text-sm text-[#999] mt-0.5">{customer.address}</div>}
          {customer.phone && <div className="text-sm text-[#999]">{customer.phone}</div>}
          {customer.tax_number && <div className="text-xs text-[#bbb] mt-1">ض: {customer.tax_number}</div>}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#bbb]">التاريخ</span><span>{invoice.date}</span></div>
          {invoice.due_date && <div className="flex justify-between"><span className="text-[#bbb]">الاستحقاق</span><span>{invoice.due_date}</span></div>}
        </div>
      </div>

      {/* Items */}
      <div className="px-8 py-4">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-[#bbb] uppercase tracking-[0.15em] border-b border-[#e5e5e5]">
              <th className="text-right font-medium py-3">البند</th>
              <th className="text-center font-medium py-3 w-16">الكمية</th>
              <th className="text-center font-medium py-3 w-24">السعر</th>
              <th className="text-center font-medium py-3 w-16">ض%</th>
              <th className="text-left font-medium py-3 w-28">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemTotal = item.qty * item.price;
              const taxAmount = itemTotal * (item.tax_rate / 100);
              return (
                <tr key={i} className="border-b border-[#f5f5f5] text-sm">
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-center text-[#999] tabular-nums">{item.qty}</td>
                  <td className="py-3 text-center tabular-nums">{item.price.toLocaleString()}</td>
                  <td className="py-3 text-center text-[#bbb] text-xs">{item.tax_rate}%</td>
                  <td className="py-3 text-left tabular-nums font-medium">{(itemTotal + taxAmount).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-8 py-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[#bbb]">المجموع الفرعي</span><span className="tabular-nums">{invoice.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#bbb]">الضريبة</span><span className="tabular-nums">{invoice.tax.toLocaleString()}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#bbb]">خصم</span><span className="tabular-nums text-red-400">-{invoice.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between border-t-2 border-[#1a1a2e] pt-3 mt-3">
              <span className="text-xs text-[#999] uppercase tracking-wider">الإجمالي</span>
              <span className="text-xl font-black tabular-nums">{invoice.total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8 space-y-4">
        {settings.notes && (
          <p className="text-xs text-[#bbb] border-t border-[#f0f0f0] pt-4">{settings.notes}</p>
        )}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-8">
            {settings.stamp_url && <img src={settings.stamp_url} alt="Stamp" className="w-16 h-16 object-contain opacity-60" />}
            {settings.signature_url && (
              <div>
                <img src={settings.signature_url} alt="Signature" className="w-24 h-12 object-contain" />
                <div className="w-24 border-t border-[#ddd] mt-1 pt-0.5 text-[9px] text-[#bbb] text-center">التوقيع</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
