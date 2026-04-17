export interface InvoiceTemplateProps {
  entity: {
    name: string;
    address?: string;
    phone?: string;
    tax_number?: string;
    cr_number?: string;
    logo_url?: string;
  };
  customer: {
    name: string;
    address?: string;
    phone?: string;
    tax_number?: string;
  };
  items: {
    name: string;
    qty: number;
    price: number;
    tax_rate: number;
  }[];
  invoice: {
    number: string;
    date: string;
    due_date?: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  settings: {
    stamp_url?: string;
    signature_url?: string;
    notes?: string;
    template: 'classic' | 'modern' | 'minimal';
  };
  type: 'invoice' | 'quotation';
}
