"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Edit3, Check, X, StickyNote, FolderOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ======================== PREDEFINED NOTES DATA ========================
const QUOTATION_CATEGORIES: Record<string, string[]> = {
  'الشروط العامة لعرض السعر': [
    'الأسعار لا تشمل ضريبة القيمة المضافة (إلا إذا ذكر خلاف ذلك)',
    'الأسعار قابلة للتغيير حسب السوق',
    'اعتماد العرض يعتبر موافقة على الشروط',
  ],
  'صلاحية عرض السعر': [
    'العرض صالح لمدة 7 أيام',
    'العرض صالح لمدة 14 يوم',
    'العرض صالح لمدة 30 يوم',
    'بعد انتهاء المدة يحق تعديل الأسعار',
  ],
  'نطاق العمل': [
    'يشمل العرض التوريد والتركيب حسب المذكور',
    'أي تعديل في الكميات أو التصميم يؤثر على السعر',
    'التنفيذ حسب المخططات المعتمدة',
  ],
  'الاستثناءات': [
    'لا يشمل الأعمال المدنية (تكسير / تشطيب)',
    'لا يشمل تمديدات الكهرباء الرئيسية',
    'لا يشمل السقالات أو معدات الرفع',
  ],
  'التوريد والتسليم': [
    'مدة التوريد من 3 إلى 7 أيام',
    'حسب توفر المخزون',
    'التأخير خارج عن إرادة الشركة',
  ],
  'شروط التركيب': [
    'يشمل التركيب الأساسي فقط',
    'لا يشمل التكسير أو الكهرباء',
    'التركيب يتم حسب جدول التشغيل',
    'يتم الالتزام بالمعايير الفنية',
  ],
  'التمديدات والنحاس': [
    'يشمل X متر نحاس',
    'الزيادة تُحسب بالمتر',
    'يتم استخدام مواد مطابقة للمواصفات',
    'العزل حسب المعايير',
  ],
  'الأعمال الإضافية': [
    'أي أعمال إضافية تُحسب بشكل منفصل',
    'فك الأجهزة القديمة برسوم إضافية',
    'تمديدات إضافية بسعر منفصل',
  ],
  'تقلبات الأسعار': [
    'الأسعار مرتبطة بسعر السوق وقت التنفيذ',
    'النحاس يخضع لتغيرات السوق العالمية',
    'يتم تعديل السعر في حال تغير المورد',
  ],
  'شروط الموقع': [
    'يجب أن يكون الموقع جاهز للتركيب',
    'توفير مصدر كهرباء',
    'توفير مكان مناسب للوحدات',
  ],
  'الضمان': [
    'ضمان سنة على التركيب',
    'الأجهزة حسب ضمان الوكيل',
    'لا يشمل سوء الاستخدام',
  ],
  'المسؤولية القانونية': [
    'المسؤولية تقتصر على البنود المذكورة فقط',
    'الشركة غير مسؤولة عن أي أضرار خارج النطاق',
  ],
};

const INVOICE_CATEGORIES: Record<string, string[]> = {
  'الشروط العامة للفاتورة': [
    'الفاتورة صادرة بناءً على عرض السعر المعتمد',
    'لا يتم التعديل بعد الإصدار',
  ],
  'شروط الدفع': [
    '50% مقدم – 50% عند التسليم',
    'الدفع كامل عند الاستلام',
    'تحويل بنكي / نقدي',
  ],
  'تفاصيل السداد': [
    'يتم السداد خلال 7 أيام',
    'يتم السداد خلال 30 يوم',
    'يتم إضافة غرامة تأخير بعد المدة',
  ],
  'الضرائب (VAT)': [
    'الأسعار تشمل ضريبة القيمة المضافة',
    'يتم احتساب الضريبة حسب النظام السعودي',
  ],
  'سياسة الاسترجاع': [
    'لا يوجد استرجاع بعد التركيب',
    'الاستبدال خلال 7 أيام حسب الحالة',
  ],
  'التأخير في السداد': [
    'يتم إيقاف الخدمات في حال التأخير',
    'يتم فرض رسوم تأخير',
  ],
  'الضمان (بعد البيع)': [
    'الضمان حسب الوكيل',
    'يشمل عيوب التصنيع فقط',
    'لا يشمل سوء الاستخدام أو الكهرباء',
  ],
  'التسليم والاستلام': [
    'تم استلام الأجهزة بحالة جيدة',
    'تم التشغيل والتجربة أمام العميل',
  ],
  'ملاحظات العميل': [
    'يتم كتابة أي ملاحظات خاصة بالعميل',
    'يتم اعتمادها مع الفاتورة',
  ],
  'شروط الإلغاء': [
    'لا يمكن الإلغاء بعد التوريد',
    'يتم خصم تكاليف في حال الإلغاء',
  ],
};

