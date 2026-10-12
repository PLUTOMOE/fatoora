import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function ExecutiveTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';

  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', 'Tajawal', system-ui, sans-serif", color: '#1a1a2e' }}>
      
      {/* ═══════ HEADER WITH ACCENT ═══════ */}
      <div className="relative">
        {/* Emerald accent strip */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #047857 0%, #059669 50%, #10b981 100%)' }} />
        
        <div className="px-10 pt-8 pb-6">
          <div className="flex justify-between items-start">
            {/* Company Block */}
            <div className="flex items-start gap-5">
              {entity.logo_url ? (
                <div className="rounded-xl overflow-hidden border-2 border-emerald-100 shadow-sm" style={{ minWidth: 64 }}>
                  <img src={entity.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
                  <span className="text-2xl font-black text-white">{entity.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{entity.name}</h2>
                <div className="mt-1.5 space-y-0.5">
                  {entity.address && <p className="text-[11px] text-gray-500">{entity.address}</p>}
                  {entity.phone && <p className="text-[11px] text-gray-500">{entity.phone}</p>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {entity.cr_number && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">{t.cr} {entity.cr_number}</span>}
                  {entity.tax_number && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">{t.vat} {entity.tax_number}</span>}
                </div>
              </div>
            </div>

            {/* Document Type Badge */}
            <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
              <div className="inline-block px-5 py-1.5 rounded-full text-white text-sm font-black tracking-wide" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
                {titleText}
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.reference}</div>
                <div className="text-lg font-bold text-gray-900 font-mono">{invoice.number}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ CLIENT & DATES CARDS ═══════ */}
      <div className="px-10 pb-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Client Box */}
          <div className="col-span-2 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-xl p-5 border border-emerald-100/60">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-700 mb-2.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t.preparedFor}
            </div>
            <p className="text-[15px] font-bold text-gray-900">{customer.name || '—'}</p>
            <div className="mt-1.5 space-y-0.5">
              {customer.address && <p className="text-[11px] text-gray-500">{customer.address}</p>}
              {customer.phone && <p className="text-[11px] text-gray-500">{customer.phone}</p>}
              {customer.tax_number && <p className="text-[10px] text-gray-500 mt-1">{t.vat} {customer.tax_number}</p>}
            </div>
          </div>
          
          {/* Dates Box */}
          <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {t.details}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[9px] text-gray-400 uppercase">{t.dateOfIssue}</div>
                <div className="text-[13px] font-bold text-gray-900 mt-0.5">{invoice.date}</div>
              </div>
              {invoice.due_date && (
                <div>
                  <div className="text-[9px] text-gray-400 uppercase">{t.validUntilDue}</div>
                  <div className="text-[13px] font-bold text-gray-900 mt-0.5">{invoice.due_date}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ ITEMS TABLE ═══════ */}
      <div className="px-10 pb-4">
        <table className="w-full border-separate" style={{ borderSpacing: '0 2px' }}>
          <thead>
            <tr>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50 rounded-r-lg w-8">#</th>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50">{t.description}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50 w-14">{t.qty}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50 w-20">{t.unitPrice}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50 w-14">{t.vatPercent}</th>
              <th className={`text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-4 py-3 bg-emerald-50 rounded-l-lg w-20 ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="group">
                  <td className="px-4 py-3 text-[10px] text-gray-300 font-mono bg-gray-50/50 group-hover:bg-emerald-50/30 rounded-r-lg transition-colors">{idx + 1}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-800 bg-gray-50/50 group-hover:bg-emerald-50/30 transition-colors">{item.name}</td>
                  <td className="px-4 py-3 text-[12px] text-center text-gray-600 tabular-nums bg-gray-50/50 group-hover:bg-emerald-50/30 transition-colors">{item.qty}</td>
                  <td className="px-4 py-3 text-[12px] text-center text-gray-600 tabular-nums bg-gray-50/50 group-hover:bg-emerald-50/30 transition-colors">{item.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[10px] text-center text-gray-400 bg-gray-50/50 group-hover:bg-emerald-50/30 transition-colors">{item.tax_rate}%</td>
                  <td className={`px-4 py-3 text-[12px] font-bold text-gray-900 tabular-nums bg-gray-50/50 group-hover:bg-emerald-50/30 rounded-l-lg transition-colors ${isRTL ? 'text-left' : 'text-right'}`}>
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
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-[12px] px-4 py-1.5">
            <span className="text-gray-500">{t.subtotal}</span>
            <span className="font-medium tabular-nums">{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-[12px] px-4 py-1.5">
              <span className="text-red-500">{t.discount}</span>
              <span className="text-red-500 tabular-nums">-{invoice.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] px-4 py-1.5 border-b border-gray-100">
            <span className="text-gray-500">{t.totalVat}</span>
            <span className="font-medium tabular-nums">{invoice.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center rounded-xl px-5 py-3" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">{t.grandTotal}</span>
            <div>
              <span className="text-2xl font-black tabular-nums text-white">{invoice.total.toLocaleString()}</span>
              <span className="text-[9px] text-emerald-200 mr-1">{t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ NOTES ═══════ */}
      {settings.notes && (
        <div className="px-10 pb-4">
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-4">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t.termsConditions}
            </h4>
            <p className="text-[11px] text-amber-900/80 leading-relaxed whitespace-pre-line">{settings.notes}</p>
          </div>
        </div>
      )}

      {/* ═══════ STAMP & SIGNATURE & QR ═══════ */}
      {(settings.stamp_url || settings.signature_url || (!isQuotation && qrCodeDataUrl)) && (
        <div className="px-10 pb-4">
          <div className="flex items-end justify-between gap-8 pt-4 border-t border-gray-100">
            <div className="flex items-end gap-8">
              {settings.stamp_url && (
                <div className="text-center">
                  <img src={settings.stamp_url} alt="Stamp" className="w-18 h-18 object-contain opacity-85" style={{ mixBlendMode: 'multiply' }} />
                  <span className="text-[8px] text-gray-400 uppercase font-bold mt-1 block">{t.companyStamp}</span>
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
                <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-emerald-100 rounded-md p-1 bg-white shadow-2xs" />
                <span className="text-[8px] text-emerald-800 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className="px-10 py-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-[8px] text-gray-400">
          <span>{entity.name}</span>
          <span>{invoice.number} · {invoice.date}</span>
        </div>
      </div>
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #047857 0%, #059669 50%, #10b981 100%)' }} />
    </div>
  );
}
