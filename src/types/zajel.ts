// Types for Zajel Al Nokhba & Multi-Company ERP

export type ThemeMode = 'dark-sidebar' | 'light';

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  taxNumber: string;
  crNumber: string;
  currency: string;
  vatRate: number;
  prefixQuotation: string;
  prefixInvoice: string;
  prefixReceipt: string;
  prefixPayment: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  quotationTerms: string;
  invoiceTerms: string;
  isDefault?: boolean;
}

export type CustomerType = 'individual' | 'business';

export interface Customer {
  id: string;
  companyId?: string;
  code: string;
  name: string;
  type: CustomerType;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  taxNumber?: string;
  crNumber?: string;
  notes?: string;
  status: 'active' | 'inactive';
  openingBalance: number;
  openingBalanceType: 'debit' | 'credit'; // debit = مستحق على العميل, credit = لصالحه
  openingBalanceDate: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  companyId?: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  taxRate: number; // e.g. 15
  status: 'active' | 'inactive';
}

export interface DocumentItem {
  id: string;
  productId?: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number; // amount
  taxRate: number; // percentage, e.g. 15
  taxAmount: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Quotation {
  id: string;
  companyId?: string;
  number: string;
  customerId: string;
  date: string;
  expiryDate: string;
  reference?: string;
  items: DocumentItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  terms?: string;
  notes?: string;
  status: QuotationStatus;
  convertedToInvoiceId?: string;
  createdAt: string;
}

export type InvoiceDocumentStatus = 'draft' | 'approved' | 'cancelled';
export type InvoicePaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Invoice {
  id: string;
  companyId?: string;
  number: string;
  customerId: string;
  date: string;
  dueDate?: string;
  quotationId?: string;
  items: DocumentItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  documentStatus: InvoiceDocumentStatus;
  paymentStatus: InvoicePaymentStatus;
  terms?: string;
  notes?: string;
  snapshotCustomer?: {
    name: string;
    taxNumber?: string;
    crNumber?: string;
    phone?: string;
    address?: string;
  };
  snapshotCompany?: {
    name: string;
    taxNumber?: string;
    crNumber?: string;
    phone?: string;
    address?: string;
    iban?: string;
    bankName?: string;
  };
  createdAt: string;
  approvedAt?: string;
  cancelledAt?: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'cheque';
export type VoucherAccount = 'main_cashbox' | 'alrajhi_bank' | 'snb_bank';

export interface VoucherAllocation {
  invoiceId: string;
  amount: number;
}

export interface ReceiptVoucher {
  id: string;
  companyId?: string;
  number: string;
  date: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  account: VoucherAccount;
  reference?: string;
  statement: string;
  notes?: string;
  allocations: VoucherAllocation[];
  status: 'draft' | 'approved' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
}

export type PaymentVoucherType = 'expense' | 'refund';

export interface PaymentVoucher {
  id: string;
  companyId?: string;
  number: string;
  date: string;
  beneficiary: string;
  type: PaymentVoucherType;
  customerId?: string; // only for refund
  amount: number;
  paymentMethod: PaymentMethod;
  account: VoucherAccount;
  reference?: string;
  reason: string;
  notes?: string;
  status: 'draft' | 'approved' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
}

export interface CompanySettings {
  name: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  taxNumber: string;
  crNumber: string;
  currency: string;
  vatRate: number;
  prefixQuotation: string;
  prefixInvoice: string;
  prefixReceipt: string;
  prefixPayment: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  quotationTerms: string;
  invoiceTerms: string;
}

export type UserRole = 'admin' | 'accountant' | 'viewer';

export interface UserProfile {
  name: string;
  role: UserRole;
  title: string;
}

export interface StatementMovement {
  id: string;
  seq: number;
  date: string;
  documentType: 'opening_balance' | 'invoice' | 'receipt' | 'refund';
  documentTypeLabel: string;
  documentNumber: string;
  documentId?: string;
  documentRoute?: string;
  statement: string;
  debit: number; // مدين (زيادة المستحق على العميل)
  credit: number; // دائن (سداد أو دفعة لصالح العميل)
  runningBalance: number; // الرصيد التراكمي بعد الحركة
}
