import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function RoyalTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';

  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', 'Tajawal', system-ui, sans-serif", color: '#2c1810' }}>
      
      {/* Gold Top Accent */}
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #92702a 0%, #c9a84c 30%, #e8c96d 50%, #c9a84c 70%, #92702a 100%)' }} />
      
      {/* ═══════ HEADER ═══════ */}
      <div className="px-10 pt-7 pb-5" style={{ background: 'linear-gradient(180deg, #fdf8ef 0%, #ffffff 100%)' }}>
        <div className="flex justify-between items-start">
          {/* Logo & Company */}
          <div className="flex items-center gap-4">
            {entity.logo_url ? (
              <div className="bg-white rounded-xl p-2.5 border-2 border-amber-200/60 shadow-sm" style={{ minWidth: 60 }}>
                <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-amber-300/50" style={{ background: 'linear-gradient(135deg, #fef9ef 0%, #fdf0d5 100%)' }}>
                <span className="text-2xl font-black text-amber-700">{entity.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{entity.name}</h2>
              {entity.address && <p className="text-[10px] text-gray-500 mt-0.5">{entity.address}</p>}
              {entity.phone && <p className="text-[10px] text-gray-500">{entity.phone}</p>}
            </div>
          </div>

          {/* Document Type */}
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <h1 className="text-2xl font-black tracking-tight text-amber-800">{titleText}</h1>
            <div className="mt-2 border-2 border-amber-200/60 rounded-lg px-4 py-2" style={{ background: 'linear-gradient(135deg, #fefaf3 0%, #fdf5e6 100%)' }}>
              <div className="text-[8px] uppercase tracking-widest text-amber-600 font-bold">{t.reference}</div>
              <div className="text-sm font-bold text-gray-900 font-mono">{invoice.number}</div>
            </div>
          </div>
        </div>

        {/* Company Registration */}
        <div className="flex items-center gap-3 mt-4">
          {entity.cr_number && (
            <span className="text-[9px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/50 font-medium">
              {t.cr} {entity.cr_number}
            </span>
          )}
          {entity.tax_number && (
            <span className="text-[9px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/50 font-medium">
              {t.vat} {entity.tax_number}
            </span>
          )}
        </div>
      </div>

      {/* Gold Divider */}
      <div className="mx-10 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, #c9a84c 50%, transparent 100%)' }} />

      {/* ═══════ CLIENT & DATES ═══════ */}
      <div className="px-10 py-5">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100/60">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t.preparedFor}
            </div>
            <p className="text-sm font-bold text-gray-900">{customer.name || '—'}</p>
            {customer.address && <p className="text-[11px] text-gray-500 mt-0.5">{customer.address}</p>}
            {customer.phone && <p className="text-[11px] text-gray-500">{customer.phone}</p>}
            {customer.tax_number && <p className="text-[10px] text-gray-500 mt-1">{t.vat} {customer.tax_number}</p>}
          </div>
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-2">{t.details}</div>
            <div className="text-[11px] text-gray-600"><span className="text-gray-400">{t.dateOfIssue} </span><span className="font-semibold text-gray-900">{invoice.date}</span></div>
            {invoice.due_date && <div className="text-[11px] text-gray-600 mt-0.5"><span className="text-gray-400">{t.validUntilDue} </span><span className="font-semibold text-gray-900">{invoice.due_date}</span></div>}
          </div>
        </div>
      </div>

      {/* ═══════ ITEMS TABLE ═══════ */}
      <div className="px-10 py-4">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #fef9ef 0%, #fdf5e6 100%)' }}>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3 w-8 rounded-r-lg">#</th>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3">{t.description}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3 w-14">{t.qty}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3 w-20">{t.unitPrice}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3 w-14">{t.vatPercent}</th>
              <th className={`text-[9px] font-bold uppercase tracking-wider text-amber-800 px-3 py-3 w-20 rounded-l-lg ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="border-b border-amber-50 hover:bg-amber-50/30 transition-colors">
                  <td className="px-3 py-3 text-[10px] text-amber-300 font-mono">{idx + 1}</td>
                  <td className="px-3 py-3 text-[12px] font-semibold text-gray-800">{item.name}</td>
                  <td className="px-3 py-3 text-[12px] text-center text-gray-600 tabular-nums">{item.qty}</td>
                  <td className="px-3 py-3 text-[12px] text-center text-gray-600 tabular-nums">{item.price.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[10px] text-center text-gray-400">{item.tax_rate}%</td>
                  <td className={`px-3 py-3 text-[12px] font-bold text-gray-900 tabular-nums ${isRTL ? 'text-left' : 'text-right'}`}>
                    {(lineTotal + lineTax).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════ TOTALS ═══════ */}
      <div className={`px-10 pb-5 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <div className="w-72 rounded-xl p-5 space-y-2 border border-amber-200/50" style={{ background: 'linear-gradient(135deg, #fefaf3 0%, #fdf5e6 100%)' }}>
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-500">{t.subtotal}</span>
            <span className="font-medium text-gray-800 tabular-nums">{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-[12px]">
              <span className="text-red-500">{t.discount}</span>
              <span className="text-red-500 tabular-nums">-{invoice.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] pb-3 border-b border-amber-200/40">
            <span className="text-gray-500">{t.totalVat}</span>
            <span className="font-medium text-gray-800 tabular-nums">{invoice.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">{t.grandTotal}</span>
            <div>
              <span className="text-2xl font-black tabular-nums text-amber-800">{invoice.total.toLocaleString()}</span>
              <span className="text-[9px] text-amber-500 mr-1">{t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ NOTES ═══════ */}
      {settings.notes && (
        <div className="px-10 pb-4">
          <div className="bg-amber-50/70 border border-amber-200/50 rounded-lg p-4">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-1.5">{t.termsConditions}</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{settings.notes}</p>
          </div>
        </div>
      )}

      {/* ═══════ STAMP & SIGNATURE & QR ═══════ */}
      {(settings.stamp_url || settings.signature_url || (!isQuotation && qrCodeDataUrl)) && (
        <div className="px-10 pb-4">
          <div className="flex items-end justify-between gap-8 pt-4 border-t border-amber-100">
            <div className="flex items-end gap-8">
              {settings.stamp_url && (
                <div className="text-center">
                  <img src={settings.stamp_url} alt="Stamp" className="w-16 h-16 object-contain opacity-85" style={{ mixBlendMode: 'multiply' }} />
                  <span className="text-[8px] text-gray-400 uppercase font-bold block mt-1">{t.companyStamp}</span>
                </div>
              )}
              {settings.signature_url && (
                <div className="text-center">
                  <img src={settings.signature_url} alt="Signature" className="w-24 h-12 object-contain" />
                  <div className="border-t border-amber-200/50 mt-1 pt-1">
                    <span className="text-[8px] text-gray-400 uppercase font-bold">{t.authorizedSignature}</span>
                  </div>
                </div>
              )}
            </div>
            {!isQuotation && qrCodeDataUrl && (
              <div className="text-center flex-shrink-0">
                <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-amber-100 rounded-md p-1 bg-white shadow-2xs" />
                <span className="text-[8px] text-amber-800 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className="px-10 py-3">
        <div className="flex justify-between items-center text-[8px] text-gray-400">
          <span>{entity.name}</span>
          <span>{invoice.number} · {invoice.date}</span>
        </div>
      </div>
      
      {/* Gold Bottom Accent */}
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #92702a 0%, #c9a84c 30%, #e8c96d 50%, #c9a84c 70%, #92702a 100%)' }} />
    </div>
  );
}
