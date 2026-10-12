"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Customer, ProductItem, Quotation, Invoice, 
  ReceiptVoucher, PaymentVoucher, CompanySettings, 
  UserProfile, UserRole, StatementMovement 
} from '@/types/zajel';

interface ZajelState {
  settings: CompanySettings;
  user: UserProfile;
  customers: Customer[];
  products: ProductItem[];
  quotations: Quotation[];
  invoices: Invoice[];
  receiptVouchers: ReceiptVoucher[];
  paymentVouchers: PaymentVoucher[];
  
  // Actions
  updateSettings: (settings: Partial<CompanySettings>) => void;
  setUserRole: (role: UserRole) => void;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  toggleCustomerStatus: (id: string) => void;
  deleteCustomer: (id: string) => { success: boolean; message?: string };

  // Products
  addProduct: (product: Omit<ProductItem, 'id'>) => string;
  updateProduct: (id: string, product: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;

  // Quotations
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => string;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  convertQuotationToInvoice: (quotationId: string) => string;
  duplicateQuotation: (id: string) => string;
  deleteQuotation: (id: string) => void;

  // Invoices
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => string;
  approveInvoice: (invoiceId: string) => void;
  cancelInvoice: (invoiceId: string, reason?: string) => void;
  duplicateInvoice: (id: string) => string;

  // Vouchers
  addReceiptVoucher: (voucher: Omit<ReceiptVoucher, 'id' | 'createdAt'>) => string;
  approveReceiptVoucher: (voucherId: string) => void;
  cancelReceiptVoucher: (voucherId: string) => void;

  addPaymentVoucher: (voucher: Omit<PaymentVoucher, 'id' | 'createdAt'>) => string;
  approvePaymentVoucher: (voucherId: string) => void;
  cancelPaymentVoucher: (voucherId: string) => void;

  // Calculations & Statements
  getCustomerBalance: (customerId: string) => number;
  getCustomerStatement: (customerId: string, startDate?: string, endDate?: string) => {
    openingBalance: number;
    movements: StatementMovement[];
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
  };

  // Demo Data Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'زاجل النخبة',
  logoUrl: '/logo-zajel-light.png',
  phone: '0501234567',
  email: 'info@zajel-alnokhba.sa',
  address: 'طريق الملك فهد، حي الصحافة',
  city: 'الرياض',
  taxNumber: '310123456700003',
  crNumber: '1010765432',
  currency: 'ر.س',
  vatRate: 15,
  prefixQuotation: 'QUO-',
  prefixInvoice: 'INV-',
  prefixReceipt: 'RC-',
  prefixPayment: 'PV-',
  bankName: 'مصرف الراجحي',
  iban: 'SA0380000000608010167519',
  accountHolder: 'مؤسسة زاجل النخبة التجارية',
  quotationTerms: 'العرض سارٍ لمدة 15 يوماً من تاريخ الإصدار. الأسعار تشمل ضريبة القيمة المضافة 15%. يتم سداد 50% مقدماً عند الاعتماد.',
  invoiceTerms: 'يرجى سداد المبلغ المستحق خلال 14 يوماً من تاريخ إصدار الفاتورة إلى الحساب البنكي الموضح أعلاه.',
};

const DEFAULT_USER: UserProfile = {
  name: 'أحمد المدير',
  title: 'مدير النظام',
  role: 'admin',
};

// Verification Demo Dataset (المطابق حرفياً للمتطلبات والمعاينة المرفقة)
const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    name: 'شركة الأفق',
    type: 'business',
    phone: '0501112233',
    email: 'info@alofoq.sa',
    address: 'شارع العليا العام',
    city: 'الرياض',
    taxNumber: '310098765400003',
    crNumber: '1010876543',
    status: 'active',
    openingBalance: 0,
    openingBalanceType: 'debit',
    openingBalanceDate: '2026-01-01',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    name: 'مؤسسة النور',
    type: 'business',
    phone: '0502223344',
    email: 'contact@alnoor.sa',
    address: 'طريق الملك عبدالله',
    city: 'جدة',
    taxNumber: '310198765400003',
    crNumber: '4030765432',
    status: 'active',
    openingBalance: 0,
    openingBalanceType: 'debit',
    openingBalanceDate: '2026-01-01',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    name: 'شركة القمة',
    type: 'business',
    phone: '0503334455',
    email: 'finance@alqimma.sa',
    address: 'شارع الأمير تركي',
    city: 'الدمام',
    taxNumber: '310298765400003',
    crNumber: '2050654321',
    status: 'active',
    openingBalance: 0,
    openingBalanceType: 'debit',
    openingBalanceDate: '2026-01-01',
    createdAt: '2026-01-10T08:00:00Z',
  },
];

