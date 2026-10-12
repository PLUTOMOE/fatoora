"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Package, Edit3, Trash2, 
  CheckCircle2, X, Save 
} from 'lucide-react';
import { useZajelStore } from '@/store/zajelStore';
import { ProductItem } from '@/types/zajel';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useZajelStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('خدمة');
  const [price, setPrice] = useState<number>(500);
  const [taxRate, setTaxRate] = useState<number>(15);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const openNewModal = () => {
    setEditingId(null);
    setCode(`SRV-${String(products.length + 1).padStart(3, '0')}`);
    setName('');
    setDescription('');
    setUnit('جلسة');
    setPrice(1000);
    setTaxRate(15);
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingId(p.id);
    setCode(p.code);
    setName(p.name);
    setDescription(p.description || '');
    setUnit(p.unit);
    setPrice(p.price);
    setTaxRate(p.taxRate);
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateProduct(editingId, {
        code,
        name: name.trim(),
        description: description.trim() || undefined,
        unit,
        price: Number(price) || 0,
        taxRate: Number(taxRate) || 15,
        status,
      });
    } else {
      addProduct({
        code: code || `SRV-${String(products.length + 1).padStart(3, '0')}`,
        name: name.trim(),
        description: description.trim() || undefined,
        unit,
        price: Number(price) || 0,
        taxRate: Number(taxRate) || 15,
        status,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#202D3B]">الأصناف والخدمات</h2>
          <p className="text-xs text-slate-500 mt-0.5">قائمة المنتجات والخدمات لتسهيل إضافة البنود في الفواتير وعروض الأسعار</p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C59A55] hover:bg-[#B38944] text-white text-xs font-bold shadow-sm shadow-[#C59A55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف أو خدمة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم الصنف أو الكود أو الوصف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-[#202D3B] placeholder-slate-400 focus:outline-none focus:border-[#C59A55]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">كود الصنف</th>
                <th className="py-3 px-4">اسم الصنف أو الخدمة</th>
                <th className="py-3 px-4">الوصف</th>
                <th className="py-3 px-4 text-center">الوحدة</th>
                <th className="py-3 px-4 text-center">السعر الافتراضي</th>
                <th className="py-3 px-4 text-center">الضريبة</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد أصناف أو خدمات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#202D3B]">
                      {p.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {p.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-[#202D3B]">
                      {p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {p.taxRate}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="تعديل الصنف"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-[#202D3B]">
                {editingId ? 'تعديل بيانات الصنف أو الخدمة' : 'إضافة صنف أو خدمة جديدة'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كود الصنف *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الوحدة *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="جلسة، حبة، شهر..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم الصنف أو الخدمة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: خدمة استشارية، تطوير برمجيات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="تفاصيل ومواصفات البند..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#202D3B] outline-none focus:border-[#C59A55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">السعر الافتراضي (ر.س) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نسبة الضريبة (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[#202D3B] outline-none focus:border-[#C59A55]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C59A55] text-white font-bold hover:bg-[#B38944] shadow-xs"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
