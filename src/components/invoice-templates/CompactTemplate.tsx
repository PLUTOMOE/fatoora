import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function CompactTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';

  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111827' }}>
      
      {/* Compact Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b-2 border-emerald-600">
        <div className="flex items-center gap-3">
          {entity.logo_url ? (
            <img src={entity.logo_url} alt="Logo" className="max-h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
              {entity.name?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold">{entity.name}</h2>
            <p className="text-[10px] text-gray-400">
              {entity.tax_number && `${t.vat}: ${entity.tax_number}`}
              {entity.cr_number && ` | ${t.cr}: ${entity.cr_number}`}
            </p>
          </div>
        </div>
        <div className={isRTL ? 'text-left' : 'text-right'}>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{titleText}</span>
            <span className="text-sm font-mono font-bold text-gray-700">{invoice.number}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{t.dateOfIssue}: {invoice.date}</p>
          {invoice.due_date && <p className="text-[10px] text-gray-400">{t.validUntilDue}: {invoice.due_date}</p>}
        </div>
      </div>

      {/* Customer Info - Inline */}
      <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-8 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">{t.preparedFor}:</span>
            <span className="font-bold text-gray-800">{customer.name}</span>
          </div>
          {customer.address && <span className="text-gray-500">{customer.address}</span>}
          {customer.tax_number && <span className="text-gray-500">{t.vat}: {customer.tax_number}</span>}
          {customer.phone && <span className="text-gray-500">{customer.phone}</span>}
        </div>
      </div>

      {/* Line Items */}
      <div className="px-8 py-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="text-right font-semibold pb-2 w-8">#</th>
              <th className="text-right font-semibold pb-2 pr-3">{t.description}</th>
              <th className="text-center font-semibold pb-2">{t.qty}</th>
              <th className="text-center font-semibold pb-2">{t.unitPrice}</th>
              <th className="text-center font-semibold pb-2">{t.vatPercent}</th>
              <th className={`font-semibold pb-2 ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2.5 text-xs text-gray-300 font-mono">{idx + 1}</td>
                  <td className="py-2.5 pr-3 font-medium">{item.name}</td>
                  <td className="py-2.5 text-center text-gray-500">{item.qty}</td>
                  <td className="py-2.5 text-center text-gray-500">{item.price.toLocaleString()}</td>
                  <td className="py-2.5 text-center text-gray-400 text-xs">{item.tax_rate}%</td>
                  <td className={`py-2.5 font-bold ${isRTL ? 'text-left' : 'text-right'}`}>{(lineTotal + lineTax).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Row */}
      <div className="px-8 pb-6">
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-5 py-4 border border-gray-100">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>{t.subtotal}: <b className="text-gray-700">{invoice.subtotal.toLocaleString()}</b></span>
            {invoice.discount > 0 && <span>{t.discount}: <b className="text-red-500">-{invoice.discount.toLocaleString()}</b></span>}
            <span>{t.totalVat}: <b className="text-gray-700">{invoice.tax.toLocaleString()}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-400">{t.grandTotal}</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight">{invoice.total.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400">{t.currency}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8">
        {settings.notes && (
          <div className="mb-4 text-xs text-gray-500 leading-relaxed border-r-2 border-emerald-600 pr-3 whitespace-pre-line">
            {settings.notes}
          </div>
        )}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div className="flex items-end gap-8">
            {settings.stamp_url && (
              <div className="text-center">
                <img src={settings.stamp_url} alt="Stamp" className="w-16 h-16 object-contain opacity-75" />
                <span className="text-[8px] text-gray-400 uppercase font-bold block mt-1">{t.companyStamp}</span>
              </div>
            )}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-24 h-10 object-contain" />
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <span className="text-[8px] text-gray-400 uppercase font-bold">{t.authorizedSignature}</span>
                </div>
              </div>
            )}
          </div>
          {!isQuotation && qrCodeDataUrl && (
            <div className="text-center flex-shrink-0">
              <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-16 h-16 object-contain mx-auto border border-gray-100 rounded p-1 bg-white" />
              <span className="text-[7px] text-gray-400 uppercase font-semibold block mt-0.5">QR Code · ZATCA</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