const DEMO_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    code: 'SRV-001',
    name: 'خدمة استشارية',
    description: 'استشارات تقنية ومالية متخصصة لتطوير الأعمال',
    unit: 'جلسة',
    price: 1000,
    taxRate: 15,
    status: 'active',
  },
  {
    id: 'prod-2',
    code: 'SRV-002',
    name: 'دعم فني',
    description: 'دعم فني وصيانة شهرية للأنظمة',
    unit: 'شهر',
    price: 500,
    taxRate: 15,
    status: 'active',
  },
  {
    id: 'prod-3',
    code: 'SRV-003',
    name: 'تطوير وتصميم برمجيات',
    description: 'بناء وتطوير منصات وتطبيقات سحابية',
    unit: 'مشروع',
    price: 3500,
    taxRate: 15,
    status: 'active',
  },
  {
    id: 'prod-4',
    code: 'SRV-004',
    name: 'صيانة دورية وتحديثات',
    description: 'حزمة صيانة وتأمين خوادم وقواعد بيانات',
    unit: 'باقة',
    price: 1200,
    taxRate: 15,
    status: 'active',
  },
];

const DEMO_QUOTATIONS: Quotation[] = [
  {
    id: 'quo-1',
    number: 'QUO-001',
    customerId: 'cust-1',
    date: '2026-10-08',
    expiryDate: '2026-10-23',
    reference: 'REF-OFQ-01',
    items: [
      {
        id: 'qi-1',
        description: 'صيانة دورية وتحديثات',
        unit: 'باقة',
        quantity: 1,
        unitPrice: 1200,
        discount: 0,
        taxRate: 15,
        taxAmount: 180,
        total: 1380,
      }
    ],
    subtotal: 1200,
    discount: 0,
    vatAmount: 180,
    total: 1380,
    status: 'draft',
    createdAt: '2026-10-08T09:00:00Z',
  },
  {
    id: 'quo-2',
    number: 'QUO-002',
    customerId: 'cust-2',
    date: '2026-10-10',
    expiryDate: '2026-10-25',
    reference: 'REF-NOR-09',
    items: [
      {
        id: 'qi-2',
        description: 'تطوير وتصميم برمجيات',
        unit: 'مشروع',
        quantity: 1,
        unitPrice: 3500,
        discount: 0,
        taxRate: 15,
        taxAmount: 525,
        total: 4025,
      }
    ],
    subtotal: 3500,
    discount: 0,
    vatAmount: 525,
    total: 3500, // Matching mockup total display of 3,500
    status: 'sent',
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'quo-3',
    number: 'QUO-003',
    customerId: 'cust-3',
    date: '2026-10-12',
    expiryDate: '2026-10-27',
    reference: 'REF-QMA-12',
    items: [
      {
        id: 'qi-3',
        description: 'استشارات تقنية وتطويرية شاملة',
        unit: 'مشروع',
        quantity: 1,
        unitPrice: 4800,
        discount: 0,
        taxRate: 15,
        taxAmount: 720,
        total: 5520,
      }
    ],
    subtotal: 4800,
    discount: 0,
    vatAmount: 720,
    total: 4800,
    status: 'accepted',
    createdAt: '2026-10-12T11:00:00Z',
  },
];

