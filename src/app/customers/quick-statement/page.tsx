"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, Trash2, Printer, Download, Share2, Save, 
  FileSpreadsheet, ArrowRight, ArrowUp, ArrowDown, 
  Scale, CheckCircle2, AlertCircle, Building2, User, 
  Phone, Calendar, Edit3, History, Check, RefreshCw, 
  CreditCard, Banknote, Sparkles, FileText, ChevronRight,
  Upload, ImageIcon, Search
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { EditCompanyModal } from '@/components/shared/EditCompanyModal';
import { formatDate, tafqeetArabic, formatCurrency } from '@/lib/zajelUtils';
import { PaymentMethod, ProjectPayment, QuickProjectStatement, Company } from '@/types/zajel';

function QuickStatementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    customers, 
    addCustomer,
    settings, 
    companies,
    activeCompanyId,
    setActiveCompany,
    updateCompany,
    getActiveCompany, 
    quickStatements, 
    addQuickStatement, 
    updateQuickStatement, 
    deleteQuickStatement 
  } = useZajelStore();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(activeCompanyId || companies?.[0]?.id || '');
  const [editingModalCompany, setEditingModalCompany] = useState<Company | null>(null);

  // Success modal feedback state (kept for compatibility)
  const [saveSuccessModal, setSaveSuccessModal] = useState<{
    isOpen: boolean;
    statementNumber: string;
    customerName: string;
    projectName: string;
    totalAmount: number;
    remainingBalance: number;
    statementId: string;
  } | null>(null);

  // Sync selectedCompanyId when activeCompanyId changes
  useEffect(() => {
    if (activeCompanyId) setSelectedCompanyId(activeCompanyId);
  }, [activeCompanyId]);

  const activeCompany = (companies || []).find(c => c.id === selectedCompanyId) || getActiveCompany() || settings;
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleStatementLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (activeCompany?.id) {
        updateCompany(activeCompany.id, { logoUrl: base64 });
        setToastMessage(`تم حفظ وتحديث شعار منشأة «${activeCompany.name}» بنجاح!`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // View state: 'history' (كشوف الحساب المصدرة) | 'editor' (عمل كشف حساب جديد) | 'preview' (معاينة وطباعة)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('history');
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState<string>('');
  
  // Current active statement ID (if editing saved one)
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields: Customer Info
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerTaxNumber, setCustomerTaxNumber] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Form Fields: Project Info
  const [projectName, setProjectName] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [statementDate, setStatementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');

  // Total project amount & tax (starts completely blank)
  const [projectTotal, setProjectTotal] = useState<number | ''>('');
  const [taxType, setTaxType] = useState<'none' | 'included' | 'excluded'>('none');

  // Payments array (starts completely empty)
  const [payments, setPayments] = useState<ProjectPayment[]>([]);

  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('');

  // UI feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Intelligent project name extraction from payments if blank
  const displayProjectName = useMemo(() => {
    if (projectName && projectName.trim() && projectName.trim() !== 'بدون اسم محدد') {
      return projectName.trim();
    }
    for (const p of payments) {
      if (p.statement && p.statement.includes('مشروع')) {
        const match = p.statement.match(/(مشروع\s+[^\(\)]+)/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    return projectCode ? `مشروع عقد رقم ${projectCode}` : 'عقد توريد وتنفيذ / مشروع تعاقدي';
  }, [projectName, payments, projectCode]);

  // Company logo determination: never show Zajel for another company
  const isZajel = useMemo(() => {
    const name = (activeCompany?.name || '').toLowerCase();
    return name.includes('زاجل') || name.includes('zajel');
  }, [activeCompany?.name]);

  const hasCustomLogo = useMemo(() => {
    const url = activeCompany?.logoUrl;
    if (!url || typeof url !== 'string' || !url.trim()) return false;
    if (url.includes('logo-zajel') && !isZajel) {
      return false;
    }
    return true;
  }, [activeCompany?.logoUrl, isZajel]);

  const companyInitials = useMemo(() => {
    const raw = activeCompany?.name || 'خبراء الخليج';
    const clean = raw.replace(/^(مؤسسة|شركة|مكتب|مجموعة)\s+/, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]} ${parts[1][0]}`;
    }
    return parts[0] ? parts[0].slice(0, 2) : 'خ خ';
  }, [activeCompany?.name]);

  const currentStatement = useMemo(() => {
    return (quickStatements || []).find(s => s.id === currentId);
  }, [quickStatements, currentId]);

  const displayStatementNumber = currentStatement?.statementNumber || 'ST-PRJ-001';

  const formatIBAN = (iban?: string) => {
    if (!iban) return '';
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  // Check URL params if customer pre-selected or specific tab requested
  useEffect(() => {
    const custId = searchParams.get('customerId');
    if (custId) {
      const found = customers.find(c => c.id === custId);
      if (found) {
        setSelectedCustomerId(found.id);
        setCustomerName(found.name);
        setCustomerPhone(found.phone || '');
        setCustomerTaxNumber(found.taxNumber || '');
        setCustomerAddress(found.address || '');
      }
    }

    const editId = searchParams.get('id');
    const tabParam = searchParams.get('tab');

    if (editId) {
      const requestedTab = (tabParam as 'editor' | 'preview') || 'editor';
      loadStatement(editId, requestedTab);
    } else if (tabParam === 'editor' || tabParam === 'new') {
      setActiveTab('editor');
    } else if (tabParam === 'preview') {
      setActiveTab('preview');
    } else if (tabParam === 'history' || tabParam === 'issued') {
      setActiveTab('history');
    } else {
      // Default: If issued statements exist, open history (كشوف الحساب المصدرة)
      // If no statements exist yet, open editor (عمل كشف حساب جديد)
      if (quickStatements && quickStatements.length > 0) {
        setActiveTab('history');
      } else {
        setActiveTab('editor');
      }
    }
  }, [searchParams, customers, quickStatements?.length]);

  // Handle customer selection from existing list
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) {
      return;
    }
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone || '');
      setCustomerTaxNumber(found.taxNumber || '');
      setCustomerAddress(found.address || '');
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const baseTotal = Number(projectTotal) || 0;
    let subtotal = baseTotal;
    let taxAmount = 0;
    let totalWithTax = baseTotal;

    if (taxType === 'excluded') {
      taxAmount = Math.round(baseTotal * 0.15 * 100) / 100;
      totalWithTax = baseTotal + taxAmount;
    } else if (taxType === 'included') {
      subtotal = Math.round((baseTotal / 1.15) * 100) / 100;
      taxAmount = Math.round((baseTotal - subtotal) * 100) / 100;
      totalWithTax = baseTotal;
    } else {
      subtotal = baseTotal;
      taxAmount = 0;
      totalWithTax = baseTotal;
    }

    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const remainingBalance = totalWithTax - totalPaid;
    const paidPercentage = totalWithTax > 0 
      ? Math.min(100, Math.max(0, Math.round((totalPaid / totalWithTax) * 100))) 
      : 0;

    return {
      subtotal,
      taxAmount,
      totalWithTax,
      totalPaid,
      remainingBalance,
      paidPercentage,
    };
  }, [projectTotal, taxType, payments]);

  // Calculate Running Balance Table Rows for Statement
  const statementRows = useMemo(() => {
    // 1. Project Initial Row
    let running = calculations.totalWithTax;
    const rows = [];

    // Sort payments by date chronologically
    const sortedPayments = [...payments].sort((a, b) => {
      const d = new Date(a.date).getTime() - new Date(b.date).getTime();
      return isNaN(d) ? 0 : d;
    });

    // Initial contract row
    rows.push({
      id: 'initial-contract',
      seq: 1,
      date: startDate || statementDate,
      reference: projectCode || 'العقد الرئيسي',
      statement: projectName ? `قيمة المشروع / العقد: ${projectName}` : 'إجمالي قيمة المشروع المتفق عليها',
      paymentMethodLabel: 'قيمة تعاقدية',
      debit: calculations.totalWithTax,
      credit: 0,
      runningBalance: running,
    });

    // Payments rows
    sortedPayments.forEach((p, idx) => {
      const paymentAmount = Number(p.amount) || 0;
      running -= paymentAmount;

      let methodLabel = 'تحويل بنكي';
      if (p.paymentMethod === 'cash') methodLabel = 'نقدي';
      if (p.paymentMethod === 'card') methodLabel = 'شبكة / مدى';
      if (p.paymentMethod === 'cheque') methodLabel = 'شيك بنكي';

      rows.push({
        id: p.id,
        seq: idx + 2,
        date: p.date,
        reference: p.reference || `دفعة #${idx + 1}`,
        statement: p.statement || `دفعة مسددة من المشروع (${methodLabel})`,
        paymentMethodLabel: methodLabel,
        debit: 0,
        credit: paymentAmount,
        runningBalance: running,
      });
    });

    return rows;
  }, [calculations.totalWithTax, payments, startDate, statementDate, projectCode, projectName]);

  // Add new payment row
  const handleAddPayment = () => {
    const nextSeq = payments.length + 1;
    const remaining = calculations.remainingBalance;
    const suggestedAmount = remaining > 0 ? remaining : '';

    const newPayment: ProjectPayment = {
      id: 'p-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: (suggestedAmount === '' ? '' : suggestedAmount) as any,
      statement: `دفعة رقم ${nextSeq}`,
      paymentMethod: 'bank_transfer',
      reference: '',
      notes: '',
    };
    setPayments([...payments, newPayment]);
  };

  // Quick fill remaining balance as a final payment
  const handlePayRemaining = () => {
    if (calculations.remainingBalance <= 0) {
      alert('تم سداد كامل المبلغ المطلوب بالفعل.');
      return;
    }
    const nextSeq = payments.length + 1;
    const newPayment: ProjectPayment = {
      id: 'p-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: calculations.remainingBalance,
      statement: `سداد المتبقي كاملاً (دفعة نهائية)`,
      paymentMethod: 'bank_transfer',
      reference: '',
      notes: '',
    };
    setPayments([...payments, newPayment]);
  };

  // Update payment row
  const handleUpdatePayment = (id: string, field: keyof ProjectPayment, value: any) => {
    setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Remove payment row (freely allows removing any row, including down to 0)
  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  // Calculate aggregate stats for issued statements history
  const historyStats = useMemo(() => {
    const list = quickStatements || [];
    let totalProjects = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    list.forEach(st => {
      const tot = st.totalWithTax || st.projectTotal || 0;
      const pd = (st.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      totalProjects += tot;
      totalPaid += pd;
      totalRemaining += (tot - pd);
    });

    return {
      count: list.length,
      totalProjects,
      totalPaid,
      totalRemaining,
    };
  }, [quickStatements]);

  // Filtered issued statements
  const filteredHistory = useMemo(() => {
    const list = quickStatements || [];
    if (!historySearch.trim()) return list;
    const q = historySearch.trim().toLowerCase();
    return list.filter(st => 
      st.statementNumber?.toLowerCase().includes(q) ||
      st.customerName?.toLowerCase().includes(q) ||
      st.projectName?.toLowerCase().includes(q) ||
      st.projectCode?.toLowerCase().includes(q) ||
      st.customerPhone?.includes(q)
    );
  }, [quickStatements, historySearch]);

  // Save statement to store with robust fallbacks and seamless registration
  const handleSaveStatement = (targetView: 'history' | 'preview' = 'history') => {
    const finalCustomerName = customerName.trim() || 'عميل نقدي';
    
    // Automatically register customer in customers directory if not already there
    let linkedCustomerId = selectedCustomerId;
    if (!linkedCustomerId && customerName.trim() && customerName.trim() !== 'عميل نقدي') {
      const existing = (customers || []).find(
        (c) => c.name.trim().toLowerCase() === customerName.trim().toLowerCase()
      );
      if (existing) {
        linkedCustomerId = existing.id;
        setSelectedCustomerId(existing.id);
      } else {
        try {
          linkedCustomerId = addCustomer({
            companyId: activeCompany?.id || activeCompanyId,
            name: customerName.trim(),
            type: customerTaxNumber ? 'business' : 'individual',
            phone: customerPhone.trim() || '',
            taxNumber: customerTaxNumber.trim() || undefined,
            address: customerAddress.trim() || undefined,
            status: 'active',
            openingBalance: 0,
            openingBalanceType: 'debit',
            openingBalanceDate: statementDate,
          });
          setSelectedCustomerId(linkedCustomerId);
        } catch (e) {
          console.error('Error auto-creating customer:', e);
        }
      }
    }

    const rawTotal = Number(projectTotal);
    const calculatedSumOfPayments = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const finalProjectTotal = !isNaN(rawTotal) && rawTotal > 0 
      ? rawTotal 
      : (calculatedSumOfPayments > 0 ? calculatedSumOfPayments : 0);

    const payload = {
      companyId: activeCompany?.id,
      date: statementDate,
      customerId: linkedCustomerId || undefined,
      customerName: finalCustomerName,
      customerPhone: customerPhone.trim(),
      customerTaxNumber: customerTaxNumber.trim(),
      customerAddress: customerAddress.trim(),
      projectName: projectName.trim() || 'مشروع تعاقدي بدون اسم',
      projectCode: projectCode.trim() || undefined,
      startDate: startDate || statementDate,
      endDate: endDate || undefined,
      projectTotal: finalProjectTotal,
      taxType,
      subtotal: calculations.subtotal || finalProjectTotal,
      taxAmount: calculations.taxAmount,
      totalWithTax: calculations.totalWithTax || finalProjectTotal,
      payments,
      notes,
      terms,
    };

    let savedId = currentId;
    let savedNum = '';

    if (currentId) {
      updateQuickStatement(currentId, payload);
      const existing = (quickStatements || []).find(s => s.id === currentId);
      savedNum = existing?.statementNumber || 'ST-PRJ';
      setToastMessage(`تم تحديث كشف الحساب (${savedNum}) في كشوف الحساب المصدرة بنجاح!`);
    } else {
      savedId = addQuickStatement(payload);
      setCurrentId(savedId);
      const existingCount = quickStatements?.length || 0;
      savedNum = `ST-PRJ-${String(existingCount + 1).padStart(3, '0')}`;
      setToastMessage(`تم حفظ كشف الحساب (${savedNum}) بنجاح وإدراجه في كشوف الحساب المصدرة!`);
    }

    setRecentlySavedId(savedId);

    // Direct transition to the desired tab
    setActiveTab(targetView);
    setSaveSuccessModal(null);

    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load an existing statement from history
  const loadStatement = (id: string, initialTab: 'editor' | 'preview' = 'editor') => {
    const st = quickStatements.find(s => s.id === id);
    if (!st) return;
    setCurrentId(st.id);
    setSelectedCustomerId(st.customerId || '');
    setCustomerName(st.customerName);
    setCustomerPhone(st.customerPhone || '');
    setCustomerTaxNumber(st.customerTaxNumber || '');
    setCustomerAddress(st.customerAddress || '');
    setProjectName(st.projectName);
    setProjectCode(st.projectCode || '');
    setStatementDate(st.date);
    setStartDate(st.startDate || st.date);
    setEndDate(st.endDate || '');
    setProjectTotal(st.projectTotal);
    setTaxType(st.taxType || 'none');
    setPayments(st.payments && st.payments.length > 0 ? st.payments : []);
    setNotes(st.notes || '');
    setTerms(st.terms || '');
    if (st.companyId) {
      setSelectedCompanyId(st.companyId);
      setActiveCompany(st.companyId);
    }
    setActiveTab(initialTab);
    setToastMessage(`تم تحميل كشف الحساب: ${st.statementNumber}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to brand new statement
  const handleResetNew = () => {
    setCurrentId(null);
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerTaxNumber('');
    setCustomerAddress('');
    setProjectName('');
    setProjectCode('');
    setStatementDate(new Date().toISOString().split('T')[0]);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setProjectTotal('');
    setTaxType('none');
    setPayments([]);
    setNotes('');
    setTerms('');
    setActiveTab('editor');
    setToastMessage('تم فتح كشف حساب جديد فارغ بالكامل');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy WhatsApp summary
  const handleCopyWhatsApp = () => {
    const remainingText = calculations.remainingBalance > 0 
      ? `المتبقي المستحق: ${formatCurrency(calculations.remainingBalance)}`
      : 'الحساب خالص ومسدد بالكامل';

    const text = `*كشف حساب مشروع: ${projectName || 'مشروع تعاقدي'}*
العميل: ${customerName}
إجمالي قيمة المشروع: ${formatCurrency(calculations.totalWithTax)}
إجمالي المسدد: ${formatCurrency(calculations.totalPaid)}
${remainingText}
عدد الدفعات المسجلة: ${payments.length}
بتاريخ: ${statementDate}
صادر من: ${activeCompany.name}`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:space-y-0 print:max-w-none print:w-full print:m-0 print:p-0" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 start-1/2 -translate-x-1/2 z-50 bg-[#202D3B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-[#C59A55]/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#C59A55]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Save Success Confirmation Modal */}
      {saveSuccessModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold inline-block mb-1.5">
                {saveSuccessModal.statementNumber}
              </span>
              <h3 className="text-lg font-bold text-[#202D3B]">
                تم حفظ كشف الحساب بنجاح!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تم تسجيل كشف الحساب للعميل «{saveSuccessModal.customerName}» وحفظه في سجل كشوف المشاريع
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2 text-start font-medium">
              <div>
                <span className="text-slate-400 block text-[11px]">المشروع:</span>
                <span className="text-[#202D3B] font-bold truncate block">{saveSuccessModal.projectName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي المشروع:</span>
                <span className="text-[#202D3B] font-bold font-mono">{formatCurrency(saveSuccessModal.totalAmount)}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">الرصيد المتبقي المستحق:</span>
                <span className="font-bold font-mono text-rose-600">{formatCurrency(saveSuccessModal.remainingBalance)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSaveSuccessModal(null);
                  setActiveTab('preview');
                }}
                className="w-full py-2.5 rounded-xl bg-[#202D3B] hover:bg-[#15202B] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#C59A55]" />
                <span>معاينة كشف الحساب للطباعة (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccessModal(null);
                  router.push('/customers');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#C59A55]" />
                <span>الذهاب إلى قائمة العملاء والكشوفات</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessModal(null);
                    handleResetNew();
                  }}
                  className="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-[11px] font-bold"
                >
                  + إنشاء كشف حساب جديد
                </button>
                <button
                  type="button"
                  onClick={() => setSaveSuccessModal(null)}
                  className="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-[11px] font-bold"
                >
                  إغلاق ومتابعة التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Mode Switcher (Hidden in Print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/customers" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-[#202D3B]">
              كشوف الحساب والمشاريع
            </h1>
            {currentId && activeTab === 'editor' && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#C59A55]/15 text-[#C59A55] text-[11px] font-bold">
                تعديل: {displayStatementNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة كشوف الحساب المصدرة والبحث فيها، أو إصدار كشف حساب جديد بمبالغ ودفعات فورية
          </p>
        </div>

        {/* Tab Controls & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Main Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold gap-1">
            {/* Tab 1: كشوف الحساب المصدرة */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'history' 
                  ? 'bg-[#202D3B] text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-[#C59A55]' : ''}`} />
              <span>كشوف الحساب المصدرة</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {quickStatements?.length || 0}
              </span>
            </button>

            {/* Tab 2: عمل كشف حساب جديد */}
            <button
              type="button"
              onClick={() => {
                if (activeTab !== 'editor' && !currentId) {
                  handleResetNew();
                } else if (activeTab !== 'editor' && currentId) {
                  setActiveTab('editor');
                } else if (activeTab === 'editor' && currentId) {
                  // already in editor editing
                } else {
                  handleResetNew();
                }
              }}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'editor' 
                  ? 'bg-white text-[#202D3B] shadow-xs border border-slate-200/80 font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#C59A55]" />
              <span>{currentId ? `تعديل الكشف (${displayStatementNumber})` : 'عمل كشف حساب جديد'}</span>
            </button>

            {/* Tab 3: معاينة وطباعة الكشف (A4) */}
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'preview' 
                  ? 'bg-[#C59A55] text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-[#C59A55]'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة وطباعة A4</span>
            </button>
          </div>

          {/* Contextual Action Button */}
          {activeTab === 'editor' && (
            <button
              type="button"
              onClick={() => handleSaveStatement('history')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#202D3B] hover:bg-[#15202B] text-white text-xs font-bold shadow-xs transition-all"
              title="حفظ كشف الحساب والانتقال إلى قائمة كشوف الحساب المصدرة"
            >
              <Save className="w-3.5 h-3.5 text-[#C59A55]" />
              <span>حفظ الكشف</span>
            </button>
          )}

          {activeTab === 'history' && (
            <button
              type="button"
              onClick={handleResetNew}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ كشف جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounting Status Bar (Compact, Formal Accounting Standard, No Boxes) */}
      {activeTab === 'editor' && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shadow-2xs">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div>
              <span className="text-slate-500 text-[11px] block">إجمالي قيمة المشروع (مدين):</span>
              <span className="font-mono font-bold text-sm text-rose-600">
                {calculations.totalWithTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 text-[11px] block">إجمالي المسدد (دائن):</span>
              <span className="font-mono font-bold text-sm text-emerald-600">
                {calculations.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 text-[11px] block">صافي الرصيد المتبقي:</span>
              <span className={`font-mono font-bold text-sm ${calculations.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {calculations.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
              <span className="text-[10px] text-slate-500 ms-1 font-normal">
                ({calculations.remainingBalance > 0 ? 'مستحق على العميل' : 'خالص بالكامل'})
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            نسبة السداد: <strong className="font-mono text-[#202D3B] font-bold">%{calculations.paidPercentage}</strong>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DATA & PAYMENTS BUILDER / EDITOR (عمل كشف حساب جديد / تعديل)
         ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="space-y-6 print:hidden">

          {/* Active Editing Notice */}
          {currentId && (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">
                    أنت تقوم الآن بتعديل كشف الحساب المصدر رقم ({displayStatementNumber})
                  </p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    العميل: {customerName || 'بدون اسم'} | المشروع: {projectName || 'مشروع تعاقدي'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetNew}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs transition-colors shadow-2xs"
                >
                  إلغاء وبدء كشف جديد
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-950 transition-colors"
                >
                  العودة لكشوف الحساب المصدرة
                </button>
              </div>
            </div>
          )}

          {/* Section 0: Issuing Company & Logo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C59A55]" />
                <h2 className="text-sm font-bold text-[#202D3B]">المنشأة المصدرة لكشف الحساب</h2>
              </div>
              <span className="text-[11px] text-slate-500">
                اختر المنشأة المصدرة ليظهر اسمها وشعارها وسجلها التجاري والضريبي ورقم هاتفها في ترويسة الكشف
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Select Company Dropdown */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block">
                  اختيار المؤسسة / المنشأة:
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    setActiveCompany(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#202D3B] font-bold focus:border-[#C59A55] outline-none shadow-2xs"
                >
                  {(companies || []).map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} {comp.crNumber ? `(س.ت: ${comp.crNumber})` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingModalCompany(activeCompany as Company)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#C59A55] hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تعديل بيانات «{activeCompany.name}»</span>
                  </button>
                </div>
              </div>

              {/* Company Logo and Upload */}
              <div className="md:col-span-7 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {activeCompany.logoUrl ? (
                    <img
                      src={activeCompany.logoUrl}
                      alt={activeCompany.name}
                      className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-white p-1 shrink-0 shadow-2xs"
                    />
                  ) : activeCompany.name?.includes('زاجل') ? (
                    <ZajelLogo variant="light" size="sm" showText={false} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[#C59A55]/40 bg-amber-50/30 flex flex-col items-center justify-center text-[#C59A55] shrink-0">
                      <Building2 className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">بدون شعار</span>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xs text-[#202D3B]">{activeCompany.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {activeCompany.crNumber ? `سجل: ${activeCompany.crNumber}` : ''} {activeCompany.taxNumber ? `| ضريبة: ${activeCompany.taxNumber}` : ''}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      {activeCompany.logoUrl ? '✓ تم إدراج الشعار وسيطبع في الكشف' : '⚠️ لم يتم رفع شعار لهذه المنشأة بعد'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{activeCompany.logoUrl ? 'تغيير الشعار' : 'رفع الشعار الآن'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#C59A55]" />
                <h2 className="text-sm font-bold text-[#202D3B]">بيانات العميل</h2>
              </div>
              <span className="text-[11px] text-slate-400">
                يمكنك الاختيار من العملاء المسجلين أو كتابة بيانات العميل مباشرة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Select Existing Customer */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">اختيار عميل مسجل (اختياري)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-semibold focus:border-[#C59A55] outline-none"
                >
                  <option value="">-- عميل جديد / إدخال يدوي --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  اسم العميل أو الجهة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: شركة التطوير الحديث / أ. محمد علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-bold focus:border-[#C59A55] outline-none"
                  required
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">رقم الجوال / الهاتف</label>
                <input
                  type="text"
                  placeholder="05XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono focus:border-[#C59A55] outline-none"
                />
              </div>

              {/* Customer Tax / CR Number */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">الرقم الضريبي أو السجل (اختياري)</label>
                <input
                  type="text"
                  placeholder="300XXXXXXXXXXXX"
                  value={customerTaxNumber}
                  onChange={(e) => setCustomerTaxNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono focus:border-[#C59A55] outline-none"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Project Details & Initial Total Amount */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C59A55]" />
                <h2 className="text-sm font-bold text-[#202D3B]">تفاصيل المشروع والمبلغ الإجمالي</h2>
              </div>
              <span className="text-[11px] text-slate-400">
                المبلغ الإجمالي هو القيمة الكلية للمشروع أو العقد التي تبدأ بها المديونية
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Project Name */}
              <div className="space-y-1 lg:col-span-2">
                <label className="font-bold text-slate-700 block">
                  اسم المشروع / موضوع العقد <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: تطوير وبرمجة متجر إلكتروني متكامل / تشطيب وديكورات فيلا"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-bold focus:border-[#C59A55] outline-none"
                />
              </div>

              {/* Project Code / Reference */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">رقم العقد / المرجع</label>
                <input
                  type="text"
                  placeholder="PRJ-2026-01"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono focus:border-[#C59A55] outline-none"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">تاريخ بدء المشروع / التعاقد</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#202D3B] font-mono focus:border-[#C59A55] outline-none"
                />
              </div>

            </div>

            {/* Total Amount & Tax Box */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#C59A55]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              
              {/* Total Project Amount (المدخل الأهم) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#202D3B] flex items-center gap-1.5">
                  <span>المبلغ الإجمالي للمشروع</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={projectTotal}
                    onChange={(e) => setProjectTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#C59A55] rounded-xl px-3 py-2.5 text-base font-bold font-mono text-[#202D3B] focus:outline-none focus:ring-2 focus:ring-[#C59A55]/30"
                    placeholder="0.00"
                  />
                  <span className="absolute end-3 top-3 text-xs font-bold text-slate-400">ر.س</span>
                </div>
              </div>

              {/* Tax Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">خيارات الضريبة (VAT 15%)</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#202D3B] focus:border-[#C59A55] outline-none"
                >
                  <option value="none">بدون ضريبة / معفى (المبلغ الإجمالي صافي)</option>
                  <option value="included">المبلغ يشمل ضريبة القيمة المضافة (15%)</option>
                  <option value="excluded">المبلغ غير شامل (إضافة 15% على الإجمالي)</option>
                </select>
              </div>

              {/* Calculated Total Due */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-end">
                <span className="text-[11px] text-slate-400 block">إجمالي القيمة التعاقدية المعتمدة:</span>
                <span className="text-lg font-bold font-mono text-[#202D3B]">
                  {calculations.totalWithTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                </span>
                {taxType !== 'none' && (
                  <span className="text-[10px] text-slate-400 block">
                    (الأصل: {calculations.subtotal.toLocaleString()} + ضريبة: {calculations.taxAmount.toLocaleString()})
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Payments & Installments Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-[#202D3B]">جدول الدفعات المسددة بالتواريخ</h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  أضف كل دفعة استلمتها من العميل وتاريخها، وسيتم خصمها وحساب الرصيد المتبقي تلقائياً
                </p>
              </div>

              <div className="flex items-center gap-2">
                {calculations.remainingBalance > 0 && (
                  <button
                    type="button"
                    onClick={handlePayRemaining}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200"
                    title="إضافة دفعة بالمبلغ المتبقي كاملاً"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>سداد المتبقي كاملاً</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة دفعة جديدة</span>
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[130px]">تاريخ الدفعة</th>
                    <th className="py-2.5 px-3 min-w-[200px]">البيان / الوصف</th>
                    <th className="py-2.5 px-3 min-w-[120px]">طريقة السداد</th>
                    <th className="py-2.5 px-3 min-w-[110px]">رقم المرجع / الحوالة</th>
                    <th className="py-2.5 px-3 min-w-[130px]">مبلغ الدفعة (ر.س)</th>
                    <th className="py-2.5 px-2 w-10 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-xs text-slate-700">لم يتم تسجيل أي دفعات بعد</p>
                          <p className="text-[11px] text-slate-400 max-w-sm">
                            يمكنك إضافة دفعات المشروع عند استلامها، أو ترك الكشف لإثبات إجمالي القيمة والمبلغ المتبقي كاملاً.
                          </p>
                          <button
                            type="button"
                            onClick={handleAddPayment}
                            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة دفعة أولى الآن</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        {/* Date */}
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={p.date}
                            onChange={(e) => handleUpdatePayment(p.id, 'date', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#202D3B] focus:border-[#C59A55] outline-none"
                          />
                        </td>

                        {/* Statement / Description */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={p.statement}
                            onChange={(e) => handleUpdatePayment(p.id, 'statement', e.target.value)}
                            placeholder="مثال: دفعة أولى مقدمة عند توقيع العقد"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#202D3B] font-semibold focus:border-[#C59A55] outline-none"
                          />
                        </td>

                        {/* Payment Method */}
                        <td className="py-2 px-3">
                          <select
                            value={p.paymentMethod}
                            onChange={(e) => handleUpdatePayment(p.id, 'paymentMethod', e.target.value as PaymentMethod)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-[#202D3B] focus:border-[#C59A55] outline-none"
                          >
                            <option value="bank_transfer">تحويل بنكي</option>
                            <option value="cash">نقدي (كاش)</option>
                            <option value="card">شبكة / مدى</option>
                            <option value="cheque">شيك بنكي</option>
                          </select>
                        </td>

                        {/* Reference */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={p.reference || ''}
                            onChange={(e) => handleUpdatePayment(p.id, 'reference', e.target.value)}
                            placeholder="رقم الحوالة"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs text-[#202D3B] focus:border-[#C59A55] outline-none"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-2 px-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={p.amount}
                              onChange={(e) => handleUpdatePayment(p.id, 'amount', e.target.value === '' ? ('' as any) : Number(e.target.value))}
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-emerald-700 focus:border-[#C59A55] outline-none"
                            />
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePayment(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف هذه الدفعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Footer with Totals */}
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-start text-slate-700">
                      إجمالي الدفعات المسددة حتى تاريخه:
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 text-sm">
                      {calculations.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddPayment}
                className="flex items-center gap-2 text-xs font-bold text-[#C59A55] hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دفعة أخرى</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>معاينة كشف الحساب والطباعة</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Section 4: Notes and Terms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">ملاحظات كشف الحساب</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[#202D3B] focus:border-[#C59A55] outline-none"
                placeholder="ملاحظات تظهر أسفل كشف الحساب..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">شروط ومواعيد السداد</label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[#202D3B] focus:border-[#C59A55] outline-none"
                placeholder="شروط السداد والحساب البنكي..."
              />
            </div>
          </div>

          {/* Bottom Floating Action Bar for Easy Saving & Preview */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C59A55] flex items-center justify-center font-bold shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-[#202D3B]">
                  {customerName.trim() ? `كشف حساب: ${customerName}` : 'كشف حساب مشروع سريع (جاهز للحفظ)'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  الإجمالي: {formatCurrency(calculations.totalWithTax || Number(projectTotal) || 0)} | المسدد: {formatCurrency(calculations.totalPaid)} | المتبقي: {formatCurrency(calculations.remainingBalance)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleSaveStatement('history')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#202D3B] hover:bg-[#15202B] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#C59A55]" />
                <span>حفظ كشف الحساب (كشوف الحساب المصدرة)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveStatement('preview')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-[#C59A55]" />
                <span>حفظ ومعاينة الطباعة A4</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: PRINTABLE A4 STATEMENT PREVIEW
         ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4 print:space-y-0 print:w-full print:m-0 print:p-0">
          
          {/* Action Toolbar on Preview */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>كشوف الحساب المصدرة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C59A55]" />
                <span>تعديل بيانات الكشف والدفعات</span>
              </button>

              {/* Institution Quick Switcher on Preview */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <Building2 className="w-4 h-4 text-[#C59A55]" />
                <span className="text-slate-500 font-bold hidden sm:inline">المنشأة المصدرة:</span>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    setActiveCompany(e.target.value);
                  }}
                  className="bg-transparent font-bold text-[#202D3B] outline-none cursor-pointer py-0.5"
                >
                  {(companies || []).map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="p-1 rounded-lg hover:bg-white text-[#C59A55] transition-colors"
                  title="رفع أو تغيير شعار المنشأة مباشرة"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setEditingModalCompany(activeCompany as Company)}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-[#C59A55] transition-colors"
                  title="تعديل بيانات المنشأة بالكامل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'تم نسخ الملخص!' : 'مشاركة واتساب'}</span>
              </button>

              <button
                onClick={() => handleSaveStatement('history')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[#202D3B] hover:bg-slate-50 text-xs font-bold transition-all"
              >
                <Save className="w-3.5 h-3.5 text-[#C59A55]" />
                <span>حفظ في كشوف الحساب المصدرة</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كشف الحساب (A4)</span>
              </button>
            </div>
          </div>

          {/* Formal Printable Sheet (Executive Corporate Standard) */}
          <div className="printable-statement bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none max-w-4xl print:max-w-none print:w-full print:m-0 mx-auto">
            
            {/* Letterhead (Standard Professional Accounting Format - Clean Monochrome) */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-2.5 mb-2.5 print:pb-2 print:mb-2 gap-4">
              {/* Right / Start Column: Statement Title & Reference */}
              <div className="space-y-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-none font-sans">
                    كشف حساب
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
                    STATEMENT OF ACCOUNT
                  </p>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-1 font-medium">
                  <span>رقم الكشف: <strong className="font-mono text-slate-900 font-bold">{displayStatementNumber}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>تاريخ الإصدار: <strong className="font-mono text-slate-900 font-bold">{formatDate(statementDate)}</strong></span>
                </div>
              </div>

              {/* Left / End Column: Issuing Company Branding & Details */}
              <div className="flex flex-col items-end text-end max-w-[50%]">
                {/* Logo / Monogram */}
                {hasCustomLogo ? (
                  <div className="relative group mb-1">
                    <img 
                      src={activeCompany.logoUrl} 
                      alt={activeCompany.name} 
                      className="h-12 sm:h-14 w-auto max-w-[150px] object-contain rounded-md print:h-10" 
                    />
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-900/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1 print:hidden cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-white" />
                      <span>تغيير</span>
                    </button>
                  </div>
                ) : isZajel ? (
                  <div className="mb-1">
                    <ZajelLogo variant="light" size="sm" showText={false} />
                  </div>
                ) : (
                  <div 
                    onClick={() => logoFileInputRef.current?.click()}
                    className="w-12 h-12 rounded-lg border border-slate-300 bg-slate-100 p-1 flex flex-col items-center justify-center text-center shadow-2xs cursor-pointer group mb-1 transition-colors hover:border-slate-400"
                    title="انقر لرفع الشعار الخاص بالمنشأة"
                  >
                    <div className="text-slate-900 font-bold text-sm tracking-wider leading-none">
                      {companyInitials}
                    </div>
                  </div>
                )}

                {/* Company Details */}
                <div className="space-y-0 text-xs text-slate-700">
                  <h2 className="font-bold text-slate-950 text-sm sm:text-base leading-tight">
                    {activeCompany.name}
                  </h2>
                  <div className="text-[10.5px] text-slate-600 font-mono leading-tight">
                    {activeCompany.crNumber && (
                      <span>س.ت: <strong className="text-slate-900 font-bold">{activeCompany.crNumber}</strong></span>
                    )}
                    {activeCompany.crNumber && activeCompany.taxNumber && (
                      <span className="mx-1 text-slate-300">|</span>
                    )}
                    {activeCompany.taxNumber && (
                      <span>الرقم الضريبي: <strong className="text-slate-900 font-bold">{activeCompany.taxNumber}</strong></span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-slate-600 leading-tight">
                    {activeCompany.city && <span>{activeCompany.city}</span>}
                    {activeCompany.city && activeCompany.phone && <span className="mx-1 text-slate-300">|</span>}
                    {activeCompany.phone && <span className="font-mono">هاتف: {activeCompany.phone}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Account & Project Information Table (Standard Accounting ERP Format - No Boxes) */}
            <div className="overflow-hidden rounded-lg border border-slate-300 mb-2.5 print:mb-2 text-xs w-full">
              <table className="w-full text-right border-collapse table-fixed">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[32%]" />
                  <col className="w-[18%]" />
                  <col className="w-[32%]" />
                </colgroup>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      العميل / الطرف الثاني:
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950 text-xs sm:text-sm border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      {customerName || 'عميل نقدي'}
                    </td>
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      رقم العقد / المرجع:
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-950 truncate print:py-1 print:px-2 print:text-[11px]">
                      {projectCode || 'PRJ-2026443'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      المشروع / البيان:
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      {displayProjectName}
                    </td>
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      تاريخ بدء المشروع:
                    </td>
                    <td className="py-1.5 px-3 font-mono text-slate-800 truncate print:py-1 print:px-2 print:text-[11px]">
                      {formatDate(startDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      الرقم الضريبي للعميل:
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-950 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      {customerTaxNumber || 'غير مسجل'}
                    </td>
                    <td className="py-1.5 px-3 bg-slate-100 font-bold text-slate-800 border-e border-slate-200 truncate print:py-1 print:px-2 print:text-[11px]">
                      العملة المعتمدة:
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950 truncate print:py-1 print:px-2 print:text-[11px]">
                      ريال سعودي (SAR)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Movements & Payments Table */}
            <div className="overflow-hidden rounded-xl border border-slate-300 mb-2.5 print:mb-2 w-full">
              <table className="w-full text-right text-xs table-fixed border-collapse">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[27%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="py-2 px-1 text-center print:py-1.5 print:text-[10px]">م</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap print:py-1.5 print:text-[10px]">التاريخ</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap print:py-1.5 print:text-[10px]">رقم المرجع</th>
                    <th className="py-2 px-3 text-start print:py-1.5 print:text-[10px]">البيان والحركة</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap print:py-1.5 print:text-[10px]">مدين (ر.س)</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap print:py-1.5 print:text-[10px]">دائن (ر.س)</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap print:py-1.5 print:text-[10px]">الرصيد المتبقي (ر.س)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {statementRows.map((row) => (
                    <tr 
                      key={row.id} 
                      className={`transition-colors ${row.id === 'initial-contract' ? 'bg-slate-50/90 font-semibold' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="py-2 px-1 text-center font-mono text-slate-500 print:py-1 print:text-[10px]">
                        {row.seq}
                      </td>
                      <td className="py-2 px-1 text-center font-mono text-slate-700 whitespace-nowrap print:py-1 print:text-[10px]">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-slate-900 whitespace-nowrap print:py-1 print:text-[10px]">
                        {row.reference}
                      </td>
                      <td className="py-2 px-3 text-slate-900 print:py-1">
                        <span className="font-bold block leading-tight print:text-[10.5px]">{row.statement}</span>
                        {row.paymentMethodLabel && (
                          <span className="text-[10px] text-slate-500 block font-normal print:text-[8.5px]">
                            طريقة التعامل: {row.paymentMethodLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums print:py-1 print:text-[10.5px]">
                        {row.debit > 0 ? row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums print:py-1 print:text-[10.5px]">
                        {row.credit > 0 ? row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-slate-950 whitespace-nowrap tabular-nums print:py-1 print:text-[10.5px]">
                        {row.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr className="bg-slate-50/50 text-slate-600 text-[11px]">
                      <td colSpan={7} className="py-2 px-4 text-center font-medium print:py-1">
                        (لم تسجل دفعات مسددة بعد — كامل المبلغ مستحق كقيمة تعاقدية)
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Table Footer with Totals - Fixed Matching Columns */}
                <tfoot className="bg-slate-100 font-bold border-t-2 border-b-2 border-slate-900">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-start text-slate-950 text-xs font-bold print:py-1.5 print:text-[10.5px]">
                      إجمالي الحساب وصافي الرصيد المتبقي:
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-xs text-slate-950 whitespace-nowrap tabular-nums print:py-1.5 print:text-[10.5px]">
                      {calculations.totalWithTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[9px] font-sans font-normal">ر.س</span>
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-xs text-slate-950 whitespace-nowrap tabular-nums print:py-1.5 print:text-[10.5px]">
                      {calculations.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[9px] font-sans font-normal">ر.س</span>
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-xs sm:text-sm text-slate-950 whitespace-nowrap tabular-nums print:py-1.5 print:text-[10.5px] font-bold">
                      {calculations.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[9px] font-sans font-normal text-slate-600">ر.س</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tafqeet & Closing Balance Details */}
            <div className="bg-slate-50 p-2.5 print:p-1.5 rounded-lg border border-slate-300 flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-center print:items-center gap-2 text-xs mb-2.5 print:mb-2">
              <div>
                <span className="text-slate-500 block text-[10px] font-semibold mb-0.5 print:inline print:me-1.5">
                  إقرار وتفقيط صافي الرصيد المتبقي كتابةً:
                </span>
                <span className="font-bold text-slate-950 text-xs sm:text-sm tracking-wide">
                  « {tafqeetArabic(Math.abs(calculations.remainingBalance))} »
                </span>
                <span className="text-slate-600 me-2 ms-2 font-bold text-[10.5px]">
                  ({calculations.remainingBalance > 0 
                    ? 'مستحق على العميل لصالح المؤسسة' 
                    : calculations.remainingBalance < 0 
                    ? 'رصيد دائن لصالح العميل' 
                    : 'الحساب متوازن وخالص بالكامل'})
                </span>
              </div>

              <div className="text-start sm:text-end shrink-0 border-s sm:border-s-0 border-slate-300 ps-3 sm:ps-0 print:border-s-0 print:ps-0">
                <div className="text-[9px] text-slate-500 font-medium">تاريخ وتوقيت إصدار الكشف:</div>
                <div className="font-mono text-xs font-bold text-slate-800">{formatDate(statementDate)}</div>
              </div>
            </div>

            {/* Notes & Bank Details (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2.5 mb-2.5 print:mb-2">
              {/* Notes & Terms */}
              <div className="p-2.5 print:p-2 rounded-xl bg-slate-50/70 border border-slate-300 text-xs space-y-1 print:text-[10px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-0.5 border-b border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <span>ملاحظات وشروط السداد:</span>
                </div>
                <p className="text-slate-700 leading-snug">
                  <strong className="text-slate-900 font-bold">ملاحظات: </strong>
                  {notes || 'كشف حساب مشروع مستقل يوضح الدفعات المستلمة والمبلغ المتبقي.'}
                </p>
                <p className="text-slate-700 leading-snug">
                  <strong className="text-slate-900 font-bold">شروط السداد: </strong>
                  {terms || 'يرجى سداد الدفعة المتبقية فور استكمال مراحل العمل المتفق عليها.'}
                </p>
              </div>

              {/* Official Bank Account for Wire Transfer */}
              <div className="p-2.5 print:p-2 rounded-xl bg-slate-50/70 border border-slate-300 text-xs space-y-1 print:text-[10px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-0.5 border-b border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>بيانات التحويل البنكي المعتمد:</span>
                </div>
                <div className="space-y-0.5 text-[10.5px] text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">المصرف المعتمد:</span>
                    <strong className="text-slate-900">{activeCompany.bankName || 'مصرف الراجحي'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">اسم المستفيد:</span>
                    <strong className="text-slate-900">{activeCompany.accountHolder || activeCompany.name}</strong>
                  </div>
                  {activeCompany.iban && (
                    <div className="pt-0.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-slate-500 text-[9.5px]">IBAN:</span>
                      <div className="font-mono font-bold text-[10px] text-slate-950 bg-white px-1.5 py-0.5 rounded border border-slate-300 tracking-wider" dir="ltr">
                        {formatIBAN(activeCompany.iban)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Executive Authentication & Signatures Block */}
            <div className="grid grid-cols-2 gap-6 text-center text-xs pt-2.5 print:pt-1.5 border-t-2 border-slate-300 print:break-inside-avoid">
              {/* First Party (Contractor) */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-slate-950 text-xs print:text-[11px]">
                  المسؤول المالي / اعتماد المنشأة
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">
                  {activeCompany.name}
                </div>

                {/* Circular Stamp Space */}
                <div className="my-1 w-14 h-14 print:w-11 print:h-11 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-300 gap-0.5 bg-slate-50/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[7px] font-bold text-slate-400">[ الختم الرسمي ]</span>
                </div>

                <div className="w-36 border-b border-slate-400 mb-0.5" />
                <div className="text-[9px] text-slate-500 font-medium">التوقيع والاعتماد الرسمي</div>
              </div>

              {/* Second Party (Customer) */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-slate-950 text-xs print:text-[11px]">
                  مصادقة واعتماد العميل (الطرف الثاني)
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">
                  {customerName || 'المفوض بالاعتماد'}
                </div>

                {/* Circular Stamp Space */}
                <div className="my-1 w-14 h-14 print:w-11 print:h-11 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-300 gap-0.5 bg-slate-50/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[7px] font-bold text-slate-400">[ ختم العميل ]</span>
                </div>

                <div className="w-36 border-b border-slate-400 mb-0.5" />
                <div className="text-[9px] text-slate-500 font-medium">اسم وتوقيع المفوض بالاستلام</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 1 (PRIMARY): ISSUED STATEMENTS (كشوف الحساب المصدرة)
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4 print:hidden">

          {/* Recently Saved Statement Banner */}
          {recentlySavedId && (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">
                    تم حفظ كشف الحساب بنجاح وإدراجه ضمن كشوف الحساب المصدرة!
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">
                    يمكنك الآن معاينة كشف الحساب وطباعته A4 أو مشاركة ملخصه السريع عبر واتساب
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => loadStatement(recentlySavedId, 'preview')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#202D3B] text-white text-xs font-bold hover:bg-[#15202B] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C59A55]" />
                  <span>معاينة وطباعة A4</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetNew}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  + عمل كشف جديد
                </button>
                <button
                  type="button"
                  onClick={() => setRecentlySavedId(null)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800 text-xs"
                  title="إغلاق التنبيه"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Financial Summary Ribbon for Issued Statements */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">الكشوف المصدرة:</span>
              <span className="font-mono font-bold text-base text-[#202D3B]">
                {historyStats.count} <span className="text-xs font-normal text-slate-500">كشف</span>
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">إجمالي المشاريع (مدين):</span>
              <span className="font-mono font-bold text-base text-rose-600">
                {formatCurrency(historyStats.totalProjects)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">إجمالي المسدد (دائن):</span>
              <span className="font-mono font-bold text-base text-emerald-600">
                {formatCurrency(historyStats.totalPaid)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-[11px] block">إجمالي المتبقي المستحق:</span>
              <span className={`font-mono font-bold text-base ${historyStats.totalRemaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatCurrency(historyStats.totalRemaining)}
              </span>
            </div>
          </div>

          {/* Search & Actions Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="البحث برقم الكشف، اسم العميل، الهاتف، أو اسم المشروع..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-10 pe-8 py-2 text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute end-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202D3B] hover:bg-[#15202B] text-white text-xs font-bold transition-all shadow-xs self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4 text-[#C59A55]" />
              <span>عمل كشف حساب جديد</span>
            </button>
          </div>

          {/* Issued Statements Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {!quickStatements || quickStatements.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#202D3B]">لا توجد كشوف حساب مشاريع مصدرة حتى الآن</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  يمكنك البدء بعمل كشف حساب جديد بالمبلغ الإجمالي والدفعات وتواريخها، وسيتم حفظه تلقائياً هنا في كشوف الحساب المصدرة
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] text-white text-xs font-bold hover:bg-[#B38944] transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>عمل أول كشف حساب الآن</span>
                  </button>
                </div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-14 space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">لا توجد كشوف حساب مطابقة لبحثك «{historySearch}»</p>
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="text-xs text-[#C59A55] font-bold hover:underline"
                >
                  مسح كلمة البحث وعرض كل الكشوف المصدرة
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">رقم الكشف</th>
                      <th className="py-3 px-3">تاريخ الإصدار</th>
                      <th className="py-3 px-4">اسم العميل</th>
                      <th className="py-3 px-4">المشروع / العقد</th>
                      <th className="py-3 px-3">المنشأة المصدرة</th>
                      <th className="py-3 px-3 text-center">إجمالي المشروع</th>
                      <th className="py-3 px-3 text-center">المسدد</th>
                      <th className="py-3 px-3 text-center">المتبقي</th>
                      <th className="py-3 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((st) => {
                      const totalAmount = st.totalWithTax || st.projectTotal || 0;
                      const paidAmount = (st.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                      const remainingAmount = totalAmount - paidAmount;
                      const isRecentlySaved = st.id === recentlySavedId;
                      const issuingComp = (companies || []).find(c => c.id === st.companyId) || activeCompany;

                      return (
                        <tr 
                          key={st.id} 
                          className={`transition-colors ${
                            isRecentlySaved 
                              ? 'bg-emerald-50/70 border-s-4 border-emerald-500' 
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-[#C59A55]">
                            <button
                              type="button"
                              onClick={() => loadStatement(st.id, 'preview')}
                              className="hover:underline flex items-center gap-1.5"
                              title="معاينة وطباعة كشف الحساب"
                            >
                              <span>{st.statementNumber}</span>
                              {isRecentlySaved && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                  جديد
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-600">
                            {formatDate(st.date)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#202D3B]">
                            <span>{st.customerName}</span>
                            {st.customerPhone && (
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">
                                {st.customerPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium block">{st.projectName || '-'}</span>
                            {st.projectCode && (
                              <span className="text-[10px] font-mono text-slate-400">مرجع: {st.projectCode}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                            {issuingComp?.name || '-'}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-600">
                            {formatCurrency(totalAmount)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-600">
                            {formatCurrency(paidAmount)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              remainingAmount <= 0 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {formatCurrency(remainingAmount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Preview & Print A4 */}
                              <button
                                type="button"
                                onClick={() => loadStatement(st.id, 'preview')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C59A55]/10 hover:bg-[#C59A55] text-[#C59A55] hover:text-white font-bold text-[11px] transition-colors"
                                title="معاينة وطباعة كشف الحساب A4"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>معاينة وطباعة</span>
                              </button>

                              {/* Edit Statement */}
                              <button
                                type="button"
                                onClick={() => loadStatement(st.id, 'editor')}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#202D3B] hover:bg-slate-100 transition-colors"
                                title="تعديل بيانات الكشف والدفعات"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp Share */}
                              <button
                                type="button"
                                onClick={() => {
                                  loadStatement(st.id, 'editor');
                                  handleCopyWhatsApp();
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="نسخ ملخص كشف الحساب للواتساب"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Statement */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف كشف الحساب (${st.statementNumber}) نهائياً؟`)) {
                                    deleteQuickStatement(st.id);
                                    if (recentlySavedId === st.id) setRecentlySavedId(null);
                                    setToastMessage(`تم حذف كشف الحساب (${st.statementNumber}) بنجاح`);
                                    setTimeout(() => setToastMessage(null), 3000);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="حذف كشف الحساب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Hidden universal file input for logo uploads from Editor or Preview */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleStatementLogoUpload}
        className="hidden"
      />

      {/* Edit Company Modal */}
      {editingModalCompany && (
        <EditCompanyModal
          isOpen={!!editingModalCompany}
          company={editingModalCompany}
          onClose={() => setEditingModalCompany(null)}
          onSuccess={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />
      )}

    </div>
  );
}

export default function QuickStatementPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">جاري تحميل كشف الحساب...</div>}>
      <QuickStatementContent />
    </Suspense>
  );
}
