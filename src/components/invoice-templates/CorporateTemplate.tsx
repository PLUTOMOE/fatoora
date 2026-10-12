import React from 'react';
import { InvoiceTemplateProps } from './types';
import { getTemplateTranslations } from './translations';

export function CorporateTemplate({ entity, customer, items, invoice, settings, type, language = 'ar', qrCodeDataUrl }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const t = getTemplateTranslations(language);
  const titleText = isQuotation ? t.quotation : t.invoice;
  const isRTL = language === 'ar';

  return (
    <div className="bg-white w-full max-w-[900px] mx-auto" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a2e' }}>
      
      {/* Top Accent Bar */}
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #0f3460 0%, #16213e 50%, #533483 100%)' }} />

      {/* Header */}
      <div className="px-12 pt-10 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {entity.logo_url ? (
                <img src={entity.logo_url} alt="Logo" className="max-h-14 object-contain" />
              ) : (
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                  <span className="text-xl font-black text-[#0f3460]">{entity.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-[#0f3460]">{entity.name}</h2>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                  {entity.cr_number && <span>{t.cr}: {entity.cr_number}</span>}
                  {entity.tax_number && <span>{t.vat}: {entity.tax_number}</span>}
                </div>
              </div>
            </div>
            {entity.address && <p className="text-xs text-gray-400 mt-2">{entity.address}</p>}
            {entity.phone && <p className="text-xs text-gray-400">{entity.phone}</p>}
          </div>

          <div className="text-left" style={{ direction: 'ltr' }}>
            <h1 className="text-3xl font-black tracking-tight text-[#0f3460] uppercase">{titleText}</h1>
            <div className="mt-2 text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md inline-block">
              #{invoice.number}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-12 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#f8f9fc] rounded-lg p-5 border border-[#e8eaf0]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0f3460] mb-3">{t.preparedFor}</h4>
            <p className="text-sm font-bold text-gray-800">{customer.name}</p>
            {customer.address && <p className="text-xs text-gray-500 mt-1">{customer.address}</p>}
            {customer.phone && <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>}
            {customer.tax_number && <p className="text-xs text-gray-500 mt-1">{t.vat}: {customer.tax_number}</p>}
          </div>
          <div className="bg-[#f8f9fc] rounded-lg p-5 border border-[#e8eaf0]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0f3460] mb-3">{t.details}</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">{t.dateOfIssue}</span><span className="font-medium">{invoice.date}</span></div>
              {invoice.due_date && <div className="flex justify-between"><span className="text-gray-500">{t.validUntilDue}</span><span className="font-medium">{invoice.due_date}</span></div>}
            </div>
          </div>
          <div className="bg-[#0f3460] rounded-lg p-5 text-white">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-3">{t.grandTotal}</h4>
            <p className="text-2xl font-black tracking-tight">{invoice.total.toLocaleString()}</p>
            <p className="text-[10px] text-blue-200 mt-1">{t.currency}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-12 pb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f3460] text-white text-xs">
              <th className="text-right font-bold px-4 py-3 rounded-r-lg w-8">#</th>
              <th className="text-right font-bold px-4 py-3">{t.description}</th>
              <th className="text-center font-bold px-4 py-3">{t.qty}</th>
              <th className="text-center font-bold px-4 py-3">{t.unitPrice}</th>
              <th className="text-center font-bold px-4 py-3">{t.vatPercent}</th>
              <th className={`font-bold px-4 py-3 rounded-l-lg ${isRTL ? 'text-left' : 'text-right'}`}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.price;
              const lineTax = lineTotal * (item.tax_rate / 100);
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm font-semibold">{item.name}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-600">{item.qty}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-600">{item.price.toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs text-center text-gray-400">{item.tax_rate}%</td>
                  <td className={`px-4 py-4 text-sm font-bold ${isRTL ? 'text-left' : 'text-right'}`}>{(lineTotal + lineTax).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className={`px-12 pb-8 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <div className="w-72 bg-[#f8f9fc] rounded-lg p-5 border border-[#e8eaf0]">
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">{t.subtotal}</span><span className="font-medium">{invoice.subtotal.toLocaleString()}</span></div>
          {invoice.discount > 0 && <div className="flex justify-between text-sm mb-2"><span className="text-red-500">{t.discount}</span><span className="text-red-500">-{invoice.discount.toLocaleString()}</span></div>}
          <div className="flex justify-between text-sm mb-3 pb-3 border-b border-gray-200"><span className="text-gray-500">{t.totalVat}</span><span className="font-medium">{invoice.tax.toLocaleString()}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f3460]">{t.grandTotal}</span>
            <span className="text-xl font-black text-[#0f3460]">{invoice.total.toLocaleString()} <span className="text-xs font-normal text-gray-400">{t.currency}</span></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-12 pb-10">
        {settings.notes && (
          <div className="mb-6 bg-[#fffbeb] border border-[#fde68a] rounded-lg p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">{t.termsConditions}</h4>
            <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{settings.notes}</p>
          </div>
        )}
        <div className="flex items-end justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-8">
            {settings.stamp_url && (
              <div className="text-center">
                <img src={settings.stamp_url} alt="Stamp" className="w-20 h-20 object-contain opacity-80" />
                <span className="text-[9px] text-gray-400 uppercase font-bold mt-1 block">{t.companyStamp}</span>
              </div>
            )}
            {settings.signature_url && (
              <div className="text-center">
                <img src={settings.signature_url} alt="Signature" className="w-28 h-14 object-contain" />
                <div className="border-t border-gray-300 pt-1 mt-1">
                  <span className="text-[9px] text-gray-400 uppercase font-bold">{t.authorizedSignature}</span>
                </div>
              </div>
            )}
          </div>
          {!isQuotation && qrCodeDataUrl && (
            <div className="text-center flex-shrink-0">
              <img src={qrCodeDataUrl} alt="ZATCA QR" className="w-20 h-20 object-contain mx-auto border border-gray-200 rounded-md p-1 bg-white" />
              <span className="text-[8px] text-gray-400 uppercase font-semibold block mt-1 tracking-wider">QR Code · ZATCA</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #0f3460 0%, #16213e 50%, #533483 100%)' }} />
    </div>
  );
}
