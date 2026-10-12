import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function ClassicTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const docTitle = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';
  
  return (
    <div className="bg-white text-[#1a1a2e] w-full max-w-[800px] mx-auto shadow-lg" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-gray-50 text-gray-900 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {entity.logo_url ? (
              <img src={entity.logo_url} alt="Logo" className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-gray-200" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-2xl font-black text-gray-700">{entity.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{entity.name}</h1>
              {entity.address && <p className="text-gray-500 text-sm mt-1">{entity.address}</p>}
              {entity.phone && <p className="text-gray-500 text-sm">{entity.phone}</p>}
            </div>
          </div>
          <div className={isRTL ? 'text-left' : 'text-right'}>
            <div className="text-2xl font-black tracking-tight text-gray-800 uppercase">{docTitle}</div>
            <div className="text-gray-500 text-sm mt-1 bg-white px-3 py-1.5 rounded-md inline-block border border-gray-200">#{invoice.number}</div>
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-2 gap-6 p-6 bg-[#f8f9fb]">
        <div>
          <div className="text-xs text-[#767683] uppercase tracking-wider mb-1 font-medium">{t.billTo}</div>
          <div className="font-bold text-base">{customer.name}</div>
          {customer.address && <div className="text-sm text-[#585c80] mt-0.5">{customer.address}</div>}
          {customer.phone && <div className="text-sm text-[#585c80]">{customer.phone}</div>}
          {customer.tax_number && <div className="text-xs text-[#767683] mt-1">{t.vat} {customer.tax_number}</div>}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-xs text-[#767683]">{t.date}</span><span className="text-sm font-medium">{invoice.date}</span></div>
          {invoice.due_date && <div className="flex justify-between"><span className="text-xs text-[#767683]">{t.validUntilDue}</span><span className="text-sm font-medium">{invoice.due_date}</span></div>}
          {entity.tax_number && <div className="flex justify-between"><span className="text-xs text-[#767683]">{t.vat}</span><span className="text-sm font-medium">{entity.tax_number}</span></div>}
          {entity.cr_number && <div className="flex justify-between"><span className="text-xs text-[#767683]">{t.cr}</span><span className="text-sm font-medium">{entity.cr_number}</span></div>}
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className={`py-2.5 px-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>#</th>
              <th className={`py-2.5 px-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t.item}</th>
              <th className="text-center py-2.5 px-3 font-medium">{t.qty}</th>
              <th className="text-center py-2.5 px-3 font-medium">{t.price}</th>
              <th className="text-center py-2.5 px-3 font-medium">{t.vatPercent}</th>
              <th className={`py-2.5 px-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
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
                  <td className={`py-2.5 px-3 tabular-nums font-medium ${isRTL ? 'text-left' : 'text-right'}`}>{(itemTotal + taxAmount).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-6 py-4">
        <div className={`flex ${isRTL ? 'justify-end' : 'justify-end'}`}>
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-[#767683]">{t.subtotal}</span><span className="tabular-nums">{invoice.subtotal.toLocaleString()} {t.currency}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#767683]">{t.totalVat}</span><span className="tabular-nums">{invoice.tax.toLocaleString()} {t.currency}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#767683]">{t.discount}</span><span className="tabular-nums text-red-500">-{invoice.discount.toLocaleString()} {t.currency}</span></div>}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span>{t.grandTotal}</span>
              <span className="tabular-nums text-[#1a1a2e]">{invoice.total.toLocaleString()} {t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Stamp + Signature + Notes */}
      <div className="px-6 pb-6 space-y-4">
        {settings.notes && (
          <div className="bg-[#f8f9fb] rounded-lg p-3">
            <div className="text-xs text-[#767683] font-medium mb-1">{t.notes}</div>
            <p className="text-sm text-[#585c80]">{settings.notes}</p>
          </div>
        )}
        
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6">
            {settings.stamp_url && (
              <div className="text-center">
                <img src={settings.stamp_url} alt="Stamp" className="w-20 h-20 object-contain opacity-80" />
                <div className="text-[10px] text-[#767683] mt-1">{t.companyStamp}</div>
              </div>
            )}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-24 h-14 object-contain" />
                <div className="text-[10px] text-[#767683] mt-1 border-t border-gray-300 pt-1">{t.authorizedSignature}</div>
              </div>
            )}
          </div>
          {!isQuotation && qrCodeDataUrl && (
            <div className="text-center flex-shrink-0">
              <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-gray-200 rounded-md p-1 bg-white" />
              <span className="text-[8px] text-gray-400 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
            </div>
          )}
          <div className="text-xs text-[#767683]">
            {t.poweredBy}
          </div>
        </div>
      </div>
    </div>
  );
}
