"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase/client';

const blankForm = { name: '', description: '', sku: '', price: '', tax_rate: '15' };

export default function ProductsList() {
  const { t } = useTranslation();
  const { activeEntity } = useStore();
  const supabase = createClient();

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState(blankForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resolveEntityId = useCallback(async () => {
    if (activeEntity?.name) {
      const { data } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (data) return data.id;
    }
    const { data } = await supabase.from('entities').select('id').limit(1).single();
    return data?.id || null;
  }, [activeEntity]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const entId = await resolveEntityId();
      if (entId) {
        const { data } = await supabase.from('products').select('*').eq('entity_id', entId).order('created_at', { ascending: false });
        setProducts(data || []);
        setFiltered(data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [resolveEntityId]);

  useEffect(() => { fetchProducts(); }, [activeEntity]);

  // Live search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)));
  }, [search, products]);

  const openCreate = () => { setEditingProduct(null); setForm(blankForm); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description || '', sku: p.sku || '', price: String(p.price), tax_rate: String(p.tax_rate ?? 15) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name: form.name, description: form.description, sku: form.sku, price: parseFloat(form.price || '0'), tax_rate: parseFloat(form.tax_rate) };
      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } else {
        const entId = await resolveEntityId();
        if (!entId) throw new Error('يرجى إنشاء شركة أولاً');
        await supabase.from('products').insert({ ...payload, entity_id: entId });
      }
      await fetchProducts();
      setShowModal(false);
    } catch (err: any) { alert(err.message); }
    setIsSubmitting(false);
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`هل تريد حذف "${p.name}"؟`)) return;
    setDeletingId(p.id);
    try {
      await supabase.from('products').delete().eq('id', p.id);
      await fetchProducts();
    } catch (e: any) { alert(e.message); }
    setDeletingId(null);
  };

  if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t('pages.products.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {products.length === 0 ? 'لا يوجد منتجات بعد' : `${products.length} منتج وخدمة مسجلة`}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /><span>إضافة منتج</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو الرمز (SKU)..."
          className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-xl text-[13px] focus:outline-none focus:border-[#5B5BD6] transition-colors"
        />
      </div>

      {/* Products Grid - Mobile Cards / Desktop Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Package className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-[13px]">{search ? 'لا توجد نتائج للبحث' : 'لا يوجد منتجات في هذه الشركة'}</p>
          {!search && (
            <button onClick={openCreate} className="text-[13px] text-[#5B5BD6] font-medium hover:underline">أضف أول منتج الآن</button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {filtered.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground/70" />
                    </div>
                    <div>
                      <div className="font-semibold text-[13px] text-foreground">{p.name}</div>
                      {p.sku && <div className="text-[11px] font-mono text-muted-foreground">{p.sku}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p)} disabled={deletingId === p.id} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-[#E5484D] disabled:opacity-40">
                      {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {p.description && <p className="text-[11px] text-muted-foreground">{p.description}</p>}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[13px] font-bold text-foreground tabular-nums">{Number(p.price).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">ر.س</span></span>
                  <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p.tax_rate}% ضريبة</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground/80 uppercase tracking-wider">
                  <th className="text-right font-medium px-5 py-3">المنتج / الخدمة</th>
                  <th className="text-right font-medium px-5 py-3">الوصف</th>
                  <th className="text-right font-medium px-5 py-3">السعر</th>
                  <th className="text-right font-medium px-5 py-3">الضريبة</th>
                  <th className="w-20 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-border/50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground/70" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{p.name}</div>
                          {p.sku && <div className="text-[11px] font-mono text-muted-foreground/70">{p.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px] max-w-[200px] truncate">{p.description || '—'}</td>
                    <td className="px-5 py-3 font-medium text-foreground tabular-nums">
                      {Number(p.price).toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">ر.س</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p.tax_rate}%</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p)} disabled={deletingId === p.id} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-[#E5484D] disabled:opacity-40">
                          {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج أو خدمة'}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">اسم المنتج أو الخدمة *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="مثال: استشارة تقنية" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">الوصف (اختياري)</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="وصف مختصر للمنتج..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">السعر (ر.س) *</label>
                  <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" step="0.01" min="0" className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">الرمز (SKU)</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#5B5BD6]" placeholder="PRD-001" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">نسبة الضريبة</label>
                <select value={form.tax_rate} onChange={e => setForm({...form, tax_rate: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]">
                  <option value="15">ضريبة قيمة مضافة (15%)</option>
                  <option value="0">معفى ضريبياً (0%)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 bg-muted border border-border text-muted-foreground rounded-lg text-[13px] font-medium hover:bg-background transition-colors">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