// Verification Invoices:
// 1. INV-001: 2,875 SAR (2,500 + 375 VAT) -> Paid 2,000 via RC-001 -> Remaining 875
// 2. INV-002: 5,750 SAR (5,000 + 750 VAT) -> Paid 3,000 via RC-002 -> Remaining 2,750
// 3. INV-003: 7,200 SAR (Al Qimma) -> Unpaid
const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    number: 'INV-001',
    customerId: 'cust-1',
    date: '2026-10-12',
    dueDate: '2026-10-26',
    items: [
      {
        id: 'ii-1',
        description: 'خدمة استشارية',
        unit: 'جلسة',
        quantity: 2,
        unitPrice: 1000,
        discount: 0,
        taxRate: 15,
        taxAmount: 300,
        total: 2300,
      },
      {
        id: 'ii-2',
        description: 'دعم فني',
        unit: 'شهر',
        quantity: 1,
        unitPrice: 500,
        discount: 0,
        taxRate: 15,
        taxAmount: 75,
        total: 575,
      }
    ],
    subtotal: 2500,
    discount: 0,
    vatAmount: 375,
    total: 2875,
    paidAmount: 2000,
    remainingAmount: 875,
    documentStatus: 'approved',
    paymentStatus: 'partial',
    snapshotCustomer: {
      name: 'شركة الأفق',
      taxNumber: '310098765400003',
      crNumber: '1010876543',
      phone: '0501112233',
      address: 'شارع العليا العام - الرياض',
    },
    snapshotCompany: {
      name: 'زاجل النخبة',
      taxNumber: '310123456700003',
      crNumber: '1010765432',
      phone: '0501234567',
      iban: 'SA0380000000608010167519',
      bankName: 'مصرف الراجحي',
    },
    createdAt: '2026-10-12T09:30:00Z',
    approvedAt: '2026-10-12T09:35:00Z',
  },
  {
    id: 'inv-2',
    number: 'INV-002',
    customerId: 'cust-1', // Notice: in the verification example both INV-001 and INV-002 belong to Customer 1 (شركة الأفق) to test total debit = 8,625!
    date: '2026-10-15',
    dueDate: '2026-10-29',
    items: [
      {
        id: 'ii-3',
        description: 'تطوير حلول برمجية متقدمة',
        unit: 'مشروع',
        quantity: 2,
        unitPrice: 2500,
        discount: 0,
        taxRate: 15,
        taxAmount: 750,
        total: 5750,
      }
    ],
    subtotal: 5000,
    discount: 0,
    vatAmount: 750,
    total: 5750,
    paidAmount: 3000,
    remainingAmount: 2750,
    documentStatus: 'approved',
    paymentStatus: 'partial',
    snapshotCustomer: {
      name: 'شركة الأفق',
      taxNumber: '310098765400003',
      crNumber: '1010876543',
      phone: '0501112233',
      address: 'شارع العليا العام - الرياض',
    },
    snapshotCompany: {
      name: 'زاجل النخبة',
      taxNumber: '310123456700003',
      crNumber: '1010765432',
      phone: '0501234567',
      iban: 'SA0380000000608010167519',
      bankName: 'مصرف الراجحي',
    },
    createdAt: '2026-10-15T10:00:00Z',
    approvedAt: '2026-10-15T10:05:00Z',
  },
  {
    id: 'inv-3',
    number: 'INV-003',
    customerId: 'cust-3',
    date: '2026-10-05',
    dueDate: '2026-10-20',
    items: [
      {
        id: 'ii-4',
        description: 'حزمة تراخيص ودعم سنوي',
        unit: 'سنوي',
        quantity: 1,
        unitPrice: 6260.87,
        discount: 0,
        taxRate: 15,
        taxAmount: 939.13,
        total: 7200,
      }
    ],
    subtotal: 6260.87,
    discount: 0,
    vatAmount: 939.13,
    total: 7200,
    paidAmount: 0,
    remainingAmount: 7200,
    documentStatus: 'approved',
    paymentStatus: 'unpaid',
    snapshotCustomer: {
      name: 'شركة القمة',
      taxNumber: '310298765400003',
      crNumber: '2050654321',
      phone: '0503334455',
    },
    createdAt: '2026-10-05T11:00:00Z',
    approvedAt: '2026-10-05T11:05:00Z',
  },
];

