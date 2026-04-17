"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, Upload, Image, Stamp, PenLine, FileText, Check,
  ChevronRight, Trash2, Eye
} from 'lucide-react';

type TemplateType = 'classic' | 'modern' | 'minimal' | 'elite';

interface InvoiceSettings {
  template: TemplateType;
  logo_url: string;
  stamp_url: string;
  signature_url: string;
  default_notes: string;
  payment_terms: string;
}

const TEMPLATES: { id: TemplateType; name: string; nameAr: string; desc: string; colors: string[] }[] = [
  { id: 'elite', name: 'Elite', nameAr: 'النخبة (الجديد)', desc: 'تصميم فخم مستوحى من Global Elite لعروض الأسعار', colors: ['#ffffff', '#003dc7', '#f2f3ff'] },
  { id: 'classic', name: 'Classic', nameAr: 'كلاسيكي', desc: 'تصميم تقليدي احترافي بهيدر أزرق داكن', colors: ['#1a1a2e', '#16213e', '#e2e8f0'] },
  { id: 'modern', name: 'Modern', nameAr: 'عصري', desc: 'تدرجات لونية مع تصميم حديث', colors: ['#5B5BD6', '#7B7BF6', '#f0f0ff'] },
  { id: 'minimal', name: 'Minimal', nameAr: 'بسيط', desc: 'أبيض نظيف مع خطوط رفيعة', colors: ['#ffffff', '#f8f8f8', '#e5e5e5'] },
];