// ======================== TYPES ========================
interface AddedNote {
  id: string;
  text: string;
  category: string;
  isEditing?: boolean;
}

interface NotesManagerProps {
  docType: 'quotation' | 'invoice';
  value: string;
  onChange: (notes: string) => void;
}

// ======================== COMPONENT ========================
export function NotesManager({ docType, value, onChange }: NotesManagerProps) {
  const categories = docType === 'quotation' ? QUOTATION_CATEGORIES : INVOICE_CATEGORIES;
  const categoryNames = Object.keys(categories);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [addedNotes, setAddedNotes] = useState<AddedNote[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [customDbNotes, setCustomDbNotes] = useState<{id: string; category: string; note_text: string}[]>([]);
  
  const catRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Initialize from existing value
  useEffect(() => {
    if (value && addedNotes.length === 0) {
      const lines = value.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        setAddedNotes(lines.map((text, i) => ({
          id: `init_${i}`,
          text,
          category: 'ملاحظات سابقة',
        })));
      }
    }
  }, []);

  // Load custom notes from DB
  useEffect(() => {
    loadCustomNotes();
  }, []);

  const loadCustomNotes = async () => {
    try {
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').limit(1).single();
      if (!ent) return;
      const { data } = await supabase
        .from('notes_templates')
        .select('id, category, note_text')
        .eq('entity_id', ent.id)
        .eq('doc_type', docType)
        .order('created_at', { ascending: false });
      if (data) setCustomDbNotes(data);
    } catch (e) { /* silent */ }
  };

  const saveCustomNote = async (text: string, category: string) => {
    try {
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').limit(1).single();
      if (!ent) return;
      await supabase.from('notes_templates').insert({
        entity_id: ent.id,
        doc_type: docType,
        category,
        note_text: text,
        is_custom: true,
      });
      loadCustomNotes();
    } catch (e) { console.error('Failed to save note:', e); }
  };

  const deleteCustomNoteFromDb = async (noteText: string) => {
    try {
      const found = customDbNotes.find(n => n.note_text === noteText);
      if (!found) return;
      const supabase = createClient();
      await supabase.from('notes_templates').delete().eq('id', found.id);
      loadCustomNotes();
    } catch (e) { /* silent */ }
  };

  // Sync notes to parent
  const syncToParent = useCallback((notes: AddedNote[]) => {
    const text = notes.map(n => n.text).join('\n');
    onChange(text);
  }, [onChange]);

  // Get notes for selected category (with custom DB notes merged)
  const getNotesForCategory = (cat: string) => {
    const predefined = categories[cat] || [];
    const custom = customDbNotes.filter(n => n.category === cat).map(n => n.note_text);
    return [...predefined, ...custom];
  };

  const addNote = (text: string, category: string) => {
    if (addedNotes.some(n => n.text === text)) return; // No duplicates
    const newNotes = [...addedNotes, { id: `note_${Date.now()}`, text, category }];
    setAddedNotes(newNotes);
    syncToParent(newNotes);
    setIsNoteOpen(false);
  };

  const removeNote = (id: string) => {
    const newNotes = addedNotes.filter(n => n.id !== id);
    setAddedNotes(newNotes);
    syncToParent(newNotes);
  };

  const startEdit = (note: AddedNote) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (id: string) => {
    const newNotes = addedNotes.map(n => n.id === id ? { ...n, text: editText } : n);
    setAddedNotes(newNotes);
    syncToParent(newNotes);
    setEditingId(null);
  };

  const addCustomNote = () => {
    if (!customNote.trim()) return;
    const cat = 'ملاحظات مخصصة';
    addNote(customNote.trim(), cat);
    saveCustomNote(customNote.trim(), cat);
    setCustomNote('');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setIsCategoryOpen(false);
      if (noteRef.current && !noteRef.current.contains(e.target as Node)) setIsNoteOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          الملاحظات والشروط
        </h2>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Dropdown Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Dropdown */}
          <div className="relative flex-1" ref={catRef}>
            <button
              type="button"
              onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsNoteOpen(false); }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-lg text-sm hover:border-primary/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={selectedCategory ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {selectedCategory || 'اختر التصنيف...'}
                </span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-[250px] overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in slide-in-from-top-2">
                {categoryNames.map(cat => {
                  const customCount = customDbNotes.filter(n => n.category === cat).length;
                  const totalCount = (categories[cat]?.length || 0) + customCount;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); setIsNoteOpen(true); }}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{totalCount}</span>
                    </button>
                  );
                })}
                {/* Custom Notes Category */}
                {customDbNotes.some(n => !categoryNames.includes(n.category)) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory('ملاحظات مخصصة'); setIsCategoryOpen(false); setIsNoteOpen(true); }}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'ملاحظات مخصصة' ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <span>⭐ ملاحظات مخصصة</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {customDbNotes.filter(n => !categoryNames.includes(n.category)).length}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes Dropdown */}
          <div className="relative flex-1" ref={noteRef}>
            <button
              type="button"
              onClick={() => { if (selectedCategory) setIsNoteOpen(!isNoteOpen); }}
              disabled={!selectedCategory}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-lg text-sm transition-colors ${
                selectedCategory ? 'hover:border-primary/40' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-muted-foreground">اختر ملاحظة لإضافتها...</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isNoteOpen ? 'rotate-180' : ''}`} />
            </button>
            {isNoteOpen && selectedCategory && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-[250px] overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in slide-in-from-top-2">
                {getNotesForCategory(selectedCategory).map((note, i) => {
                  const isAdded = addedNotes.some(n => n.text === note);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !isAdded && addNote(note, selectedCategory)}
                      disabled={isAdded}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                        isAdded ? 'bg-primary/5 text-primary/50 cursor-default' : 'hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isAdded && <Check className="w-3 h-3 text-primary shrink-0" />}
                        <span className="line-clamp-2">{note}</span>
                      </span>
                    </button>
                  );
                })}
                {getNotesForCategory(selectedCategory).length === 0 && (
                  <div className="p-3 text-center text-xs text-muted-foreground">لا توجد ملاحظات في هذا التصنيف</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Custom Note Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomNote()}
            placeholder="اكتب ملاحظة مخصصة واضغط Enter أو +"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="button"
            onClick={addCustomNote}
            disabled={!customNote.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة
          </button>
        </div>

        {/* Added Notes List */}
        {addedNotes.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              الملاحظات المضافة ({addedNotes.length})
            </span>
            <div className="space-y-1">
              {addedNotes.map((note, idx) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 p-2.5 bg-background border border-border/50 rounded-lg group hover:border-border transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground/60 mt-1 w-4 shrink-0 text-center font-mono">{idx + 1}</span>
                  {editingId === note.id ? (
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(note.id)}
                        className="flex-1 bg-card border border-primary/30 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                        autoFocus
                      />
                      <button type="button" onClick={() => saveEdit(note.id)} className="text-primary hover:text-primary/80">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-foreground leading-relaxed">{note.text}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button type="button" onClick={() => startEdit(note)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => removeNote(note.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