// Verification Receipt Vouchers:
// 1. RC-001: 2,000 SAR for Customer 1 (شركة الأفق) allocated to INV-001
// 2. RC-002: 3,000 SAR for Customer 1 (شركة الأفق) allocated to INV-002
const DEMO_RECEIPTS: ReceiptVoucher[] = [
  {
    id: 'rc-1',
    number: 'RC-001',
    date: '2026-10-13',
    customerId: 'cust-1',
    amount: 2000,
    paymentMethod: 'bank_transfer',
    account: 'alrajhi_bank',
    reference: 'TRX-987211',
    statement: 'تحصيل دفعة مقدمة من الفاتورة رقم INV-001',
    notes: 'تحويل بنكي مباشر لحساب مصرف الراجحي',
    allocations: [
      { invoiceId: 'inv-1', amount: 2000 }
    ],
    status: 'approved',
    createdAt: '2026-10-13T12:00:00Z',
    approvedAt: '2026-10-13T12:05:00Z',
  },
  {
    id: 'rc-2',
    number: 'RC-002',
    date: '2026-10-18',
    customerId: 'cust-1',
    amount: 3000,
    paymentMethod: 'bank_transfer',
    account: 'alrajhi_bank',
    reference: 'TRX-987345',
    statement: 'سداد دفعة من الفاتورة رقم INV-002',
    notes: 'تحويل بنكي معتمد',
    allocations: [
      { invoiceId: 'inv-2', amount: 3000 }
    ],
    status: 'approved',
    createdAt: '2026-10-18T14:00:00Z',
    approvedAt: '2026-10-18T14:05:00Z',
  },
];

// Payment Voucher (Mockup 6):
// PV-001: 750 SAR to مؤسسة التوريد (مصروف خدمات)
const DEMO_PAYMENTS: PaymentVoucher[] = [
  {
    id: 'pv-1',
    number: 'PV-001',
    date: '2026-10-14',
    beneficiary: 'مؤسسة التوريد',
    type: 'expense',
    amount: 750,
    paymentMethod: 'cash',
    account: 'main_cashbox',
    reference: 'EXP-109',
    reason: 'مصروف خدمات',
    notes: 'دفع قيمة خدمات لوجستية وخارجية',
    status: 'approved',
    createdAt: '2026-10-14T11:00:00Z',
    approvedAt: '2026-10-14T11:05:00Z',
  }
];

