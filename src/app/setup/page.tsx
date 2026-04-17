"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Loader2, ArrowLeft, Info, Landmark, 
  Hash, ReceiptText, HelpCircle, Save, CheckSquare, Users, FileText, Phone, MapPin, Sun, Moon, LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createEntity } from '@/lib/supabase/services';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from 'next-themes';

// ===== Validation Rules =====
const RULES = {
  cr_number: {
    // السجل التجاري: 10 أرقام
    pattern: /^\d{10}$/,
    message: 'السجل التجاري يجب أن يتكون من 10 أرقام بالضبط',
  },
  tax_number: {
    // الرقم الضريبي (TIN): 15 رقماً يبدأ وينتهي بـ 3
    pattern: /^3\d{13}3$/,
    message: 'الرقم الضريبي يجب أن يتكون من 15 رقماً ويبدأ وينتهي بـ 3',
  },
  phone: {
    // هاتف سعودي: 05XXXXXXXX (10 أرقام) أو +9665XXXXXXXX
    pattern: /^(05\d{8}|(\+966|00966)5\d{8})$/,
    message: 'رقم الهاتف يجب أن يكون صيغة سعودية صحيحة (مثال: 0512345678)',
  },
};

type FieldName = 'cr_number' | 'tax_number' | 'phone';