export default function InvoicingSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<InvoiceSettings>({
    template: 'elite',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    default_notes: 'شكراً لتعاملكم معنا. يُرجى السداد خلال المدة المحددة.',
    payment_terms: '30 يوم من تاريخ الإصدار',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('invoice_settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('invoice_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = (field: 'logo_url' | 'stamp_url' | 'signature_url') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings(prev => ({ ...prev, [field]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button onClick={() => router.back()} className="hover:text-foreground transition-colors">الإعدادات</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">إعدادات الفوترة</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات الفوترة</h1>
          <p className="text-sm text-muted-foreground mt-1">تخصيص شكل الفواتير وعروض الأسعار</p>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all shadow-md hover:-translate-y-0.5 ${
            saved 
              ? 'bg-[#22C55E] text-white' 
              : 'bg-gradient-to-l from-[#1A1A1A] to-[#2A2A2A] hover:from-[#000] hover:to-[#1A1A1A] text-white'
          }`}
        >
          {saved ? <><Check className="w-4 h-4" /> تم الحفظ</> : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Template Selection */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#5B5BD6]" />
          قالب الفاتورة
        </h2>
        <p className="text-sm text-muted-foreground mb-4">يُطبَّق على الفواتير وعروض الأسعار</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => setSettings(p => ({ ...p, template: tmpl.id }))}
              className={`group relative text-right p-0 rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                settings.template === tmpl.id
                  ? 'border-[#5B5BD6] shadow-md shadow-[#5B5BD6]/10'
                  : 'border-border hover:border-[#5B5BD6]/40'
              }`}
            >
              {/* Mini Preview */}
              <div className="h-40 relative overflow-hidden">
                <TemplateMiniPreview type={tmpl.id} colors={tmpl.colors} />
                {settings.template === tmpl.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#5B5BD6] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="p-3 bg-card">
                <div className="text-sm font-semibold text-foreground">{tmpl.nameAr}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{tmpl.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* File Uploads */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Image className="w-5 h-5 text-[#5B5BD6]" />
          الملفات والصور
        </h2>
        <p className="text-sm text-muted-foreground mb-4">ارفع اللوجو والختم والتوقيع لتظهر على الفواتير وعروض الأسعار</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UploadCard
            label="لوجو الشركة"
            desc="يظهر في هيدر الفاتورة"
            icon={<Image className="w-5 h-5" />}
            preview={settings.logo_url}
            onUpload={() => handleFileUpload('logo_url')}
            onRemove={() => setSettings(p => ({ ...p, logo_url: '' }))}
          />
          <UploadCard
            label="الختم الرسمي"
            desc="يظهر في ذيل الفاتورة"
            icon={<Stamp className="w-5 h-5" />}
            preview={settings.stamp_url}
            onUpload={() => handleFileUpload('stamp_url')}
            onRemove={() => setSettings(p => ({ ...p, stamp_url: '' }))}
          />
          <UploadCard
            label="التوقيع"
            desc="يظهر بجانب الختم"
            icon={<PenLine className="w-5 h-5" />}
            preview={settings.signature_url}
            onUpload={() => handleFileUpload('signature_url')}
            onRemove={() => setSettings(p => ({ ...p, signature_url: '' }))}
          />
        </div>
      </section>

      {/* Default Settings */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5B5BD6]" />
          إعدادات افتراضية
        </h2>
        <p className="text-sm text-muted-foreground mb-4">نصوص تظهر تلقائياً في كل فاتورة وعرض سعر</p>
        
        <div className="space-y-4 bg-card border border-border rounded-xl p-5">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">ملاحظات افتراضية</label>
            <textarea
              value={settings.default_notes}
              onChange={e => setSettings(p => ({ ...p, default_notes: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#5B5BD6]/20 focus:border-[#5B5BD6] focus:outline-none resize-none"
              placeholder="مثال: شكراً لتعاملكم معنا..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">شروط الدفع</label>
            <input
              type="text"
              value={settings.payment_terms}
              onChange={e => setSettings(p => ({ ...p, payment_terms: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#5B5BD6]/20 focus:border-[#5B5BD6] focus:outline-none"
              placeholder="مثال: 30 يوم من تاريخ الإصدار"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function UploadCard({ label, desc, icon, preview, onUpload, onRemove }: {
  label: string; desc: string; icon: React.ReactNode; preview: string;
  onUpload: () => void; onRemove: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#5B5BD6]/10 flex items-center justify-center text-[#5B5BD6]">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      
      {preview ? (
        <div className="relative group flex-1 min-h-[100px] bg-background border border-border rounded-lg flex items-center justify-center overflow-hidden">
          <img src={preview} alt={label} className="max-h-24 max-w-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <button onClick={onUpload} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
              <Upload className="w-4 h-4 text-white" />
            </button>
            <button onClick={onRemove} className="w-8 h-8 bg-red-500/50 rounded-lg flex items-center justify-center hover:bg-red-500/70">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onUpload}
          className="flex-1 min-h-[100px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[#5B5BD6]/40 hover:text-[#5B5BD6] transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">اضغط للرفع</span>
        </button>
      )}
    </div>
  );
}

function TemplateMiniPreview({ type, colors }: { type: TemplateType; colors: string[] }) {
  if (type === 'elite') {
    return (
      <div className="w-full h-full bg-white p-3 flex flex-col border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="w-14 h-2 bg-gray-800 rounded"></div>
            <div className="w-8 h-1 bg-gray-400 rounded mt-1"></div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="w-12 h-2 text-[#003dc7] font-black leading-none text-[8px] uppercase tracking-tighter">GLOBAL</div>
            <div className="w-8 h-1 bg-gray-300 rounded mt-0.5"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 text-[6px] tracking-tight">
          <div>
             <div className="font-bold text-gray-500 uppercase">Prepared For</div>
             <div className="w-10 h-1.5 bg-gray-800 rounded mt-1"></div>
          </div>
          <div className="text-right">
             <div className="font-bold text-gray-500 uppercase">Details</div>
             <div className="flex justify-end mt-1"><div className="w-8 h-1 bg-gray-400 rounded"></div></div>
          </div>
        </div>
        <div className="mt-3 flex-1 space-y-1">
          <div className="h-3 rounded flex items-center px-1" style={{ background: colors[2] }}>
            <span className="w-8 h-1 bg-gray-400 rounded"></span>
          </div>
          <div className="h-4 bg-white border border-gray-100 rounded px-1 flex items-center shadow-sm">
            <span className="w-12 h-1 bg-gray-800 rounded"></span>
            <span className="ml-auto w-6 h-1 bg-[#003dc7] rounded"></span>
          </div>
        </div>
      </div>
    );
  }
  if (type === 'classic') {
    return (
      <div className="w-full h-full bg-white p-3 flex flex-col">
        <div className="h-8 rounded" style={{ background: colors[0] }}></div>
        <div className="flex justify-between mt-2">
          <div className="w-16 h-2 bg-gray-200 rounded"></div>
          <div className="w-10 h-2 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-3 flex-1 space-y-1.5">
          <div className="h-4 rounded text-[8px] font-medium text-white flex items-center px-2" style={{ background: colors[1] }}>
            <span className="opacity-70">المنتج</span>
            <span className="mr-auto opacity-70">المبلغ</span>
          </div>
          {[70, 55, 40].map((w, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-2 bg-gray-100 rounded" style={{ width: `${w}%` }}></div>
              <div className="h-2 w-8 bg-gray-200 rounded mr-auto"></div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between">
          <div className="w-6 h-6 rounded bg-gray-100"></div>
          <div className="w-12 h-3 rounded" style={{ background: colors[0] }}></div>
        </div>
      </div>
    );
  }
  if (type === 'modern') {
    return (
      <div className="w-full h-full bg-white p-3 flex flex-col">
        <div className="h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
          <div className="flex items-center h-full px-2">
            <div className="w-4 h-4 rounded-full bg-white/30"></div>
            <div className="w-12 h-1.5 bg-white/40 rounded mr-2"></div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="h-6 rounded bg-[#f0f0ff] p-1">
            <div className="w-8 h-1 bg-[#5B5BD6]/20 rounded"></div>
          </div>
          <div className="h-6 rounded bg-[#f0f0ff] p-1">
            <div className="w-8 h-1 bg-[#5B5BD6]/20 rounded"></div>
          </div>
        </div>
        <div className="mt-2 flex-1 space-y-1">
          {[1,2,3].map(i => (
            <div key={i} className="h-4 bg-gray-50 rounded flex items-center px-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: colors[0] + '40' }}></div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-1">
          <div className="h-5 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }}>
            <div className="w-10 h-1 bg-white/60 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  // minimal
  return (
    <div className="w-full h-full bg-white p-3 flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <div className="w-14 h-1.5 bg-gray-800 rounded mb-1"></div>
          <div className="w-8 h-1 bg-gray-200 rounded"></div>
        </div>
        <div className="w-5 h-5 border border-gray-200 rounded"></div>
      </div>
      <div className="mt-4 border-t border-gray-100 pt-2 flex-1 space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="flex justify-between">
            <div className="w-16 h-1 bg-gray-100 rounded"></div>
            <div className="w-8 h-1 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-2 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="w-10 h-1.5 bg-gray-100 rounded"></div>
          <div className="w-14 h-2 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}
