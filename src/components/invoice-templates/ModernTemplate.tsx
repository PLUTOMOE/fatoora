import React from 'react';
import { InvoiceTemplateProps } from './types';

export function ModernTemplate({ entity, customer, items, invoice, settings, type }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const docTitle = isQuotation ? 'عرض سعر' : 'فاتورة ضريبية';
  
  return (
    <div className="bg-white text-[#1a1a2e] w-full max-w-[800px] mx-auto shadow-lg rounded-xl overflow-hidden" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-l from-[#5B5BD6] to-[#7B7BF6] text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {entity.logo_url ? (
              <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl bg-white/20 p-1.5" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">
                {entity.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold">{entity.name}</h1>
              {entity.address && <p className="text-white/60 text-sm">{entity.address}</p>}
            </div>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-white/60 uppercase tracking-wider">{docTitle}</div>
            <div className="text-2xl font-black mt-0.5">#{invoice.number}</div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="bg-[#f0f0ff] rounded-xl p-4">
          <div className="text-xs text-[#5B5BD6] font-semibold mb-2 uppercase tracking-wider">عميل</div>
          <div className="font-bold text-sm">{customer.name}</div>
          {customer.address && <div className="text-xs text-[#585c80] mt-1">{customer.address}</div>}
          {customer.phone && <div className="text-xs text-[#585c80]">{customer.phone}</div>}
          {customer.tax_number && <div className="text-xs text-[#767683] mt-1.5 bg-white rounded px-2 py-0.5 inline-block">ض: {customer.tax_number}</div>}
        </div>
        <div className="bg-[#f0f0ff] rounded-xl p-4">
          <div className="text-xs text-[#5B5BD6] font-semibold mb-2 uppercase tracking-wider">تفاصيل</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-[#767683]">التاريخ</span><span className="font-medium">{invoice.date}</span></div>
            {invoice.due_date && <div className="flex justify-between"><span className="text-[#767683]">الاستحقاق</span><span className="font-medium">{invoice.due_date}</span></div>}
            {entity.tax_number && <div className="flex justify-between"><span className="text-[#767683]">رقمنا الضريبي</span><span className="font-medium">{entity.tax_number}</span></div>}
            {entity.cr_number && <div className="flex justify-between"><span className="text-[#767683]">سجل تجاري</span><span className="font-medium">{entity.cr_number}</span></div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-6">
        <div className="rounded-xl overflow-hidden border border-[#e8e8f0]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f0f0ff] text-[#5B5BD6] text-xs font-semibold uppercase tracking-wider">
                <th className="text-right py-3 px-4">البند</th>
                <th className="text-center py-3 px-4">الكمية</th>
                <th className="text-center py-3 px-4">السعر</th>
                <th className="text-center py-3 px-4">الضريبة</th>
                <th className="text-left py-3 px-4">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const itemTotal = item.qty * item.price;
                const taxAmount = itemTotal * (item.tax_rate / 100);
                return (
                  <tr key={i} className="border-b border-[#f0f0ff] text-sm last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#5B5BD6]/30"></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-[#585c80]">{item.qty}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-[#585c80]">{item.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-[#767683] text-xs">{item.tax_rate}%</td>
                    <td className="py-3 px-4 text-left tabular-nums font-semibold">{(itemTotal + taxAmount).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="px-6 py-5">
        <div className="flex justify-end">
          <div className="w-72 bg-gradient-to-l from-[#5B5BD6] to-[#7B7BF6] rounded-xl p-4 text-white">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">المجموع الفرعي</span><span className="tabular-nums">{invoice.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-white/70">ضريبة (15%)</span><span className="tabular-nums">{invoice.tax.toLocaleString()}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between"><span className="text-white/70">خصم</span><span className="tabular-nums">-{invoice.discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-lg font-black border-t border-white/20 pt-2 mt-1">
                <span>الإجمالي</span>
                <span className="tabular-nums">{invoice.total.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 space-y-4">
        {settings.notes && (
          <div className="bg-[#f8f8ff] border border-[#e8e8f0] rounded-lg p-3">
            <p className="text-xs text-[#585c80]">{settings.notes}</p>
          </div>
        )}
        <div className="flex items-end justify-between pt-3">
          <div className="flex items-center gap-6">
            {settings.stamp_url && <img src={settings.stamp_url} alt="Stamp" className="w-20 h-20 object-contain opacity-70" />}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-24 h-14 object-contain" />
                <div className="text-[10px] text-[#767683] border-t border-[#e8e8f0] pt-1 mt-1">التوقيع</div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-[#767683]">فاتورة ©</div>
        </div>
      </div>
    </div>
  );
}
