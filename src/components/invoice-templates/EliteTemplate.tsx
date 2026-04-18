import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function EliteTemplate({ entity, customer, items, invoice, settings, type, language = 'ar' }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';
  
  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', 'Tajawal', system-ui, sans-serif", color: '#1a1d2e' }}>
      
      {/* ═══════ HEADER ═══════ */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #162544 40%, #1a3a6b 100%)' }}>
        <div className="relative px-8 py-5">
          <div className="flex justify-between items-center">
            {/* Logo & Company */}
            <div className="flex items-center gap-4">
              {entity.logo_url ? (
                <div className="bg-white rounded-xl p-2 shadow-lg" style={{ minWidth: 56 }}>
                  <img src={entity.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <span className="text-2xl font-black text-white">{entity.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-white">{entity.name}</h2>
                {entity.address && <p className="text-[10px] text-blue-200/70">{entity.address}</p>}
                <div className="flex items-center gap-2 mt-1">
                  {entity.cr_number && <span className="text-[9px] bg-white/10 text-blue-100 px-1.5 py-0.5 rounded-full">{t.cr}: {entity.cr_number}</span>}
                  {entity.tax_number && <span className="text-[9px] bg-white/10 text-blue-100 px-1.5 py-0.5 rounded-full">{t.vat}: {entity.tax_number}</span>}
                </div>
              </div>
            </div>

            {/* Document Type & Number */}
            <div className={`text-${isRTL ? 'left' : 'right'}`}>
              <h1 className="text-2xl font-black text-white tracking-tight">{titleText}</h1>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 mt-1 border border-white/15">
                <div className="text-[9px] text-blue-200/60">{t.reference}</div>
                <div className="text-sm font-bold text-white font-mono">{invoice.number}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ INFO ROW ═══════ */}
      <div className="px-8 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          {/* Customer */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.preparedFor}</div>
            <p className="text-sm font-bold text-gray-800">{customer.name || '—'}</p>
            {customer.address && <p className="text-[11px] text-gray-500">{customer.address}</p>}
            {customer.phone && <p className="text-[11px] text-gray-500">{customer.phone}</p>}
            {customer.tax_number && <p className="text-[10px] text-gray-500 mt-0.5">{t.vat}: {customer.tax_number}</p>}
          </div>
          {/* Dates */}
          <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.details}</div>
            <div className="text-[11px] text-gray-600"><span className="text-gray-400">{t.dateOfIssue}: </span><span className="font-semibold">{invoice.date}</span></div>
            {invoice.due_date && <div className="text-[11px] text-gray-600"><span className="text-gray-400">{t.validUntilDue}: </span><span className="font-semibold">{invoice.due_date}</span></div>}
          </div>
        </div>
      </div>

      {/* ═══════ ITEMS TABLE ═══════ */}
      <div className="px-8 pt-4 pb-2">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#f0f4ff' }}>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 w-8">#</th>
              <th className="text-right text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2">{t.description}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 w-14">{t.qty}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 w-20">{t.unitPrice}</th>
              <th className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 w-14">{t.vatPercent}</th>
              <th className={`text-[9px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2 w-20 ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="border-b border-gray-50">
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
        <div className="w-64 bg-gray-50 rounded-lg p-4 space-y-1.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-500">{t.subtotal}</span>
            <span className="font-medium tabular-nums">{invoice.subtotal.toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-[12px]">
              <span className="text-red-500">{t.discount}</span>
              <span className="text-red-500 tabular-nums">-{invoice.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px] pb-2 border-b border-gray-200">
            <span className="text-gray-500">{t.totalVat}</span>
            <span className="font-medium tabular-nums">{invoice.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] font-bold uppercase text-gray-500">{t.grandTotal}</span>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <span className="text-xl font-black tabular-nums" style={{ 
                background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{invoice.total.toLocaleString()}</span>
              <span className="text-[9px] text-gray-400 mr-1">{t.currency}</span>
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

      {/* ═══════ STAMP & SIGNATURE ═══════ */}
      {(settings.stamp_url || settings.signature_url) && (
        <div className="px-8 pb-3">
          <div className="flex items-end gap-8 pt-3 border-t border-gray-100">
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
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className="px-8 py-2 border-t border-gray-100">
        <div className="flex justify-between items-center text-[8px] text-gray-400">
          <span>{entity.name}</span>
          <span>{invoice.number} · {invoice.date}</span>
        </div>
      </div>
      <div className="h-1" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #162544 40%, #1a3a6b 100%)' }} />
    </div>
  );
}
