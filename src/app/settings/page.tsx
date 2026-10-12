"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, Building2, CreditCard, FileText, 
  Users, Save, CheckCircle2, RotateCcw, Trash2, 
  ShieldCheck, Sparkles, Plus, Sun, Moon, 
  Check, AlertCircle, Building, Layers
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { UserRole, Company } from '@/types/zajel';

function SettingsContent() {
  const searchParams = useSearchParams();
  const { 
    settings, 
    updateSettings, 
    user, 
    setUserRole, 
    companies, 
    activeCompanyId, 
    setActiveCompany, 
    addCompany, 
    deleteCompany, 
    themeMode, 
    setThemeMode, 
    resetToDemoData, 
    clearAllData 
  } = useZajelStore();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'companies' | 'company' | 'banking' | 'prefixes' | 'theme' | 'roles' | 'data'>('companies');

  useEffect(() => {
    if (tabQuery && ['companies', 'company', 'banking', 'prefixes', 'theme', 'roles', 'data'].includes(tabQuery)) {
      setActiveTab(tabQuery as any);
    }
  }, [tabQuery]);

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Form states for current active company settings
  const [formData, setFormData] = useState({ ...settings });

  // Form states for adding a new company
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<Company, 'id'>>({
    name: '',
    logoUrl: '',
    phone: '',
    email: '',
    address: '',
    city: 'الرياض',
    taxNumber: '',
    crNumber: '',
    currency: 'ر.س',
    vatRate: 15,
    prefixQuotation: 'QUO-',
    prefixInvoice: 'INV-',
    prefixReceipt: 'RC-',
    prefixPayment: 'PV-',
    bankName: 'مصرف الراجحي',
    iban: '',
    accountHolder: '',
    quotationTerms: 'العرض سارٍ لمدة 15 يوماً من تاريخ الإصدار.',
    invoiceTerms: 'يرجى سداد المبلغ المستحق خلال 14 يوماً من تاريخ الفاتورة.',
  });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedNotice('تم حفظ الإعدادات بنجاح!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      alert('يرجى إدخال اسم الشركة / المنشأة');
      return;
    }
    const newId = addCompany(newCompany);
    setActiveCompany(newId);
    setShowAddCompanyModal(false);
    setSavedNotice(`تم إنشاء المنشأة «${newCompany.name}» وتفعيلها بنجاح!`);
    setTimeout(() => setSavedNotice(null), 3000);
    // Reset form
    setNewCompany({
      name: '',
      logoUrl: '',
      phone: '',
      email: '',
      address: '',
      city: 'الرياض',
      taxNumber: '',
      crNumber: '',
      currency: 'ر.س',
      vatRate: 15,
      prefixQuotation: 'QUO-',
      prefixInvoice: 'INV-',
      prefixReceipt: 'RC-',
      prefixPayment: 'PV-',
      bankName: 'مصرف الراجحي',
      iban: '',
      accountHolder: '',
      quotationTerms: 'العرض سارٍ لمدة 15 يوماً من تاريخ الإصدار.',
      invoiceTerms: 'يرجى سداد المبلغ المستحق خلال 14 يوماً من تاريخ الفاتورة.',
    });
  };

  const handleDeleteComp = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف شركة «${name}»؟`)) {
      const res = deleteCompany(id);
      if (!res.success) {
        alert(res.message);
      } else {
        setSavedNotice(`تم حذف شركة «${name}» بنجاح.`);
        setTimeout(() => setSavedNotice(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">إعدادات النظام والشركات</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة المنشآت المتعددة، المظهر، بيانات الحسابات، والصلاحيات
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-md shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-100 text-xs font-bold">
          
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'companies' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C59A55]" />
            <span>تعدد الشركات ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'company' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>بيانات الشركة الحالية</span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'banking' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>الحسابات البنكية وIBAN</span>
          </button>

          <button
            onClick={() => setActiveTab('prefixes')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'prefixes' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الترقيم والشروط</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'theme' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>المظهر (فاتح / داكن)</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'roles' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمون والصلاحيات</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-3.5 px-5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'data' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C59A55]" />
            <span>إدارة البيانات</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Tab 0: Multi-Company Management (ميزة تعدد الشركات) */}
          {activeTab === 'companies' && (
            <div className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-[#202D3B]">الشركات والمنشآت المسجلة في النظام</h3>
                  <p className="text-slate-500 mt-1">
                    يمكنك إضافة أكثر من شركة ومتابعة فواتيرها وعروض أسعارها وحساباتها المستقلة بسهولة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة شركة جديدة</span>
                </button>
              </div>

              {/* Companies Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((comp) => {
                  const isActive = comp.id === activeCompanyId;
                  return (
                    <div 
                      key={comp.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isActive 
                          ? 'border-[#C59A55] bg-amber-50/20 shadow-md ring-1 ring-[#C59A55]/30' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {comp.logoUrl ? (
                            <img src={comp.logoUrl} alt={comp.name} className="w-10 h-10 object-contain rounded-xl border border-slate-200 p-0.5 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center font-bold text-sm">
                              <Building className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-[#202D3B] flex items-center gap-2">
                              <span>{comp.name}</span>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C59A55] text-white font-bold">
                                  الشركة النشطة حالياً
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {comp.city} • {comp.phone || 'بدون هاتف'}
                            </div>
                          </div>
                        </div>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCompany(comp.id);
                              setSavedNotice(`تم التبديل إلى منشأة «${comp.name}» بنجاح!`);
                              setTimeout(() => setSavedNotice(null), 2500);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[#C59A55] text-[#C59A55] hover:bg-[#C59A55] hover:text-white font-bold text-xs transition-colors shrink-0"
                          >
                            تفعيل هذه الشركة
                          </button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div><span className="text-slate-400">الرقم الضريبي:</span> {comp.taxNumber || 'غير مسجل'}</div>
                        <div><span className="text-slate-400">السجل التجاري:</span> {comp.crNumber || 'غير مسجل'}</div>
                        <div><span className="text-slate-400">بادئة الفواتير:</span> <code className="text-[#C59A55] font-bold">{comp.prefixInvoice}</code></div>
                        <div><span className="text-slate-400">بادئة العروض:</span> <code className="text-[#C59A55] font-bold">{comp.prefixQuotation}</code></div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
                        <span className="text-slate-500">
                          {comp.bankName ? `${comp.bankName} (${comp.iban ? comp.iban.slice(-6) : ''}...)` : 'لا يوجد حساب بنكي'}
                        </span>
                        {companies.length > 1 && !comp.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComp(comp.id, comp.name)}
                            className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Company Modal */}
              {showAddCompanyModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-base text-[#202D3B]">إضافة شركة / منشأة جديدة</h3>
                      <button 
                        type="button"
                        onClick={() => setShowAddCompanyModal(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateCompany} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">اسم الشركة أو المنشأة *</label>
                          <input
                            type="text"
                            required
                            value={newCompany.name}
                            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                            placeholder="مثال: شركة النجم الساطع للخدمات"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">الرقم الضريبي</label>
                          <input
                            type="text"
                            value={newCompany.taxNumber}
                            onChange={(e) => setNewCompany({ ...newCompany, taxNumber: e.target.value })}
                            placeholder="310XXXXXXXXXXX3"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">السجل التجاري</label>
                          <input
                            type="text"
                            value={newCompany.crNumber}
                            onChange={(e) => setNewCompany({ ...newCompany, crNumber: e.target.value })}
                            placeholder="1010XXXXXX"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / الجوال</label>
                          <input
                            type="text"
                            value={newCompany.phone}
                            onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                            placeholder="05XXXXXXXX"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                          <input
                            type="email"
                            value={newCompany.email}
                            onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                            placeholder="info@company.sa"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">المدينة</label>
                          <input
                            type="text"
                            value={newCompany.city}
                            onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">العنوان</label>
                          <input
                            type="text"
                            value={newCompany.address}
                            onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                            placeholder="الشارع، الحي"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">بادئة الفواتير</label>
                          <input
                            type="text"
                            value={newCompany.prefixInvoice}
                            onChange={(e) => setNewCompany({ ...newCompany, prefixInvoice: e.target.value })}
                            placeholder="INV-"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">بادئة عروض الأسعار</label>
                          <input
                            type="text"
                            value={newCompany.prefixQuotation}
                            onChange={(e) => setNewCompany({ ...newCompany, prefixQuotation: e.target.value })}
                            placeholder="QUO-"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">اسم البنك</label>
                          <input
                            type="text"
                            value={newCompany.bankName}
                            onChange={(e) => setNewCompany({ ...newCompany, bankName: e.target.value })}
                            placeholder="مصرف الراجحي"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">رقم الآيبان (IBAN)</label>
                          <input
                            type="text"
                            value={newCompany.iban}
                            onChange={(e) => setNewCompany({ ...newCompany, iban: e.target.value })}
                            placeholder="SA0000000000000000000000"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddCompanyModal(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold"
                        >
                          إنشاء وتفعيل الشركة
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Current Company Profile */}
          {activeTab === 'company' && (
            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <ZajelLogo variant="light" size="lg" />
                <div>
                  <h3 className="font-bold text-sm text-[#202D3B]">بيانات المنشأة الحالية ({formData.name})</h3>
                  <p className="text-slate-500 text-[11px]">هذه البيانات تظهر تلقائياً على كافة نماذج الطباعة والفواتير الرسمية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المنشأة / الشركة</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رابط الشعار (Logo URL)</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم الضريبي (VAT)</label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={formData.crNumber}
                    onChange={(e) => handleChange('crNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المدينة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Tab 2: Banking & IBAN */}
          {activeTab === 'banking' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم البنك الافتراضي</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم صاحب الحساب</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleChange('accountHolder', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">رقم الآيبان (IBAN)</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleChange('iban', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Tab 3: Prefixes & Terms */}
          {activeTab === 'prefixes' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة عروض الأسعار</label>
                  <input
                    type="text"
                    value={formData.prefixQuotation}
                    onChange={(e) => handleChange('prefixQuotation', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة الفواتير</label>
                  <input
                    type="text"
                    value={formData.prefixInvoice}
                    onChange={(e) => handleChange('prefixInvoice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة سند القبض</label>
                  <input
                    type="text"
                    value={formData.prefixReceipt}
                    onChange={(e) => handleChange('prefixReceipt', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة سند الصرف</label>
                  <input
                    type="text"
                    value={formData.prefixPayment}
                    onChange={(e) => handleChange('prefixPayment', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الشروط والأحكام الافتراضية لعروض الأسعار</label>
                <textarea
                  rows={2}
                  value={formData.quotationTerms}
                  onChange={(e) => handleChange('quotationTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الشروط والأحكام الافتراضية للفواتير</label>
                <textarea
                  rows={2}
                  value={formData.invoiceTerms}
                  onChange={(e) => handleChange('invoiceTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </form>
          )}

          {/* Tab 4: Theme Mode (الوضع الفاتح / الداكن) */}
          {activeTab === 'theme' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-[#202D3B] mb-1">تحديد المظهر البصري للنظام</h4>
                <p className="text-slate-500">اختر مظهر الواجهة الأنسب لبيئة عملك اليومية.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('light');
                    setSavedNotice('تم تفعيل الوضع الفاتح بنجاح!');
                    setTimeout(() => setSavedNotice(null), 2500);
                  }}
                  className={`p-5 rounded-2xl border text-right transition-all flex items-start gap-4 ${
                    themeMode === 'light'
                      ? 'border-[#C59A55] bg-amber-50/20 ring-1 ring-[#C59A55] shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#202D3B] flex items-center gap-2">
                      <span>الوضع الفاتح (Light Mode)</span>
                      {themeMode === 'light' && <Check className="w-4 h-4 text-[#C59A55]" />}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                      واجهة ناصعة البياض بقائمة جانبية رمادية فاتحة مع لمسات ذهبية أنيقة، مريحة للعين في النهار وسريعة التصفح.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dark-sidebar');
                    setSavedNotice('تم تفعيل الوضع الداكن للقائمة الجانبية!');
                    setTimeout(() => setSavedNotice(null), 2500);
                  }}
                  className={`p-5 rounded-2xl border text-right transition-all flex items-start gap-4 ${
                    themeMode === 'dark-sidebar'
                      ? 'border-[#C59A55] bg-slate-900/10 ring-1 ring-[#C59A55] shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-[#202D3B] text-slate-100 shrink-0">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#202D3B] flex items-center gap-2">
                      <span>الوضع الداكن للقائمة الجانبية (Dark Sidebar)</span>
                      {themeMode === 'dark-sidebar' && <Check className="w-4 h-4 text-[#C59A55]" />}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                      قائمة جانبية كحلية داكنة راقية (#1E293B) مطابقة لتصميم زاجل النخبة الأصلي مع عناصر ذهبية براقة.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Roles */}
          {activeTab === 'roles' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-sm text-[#202D3B]">صلاحية المستخدم الحالي</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('admin')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${user.role === 'admin' ? 'bg-[#C59A55] text-white shadow-md' : 'bg-white border text-slate-700'}`}
                  >
                    مدير (كامل الصلاحيات)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('accountant')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${user.role === 'accountant' ? 'bg-[#C59A55] text-white shadow-md' : 'bg-white border text-slate-700'}`}
                  >
                    محاسب (إنشاء واعتماد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('viewer')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${user.role === 'viewer' ? 'bg-[#C59A55] text-white shadow-md' : 'bg-white border text-slate-700'}`}
                  >
                    مستخدم عرض (اطلاع وطباعة فقط)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Data Wipe & Clean Start */}
          {activeTab === 'data' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-[#202D3B] flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>تفريغ البيانات والبدء بحساب نظيف</span>
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  إذا كنت ترغب في استخدام النظام بشكل حقيقي، يمكنك حذف كافة الفواتير وسندات القبض والصرف والعملاء التجريبيين للبدء بسجل أبيض 100%.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('تنبيه: هل أنت متأكد من رغبتك في حذف كافة البيانات التجريبية نهائياً والبدء ببيانات نظيفة؟')) {
                        clearAllData();
                        setSavedNotice('تم تفريغ كافة البيانات التجريبية بنجاح والبدء ببيانات نظيفة!');
                        setTimeout(() => setSavedNotice(null), 3000);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف كافة البيانات التجريبية الآن</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <h4 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C59A55]" />
                  <span>تحميل البيانات التجريبية الجاهزة للمعاينة</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  يمكنك أيضاً إعادة تحميل مجموعة البيانات التجريبية المعتمدة (شركة الأفق، الفواتير، وسندات القبض المحاسبية) لأغراض الفحص والاختبار.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetToDemoData();
                      setSavedNotice('تم استعادة البيانات التجريبية المعتمدة بنجاح!');
                      setTimeout(() => setSavedNotice(null), 3000);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold transition-all shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>تحميل البيانات التجريبية القياسية</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 font-medium">جاري تحميل الإعدادات...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
