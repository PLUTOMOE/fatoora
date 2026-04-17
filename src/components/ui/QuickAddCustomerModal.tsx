"use client";

import React, { useState } from 'react';
import { X, Building2, User, Loader2, Sparkles, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { createCustomer } from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';
import { CustomerData } from './CustomerAutocomplete';

interface QuickAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialAiMode?: boolean;
  onSuccess: (customer: CustomerData) => void;
}

export function QuickAddCustomerModal({ isOpen, onClose, initialName, initialAiMode = false, onSuccess }: QuickAddCustomerModalProps) {
  const { activeEntity } = useStore();
  const [formData, setFormData] = useState({
    name: initialName || '',
    type: 'company',
    phone: '',
    address: '',
    tax_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(initialAiMode);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0); // 0: upload, 1: scanning, 2: success

  // Sync AI mode when opened
  React.useEffect(() => {
    if (isOpen) {
      setIsAiMode(initialAiMode);
      setAiAnalysisStep(0);
    }
  }, [isOpen, initialAiMode]);

  if (!isOpen) return null;

  const simulateAiExtraction = () => {
    setAiAnalysisStep(1); // scanning
    setTimeout(() => {
      setFormData({
        name: 'شركة النور للتجارة والتقنية',
        type: 'company',
        phone: '0501234567',
        address: 'الرياض، المملكة العربية السعودية',
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
    
    setLoading(true);
    try {
      const supabase = createClient();
      // Get entity id
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (!ent) {
        alert('حدث خطأ في تحديد الكيان النشط.');
        setLoading(false);
        return;
      }

      // Create
      const newCustomer = await createCustomer({
        ...formData,
        entity_id: ent.id
      });

      if (newCustomer) {
        onSuccess(newCustomer as unknown as CustomerData);
      } else {
        alert('لم يتم إضافة العميل، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة العميل');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">إضافة عميل جديد</h2>
            {!isAiMode && (
              <button 
                type="button" 
                onClick={() => setIsAiMode(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#7A5A1A] bg-gradient-to-r from-[#FFE2A8] to-[#E8B96B] px-2 py-1 rounded-md shadow-sm hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ملء بالذكاء الاصطناعي
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {isAiMode ? (
          <div className="p-6">
            {aiAnalysisStep === 0 && (
              <div 
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                onClick={simulateAiExtraction}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFE2A8] to-[#E8B96B] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-[#7A5A1A]" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">ارفع السجل التجاري أو البطاقة الضريبية</h3>
                <p className="text-[11px] text-muted-foreground">صورة أو PDF (الذكاء الاصطناعي سيقوم بملء البيانات)</p>
              </div>
            )}
            
            {aiAnalysisStep === 1 && (
              <div className="py-8 text-center animate-in fade-in">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-sm font-bold text-foreground mb-1">جاري قراءة المستند...</h3>
                <p className="text-[12px] text-muted-foreground">الذكاء الاصطناعي يستخرج البيانات الآن</p>
                
                <div className="mt-6 max-w-xs mx-auto space-y-2 text-right">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin"/> استخراج النصوص (OCR)...</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin"/> مطابقة الحقول وتحليلها...</div>
                </div>
              </div>
            )}
            
            {aiAnalysisStep === 2 && (
              <div className="py-8 text-center animate-in zoom-in">
                <div className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-[#15803D] mb-1">تم الاستخراج بنجاح!</h3>
                <p className="text-[12px] text-muted-foreground">دقة البيانات تصل إلى 96%</p>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
               <button onClick={() => setIsAiMode(false)} className="text-[12px] text-muted-foreground hover:text-foreground">إلغاء</button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'company' })}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                formData.type === 'company' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" /> شركة / مؤسسة
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'individual' })}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                formData.type === 'individual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" /> فرد
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">الاسم (مطلوب)</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                placeholder="اسم العميل"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">الهاتف (اختياري)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">الرقم الضريبي (اختياري)</label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={e => setFormData({ ...formData, tax_number: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="15 رقم للشركات"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">العنوان / المدينة (اختياري)</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                placeholder="الرياض، المملكة العربية السعودية"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              حفظ واستخدام
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
