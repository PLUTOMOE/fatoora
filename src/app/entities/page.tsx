"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Building2, Shield, Loader2, Edit2, Trash2, Upload, CheckCircle, X, ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { getEntities, createEntity } from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';

type Entity = {
  id: string; name: string; short_name: string | null; legal_type: string | null;
  tax_number: string | null; cr_number: string | null; address: string | null;
  phone: string | null; logo_url: string | null; status: string | null; created_at: string; user_id: string;
};

const blankForm = { name: '', legal_type: 'مؤسسة فردية', tax_number: '', cr_number: '', address: '', phone: '' };

export default function EntitiesList() {
  const { activeEntity, setActiveEntity } = useStore();
  const { t } = useTranslation();
  const supabase = createClient();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [form, setForm] = useState(blankForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUploading, setLogoUploading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntities();
      setEntities((data as any) || []);
      if (data && data.length > 0 && !activeEntity.name) {
        setActiveEntity({ name: data[0].name, short: data[0].name.substring(0, 2) });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntities(); }, []);

  const openCreate = () => { setEditingEntity(null); setForm(blankForm); setShowModal(true); };
  const openEdit = (e: Entity) => {
    setEditingEntity(e);
    setForm({ name: e.name, legal_type: e.legal_type || 'مؤسسة فردية', tax_number: e.tax_number || '', cr_number: e.cr_number || '', address: e.address || '', phone: e.phone || '' });
    setShowModal(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEntity) {
        await supabase.from('entities').update({ name: form.name, legal_type: form.legal_type, tax_number: form.tax_number, cr_number: form.cr_number, address: form.address, phone: form.phone }).eq('id', editingEntity.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");
        await supabase.from('entities').insert({ name: form.name, short_name: form.name.substring(0, 2), legal_type: form.legal_type, tax_number: form.tax_number, cr_number: form.cr_number, address: form.address, phone: form.phone, logo_url: null, status: 'active', user_id: user.id });
      }
      await fetchEntities();
      setShowModal(false);
    } catch (e: any) { alert(e.message); }
    setIsSubmitting(false);
  };

  const handleDelete = async (entity: Entity) => {
    if (!confirm(`هل تريد حذف شركة "${entity.name}"؟ سيتم حذف جميع بياناتها نهائياً.`)) return;
    setDeletingId(entity.id);
    try {
      await supabase.from('entities').delete().eq('id', entity.id);
      await fetchEntities();
    } catch (e: any) { alert(e.message); }
    setDeletingId(null);
  };

  const handleLogoUpload = async (entity: Entity, file: File) => {
    setLogoUploading(entity.id);
    try {
      const ext = file.name.split('.').pop();
      const path = `logos/${entity.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from('entity-assets').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('entity-assets').getPublicUrl(path);
      await supabase.from('entities').update({ logo_url: publicUrl }).eq('id', entity.id);
      await fetchEntities();
    } catch (e: any) { alert('خطأ في رفع اللوجو: ' + e.message); }
    setLogoUploading(null);
  };

  if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/80" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t('pages_extra.entities.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{t('pages_extra.entities.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /><span>{t('pages_extra.entities.add')}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <div key={entity.id} className={`bg-card border rounded-xl overflow-hidden transition-all ${activeEntity.name === entity.name ? 'border-[#5B5BD6] ring-1 ring-[#5B5BD6]/30' : 'border-border hover:border-border/70'}`}>
            <div className="p-4">
              {/* Logo + Name Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="relative group">
                  {entity.logo_url ? (
                    <img src={entity.logo_url} alt="logo" className="w-12 h-12 rounded-lg object-contain border border-border bg-background" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] rounded-lg flex items-center justify-center text-white text-[14px] font-bold">
                      {entity.short_name || entity.name.substring(0, 2)}
                    </div>
                  )}
                  {/* Upload overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    {logoUploading === entity.id ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(entity, e.target.files[0])} />
                  </label>
                </div>
                {activeEntity.name === entity.name ? (
                  <span className="text-[10px] bg-[#EEEDF9] dark:bg-[#5B5BD6]/20 text-[#5B5BD6] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> نشطة
                  </span>
                ) : (
                  <button onClick={() => setActiveEntity({ name: entity.name, short: entity.short_name || entity.name.substring(0, 2) })} className="text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors">
                    تفعيل
                  </button>
                )}
              </div>

              <h3 className="font-semibold text-[14px] text-foreground mb-0.5">{entity.name}</h3>
              <div className="text-[11px] text-muted-foreground mb-3">{entity.legal_type}</div>

              <div className="space-y-1.5">
                {entity.tax_number && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">رقم ضريبي</span>
                    <span className="font-mono text-foreground">{entity.tax_number}</span>
                  </div>
                )}
                {entity.cr_number && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">سجل تجاري</span>
                    <span className="font-mono text-foreground">{entity.cr_number}</span>
                  </div>
                )}
                {entity.phone && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">هاتف</span>
                    <span className="text-foreground">{entity.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/20">
              <span className="text-[10px] text-muted-foreground/70">أُنشئت {new Date(entity.created_at).toLocaleDateString('ar-SA')}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(entity)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(entity)} disabled={deletingId === entity.id} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-[#E5484D] transition-colors disabled:opacity-40">
                  {deletingId === entity.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button onClick={openCreate} className="border-2 border-dashed border-border rounded-xl flex items-center justify-center flex-col gap-2 min-h-[180px] text-muted-foreground/60 hover:text-foreground hover:border-[#5B5BD6]/40 transition-colors hover:bg-[#5B5BD6]/5">
          <Plus className="w-7 h-7" />
          <span className="text-[13px] font-medium">{t('pages_extra.entities.add')}</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#A88732] mt-0.5 flex-shrink-0" />
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          كل شركة تحتفظ بسجل ضريبي وتسلسل فواتير وعملاء مستقلين لضمان الامتثال لمتطلبات <strong className="text-foreground">هيئة الزكاة والضريبة والجمارك (ZATCA)</strong>.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">{editingEntity ? 'تعديل الشركة' : t('pages_extra.entities.add')}</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">الاسم التجاري *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="مثال: الواحة للتجارة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">النوع القانوني</label>
                  <select value={form.legal_type} onChange={e => setForm({...form, legal_type: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]">
                    <option>مؤسسة فردية</option>
                    <option>شركة ذات مسؤولية محدودة</option>
                    <option>شركة الشخص الواحد</option>
                    <option>شركة مساهمة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">السجل التجاري</label>
                  <input value={form.cr_number} onChange={e => setForm({...form, cr_number: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#5B5BD6]" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">الرقم الضريبي (15 رقم) *</label>
                <input required value={form.tax_number} onChange={e => setForm({...form, tax_number: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#5B5BD6]" placeholder="300000000000003" minLength={15} maxLength={15} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">هاتف التواصل</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="0500000000" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-foreground mb-1.5">العنوان</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full h-10 px-3 bg-background border border-border rounded-lg text-[13px] focus:outline-none focus:border-[#5B5BD6]" placeholder="الرياض، المملكة العربية السعودية" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 bg-muted border border-border text-muted-foreground rounded-lg text-[13px] font-medium hover:bg-background transition-colors">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingEntity ? 'حفظ التعديلات' : 'إضافة الشركة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
