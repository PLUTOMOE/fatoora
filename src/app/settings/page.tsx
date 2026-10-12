"use client";

import React, { useState } from 'react';
import { 
  Settings, Building2, CreditCard, FileText, 
  Users, Save, CheckCircle2, RotateCcw, Trash2, 
  ShieldCheck, Sparkles 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ZajelLogo } from '@/components/shared/ZajelLogo';
import { UserRole } from '@/types/zajel';

export default function SettingsPage() {
  const { settings, updateSettings, user, setUserRole, resetToDemoData, clearAllData } = useZajelStore();

  const [activeTab, setActiveTab] = useState<'company' | 'banking' | 'prefixes' | 'roles' | 'data'>('company');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ ...settings });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">إعدادات النظام</h2>
          <p className="text-xs text-slate-500 mt-0.5">ضبط بيانات منشأة زاجل النخبة، الحسابات البنكية، الصلاحيات، وترقيم المستندات</p>
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
          <span>تم حفظ إعدادات النظام بنجاح!</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3.5 px-6 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'company' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>بيانات المنشأة</span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`py-3.5 px-6 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'banking' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>الحسابات البنكية وIBAN</span>
          </button>

          <button
            onClick={() => setActiveTab('prefixes')}
            className={`py-3.5 px-6 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'prefixes' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ترقيم المستندات والشروط</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3.5 px-6 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'roles' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمون والصلاحيات</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-3.5 px-6 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'data' ? 'border-[#C59A55] text-[#C59A55] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C59A55]" />
            <span>إدارة البيانات التجريبية</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          
          {/* Tab 1: Company Profile */}
          {activeTab === 'company' && (
            <div className="space-y-5 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <ZajelLogo variant="light" size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-[#202D3B]">شعار وهوية زاجل النخبة</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    اللوجو المعتمد لنظام زاجل النخبة يظهر تلقائياً في الترويسة ونماذج الطباعة A4 بدون أي تغيير في أبعاده.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المنشأة الرسمي</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي (15 رقم)</label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السجل التجاري (10 أرقام)</label>
                  <input
                    type="text"
                    value={formData.crNumber}
                    onChange={(e) => handleChange('crNumber', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">العنوان الوطني والفرع</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Banking & IBAN */}
          {activeTab === 'banking' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#202D3B] mb-1">الحساب البنكي المعتمد للطباعة</h4>
                <p className="text-slate-500 text-[11px]">
                  تظهر هذه البيانات أسفل الفواتير وعروض الأسعار لتسهيل التحويلات البنكية المباشرة من العملاء.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم البنك</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم المستفيد / صاحب الحساب</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleChange('accountHolder', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">رقم الآيبان (IBAN)</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleChange('iban', e.target.value)}
                    placeholder="SA0380000000608010167519"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-[#202D3B] outline-none focus:border-[#C59A55]"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Prefixes & Terms */}
          {activeTab === 'prefixes' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بادئة عروض الأسعار</label>
                  <input
                    type="text"
                    value={formData.prefixQuotation}
                    onChange={(e) => handleChange('prefixQuotation', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-center text-[#202D3B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بادئة الفواتير</label>
                  <input
                    type="text"
                    value={formData.prefixInvoice}
                    onChange={(e) => handleChange('prefixInvoice', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-center text-[#202D3B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بادئة سندات القبض</label>
                  <input
                    type="text"
                    value={formData.prefixReceipt}
                    onChange={(e) => handleChange('prefixReceipt', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-center text-[#202D3B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بادئة سندات الصرف</label>
                  <input
                    type="text"
                    value={formData.prefixPayment}
                    onChange={(e) => handleChange('prefixPayment', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-center text-[#202D3B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">شروط عروض الأسعار الافتراضية</label>
                <textarea
                  rows={3}
                  value={formData.quotationTerms}
                  onChange={(e) => handleChange('quotationTerms', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">شروط الفواتير الافتراضية</label>
                <textarea
                  rows={3}
                  value={formData.invoiceTerms}
                  onChange={(e) => handleChange('invoiceTerms', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Roles & Permissions (Section 14: مدير، محاسب، مستخدم عرض) */}
          {activeTab === 'roles' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#202D3B]">{user.name} ({user.title})</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">الدور النشط حالياً: {user.role === 'admin' ? 'مدير النظام' : user.role === 'accountant' ? 'محاسب' : 'مستخدم عرض'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('admin')}
                    className={`px-3 py-1.5 rounded-lg font-bold ${user.role === 'admin' ? 'bg-[#C59A55] text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    مدير
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('accountant')}
                    className={`px-3 py-1.5 rounded-lg font-bold ${user.role === 'accountant' ? 'bg-[#C59A55] text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    محاسب
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('viewer')}
                    className={`px-3 py-1.5 rounded-lg font-bold ${user.role === 'viewer' ? 'bg-[#C59A55] text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    مستخدم عرض
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-[#202D3B]">صلاحيات المدير (Admin)</div>
                  <ul className="text-slate-500 text-[11px] list-disc list-inside space-y-0.5">
                    <li>إدارة وتعديل إعدادات المنشأة</li>
                    <li>إلغاء واعتماد الفواتير والسندات</li>
                    <li>حذف وتعطيل السجلات</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-[#202D3B]">صلاحيات المحاسب (Accountant)</div>
                  <ul className="text-slate-500 text-[11px] list-disc list-inside space-y-0.5">
                    <li>إنشاء عروض الأسعار والفواتير</li>
                    <li>تسجيل سندات القبض والصرف</li>
                    <li>عرض وتصدير كشوف الحساب</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-[#202D3B]">صلاحيات مستخدم العرض (Viewer)</div>
                  <ul className="text-slate-500 text-[11px] list-disc list-inside space-y-0.5">
                    <li>الاطلاع على القوائم والجداول</li>
                    <li>طباعة النماذج والمستندات A4</li>
                    <li>تصدير كشوف الحساب PDF</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Demo Data Manager */}
          {activeTab === 'data' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <h4 className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C59A55]" />
                  <span>البيانات التجريبية المعتمدة لاختبار النظام</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  يتضمن هذا الخيار مجموعة بيانات كاملة مطابقة تماماً للمتطلبات والمعاينة:
                  (شركة الأفق: فاتورة 1 = 2,875 ر.س، سند قبض 1 = 2,000 ر.س، فاتورة 2 = 5,750 ر.س، سند قبض 2 = 3,000 ر.س، الرصيد المتبقي = 3,625 ر.س).
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetToDemoData();
                    alert('تم استعادة البيانات التجريبية المعتمدة لزاجل النخبة بنجاح!');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold shadow-md shadow-[#C59A55]/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تحميل / إعادة تعيين بيانات زاجل النخبة التجريبية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من تفريغ كافة البيانات للبدء بحساب نظيف؟')) {
                      clearAllData();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تفريغ كافة البيانات (بدء تشغيل جديد)</span>
                </button>
              </div>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
