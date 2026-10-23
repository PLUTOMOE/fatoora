"use client";

import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, Plus, X, 
  ArrowRightLeft, Sparkles, Building, Phone, 
  MapPin, Hash, ShieldCheck, Edit3 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { Company } from '@/types/zajel';
import { EditCompanyModal } from './EditCompanyModal';

interface CompanySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySwitcherModal({ isOpen, onClose }: CompanySwitcherModalProps) {
  const { companies, activeCompanyId, setActiveCompany, addCompany } = useZajelStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTaxNumber, setNewTaxNumber] = useState('');
  const [newCity, setNewCity] = useState('الرياض');
  const [newPhone, setNewPhone] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const [switchSuccess, setSwitchSuccess] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  if (!isOpen) return null;

  const handleSelect = (companyId: string, companyName: string) => {
    setActiveCompany(companyId);
    setSwitchSuccess(`تم التبديل بنجاح إلى: ${companyName}`);
    setTimeout(() => {
      setSwitchSuccess(null);
      onClose();
    }, 900);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      alert('يرجى إدخال اسم الشركة أو المنشأة');
      return;
    }

    const prefix = newPrefix.trim() 
      ? (newPrefix.endsWith('-') ? newPrefix : `${newPrefix}-`)
      : `${newCompanyName.substring(0, 3).toUpperCase()}-`;

    const newComp: Omit<Company, 'id'> = {
      name: newCompanyName.trim(),
      city: newCity.trim() || 'الرياض',
      taxNumber: newTaxNumber.trim() || '',
      crNumber: '',
      phone: newPhone.trim() || '',
      email: '',
      address: '',
      currency: 'ر.س',
      vatRate: 15,
      prefixInvoice: `${prefix}INV-`,
      prefixQuotation: `${prefix}QUO-`,
      prefixReceipt: `${prefix}RC-`,
      prefixPayment: `${prefix}PV-`,
      bankName: 'مصرف الراجحي',
      iban: '',
      accountHolder: newCompanyName.trim(),
      quotationTerms: 'العرض سارٍ لمدة 15 يوماً من تاريخ الإصدار.',
      invoiceTerms: 'يرجى سداد المبلغ المستحق خلال 14 يوماً من تاريخ الفاتورة.',
      isDefault: false,
    };

    const newId = addCompany(newComp);
    setActiveCompany(newId);
    setSwitchSuccess(`تمت إضافة وتفعيل المنشأة «${newCompanyName}» بنجاح!`);
    
    // Reset form
    setNewCompanyName('');
    setNewTaxNumber('');
    setNewPhone('');
    setNewPrefix('');
    setIsAddingNew(false);

    setTimeout(() => {
      setSwitchSuccess(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C59A55]/15 text-[#C59A55] flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#202D3B]">التبديل بين الشركات والمنشآت</h3>
              <p className="text-xs text-slate-500 mt-0.5">اختر المنشأة التي ترغب في العمل عليها وإصدار مستنداتها</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {switchSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{switchSuccess}</span>
          </div>
        )}

        {/* Existing Companies List */}
        {!isAddingNew ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">الشركات المتاحة ({companies.length})</span>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة شركة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {companies.map((comp) => {
                const isSelected = comp.id === activeCompanyId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => handleSelect(comp.id, comp.name)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-right ${
                      isSelected
                        ? 'border-[#C59A55] bg-amber-50/40 shadow-sm ring-1 ring-[#C59A55]'
                        : 'border-slate-200 bg-white hover:border-[#C59A55]/50 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 truncate">
                      {comp.logoUrl ? (
                        <img 
                          src={comp.logoUrl} 
                          alt={comp.name} 
                          className="w-11 h-11 object-contain rounded-xl border border-slate-200 p-0.5 bg-white shrink-0" 
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#C59A55] text-white font-bold' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Building className="w-5 h-5" />
                        </div>
                      )}

                      <div className="truncate">
                        <div className="font-bold text-sm text-[#202D3B] flex items-center gap-2">
                          <span className="truncate">{comp.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                              النشطة حالياً
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {comp.city && <span>📍 {comp.city}</span>}
                          {comp.phone && <span>📞 {comp.phone}</span>}
                          {comp.taxNumber && <span>ضريبة: {comp.taxNumber}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCompany(comp);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#C59A55] hover:bg-[#C59A55]/10 border border-slate-200 transition-colors"
                        title="تعديل بيانات المؤسسة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#C59A55] text-slate-600 hover:text-[#C59A55] text-xs font-semibold bg-white transition-all"
                        >
                          اختيار
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Inline Quick Add Form */
          <form onSubmit={handleCreateNew} className="space-y-4 text-xs animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C59A55]" />
                <span>إضافة شركة أو منشأة جديدة بسرعة</span>
              </h4>
              <p className="text-[11px] mt-0.5 text-amber-800">
                أدخل اسم المنشأة والبيانات الأساسية وسيتم تفعيلها فوراً لإنشاء فواتيرها وعروض أسعارها.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الشركة أو المؤسسة *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="مثال: شركة الرواد الدولية للمقاولات"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C59A55]/30 focus:border-[#C59A55] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المدينة</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="الرياض، جدة، الدمام..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم الضريبي (اختياري)</label>
                  <input
                    type="text"
                    value={newTaxNumber}
                    onChange={(e) => setNewTaxNumber(e.target.value)}
                    placeholder="310XXXXXXXXXXX3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بادئة الترقيم (اختياري)</label>
                  <input
                    type="text"
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    placeholder="مثال: RWD-"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
              >
                رجوع للقائمة
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white font-bold shadow-md shadow-[#C59A55]/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>حفظ وتفعيل الشركة الآن</span>
              </button>
            </div>
          </form>
        )}

        {/* Edit Company Modal */}
        <EditCompanyModal
          isOpen={!!editingCompany}
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSuccess={(msg) => {
            setSwitchSuccess(msg);
            setTimeout(() => setSwitchSuccess(null), 3000);
          }}
        />
      </div>
    </div>
  );
}
