import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function EliteTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';
  
  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', 'Tajawal', system-ui, sans-serif", color: '#1a1d2e' }}>
      
      {/* Accent Line */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }} />

      {/* ═══════ HEADER ═══════ */}
      <div className="px-8 pt-6 pb-5 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="flex justify-between items-start">
          {/* Logo & Company */}
          <div className="flex items-center gap-4">
            {entity.logo_url ? (
              <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100" style={{ minWidth: 56 }}>
                <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-100">
                <span className="text-2xl font-black text-blue-600">{entity.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{entity.name}</h2>
              {entity.address && <p className="text-[10px] text-gray-500 mt-0.5">{entity.address}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                {entity.cr_number && <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t.cr} {entity.cr_number}</span>}
                {entity.tax_number && <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t.vat} {entity.tax_number}</span>}
              </div>
            </div>
          </div>

          {/* Document Type & Number */}
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <div className="inline-block px-4 py-1.5 rounded-lg text-white text-lg font-black" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
              {titleText}
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 mt-2">
              <div className="text-[9px] text-gray-400 font-bold uppercase">{t.reference}</div>
              <div className="text-sm font-bold text-gray-900 font-mono">{invoice.number}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ INFO ROW ═══════ */}
      <div className="px-8 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          {/* Customer */}
          <div className="bg-gray-50/80 rounded-lg p-3 flex-1 max-w-[55%]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-1.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t.preparedFor}
            </div>
            <p className="text-sm font-bold text-gray-800">{customer.name || '—'}</p>
            {customer.address && <p className="text-[11px] text-gray-500">{customer.address}</p>}
            {customer.phone && <p className="text-[11px] text-gray-500">{customer.phone}</p>}
            {customer.tax_number && <p className="text-[10px] text-gray-500 mt-0.5">{t.vat} {customer.tax_number}</p>}
          </div>
          {/* Dates */}
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.details}</div>
            <div className="text-[11px] text-gray-600"><span className="text-gray-400">{t.dateOfIssue} </span><span className="font-semibold text-gray-800">{invoice.date}</span></div>
            {invoice.due_date && <div className="text-[11px] text-gray-600"><span className="text-gray-400">{t.validUntilDue} </span><span className="font-semibold text-gray-800">{invoice.due_date}</span></div>}
          </div>
        </div>
      </div>

      {/* ═══════ ITEMS TABLE ═══════ */}
      <div className="px-8 pt-4 pb-2">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#f0f4ff' }}>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5 w-8 rounded-r-lg">#</th>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5">{t.description}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5 w-14">{t.qty}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5 w-20">{t.unitPrice}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5 w-14">{t.vatPercent}</th>
              <th className={`text-[9px] font-bold uppercase tracking-wider text-blue-700 px-3 py-2.5 w-20 rounded-l-lg ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2.5 text-[10px] text-gray-300 font-mono">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-[12px] font-semibold text-gray-800">{item.name}</td>
                  <td className="px-3 py-2.5 text-[12px] text-center text-gray-600 tabular-nums">{item.qty}</td>
                  <td className="px-3 py-2.5 text-[12px] text-center text-gray-600 tabular-nums">{item.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-[10px] text-center text-gray-400">{item.tax_rate}%</td>
                  <td className={`px-3 py-2.5 text-[12px] font-bold text-gray-800 tabular-nums ${isRTL ? 'text-left' : 'text-right'}`}>
                    {(lineTotal + lineTax).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════ TOTALS ═══════ */}
      <div className={`px-8 pb-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <div className="w-72 space-y-1.5">
          <div className="flex justify-between text-[12px] px-3 py-1">
            <span className="text-gray-500">{t.subtotal}</span>
            <span className="font-medium tabular-nums">{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-[12px] px-3 py-1">
              <span className="text-red-500">{t.discount}</span>
              <span className="text-red-500 tabular-nums">-{invoice.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] px-3 py-1 border-b border-gray-100">
            <span className="text-gray-500">{t.totalVat}</span>
            <span className="font-medium tabular-nums">{invoice.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center rounded-xl px-4 py-3" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
            <span className="text-[10px] font-bold uppercase text-blue-100">{t.grandTotal}</span>
            <div>
              <span className="text-2xl font-black tabular-nums text-white">{invoice.total.toLocaleString()}</span>
              <span className="text-[9px] text-blue-200 mr-1">{t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ NOTES ═══════ */}
      {settings.notes && (
        <div className="px-8 pb-3">
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg p-3">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-amber-700 mb-1">{t.termsConditions}</h4>
            <p className="text-[11px] text-amber-900/80 leading-relaxed whitespace-pre-line">{settings.notes}</p>
          </div>
        </div>
      )}

      {/* ═══════ STAMP & SIGNATURE & QR ═══════ */}
      {(settings.stamp_url || settings.signature_url || (!isQuotation && qrCodeDataUrl)) && (
        <div className="px-8 pb-3">
          <div className="flex items-end justify-between gap-8 pt-3 border-t border-gray-100">
            <div className="flex items-end gap-8">
              {settings.stamp_url && (
                <div className="text-center">
                  <img src={settings.stamp_url} alt="Stamp" className="w-16 h-16 object-contain opacity-85" style={{ mixBlendMode: 'multiply' }} />
                  <span className="text-[8px] text-gray-400 uppercase font-bold block">{t.companyStamp}</span>
                </div>
              )}
              {settings.signature_url && (
                <div className="text-center">
                  <img src={settings.signature_url} alt="Signature" className="w-24 h-12 object-contain" />
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <span className="text-[8px] text-gray-400 uppercase font-bold">{t.authorizedSignature}</span>
                  </div>
                </div>
              )}
            </div>
            {!isQuotation && qrCodeDataUrl && (
              <div className="text-center flex-shrink-0">
                <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-gray-100 rounded-md p-1 bg-white shadow-2xs" />
                <span className="text-[8px] text-gray-400 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className="px-8 py-2 border-t border-gray-100">
        <div className="flex justify-between items-center text-[8px] text-gray-400">
          <span>{entity.name}</span>
          <span>{invoice.number} · {invoice.date}</span>
        </div>
      </div>
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }} />
    </div>
  );
}
