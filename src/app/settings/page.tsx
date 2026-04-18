"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, FileText, Building2, Shield, Bell, KeySquare, Palette, LayoutTemplate } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const settingsOptions = [
    {
      title: 'إعدادات الفوترة والمظهر',
      description: 'قم بتخصيص شكل قوالب الفواتير، إضافة الأختام والتوقيعات، والتحكم بالهوية البصرية للفواتير.',
      icon: LayoutTemplate,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      href: '/settings/invoicing'
    },
    {
      title: 'إعدادات الشركة',
      description: 'تعديل تفاصيل الكيان، السجل التجاري، الرقم الضريبي، ومعلومات التواصل الأساسية.',
      icon: Building2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      href: '/entities'
    },
    {
      title: 'حسابي والإشعارات',
      description: 'إعدادات الملف الشخصي، الأمان، وتخصيص تنبيهات الاستحقاق وعمليات النظام.',
      icon: Shield,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      href: '#'
    },
    {
      title: 'الربط والبرمجة (API)',
      description: 'إدارة مفتاح الذكاء الاصطناعي (Gemini) الخاص بك، ومفاتيح الربط البرمجي للأنظمة الخارجية.',
      icon: KeySquare,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      href: '/settings/api'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات النظام</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة وضبط خيارات الكيانات والفوترة والأمان.</p>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((opt, i) => (
          <div 
            key={i} 
            onClick={() => opt.href !== '#' && router.push(opt.href)}
            className={`group bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 ${opt.href !== '#' ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
          >
            <div className="flex gap-5">
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${opt.bgColor} ${opt.color} group-hover:scale-110 transition-transform`}>
                <opt.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{opt.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {opt.description}
                </p>
                {opt.href === '#' && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">قريباً</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
