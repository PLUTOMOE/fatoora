"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Download, Calendar, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Reports() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[24px] font-semibold text-foreground tracking-tight">{t('pages_extra.reports.title')}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{t('pages_extra.reports.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary text-primary-foreground rounded-md text-[12px] font-medium">
            <Download className="w-3.5 h-3.5" />
            <span>{t('pages_extra.reports.quarterly_tax')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        <div className="border border-border rounded-lg p-8 text-center bg-card">
            <BarChart3 className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
            <h3 className="text-[16px] font-medium text-foreground">{t('pages_extra.reports.tax_report')}</h3>
            <p className="text-[13px] text-muted-foreground mt-2 mb-4">يعرض إجمالي المبيعات والضريبة المستحقة لهيئة الزكاة والدخل لفترة زمنية محددة بناءً على الفواتير المصدّرة.</p>
            <button className="flex mx-auto items-center gap-1.5 h-8 px-4 bg-background border border-border rounded-md text-[12px] hover:bg-card hover:border-foreground/20 transition-colors">
              {t('pages_extra.reports.view_report')}
            </button>
        </div>
        
        <div className="border border-border rounded-lg p-8 text-center bg-card">
            <TrendingUp className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
            <h3 className="text-[16px] font-medium text-foreground">{t('pages_extra.reports.sales_performance')}</h3>
            <p className="text-[13px] text-muted-foreground mt-2 mb-4">تحليل المبيعات حسب العميل، الفروع، أو المنتجات لقياس مؤشرات الأداء بشكل دقيق ومقارنتها عبر الفترات.</p>
            <button className="flex mx-auto items-center gap-1.5 h-8 px-4 bg-background border border-border rounded-md text-[12px] hover:bg-card hover:border-foreground/20 transition-colors">
              {t('pages_extra.reports.view_report')}
            </button>
        </div>
      </div>
    </div>
  );
}