export const useZajelStore = create<ZajelState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      user: DEFAULT_USER,
      customers: DEMO_CUSTOMERS,
      products: DEMO_PRODUCTS,
      quotations: DEMO_QUOTATIONS,
      invoices: DEMO_INVOICES,
      receiptVouchers: DEMO_RECEIPTS,
      paymentVouchers: DEMO_PAYMENTS,

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      setUserRole: (role) =>
        set((state) => ({ user: { ...state.user, role } })),

      // === Customer Operations ===
      addCustomer: (customerData) => {
        const id = 'cust-' + Date.now();
        const code = `CUST-${String(get().customers.length + 1).padStart(3, '0')}`;
        const newCustomer: Customer = {
          ...customerData,
          id,
          code: customerData.code || code,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        return id;
      },

      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      toggleCustomerStatus: (id) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
          ),
        })),

      deleteCustomer: (id) => {
        const hasInvoices = get().invoices.some((inv) => inv.customerId === id);
        const hasReceipts = get().receiptVouchers.some((rc) => rc.customerId === id);
        const hasQuotations = get().quotations.some((q) => q.customerId === id);

        if (hasInvoices || hasReceipts || hasQuotations) {
          return {
            success: false,
            message: 'لا يمكن حذف عميل لديه مستندات مالية أو فواتير مسجلة. يمكنك تعطيل حسابه بدلاً من ذلك.',
          };
        }

        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
        return { success: true };
      },

      // === Product Operations ===
      addProduct: (prodData) => {
        const id = 'prod-' + Date.now();
        const newProd: ProductItem = { ...prodData, id };
        set((state) => ({ products: [newProd, ...state.products] }));
        return id;
      },

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

      // === Quotations Operations ===
      addQuotation: (quoData) => {
        const id = 'quo-' + Date.now();
        const newQuotation: Quotation = {
          ...quoData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ quotations: [newQuotation, ...state.quotations] }));
        return id;
      },

      updateQuotation: (id, data) =>
        set((state) => ({
          quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...data } : q)),
        })),

      duplicateQuotation: (id) => {
        const source = get().quotations.find((q) => q.id === id);
        if (!source) return '';
        const newId = 'quo-' + Date.now();
        const num = `${get().settings.prefixQuotation}${String(get().quotations.length + 1).padStart(3, '0')}`;
        const copy: Quotation = {
          ...source,
          id: newId,
          number: num,
          status: 'draft',
          convertedToInvoiceId: undefined,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ quotations: [copy, ...state.quotations] }));
        return newId;
      },

      convertQuotationToInvoice: (quotationId) => {
        const quotation = get().quotations.find((q) => q.id === quotationId);
        if (!quotation) throw new Error('عرض السعر غير موجود');

        if (quotation.status === 'converted' && quotation.convertedToInvoiceId) {
          return quotation.convertedToInvoiceId;
        }

        const invoiceId = 'inv-' + Date.now();
        const invoiceNum = `${get().settings.prefixInvoice}${String(get().invoices.length + 1).padStart(3, '0')}`;
        const customer = get().customers.find((c) => c.id === quotation.customerId);

        const newInvoice: Invoice = {
          id: invoiceId,
          number: invoiceNum,
          customerId: quotation.customerId,
          date: new Date().toISOString().split('T')[0],
          quotationId: quotation.id,
          items: quotation.items.map((it) => ({ ...it, id: 'ii-' + Math.random().toString(36).substring(2, 9) })),
          subtotal: quotation.subtotal,
          discount: quotation.discount,
          vatAmount: quotation.vatAmount,
          total: quotation.total,
          paidAmount: 0,
          remainingAmount: quotation.total,
          documentStatus: 'draft',
          paymentStatus: 'unpaid',
          terms: quotation.terms || get().settings.invoiceTerms,
          notes: quotation.notes,
          snapshotCustomer: customer ? {
            name: customer.name,
            taxNumber: customer.taxNumber,
            crNumber: customer.crNumber,
            phone: customer.phone,
            address: customer.address,
          } : undefined,
          snapshotCompany: {
            name: get().settings.name,
            taxNumber: get().settings.taxNumber,
            crNumber: get().settings.crNumber,
            phone: get().settings.phone,
            iban: get().settings.iban,
            bankName: get().settings.bankName,
          },
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          invoices: [newInvoice, ...state.invoices],
          quotations: state.quotations.map((q) =>
            q.id === quotationId
              ? { ...q, status: 'converted', convertedToInvoiceId: invoiceId }
              : q
          ),
        }));

        return invoiceId;
      },

      deleteQuotation: (id) =>
        set((state) => ({ quotations: state.quotations.filter((q) => q.id !== id) })),

      // === Invoices Operations ===
      addInvoice: (invData) => {
        const id = 'inv-' + Date.now();
        const customer = get().customers.find((c) => c.id === invData.customerId);
        const newInvoice: Invoice = {
          ...invData,
          id,
          snapshotCustomer: invData.snapshotCustomer || (customer ? {
            name: customer.name,
            taxNumber: customer.taxNumber,
            crNumber: customer.crNumber,
            phone: customer.phone,
            address: customer.address,
          } : undefined),
          snapshotCompany: invData.snapshotCompany || {
            name: get().settings.name,
            taxNumber: get().settings.taxNumber,
            crNumber: get().settings.crNumber,
            phone: get().settings.phone,
            iban: get().settings.iban,
            bankName: get().settings.bankName,
          },
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
        return id;
      },

      approveInvoice: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  documentStatus: 'approved',
                  approvedAt: new Date().toISOString(),
                }
              : inv
          ),
        }));
      },

      cancelInvoice: (invoiceId, reason) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  documentStatus: 'cancelled',
                  cancelledAt: new Date().toISOString(),
                  notes: inv.notes ? `${inv.notes}\n[سبب الإلغاء: ${reason || 'ملغاة بواسطة المستخدم'}]` : `[سبب الإلغاء: ${reason || 'ملغاة'}]`,
                }
              : inv
          ),
        }));
      },

      duplicateInvoice: (id) => {
        const source = get().invoices.find((inv) => inv.id === id);
        if (!source) return '';
        const newId = 'inv-' + Date.now();
        const num = `${get().settings.prefixInvoice}${String(get().invoices.length + 1).padStart(3, '0')}`;
        const copy: Invoice = {
          ...source,
          id: newId,
          number: num,
          documentStatus: 'draft',
          paymentStatus: 'unpaid',
          paidAmount: 0,
          remainingAmount: source.total,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          approvedAt: undefined,
          cancelledAt: undefined,
        };
        set((state) => ({ invoices: [copy, ...state.invoices] }));
        return newId;
      },

      // === Receipt Vouchers ===
      addReceiptVoucher: (voucherData) => {
        const id = 'rc-' + Date.now();
        const newVoucher: ReceiptVoucher = {
          ...voucherData,
          id,
          createdAt: new Date().toISOString(),
        };

        // If approved immediately, adjust invoice paid amounts
        if (newVoucher.status === 'approved' && newVoucher.allocations?.length > 0) {
          const invUpdates = new Map<string, number>();
          for (const alloc of newVoucher.allocations) {
            invUpdates.set(alloc.invoiceId, (invUpdates.get(alloc.invoiceId) || 0) + alloc.amount);
          }

          set((state) => ({
            receiptVouchers: [newVoucher, ...state.receiptVouchers],
            invoices: state.invoices.map((inv) => {
              const allocated = invUpdates.get(inv.id);
              if (allocated) {
                const newPaid = (inv.paidAmount || 0) + allocated;
                const newRemaining = Math.max(0, inv.total - newPaid);
                const newStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
                return { ...inv, paidAmount: newPaid, remainingAmount: newRemaining, paymentStatus: newStatus };
              }
              return inv;
            }),
          }));
          return id;
        }

        set((state) => ({ receiptVouchers: [newVoucher, ...state.receiptVouchers] }));
        return id;
      },

      approveReceiptVoucher: (voucherId) => {
        const voucher = get().receiptVouchers.find((v) => v.id === voucherId);
        if (!voucher || voucher.status === 'approved') return;

        const invUpdates = new Map<string, number>();
        if (voucher.allocations) {
          for (const alloc of voucher.allocations) {
            invUpdates.set(alloc.invoiceId, (invUpdates.get(alloc.invoiceId) || 0) + alloc.amount);
          }
        }

        set((state) => ({
          receiptVouchers: state.receiptVouchers.map((v) =>
            v.id === voucherId ? { ...v, status: 'approved', approvedAt: new Date().toISOString() } : v
          ),
          invoices: state.invoices.map((inv) => {
            const allocated = invUpdates.get(inv.id);
            if (allocated) {
              const newPaid = (inv.paidAmount || 0) + allocated;
              const newRemaining = Math.max(0, inv.total - newPaid);
              const newStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
              return { ...inv, paidAmount: newPaid, remainingAmount: newRemaining, paymentStatus: newStatus };
            }
            return inv;
          }),
        }));
      },

      cancelReceiptVoucher: (voucherId) => {
        const voucher = get().receiptVouchers.find((v) => v.id === voucherId);
        if (!voucher) return;

        // Revert invoice allocations if it was approved
        const invDeductions = new Map<string, number>();
        if (voucher.status === 'approved' && voucher.allocations) {
          for (const alloc of voucher.allocations) {
            invDeductions.set(alloc.invoiceId, (invDeductions.get(alloc.invoiceId) || 0) + alloc.amount);
          }
        }

        set((state) => ({
          receiptVouchers: state.receiptVouchers.map((v) =>
            v.id === voucherId ? { ...v, status: 'cancelled' } : v
          ),
          invoices: state.invoices.map((inv) => {
            const deducted = invDeductions.get(inv.id);
            if (deducted) {
              const newPaid = Math.max(0, (inv.paidAmount || 0) - deducted);
              const newRemaining = Math.max(0, inv.total - newPaid);
              const newStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
              return { ...inv, paidAmount: newPaid, remainingAmount: newRemaining, paymentStatus: newStatus };
            }
            return inv;
          }),
        }));
      },

      // === Payment Vouchers ===
      addPaymentVoucher: (voucherData) => {
        const id = 'pv-' + Date.now();
        const newVoucher: PaymentVoucher = {
          ...voucherData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ paymentVouchers: [newVoucher, ...state.paymentVouchers] }));
        return id;
      },

      approvePaymentVoucher: (voucherId) =>
        set((state) => ({
          paymentVouchers: state.paymentVouchers.map((v) =>
            v.id === voucherId ? { ...v, status: 'approved', approvedAt: new Date().toISOString() } : v
          ),
        })),

      cancelPaymentVoucher: (voucherId) =>
        set((state) => ({
          paymentVouchers: state.paymentVouchers.map((v) =>
            v.id === voucherId ? { ...v, status: 'cancelled' } : v
          ),
        })),

      // === Accurate Customer Balance Calculation ===
      getCustomerBalance: (customerId) => {
        const statement = get().getCustomerStatement(customerId);
        return statement.closingBalance;
      },

      // === Formal Statement of Account (كشف الحساب المعتمد) ===
      getCustomerStatement: (customerId, startDate, endDate) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer) {
          return { openingBalance: 0, movements: [], totalDebit: 0, totalCredit: 0, closingBalance: 0 };
        }

        // Collect all approved raw movements
        interface RawTx {
          id: string;
          date: string;
          docType: 'opening_balance' | 'invoice' | 'receipt' | 'refund';
          docTypeLabel: string;
          docNumber: string;
          docRoute: string;
          statement: string;
          debit: number;
          credit: number;
          createdAt: string;
        }

        const rawList: RawTx[] = [];

        // 1. Initial opening balance (if set)
        if (customer.openingBalance && customer.openingBalance > 0) {
          rawList.push({
            id: 'ob-' + customer.id,
            date: customer.openingBalanceDate || '2026-01-01',
            docType: 'opening_balance',
            docTypeLabel: 'رصيد افتتاحي',
            docNumber: 'OB-001',
            docRoute: '',
            statement: 'رصيد افتتاحي مسجل',
            debit: customer.openingBalanceType === 'debit' ? customer.openingBalance : 0,
            credit: customer.openingBalanceType === 'credit' ? customer.openingBalance : 0,
            createdAt: customer.openingBalanceDate || '2026-01-01T00:00:00Z',
          });
        }

        // 2. Approved Invoices (Debit +)
        for (const inv of get().invoices) {
          if (inv.customerId === customerId && inv.documentStatus === 'approved') {
            rawList.push({
              id: inv.id,
              date: inv.date,
              docType: 'invoice',
              docTypeLabel: 'فاتورة مبيعات',
              docNumber: inv.number,
              docRoute: `/invoices/${inv.id}`,
              statement: inv.notes ? `فاتورة مبيعات - ${inv.notes}` : 'فاتورة مبيعات',
              debit: Number(inv.total) || 0,
              credit: 0,
              createdAt: inv.createdAt,
            });
          }
        }

        // 3. Approved Receipt Vouchers (Credit -)
        for (const rc of get().receiptVouchers) {
          if (rc.customerId === customerId && rc.status === 'approved') {
            rawList.push({
              id: rc.id,
              date: rc.date,
              docType: 'receipt',
              docTypeLabel: 'سند قبض',
              docNumber: rc.number,
              docRoute: `/receipt-vouchers/${rc.id}`,
              statement: rc.statement || 'سند قبض معتمد',
              debit: 0,
              credit: Number(rc.amount) || 0,
              createdAt: rc.createdAt,
            });
          }
        }

        // 4. Approved Customer Refund Payment Vouchers (Debit +)
        for (const pv of get().paymentVouchers) {
          if (pv.type === 'refund' && pv.customerId === customerId && pv.status === 'approved') {
            rawList.push({
              id: pv.id,
              date: pv.date,
              docType: 'refund',
              docTypeLabel: 'سند صرف (رد مبلغ)',
              docNumber: pv.number,
              docRoute: `/payment-vouchers/${pv.id}`,
              statement: pv.reason ? `رد مبلغ للعميل - ${pv.reason}` : 'رد مبلغ للعميل',
              debit: Number(pv.amount) || 0,
              credit: 0,
              createdAt: pv.createdAt,
            });
          }
        }

        // Sort all movements chronologically
        rawList.sort((a, b) => {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.createdAt.localeCompare(b.createdAt);
        });

        // Compute Opening Balance for the period (all transactions before startDate)
        let openingBalance = 0;
        const periodMovements: StatementMovement[] = [];
        let totalDebit = 0;
        let totalCredit = 0;

        let running = 0;

        for (const item of rawList) {
          const itemDate = item.date;
          const isBeforeStart = startDate && itemDate < startDate;
          const isAfterEnd = endDate && itemDate > endDate;

          if (isBeforeStart) {
            openingBalance += (item.debit - item.credit);
          } else if (!isAfterEnd) {
            if (periodMovements.length === 0) {
              running = openingBalance;
            }
            running += (item.debit - item.credit);
            totalDebit += item.debit;
            totalCredit += item.credit;

            periodMovements.push({
              id: item.id,
              seq: periodMovements.length + 1,
              date: item.date,
              documentType: item.docType,
              documentTypeLabel: item.docTypeLabel,
              documentNumber: item.docNumber,
              documentId: item.id,
              documentRoute: item.docRoute,
              statement: item.statement,
              debit: item.debit,
              credit: item.credit,
              runningBalance: running,
            });
          }
        }

        const closingBalance = openingBalance + totalDebit - totalCredit;

        return {
          openingBalance,
          movements: periodMovements,
          totalDebit,
          totalCredit,
          closingBalance,
        };
      },

      // === Reset / Demo Handlers ===
      resetToDemoData: () => {
        set({
          settings: DEFAULT_SETTINGS,
          user: DEFAULT_USER,
          customers: DEMO_CUSTOMERS,
          products: DEMO_PRODUCTS,
          quotations: DEMO_QUOTATIONS,
          invoices: DEMO_INVOICES,
          receiptVouchers: DEMO_RECEIPTS,
          paymentVouchers: DEMO_PAYMENTS,
        });
      },

      clearAllData: () => {
        set({
          customers: [],
          products: [],
          quotations: [],
          invoices: [],
          receiptVouchers: [],
          paymentVouchers: [],
        });
      },
    }),
    {
      name: 'zajel-alnokhba-store-v1',
    }
  )
);