export default function SetupPage() {
  const router = useRouter();
  const { setActiveEntity } = useStore();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newEntity, setNewEntity] = useState({ 
    name: '', 
    phone: '',
    address: '',
    tax_number: '', 
    cr_number: '' 
  });

  const validateField = (field: FieldName, value: string): string => {
    if (!value) return ''; // اختياري — فارغ = مقبول
    if (!RULES[field].pattern.test(value)) return RULES[field].message;
    return '';
  };

  const handleChange = (field: keyof typeof newEntity, value: string) => {
    setNewEntity(prev => ({ ...prev, [field]: value }));
    if (field in RULES) {
      const err = validateField(field as FieldName, value);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق النهائي قبل الإرسال
    const errors: Record<string, string> = {};
    (['cr_number', 'tax_number', 'phone'] as FieldName[]).forEach(f => {
      const err = validateField(f, newEntity[f]);
      if (err) errors[f] = err;
    });

    if (!newEntity.name.trim()) {
      errors.name = 'اسم الشركة مطلوب';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // نرسل مباشرة بدون phone (العمود غير موجود في DB بعد)
      const { data, error } = await supabase.from('entities').insert({
        name: newEntity.name.trim(),
        short_name: newEntity.name.trim().substring(0, 3),
        legal_type: 'مؤسسة فردية',
        tax_number: newEntity.tax_number || null,
        cr_number: newEntity.cr_number || null,
        address: newEntity.address || null,
        logo_url: null,
        status: 'active'
      }).select().single();

      if (error) throw error;

      setActiveEntity({ name: data.name, short: data.short_name || data.name.substring(0, 3) });
      router.push('/');
    } catch (error: any) {
      console.error('Error creating company:', error);
      alert(`حدث خطأ: ${error?.message || 'الرجاء المحاولة مرة أخرى'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Field = ({ 
    id, label, hint, icon: Icon, type = 'text', placeholder, dir: fieldDir, value, onChange, error, required = false
  }: {
    id: string; label: string; hint?: string; icon?: any; type?: string;
    placeholder?: string; dir?: string; value: string; onChange: (v: string) => void;
    error?: string; required?: boolean;
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-[#191c1e] dark:text-[#d0d0d0] flex items-center gap-1.5">
        {label}
        {!required && <span className="text-xs text-[#767683] dark:text-[#666] font-normal">(اختياري)</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute right-3.5 top-3.5 w-4 h-4 text-[#767683] dark:text-[#555] pointer-events-none" />}
        <input
          id={id}
          type={type}
          dir={fieldDir}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#e0e3e5] dark:bg-[#252525] border-0 rounded-lg ${Icon ? 'pr-10' : 'pr-4'} pl-4 py-3 text-[#191c1e] dark:text-[#e0e0e0] text-base placeholder:text-[#767683] dark:placeholder:text-[#555] focus:ring-2 focus:ring-[#000666]/20 dark:focus:ring-[#7b8fff]/30 focus:outline-none transition-all ${error ? 'ring-2 ring-red-400' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-[#767683] dark:text-[#666]">{hint}</p>}
    </div>
  );

  const sidebarItems = [
    { icon: Building2, label: 'Company Profile', active: true },
    { icon: FileText, label: 'Legal Documentation', active: false },
    { icon: Users, label: 'Team Setup', active: false },
    { icon: CheckSquare, label: 'Final Review', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0d0d0d] text-[#191c1e] dark:text-[#e8e8e8] font-sans flex" dir="rtl">
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 h-screen w-72 pt-16 pb-8 bg-[#f2f4f6] dark:bg-[#121212] z-40 border-l border-[#e0e3e5] dark:border-[#2a2a2a]">
        <div className="px-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e0e3e5] dark:bg-[#2a2a2a] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#000666] dark:text-[#7b8fff]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#000666] dark:text-[#7b8fff]">فاتورة</h2>
              <p className="text-sm text-[#585c80] dark:text-[#888]">مرحلة الإعداد</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item, i) => {
            const Icon = item.icon;
            return item.active ? (
              <div key={i} className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#1e1e1e] text-[#000666] dark:text-[#7b8fff] font-bold border-r-4 border-[#000666] dark:border-[#7b8fff] shadow-sm rounded-l-lg">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ) : (
              <div key={i} className="flex items-center gap-4 px-4 py-3 text-[#585c80] dark:text-[#555] rounded-lg opacity-50 cursor-not-allowed select-none">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="px-8 mt-auto space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full py-2.5 px-4 rounded-lg text-sm text-[#585c80] dark:text-[#888] hover:bg-[#e6e8ea] dark:hover:bg-[#1e1e1e] transition-colors flex items-center justify-center gap-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
          </button>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full py-2.5 px-4 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:mr-72 min-h-screen pb-24 pt-8 md:pt-16 px-6 md:px-16">
        
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-block px-3 py-1 bg-[#d2d4ff] dark:bg-[#2a2a4a] text-[#585c80] dark:text-[#9999ff] rounded-full text-xs font-semibold mb-4 tracking-wide">
              خطوة ١ من ٤
            </span>
            <h1 className="font-black text-4xl text-[#191c1e] mb-3 leading-tight tracking-tight">
              {t('pages_extra.setup.title')}
            </h1>
            <p className="text-[#585c80] dark:text-[#999] text-base leading-relaxed">
              البيانات اختيارية — يمكن إكمالها لاحقاً. لكن إذا أدخلتها يجب أن تكون بالصيغة الرسمية المعتمدة.
            </p>
          </div>

          <form onSubmit={handleCreateCompany}>
            {/* Card 1: Basic Info */}
            <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-[0_8px_30px_rgba(25,28,30,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8 mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#000666] dark:from-[#4a50d6] to-[#1a237e] dark:to-[#7b8fff] rounded-r-2xl"></div>
              
              <h3 className="font-bold text-lg text-[#191c1e] dark:text-[#e0e0e0] flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-[#000666] dark:text-[#7b8fff]" />
                المعلومات الأساسية
              </h3>

              <div className="space-y-5">
                <Field
                  id="name" label="اسم الشركة أو المؤسسة" required
                  placeholder="مثال: شركة التقنية المتقدمة للتجارة"
                  value={newEntity.name}
                  onChange={v => handleChange('name', v)}
                  error={fieldErrors.name}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    id="address" label="العنوان" icon={MapPin}
                    placeholder="الرياض - حي العليا"
                    value={newEntity.address}
                    onChange={v => handleChange('address', v)}
                  />
                  <Field
                    id="phone" label="رقم الهاتف" icon={Phone}
                    type="tel" dir="ltr" placeholder="0512345678"
                    value={newEntity.phone}
                    onChange={v => handleChange('phone', v)}
                    error={fieldErrors.phone}
                    hint="صيغة: 05XXXXXXXX (10 أرقام)"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Registration Data */}
            <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-[0_8px_30px_rgba(25,28,30,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#1a237e] dark:from-[#4a50d6] to-[#303f9f] dark:to-[#7b8fff] rounded-r-2xl"></div>
              
              <h3 className="font-bold text-lg text-[#191c1e] dark:text-[#e0e0e0] flex items-center gap-2 mb-6">
                <Landmark className="w-5 h-5 text-[#000666] dark:text-[#7b8fff]" />
                بيانات التسجيل الرسمية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  id="cr_number" label="السجل التجاري" icon={Hash}
                  dir="ltr" placeholder="1010XXXXXX"
                  value={newEntity.cr_number}
                  onChange={v => handleChange('cr_number', v)}
                  error={fieldErrors.cr_number}
                  hint="10 أرقام بالضبط"
                />
                <Field
                  id="tax_number" label="الرقم الضريبي (TIN)" icon={ReceiptText}
                  dir="ltr" placeholder="3XXXXXXXXXXXXX3"
                  value={newEntity.tax_number}
                  onChange={v => handleChange('tax_number', v)}
                  error={fieldErrors.tax_number}
                  hint="15 رقماً يبدأ وينتهي بـ 3"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-4">
              <button 
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-xl text-sm text-[#585c80] dark:text-[#888] hover:bg-[#e6e8ea] dark:hover:bg-[#1e1e1e] transition-colors font-medium"
              >
                تخطي الآن
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="group px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-[#000666] to-[#1a237e] shadow-[0_8px_16px_rgba(0,6,102,0.2)] hover:shadow-[0_12px_24px_rgba(0,6,102,0.3)] hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{t('pages_extra.setup.cta')}</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
