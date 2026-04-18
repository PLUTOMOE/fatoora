"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Save, KeySquare, ShieldCheck, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ApiSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_gemini_api_key');
    if (saved) setGeminiKey(saved);
  }, []);

  const handleSave = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('user_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={() => router.push('/settings')}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">الربط والبرمجة (API)</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة مفاتيح الذكاء الاصطناعي والخدمات الخارجية.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-1">
            <KeySquare className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">الذكاء الاصطناعي (Google Gemini)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                هذا المفتاح يستخدم لتشغيل ميزة "قراءة العروض الخارجية" وتحويل الصور إلى بيانات.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">مفتاح API الخاص بك</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-left dir-ltr"
                dir="ltr"
              />
              <p className="text-[12px] text-muted-foreground">
                إذا قمت بإدخال مفتاح هنا، سيتم استخدامه دائماً كأولوية بدلاً من مفتاح النظام العام.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={handleSave}
                className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
              >
                {isSaved ? <ShieldCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'تم الحفظ بنجاح' : 'حفظ المفتاح'}</span>
              </button>
              
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="h-9 px-4 bg-muted text-muted-foreground rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <span>إدارة مفاتيحي في جوجل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
