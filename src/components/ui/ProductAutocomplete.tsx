"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Package, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface ProductData {
  id: string;
  name: string;
  price: number;
  tax_rate: number;
  sku: string | null;
  description: string | null;
}

interface ProductAutocompleteProps {
  value: string;
  onChange: (product: ProductData | null, rawName: string) => void;
}

export function ProductAutocomplete({ value, onChange }: ProductAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entityId, setEntityId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Resolve entity_id
  const resolveEntityId = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('entities').select('id').limit(1).single();
      if (data) {
        setEntityId(data.id);
        return data.id;
      }
    } catch (e) {
      console.error('Failed to resolve entity for products:', e);
    }
    return null;
  }, []);

  const fetchProducts = useCallback(async (eid?: string | null) => {
    const id = eid || entityId;
    if (!id) {
      const resolved = await resolveEntityId();
      if (!resolved) return;
      return fetchProducts(resolved);
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('entity_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
    setLoading(false);
  }, [entityId, resolveEntityId]);

  // Auto-save new product
  const saveNewProduct = useCallback(async (name: string): Promise<ProductData | null> => {
    let id = entityId;
    if (!id) {
      id = await resolveEntityId();
      if (!id) return null;
    }
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').insert({
        entity_id: id,
        name: name.trim(),
        price: 0,
        tax_rate: 15,
      }).select().single();
      if (error) throw error;
      // Refresh the list
      fetchProducts(id);
      return data;
    } catch (e) {
      console.error('Failed to save product:', e);
      return null;
    }
  }, [entityId, resolveEntityId, fetchProducts]);

  useEffect(() => {
    resolveEntityId().then(id => {
      if (id) fetchProducts(id);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  const exactMatch = products.find(p => p.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="w-full bg-transparent border border-transparent focus:border-border hover:border-border rounded-md px-3 py-2 text-sm outline-none focus:bg-background transition-all font-medium"
        placeholder="ابحث عن منتج أو اكتب مباشرة..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onChange(null, e.target.value);
        }}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            fetchProducts();
          }
        }}
        onFocus={() => {
          setIsOpen(true);
          fetchProducts();
        }}
      />

      {isOpen && (query.length > 0 || products.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2" style={{ minWidth: '300px' }}>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1.5">
            {loading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">جاري التحميل...</div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 8).map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    onChange(product, product.name);
                    setQuery(product.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-right flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{product.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {product.price > 0 ? `${product.price.toLocaleString()} ر.س` : 'بدون سعر'}
                      {product.sku ? ` · ${product.sku}` : ''}
                    </div>
                  </div>
                  {value === product.name && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))
            ) : query.trim() ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                لم يتم العثور على منتج بهذا الاسم
              </div>
            ) : null}

            {/* Quick Create */}
            {!exactMatch && query.trim() !== '' && (
              <div className="pt-1 mt-1 border-t border-border/50">
                <button
                  onClick={async () => {
                    const saved = await saveNewProduct(query);
                    if (saved) {
                      onChange(saved, saved.name);
                      setQuery(saved.name);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  حفظ "{query}" كمنتج جديد
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
