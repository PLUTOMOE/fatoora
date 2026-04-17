"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { createCustomer } from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, MapPin, ChevronDown, Phone, Mail, Check, Sparkles, Upload, Loader2, CheckCircle2, Building2 } from 'lucide-react';

function NewCustomerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillName = searchParams.get('name') || '';
  const redirectCallback = searchParams.get('callback') || '/customers';

  const initAiMode = searchParams.get('mode') === 'ai';

  const { activeEntity } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiMode, setIsAiMode] = useState(initAiMode);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: prefillName,
    type: '',
    city: '',
    phone: '',
    email: '',
    tax_number: ''
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateAiExtraction();
    }
  };

  const simulateAiExtraction = () => {
    setAiAnalysisStep(1); // scanning
    setTimeout(() => {
      setFormData({
        name: 'شركة التقنية الحديثة المشتركة',
        type: 'corporate',
        city: 'الرياض',
        phone: '0501234567',
        email: 'info@moderntech.sa',
        tax_number: '310123456700003'
      });
      setAiAnalysisStep(2); // success
      setTimeout(() => {
        setIsAiMode(false);
        setAiAnalysisStep(0);
      }, 2000);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      
      if (!ent) {
        alert('يرجى اختيار الكيان أولاً');
        setIsSubmitting(false);
        return;
      }

      await createCustomer({
        name: formData.name,
        type: formData.type === 'corporate' ? 'company' : formData.type === 'individual' ? 'individual' : 'company',
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        tax_number: formData.tax_number,
        entity_id: ent.id,
      });

      if (redirectCallback !== '/customers') {
        const customerPayload = encodeURIComponent(JSON.stringify({
          name: formData.name,
          tax_number: formData.tax_number,
          address: formData.city
        }));
        router.push(`${redirectCallback}?newCustomerData=${customerPayload}`);
      } else {
        router.push(redirectCallback + '?v=' + Date.now());
      }
      
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ العميل');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-start justify-center p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4">
      <main className="w-full max-w-3xl bg-card border border-border rounded-[1.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative overflow-hidden">
        {/* Decorative Header Blur */}
        <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent opacity-80 pointer-events-none"></div>
        
        {/* Header */}
        <header className="mb-10 relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">إضافة عميل جديد</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium pr-14 leading-relaxed">
              الرجاء إدخال بيانات العميل أو الجهة بدقة لإضافتهم إلى النظام، أو استخدم الذكاء الاصطناعي لرفع السجل المختصر.
            </p>
          </div>

          {!isAiMode && (
             <button 
                type="button" 
                onClick={() => setIsAiMode(true)}
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#7A5A1A] bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                ملء بالذكاء الاصطناعي (AI)
              </button>
          )}
        </header>

        {isAiMode ? (
          <div className="relative z-10 animate-in zoom-in-95">
            <div className="bg-muted/30 border border-border rounded-2xl p-8">
              {aiAnalysisStep === 0 && (
                <div 
                  className="border-2 border-dashed border-[#E8B96B]/50 hover:border-[#E8B96B] rounded-xl p-12 text-center cursor-pointer bg-background transition-all hover:shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,image/png,image/jpeg,image/jpg" 
                    onChange={handleFileSelect} 
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFE2A8] to-[#E8B96B] rounded-2xl flex items-center justify-center mx-auto mb-4 custom-shadow">
                    <Upload className="w-8 h-8 text-[#7A5A1A]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">ارفع السجل التجاري أو البطاقة الضريبية</h3>
                  <p className="text-sm text-muted-foreground">صورة أو PDF (الذكاء الاصطناعي سيقوم بملء كافة البيانات المتاحة أسفله)</p>
                </div>
              )}
              
              {aiAnalysisStep === 1 && (
                <div className="py-12 text-center animate-in fade-in">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">جاري قراءة المستند وتحليله...</h3>
                  <p className="text-sm text-muted-foreground mb-6">استخراج النصوص (OCR) ومطابقة الحقول بالتدريب المسبق</p>
                  
                  <div className="max-w-xs mx-auto space-y-3 text-right">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border/50">
                        <Loader2 className="w-4 h-4 animate-spin text-primary"/> قراءة البيانات الضريبية
                    </div>
                  </div>
                </div>
              )}
              
              {aiAnalysisStep === 2 && (
                <div className="py-12 text-center animate-in zoom-in">
                  <div className="w-16 h-16 bg-[#22C55E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#15803D] mb-2">تم الاستخراج والتعبئة بنجاح!</h3>
                  <p className="text-sm text-muted-foreground">دقة البيانات تصل إلى 95% برجاء مراجعتها أدناه.</p>
                </div>
              )}

              <div className="pt-6 flex justify-center">
                 <button onClick={() => setIsAiMode(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                   إلغاء الرجوع للوضع اليدوي
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8 animate-in fade-in duration-500">
            {/* Bento-style Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Width Field */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="clientName">اسم العميل أو الجهة <span className="text-red-500 text-xs">*</span></label>
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground z-30 pointer-events-none">
                     <Building2 className="w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    required
                    id="clientName" 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: شركة التقنية الحديثة المحدودة"
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px]" 
                  />
                </div>
              </div>

              {/* Half Width Fields */}
              <div className="col-span-1">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="city">المدينة <span className="text-muted-foreground/60 text-xs font-normal">(اختياري)</span></label>
                <div className="relative group">
                  <input 
                    id="city" 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="الرياض" 
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 pr-12 pl-4 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px]"
                  />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="clientType">النوع <span className="text-red-500 text-xs">*</span></label>
                <div className="relative group">
                  <select 
                    required
                    id="clientType" 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 px-4 text-foreground appearance-none focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px] cursor-pointer cursor-pointer"
                  >
                    <option value="" disabled>اختر نوع العميل</option>
                    <option value="corporate">شركة / مؤسسة</option>
                    <option value="individual">فرد</option>
                    <option value="government">جهة حكومية</option>
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>


              {/* Divider */}
              <div className="col-span-1 md:col-span-2 pt-6 pb-2">
                 <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border/50 pb-3 flex items-center gap-2">
                    معلومات إضافية للتواصل <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">تستخدم في الفواتير</span>
                 </h2>
              </div>

              {/* Contact Info */}
              <div className="col-span-1">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="phone">رقم الجوال <span className="text-muted-foreground/60 text-xs font-normal">(اختياري)</span></label>
                <div className="relative group">
                  <input 
                    id="phone" 
                    type="tel" 
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+966 50 000 0000" 
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px] text-left"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="email">البريد الإلكتروني <span className="text-muted-foreground/60 text-xs font-normal">(اختياري)</span></label>
                <div className="relative group">
                  <input 
                    id="email" 
                    type="email" 
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com" 
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px] text-left"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-foreground font-semibold text-[0.95rem] mb-2" htmlFor="tax">الرقم الضريبي <span className="text-muted-foreground/60 text-xs font-normal">(إن وُجد)</span></label>
                <div className="relative group">
                  <input 
                    id="tax" 
                    type="text" 
                    dir="ltr"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                    placeholder="310000000000003" 
                    className="w-full bg-muted/30 border border-border/50 hover:bg-muted/50 rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none text-[15px] text-left font-mono tracking-wider"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded pointer-events-none">VAT</div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-12 pt-8 border-t border-border/50">
              <button 
                onClick={() => router.back()} 
                className="px-6 py-3 rounded-xl text-muted-foreground font-semibold hover:bg-muted transition-colors duration-200" 
                type="button"
              >
                تراجع
              </button>
              <button 
                disabled={isSubmitting || !formData.name}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none" 
                type="submit"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ بيانات العميل'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground w-full flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <NewCustomerContent />
    </Suspense>
  );
}
