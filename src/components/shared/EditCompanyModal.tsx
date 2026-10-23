"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, X, Sparkles, Building, Phone, 
  MapPin, Hash, CheckCircle2, CreditCard, FileText, 
  ImageIcon, Upload, Layers, Trash2 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { Company } from '@/types/zajel';

interface EditCompanyModalProps {
  isOpen: boolean;
  company: Company | null;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function EditCompanyModal({ isOpen, company, onClose, onSuccess }: EditCompanyModalProps) {
  const { updateCompany, activeCompanyId } = useZajelStore();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'contact' | 'banking' | 'invoicing'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        logoUrl: company.logoUrl || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || 'الرياض',
        taxNumber: company.taxNumber || '',
        crNumber: company.crNumber || '',
        currency: company.currency || 'ر.س',
        vatRate: company.vatRate ?? 15,
        prefixQuotation: company.prefixQuotation || 'QUO-',
        prefixInvoice: company.prefixInvoice || 'INV-',
        prefixReceipt: company.prefixReceipt || 'RC-',
        prefixPayment: company.prefixPayment || 'PV-',
        bankName: company.bankName || 'مصرف الراجحي',
        iban: company.iban || '',
        accountHolder: company.accountHolder || '',
        quotationTerms: company.quotationTerms || '',
        invoiceTerms: company.invoiceTerms || '',
      });
      setActiveSubTab('general');
      setSaveSuccess(false);
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Company, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('يرجى إدخال اسم المؤسسة أو الشركة');
      return;
    }

    updateCompany(company.id, formData);
    setSaveSuccess(true);

    if (onSuccess) {
      onSuccess(`تم تحديث بيانات «${formData.name}» بنجاح!`);
    }

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#202D3B]">
                تعديل بيانات المؤسسة / المنشأة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعديل السجل، الرقم الضريبي، الحسابات، وبادئات الفواتير لمنشأة: <strong className="text-[#C59A55]">{company.name}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">تم حفظ وتحديث بيانات المؤسسة بنجاح!</span>
          </div>
        )}

        {/* Sub-tabs for clean organization */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'general' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>البيانات الرسمية والشعار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('contact')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'contact' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>التواصل والعنوان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('banking')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'banking' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>الحساب البنكي والآيبان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invoicing')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'invoicing' ? 'bg-white text-[#202D3B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>بادئات الترقيم والشروط</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* TAB 1: General Info */}
          {activeSubTab === 'general' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  اسم المؤسسة / الشركة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="مثال: مؤسسة النخبة التجارية"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-[#202D3B] focus:ring-2 focus:ring-[#C59A55]/30 focus:border-[#C59A55] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={formData.crNumber || ''}
                    onChange={(e) => handleChange('crNumber', e.target.value)}
                    placeholder="1010XXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم الضريبي (VAT)</label>
                  <input
                    type="text"
                    value={formData.taxNumber || ''}
                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                    placeholder="310XXXXXXXXXXX3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">شعار المؤسسة (Logo)</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  {formData.logoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs shadow-md transition-transform hover:scale-110"
                        title="إزالة الشعار"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white shrink-0">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-[10px]">بدون شعار</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 text-right w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>اختيار صورة الشعار من جهازك</span>
                      </button>

                      {formData.logoUrl && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم تحديد الشعار</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 shrink-0">أو رابط إنترنت:</span>
                      <input
                        type="text"
                        value={formData.logoUrl || ''}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                        placeholder="https://... أو /logo.png"
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-[#C59A55] bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      يظهر الشعار في أعلى كشوفات الحساب والفواتير وعروض الأسعار الرسمية.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contact & Address */}
          {activeSubTab === 'contact' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="info@company.sa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المدينة</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="الرياض، جدة، الدمام..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">العنوان الوطني / الحي والشارع</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="طريق الملك فهد، حي الصحافة"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Banking */}
          {activeSubTab === 'banking' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم البنك</label>
                  <input
                    type="text"
                    value={formData.bankName || ''}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="مصرف الراجحي / البنك الأهلي..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم صاحب الحساب البنكي</label>
                  <input
                    type="text"
                    value={formData.accountHolder || ''}
                    onChange={(e) => handleChange('accountHolder', e.target.value)}
                    placeholder="مؤسسة ... التجارية"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الآيبان البنكي (IBAN)</label>
                <input
                  type="text"
                  value={formData.iban || ''}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  placeholder="SA0380000000XXXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-[#202D3B] focus:border-[#C59A55] outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يُطبع رقم الآيبان والبنك أسفل الفواتير وعروض الأسعار وكشوفات الحساب
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: Invoicing & Prefixes */}
          {activeSubTab === 'invoicing' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة الفاتورة</label>
                  <input
                    type="text"
                    value={formData.prefixInvoice || ''}
                    onChange={(e) => handleChange('prefixInvoice', e.target.value)}
                    placeholder="INV-"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#C59A55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة عرض السعر</label>
                  <input
                    type="text"
                    value={formData.prefixQuotation || ''}
                    onChange={(e) => handleChange('prefixQuotation', e.target.value)}
                    placeholder="QUO-"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#C59A55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة سند القبض</label>
                  <input
                    type="text"
                    value={formData.prefixReceipt || ''}
                    onChange={(e) => handleChange('prefixReceipt', e.target.value)}
                    placeholder="RC-"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#C59A55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة سند الصرف</label>
                  <input
                    type="text"
                    value={formData.prefixPayment || ''}
                    onChange={(e) => handleChange('prefixPayment', e.target.value)}
                    placeholder="PV-"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#C59A55] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شروط الفاتورة الافتراضية</label>
                <textarea
                  rows={2}
                  value={formData.invoiceTerms || ''}
                  onChange={(e) => handleChange('invoiceTerms', e.target.value)}
                  placeholder="يرجى سداد المبلغ المستحق خلال 14 يوماً..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شروط عروض الأسعار الافتراضية</label>
                <textarea
                  rows={2}
                  value={formData.quotationTerms || ''}
                  onChange={(e) => handleChange('quotationTerms', e.target.value)}
                  placeholder="العرض سارٍ لمدة 15 يوماً من تاريخ الإصدار..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#C59A55]"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              {company.id === activeCompanyId && '⭐ هذه المنشأة هي النشطة حالياً'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold shadow-md shadow-[#C59A55]/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
