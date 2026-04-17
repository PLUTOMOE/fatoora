import React from 'react';
import { InvoiceTemplateProps } from './types';

export function ClassicTemplate({ entity, customer, items, invoice, settings, type }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const docTitle = isQuotation ? 'عرض سعر' : 'فاتورة ضريبية';
  
  return (
    <div className="bg-white text-[#1a1a2e] w-full max-w-[800px] mx-auto shadow-lg" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {entity.logo_url && (
              <img src={entity.logo_url} alt="Logo" className="w-16 h-16 object-contain rounded-lg bg-white/10 p-1" />
            )}
            <div>
              <h1 className="text-xl font-bold">{entity.name}</h1>
              {entity.address && <p className="text-white/70 text-sm mt-1">{entity.address}</p>}
              {entity.phone && <p className="text-white/70 text-sm">{entity.phone}</p>}
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-black tracking-tight">{docTitle}</div>
            <div className="text-white/60 text-sm mt-1">#{invoice.number}</div>
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-2 gap-6 p-6 bg-[#f8f9fb]">
        <div>
          <div className="text-xs text-[#767683] uppercase tracking-wider mb-1 font-medium">فاتورة إلى</div>
          <div className="font-bold text-base">{customer.name}</div>
          {customer.address && <div className="text-sm text-[#585c80] mt-0.5">{customer.address}</div>}
          {customer.phone && <div className="text-sm text-[#585c80]">{customer.phone}</div>}
          {customer.tax_number && <div className="text-xs text-[#767683] mt-1">رقم ضريبي: {customer.tax_number}</div>}
        </div>
        <div className="text-left space-y-1.5">
          <div className="flex justify-between"><span className="text-xs text-[#767683]">التاريخ:</span><span className="text-sm font-medium">{invoice.date}</span></div>
          {invoice.due_date && <div className="flex justify-between"><span className="text-xs text-[#767683]">تاريخ الاستحقاق:</span><span className="text-sm font-medium">{invoice.due_date}</span></div>}
          {entity.tax_number && <div className="flex justify-between"><span className="text-xs text-[#767683]">الرقم الضريبي:</span><span className="text-sm font-medium">{entity.tax_number}</span></div>}
          {entity.cr_number && <div className="flex justify-between"><span className="text-xs text-[#767683]">السجل التجاري:</span><span className="text-sm font-medium">{entity.cr_number}</span></div>}
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6">
        <table className="w-full">
          <thead>
            <tr className="bg-[#16213e] text-white text-sm">
              <th className="text-right py-2.5 px-3 font-medium">#</th>
              <th className="text-right py-2.5 px-3 font-medium">البند</th>
              <th className="text-center py-2.5 px-3 font-medium">الكمية</th>
              <th className="text-center py-2.5 px-3 font-medium">السعر</th>
              <th className="text-center py-2.5 px-3 font-medium">الضريبة</th>
              <th className="text-left py-2.5 px-3 font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemTotal = item.qty * item.price;
              const taxAmount = itemTotal * (item.tax_rate / 100);
              return (
                <tr key={i} className="border-b border-gray-100 text-sm">
                  <td className="py-2.5 px-3 text-[#767683]">{i + 1}</td>
                  <td className="py-2.5 px-3 font-medium">{item.name}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{item.qty}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{item.price.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center text-[#767683]">{item.tax_rate}%</td>
                  <td className="py-2.5 px-3 text-left tabular-nums font-medium">{(itemTotal + taxAmount).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-6 py-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-[#767683]">المجموع الفرعي</span><span className="tabular-nums">{invoice.subtotal.toLocaleString()} ر.س</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#767683]">ضريبة القيمة المضافة (15%)</span><span className="tabular-nums">{invoice.tax.toLocaleString()} ر.س</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#767683]">الخصم</span><span className="tabular-nums text-red-500">-{invoice.discount.toLocaleString()} ر.س</span></div>}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span>الإجمالي المستحق</span>
              <span className="tabular-nums text-[#1a1a2e]">{invoice.total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Stamp + Signature + Notes */}
      <div className="px-6 pb-6 space-y-4">
        {settings.notes && (
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-xs text-[#767683] font-medium mb-1">ملاحظات</div>
            <p className="text-sm text-[#585c80]">{settings.notes}</p>
          </div>
        )}
        
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6">
            {settings.stamp_url && (
              <div className="text-center">
                <img src={settings.stamp_url} alt="Stamp" className="w-20 h-20 object-contain opacity-80" />
                <div className="text-[10px] text-[#767683] mt-1">الختم</div>
              </div>
            )}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-24 h-14 object-contain" />
                <div className="text-[10px] text-[#767683] mt-1 border-t border-gray-300 pt-1">التوقيع</div>
              </div>
            )}
          </div>
          <div className="text-xs text-[#767683]">
            صُدرت بواسطة فاتورة
          </div>
        </div>
      </div>
    </div>
  );
}
