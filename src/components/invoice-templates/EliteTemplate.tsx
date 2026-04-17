import React from 'react';
import { InvoiceTemplateProps } from './types';
import { CheckCircle2 } from 'lucide-react';

export function EliteTemplate({ entity, customer, items, invoice, settings, type }: InvoiceTemplateProps) {
  const isQuotation = type === 'quotation';
  const titleText = isQuotation ? 'QUOTATION' : 'INVOICE';
  
  // Using the specific colors from the user's design for the Elite Template
  const colors = {
    surface: '#ffffff',
    onSurface: '#151b2d',
    secondary: '#565e74',
    onSurfaceVariant: '#434656',
    outlineVariant: '#c3c5d9',
    primary: '#003dc7',
    primaryContainer: '#0051ff',
    surfaceContainerLow: '#f2f3ff',
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_48px_64px_rgba(21,27,45,0.04)] overflow-hidden w-full max-w-[900px] mx-auto text-left" dir="ltr" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: colors.onSurface }}>
      
      {/* Document Header */}
      <div className="p-12 lg:p-16 border-b" style={{ borderColor: colors.surfaceContainerLow }}>
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">{titleText}</h1>
            <p className="text-sm font-medium" style={{ color: colors.secondary }}>Reference: {invoice.number}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            {entity.logo_url ? (
               <img src={entity.logo_url} alt="Logo" className="max-w-[150px] max-h-16 object-contain" />
            ) : (
               <span className="text-2xl font-black tracking-tighter uppercase">{entity.name}</span>
            )}
            <p className="text-xs mt-2" style={{ color: colors.onSurfaceVariant }}>{entity.cr_number ? `CR: ${entity.cr_number}` : ''}</p>
            <p className="text-xs" style={{ color: colors.onSurfaceVariant }}>{entity.tax_number ? `VAT: ${entity.tax_number}` : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.05em] mb-4 border-b pb-2" style={{ color: colors.secondary, borderColor: colors.surfaceContainerLow }}>Prepared For</h3>
            <p className="text-lg font-bold">{customer.name}</p>
            {customer.address && <p className="text-sm mt-1" style={{ color: colors.onSurfaceVariant }}>{customer.address}</p>}
            {customer.phone && <p className="text-sm mt-1" style={{ color: colors.onSurfaceVariant }}>{customer.phone}</p>}
            {customer.tax_number && <p className="text-sm mt-1" style={{ color: colors.onSurfaceVariant }}>VAT: {customer.tax_number}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase tracking-[0.05em] mb-4 border-b pb-2" style={{ color: colors.secondary, borderColor: colors.surfaceContainerLow }}>Details</h3>
            <div className="flex justify-between text-sm mt-1">
               <span style={{ color: colors.onSurfaceVariant }}>Date of Issue:</span>
               <span className="font-medium">{invoice.date}</span>
            </div>
            {invoice.due_date && (
               <div className="flex justify-between text-sm mt-1">
                 <span style={{ color: colors.onSurfaceVariant }}>Valid Until / Due:</span>
                 <span className="font-medium">{invoice.due_date}</span>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Ledger */}
      <div className="p-12 lg:p-16">
        <h3 className="text-xs font-bold uppercase tracking-[0.05em] mb-8" style={{ color: colors.secondary }}>Service Breakdown</h3>
        
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: `${colors.outlineVariant}40`, color: colors.secondary }}>
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-1 text-center">VAT%</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Line Items */}
          {items.map((item, idx) => {
             const rowBg = idx % 2 === 0 ? '#ffffff' : colors.surfaceContainerLow;
             const itemTotal = item.qty * item.price;
             const taxAmount = itemTotal * (item.tax_rate / 100);
             return (
               <div key={idx} className="grid grid-cols-12 gap-4 py-6 px-4 rounded-lg transition-all duration-300 hover:shadow-[0_8px_24px_rgba(21,27,45,0.04)] hover:scale-[1.005]" style={{ backgroundColor: rowBg }}>
                 <div className="col-span-5">
                   <p className="font-bold text-sm tracking-tight">{item.name}</p>
                 </div>
                 <div className="col-span-2 text-center text-sm font-medium" style={{ color: colors.onSurfaceVariant }}>{item.qty}</div>
                 <div className="col-span-2 text-center text-sm font-medium" style={{ color: colors.onSurfaceVariant }}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                 <div className="col-span-1 text-center text-xs font-medium mt-0.5" style={{ color: colors.secondary }}>{item.tax_rate}%</div>
                 <div className="col-span-2 text-right text-sm font-bold">${(itemTotal + taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
               </div>
             );
          })}
        </div>

        {/* Totals Section */}
        <div className="mt-16 flex justify-end">
          <div className="w-full max-w-sm space-y-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.onSurfaceVariant }}>Subtotal</span>
              <span className="font-medium">${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-500">Discount</span>
                <span className="font-medium text-red-500">-${invoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-b pb-4" style={{ borderColor: `${colors.outlineVariant}40` }}>
              <span style={{ color: colors.onSurfaceVariant }}>Total VAT</span>
              <span className="font-medium">${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <span className="text-xs font-bold uppercase tracking-[0.05em]" style={{ color: colors.secondary }}>Grand Total</span>
              <span className="text-4xl font-black tracking-tighter" style={{ 
                background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryContainer})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-right text-xs mt-2" style={{ color: colors.onSurfaceVariant }}>SAR / USD - All figures inclusive of outlined scope.</p>
          </div>
        </div>

        {/* Notes & Footer with Stamps */}
        <div className="mt-24 pt-8 border-t" style={{ borderColor: colors.surfaceContainerLow }}>
          {settings.notes && (
             <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.05em] mb-4" style={{ color: colors.secondary }}>Terms &amp; Conditions</h4>
                <p className="text-xs leading-relaxed max-w-3xl" style={{ color: colors.onSurfaceVariant }}>
                    {settings.notes}
                </p>
             </div>
          )}

          <div className="flex items-end justify-between mt-12 pt-8 border-t border-gray-100">
             <div className="flex items-center gap-12">
               {settings.stamp_url && (
                 <div className="text-center">
                   <img src={settings.stamp_url} alt="Stamp" className="w-24 h-24 object-contain opacity-90 mixing-multiply" />
                   <div className="text-[10px] uppercase font-bold mt-2" style={{ color: colors.outlineVariant }}>Company Stamp</div>
                 </div>
               )}
               {settings.signature_url && (
                 <div className="text-center">
                   <img src={settings.signature_url} alt="Signature" className="w-32 h-16 object-contain" />
                   <div className="text-[10px] uppercase font-bold border-t pt-2 mt-2" style={{ color: colors.outlineVariant, borderColor: colors.surfaceContainerLow }}>Authorized Signature</div>
                 </div>
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
