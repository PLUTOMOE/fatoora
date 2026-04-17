"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Sparkles, Edit, CheckCircle2, Check, Loader2, Zap, Shield, FileImage, FileType, AlertCircle, Receipt, ScrollText } from 'lucide-react';
import { Field } from '@/components/ui/Field';

export default function AIReader() {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0); // 0 to 4
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep(2);
    }
  };

  // Auto-progress simulation for step 2
  React.useEffect(() => {
    if (step === 2) {
      setSubStep(0);
      const timer1 = setTimeout(() => setSubStep(1), 1000); // OCR done, AI parsing loading
      const timer2 = setTimeout(() => setSubStep(2), 2500); // AI done, structuring loading
      const timer3 = setTimeout(() => setSubStep(3), 4000); // structuring done, preview loading
      const timer4 = setTimeout(() => {
        setSubStep(4);
        setStep(3); // Auto move to results
      }, 5000);

      return () => {
        clearTimeout(timer1); clearTimeout(timer2);
        clearTimeout(timer3); clearTimeout(timer4);
      };
    }
  }, [step]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[24px] font-semibold text-foreground tracking-tight">قراءة العروض الخارجية</h1>
            <span className="text-[10px] bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] text-[#7A5A1A] px-1.5 py-0.5 rounded font-bold">AI</span>
          </div>
          <p className="text-[13px] text-muted-foreground">حوّل أي عرض سعر خارجي (PDF أو صورة) إلى عرض/فاتورة في نظامك</p>
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-[12px]">
          <div className="text-[10px] text-muted-foreground/80 mb-0.5">الاستخدام الشهري</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">12 / 50</span>
            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#A88732] to-[#D4AC4A]" style={{ width: '24%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          {[
            { n: 1, label: 'رفع الملف', icon: Upload },
            { n: 2, label: 'تحليل بالـ AI', icon: Sparkles },
            { n: 3, label: 'مراجعة وتعديل', icon: Edit },
            { n: 4, label: 'حفظ النتيجة', icon: CheckCircle2 }
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2.5 flex-1">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  step >= s.n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/80'
                }`}>
                  {step > s.n ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] text-muted-foreground/80">الخطوة {s.n}</div>
                  <div className={`text-[12px] font-medium ${step >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-px ${step > s.n ? 'bg-primary' : 'bg-border'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden animate-fadeIn">
          <div className="p-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FFE2A8] to-[#E8B96B] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-[#7A5A1A]" />
              </div>
              <h2 className="text-[18px] font-semibold text-foreground mb-2">ارفع عرض السعر</h2>
              <p className="text-[13px] text-muted-foreground mb-6">يدعم PDF أو صور - حد أقصى 10MB</p>
              
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border hover:border-[#1A1A1A] rounded-lg p-10 cursor-pointer bg-background hover:bg-card transition-colors">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,image/png,image/jpeg,image/jpg" 
                  onChange={handleFileSelect} 
                />
                <Upload className="w-10 h-10 text-muted-foreground/80 mx-auto mb-3" />
                <div className="text-[14px] font-medium text-foreground mb-1">اضغط أو اسحب الملف هنا</div>
                <div className="text-[11px] text-muted-foreground/80">PDF, JPG, PNG حتى 10MB</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border bg-background px-8 py-5">
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <FeatureMini icon={Zap} title="استخراج فوري" desc="نتائج في أقل من 10 ثواني" />
              <FeatureMini icon={Shield} title="آمن 100%" desc="ملفاتك مشفّرة وخاصة" />
              <FeatureMini icon={CheckCircle2} title="دقة عالية" desc="مدعوم بـ Claude AI" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center animate-fadeIn">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
          </div>
          <h2 className="text-[16px] font-semibold text-foreground mb-2">جاري تحليل الملف...</h2>
          <p className="text-[13px] text-muted-foreground mb-8">الذكاء الاصطناعي يستخرج البيانات الآن</p>
          
          <div className="max-w-md mx-auto space-y-2 text-right">
            <ProcessStep label="استخراج النص من الملف (OCR)" done={subStep >= 1} loading={subStep === 0} />
            <ProcessStep label="تحليل البيانات بالـ Claude AI" done={subStep >= 2} loading={subStep === 1} />
            <ProcessStep label="هيكلة البيانات في صيغة منظمة" done={subStep >= 3} loading={subStep === 2} />
            <ProcessStep label="مراجعة الجودة والدقة" done={subStep >= 4} loading={subStep === 3} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#F0FAF4] border border-[#22C55E]/20 rounded-lg p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22C55E] rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[#15803D]">تم استخراج البيانات بنجاح</div>
              <div className="text-[12px] text-[#15803D]/80 mt-0.5">دقة الاستخراج: <span className="font-bold">94%</span> · 3 بنود تم استخراجها · راجع البيانات قبل الحفظ</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <FileImage className="w-3.5 h-3.5" />
                  <span>الملف الأصلي</span>
                </div>
                <button className="text-[11px] text-[#5B5BD6] hover:underline">تحميل</button>
              </div>
              <div className="p-4">
                <div className="bg-background border border-border rounded aspect-[3/4] flex items-center justify-center text-muted-foreground/80">
                  <div className="text-center">
                    <FileType className="w-10 h-10 mx-auto mb-2" />
                    <div className="text-[12px] font-medium text-foreground">عرض_سعر_التميز.pdf</div>
                    <div className="text-[11px] mt-0.5">2.4 MB · صفحة 1 من 1</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#A88732]" />
                  <span>البيانات المستخرجة</span>
                </div>
                <span className="text-[10px] bg-[#F0FAF4] text-[#15803D] px-1.5 py-0.5 rounded font-medium">قابل للتعديل</span>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="الشركة المُصدِرة">
                    <div className="bg-background border border-border rounded h-9 px-3 text-[12px] flex items-center text-foreground">شركة التميز للأنظمة</div>
                  </Field>
                  <Field label="رقم العرض">
                    <div className="bg-background border border-border rounded h-9 px-3 text-[12px] flex items-center font-mono text-foreground">QO-2026-1234</div>
                  </Field>
                  <Field label="التاريخ">
                    <div className="bg-background border border-border rounded h-9 px-3 text-[12px] flex items-center text-foreground">2026-04-15</div>
                  </Field>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-muted-foreground mb-2">البنود المستخرجة (3 بنود)</div>
                  <div className="border border-border rounded overflow-hidden">
                    <div className="overflow-x-auto overflow-y-hidden">
<table className="w-full text-[12px]">
                      <thead className="bg-background border-b border-border text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                        <tr>
                          <th className="text-right font-medium px-3 py-2">الصنف</th>
                          <th className="text-center font-medium px-3 py-2 w-16">الكمية</th>
                          <th className="text-center font-medium px-3 py-2 w-20">السعر</th>
                          <th className="text-left font-medium px-3 py-2 w-24">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="px-3 py-2.5">شاشة سامسونج 55 بوصة</td>
                          <td className="px-3 py-2.5 text-center tabular-nums">5</td>
                          <td className="px-3 py-2.5 text-center tabular-nums">2,800</td>
                          <td className="px-3 py-2.5 text-left tabular-nums font-medium">14,000</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="px-3 py-2.5">حامل تثبيت جداري</td>
                          <td className="px-3 py-2.5 text-center tabular-nums">5</td>
                          <td className="px-3 py-2.5 text-center tabular-nums">350</td>
                          <td className="px-3 py-2.5 text-left tabular-nums font-medium">1,750</td>
                        </tr>
                        <tr className="bg-[#FFFBEB]">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span>تركيب وتشغيل</span>
                              <AlertCircle className="w-3 h-3 text-[#F59E0B]" />
                              <span className="text-[10px] text-[#B45309]">ثقة منخفضة</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center tabular-nums">5</td>
                          <td className="px-3 py-2.5 text-center tabular-nums">200</td>
                          <td className="px-3 py-2.5 text-left tabular-nums font-medium">1,000</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-background border-t border-border text-[12px]">
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground">الإجمالي قبل الضريبة</td>
                          <td className="px-3 py-2 text-left tabular-nums">16,750</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground">الضريبة (15%)</td>
                          <td className="px-3 py-2 text-left tabular-nums">2,512.50</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td colSpan={3} className="px-3 py-3 text-right font-semibold">الإجمالي النهائي</td>
                          <td className="px-3 py-3 text-left tabular-nums font-semibold text-[14px]">19,262.50 ر.س</td>
                        </tr>
                      </tfoot>
                    </table>
</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="h-9 px-3 bg-primary hover:bg-primary text-primary-foreground rounded-md text-[12px] font-medium flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>تحويل لفاتورة</span>
                  </button>
                  <button className="h-9 px-3 bg-card border border-border rounded-md text-[12px] hover:border-border/80 flex items-center gap-1.5">
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>حفظ كعرض سعر</span>
                  </button>
                  <button onClick={() => setStep(1)} className="h-9 px-3 text-[12px] text-muted-foreground hover:bg-muted rounded-md">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessStep({ label, done, loading }: any) {
  return (
    <div className="flex items-center gap-2.5 text-right">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? 'bg-[#22C55E] text-primary-foreground' :
        loading ? 'bg-primary' :
        'bg-muted'
      }`}>
        {done ? <Check className="w-3 h-3" strokeWidth={3} /> :
         loading ? <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" /> :
         <div className="w-1 h-1 bg-[#9B9B9B] rounded-full"></div>}
      </div>
      <div className={`text-[12px] ${done ? 'text-[#15803D]' : loading ? 'text-foreground font-medium' : 'text-muted-foreground/80'}`}>
        {label}
      </div>
    </div>
  );
}

function FeatureMini({ icon: Icon, title, desc }: any) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center mx-auto mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-[12px] font-medium text-foreground">{title}</div>
      <div className="text-[10px] text-muted-foreground/80 mt-0.5">{desc}</div>
    </div>
  );
}
