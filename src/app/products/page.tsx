"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Download, Plus, Search, Package, MoreHorizontal, Loader2, ChevronRight } from 'lucide-react';
import { FilterButton } from '@/components/ui/FilterButton';
import { useStore } from '@/store/useStore';
import { getProducts, createProduct } from '@/lib/supabase/services';

import { useRouter } from 'next/navigation';

export default function ProductsList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { activeEntity } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', tax_rate: '15' });

  useEffect(() => {
    if (activeEntity.name) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [activeEntity]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (ent) {
        const data = await getProducts(ent.id);
        setProducts(data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (!ent) {
        alert('يرجى اختيار الكيان أولاً');
        return;
      }

      await createProduct({ 
        name: newProduct.name,
        sku: newProduct.sku,
        price: parseFloat(newProduct.price || '0'),
        tax_rate: parseFloat(newProduct.tax_rate),
        entity_id: ent.id 
      });
      setShowModal(false);
      setNewProduct({ name: '', sku: '', price: '', tax_rate: '15' });
      fetchProducts();
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;
  }

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
            <h1 className="text-[24px] font-semibold text-foreground tracking-tight">{t('pages.products.title')}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{products.length === 0 ? 'لا يوجد منتجات بعد' : `${products.length} منتج مسجل`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border rounded-md text-[12px] text-foreground hover:border-border/80">
            <Download className="w-3.5 h-3.5" />
            <span>تحديث الكميات</span>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary text-primary-foreground rounded-md text-[12px] font-medium">
            <Plus className="w-3.5 h-3.5" />
            <span>t('pages.products.add')</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <div className="relative flex-1 max-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
            <input type="text" placeholder="ابحث باسم المنتج أو الرمز (SKU)..." className="w-full pr-8 pl-3 h-8 bg-background border border-border rounded-md text-[12px] focus:outline-none focus:border-[#5B5BD6] focus:bg-card" />
          </div>
          <FilterButton label="الفئة" />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Package className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-[13px]">لا يوجد منتجات أو خدمات في الكيان الحالي</p>
              <button onClick={() => setShowModal(true)} className="mt-4 text-[12px] text-[#5B5BD6] font-medium hover:underline">
                أضف أول منتج الآن
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
<table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                  <th className="text-right font-medium px-4 py-2.5">المنتج / الخدمة</th>
                  <th className="text-right font-medium px-4 py-2.5">سعر الوحدة</th>
                  <th className="text-right font-medium px-4 py-2.5">الضريبة</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {products.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-background transition-colors group cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground/80" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{row.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground/80">{row.sku || 'بدون رمز'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground tabular-nums">{row.price.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground/80 mr-1">ر.س</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{row.tax_rate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center hover:bg-border rounded transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-foreground">إضافة منتج أو خدمة</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground/80 hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">اسم المنتج أو الخدمة</label>
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="مثال: استشارة تقنية" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">السعر الأساسي (ر.س)</label>
                  <input required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} type="number" step="0.01" className="w-full h-10 px-3 bg-background border border-border rounded-md text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">الرمز (SKU)</label>
                  <input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md text-[13px] font-mono focus:outline-none focus:border-[#5B5BD6]" placeholder="PRD-001" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">نسبة الضريبة</label>
                <select value={newProduct.tax_rate} onChange={e => setNewProduct({...newProduct, tax_rate: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-md text-[13px] focus:outline-none focus:border-[#5B5BD6]">
                  <option value="15">ضريبة قيمة مضافة (15%)</option>
                  <option value="0">معفى ضريبياً (0%)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 bg-card border border-border text-muted-foreground hover:bg-background rounded-md text-[13px] font-medium">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-10 bg-primary hover:bg-primary disabled:bg-[#A3A3A3] text-primary-foreground rounded-md text-[13px] font-medium">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
