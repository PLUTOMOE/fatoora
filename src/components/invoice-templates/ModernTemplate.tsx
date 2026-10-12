import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function ModernTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const docTitle = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';
  
  return (
    <div className="bg-white text-[#1a1a2e] w-full max-w-[800px] mx-auto shadow-lg rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      {/* Header */}
      <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-[#f0f0ff] to-white text-[#5B5BD6] p-6 border-b border-[#e8e8f0]`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {entity.logo_url ? (
              <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain rounded-xl bg-white border border-[#e8e8f0] p-1.5 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white border border-[#e8e8f0] flex items-center justify-center text-xl font-black text-[#5B5BD6] shadow-sm">
                {entity.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-[#1a1a2e]">{entity.name}</h1>
              {entity.address && <p className="text-[#585c80] text-sm">{entity.address}</p>}
            </div>
          </div>
          <div className={isRTL ? 'text-left' : 'text-right'}>
            <div className="text-sm font-medium text-[#5B5BD6] uppercase tracking-wider bg-[#5B5BD6]/10 px-3 py-1 inline-block rounded-md">{docTitle}</div>
            <div className="text-2xl font-black mt-1 text-[#1a1a2e]">#{invoice.number}</div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="bg-[#f0f0ff] rounded-xl p-4">
          <div className="text-xs text-[#5B5BD6] font-semibold mb-2 uppercase tracking-wider">{t.billTo}</div>
          <div className="font-bold text-sm">{customer.name}</div>
          {customer.address && <div className="text-xs text-[#585c80] mt-1">{customer.address}</div>}
          {customer.phone && <div className="text-xs text-[#585c80]">{customer.phone}</div>}
          {customer.tax_number && <div className="text-xs text-[#767683] mt-1.5 bg-white rounded px-2 py-0.5 inline-block">{t.vat} {customer.tax_number}</div>}
        </div>
        <div className="bg-[#f0f0ff] rounded-xl p-4">
          <div className="text-xs text-[#5B5BD6] font-semibold mb-2 uppercase tracking-wider">{t.details}</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-[#767683]">{t.date}</span><span className="font-medium">{invoice.date}</span></div>
            {invoice.due_date && <div className="flex justify-between"><span className="text-[#767683]">{t.validUntilDue}</span><span className="font-medium">{invoice.due_date}</span></div>}
            {entity.tax_number && <div className="flex justify-between"><span className="text-[#767683]">{t.vat}</span><span className="font-medium">{entity.tax_number}</span></div>}
            {entity.cr_number && <div className="flex justify-between"><span className="text-[#767683]">{t.cr}</span><span className="font-medium">{entity.cr_number}</span></div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-6">
        <div className="rounded-xl overflow-hidden border border-[#e8e8f0]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f0f0ff] text-[#5B5BD6] text-xs font-semibold uppercase tracking-wider">
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.item}</th>
                <th className="text-center py-3 px-4">{t.qty}</th>
                <th className="text-center py-3 px-4">{t.price}</th>
                <th className="text-center py-3 px-4">{t.vatPercent}</th>
                <th className={`py-3 px-4 ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
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
                    <td className={`py-3 px-4 tabular-nums font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>{(itemTotal + taxAmount).toLocaleString()}</td>
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
          <div className={`w-72 bg-gradient-to-${isRTL ? 'l' : 'r'} from-[#5B5BD6] to-[#7B7BF6] rounded-xl p-4 text-white`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">{t.subtotal}</span><span className="tabular-nums">{invoice.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-white/70">{t.vatAmount} (15%)</span><span className="tabular-nums">{invoice.tax.toLocaleString()}</span></div>
              {invoice.discount > 0 && <div className="flex justify-between"><span className="text-white/70">{t.discount}</span><span className="tabular-nums">-{invoice.discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-lg font-black border-t border-white/20 pt-2 mt-1">
                <span>{t.grandTotal}</span>
                <span className="tabular-nums">{invoice.total.toLocaleString()} {t.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 space-y-4">
        {settings.notes && (
          <div className="bg-[#f8f8ff] border border-[#e8e8f0] rounded-lg p-3">
            <div className="text-xs text-[#5B5BD6] font-semibold mb-1">{t.notes}</div>
            <p className="text-xs text-[#585c80]">{settings.notes}</p>
          </div>
        )}
        <div className="flex items-end justify-between pt-3">
          <div className="flex items-center gap-6">
            {settings.stamp_url && <img src={settings.stamp_url} alt="Stamp" className="w-20 h-20 object-contain opacity-70" />}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-24 h-14 object-contain" />
                <div className="text-[10px] text-[#767683] border-t border-[#e8e8f0] pt-1 mt-1">{t.authorizedSignature}</div>
              </div>
            )}
          </div>
          {!isQuotation && qrCodeDataUrl && (
            <div className="text-center flex-shrink-0">
              <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-[#e8e8f0] rounded-md p-1 bg-white" />
              <span className="text-[8px] text-gray-400 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
            </div>
          )}
          <div className="text-[10px] text-[#767683]">{t.poweredBy}</div>
        </div>
      </div>
    </div>
  );
}
