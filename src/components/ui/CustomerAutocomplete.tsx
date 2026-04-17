"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, Building2, Check, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getCustomers } from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';

export interface CustomerData {
  id: string;
  name: string;
  tax_number: string;
  address: string;
  type: string;
}

interface CustomerAutocompleteProps {
  value: string;
  onChange: (customer: CustomerData | null, rawName: string) => void;
  onOpenCreateNew: (name: string) => void;
}

export function CustomerAutocomplete({ value, onChange, onOpenCreateNew }: CustomerAutocompleteProps) {
  const { activeEntity } = useStore();
  const [query, setQuery] = useState(value);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync prop value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchAllCustomers = async () => {
    if (!activeEntity?.name) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: ent } = await supabase.from('entities').select('id').eq('name', activeEntity.name).single();
      if (ent) {
        const data = await getCustomers(ent.id);
        setCustomers(data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllCustomers();
  }, [activeEntity?.name]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    (c.tax_number && c.tax_number.includes(query))
  );

  const exactMatch = customers.find(c => c.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="absolute right-3 w-4 h-4 text-muted-foreground/60" />
        <input
          type="text"
          className="w-full bg-background border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
          placeholder="ابحث أو أدخل اسم جديد..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange(null, e.target.value); // Reset exact selection until clicked
          }}
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              fetchAllCustomers();
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            fetchAllCustomers();
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1.5">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">جاري تحميل العملاء...</div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onChange(customer, customer.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-right flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                    {customer.type === 'company' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground">{customer.name}</div>
                    {customer.tax_number && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">الرقم الضريبي: {customer.tax_number}</div>
                    )}
                  </div>
                  {value === customer.name && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                لم يتم العثور على عميل بهذا الاسم
              </div>
            )}
            
            {/* Quick Create Action */}
            {!exactMatch && query.trim() !== '' && (
              <div className="pt-1 mt-1 border-t border-border/50">
                <button
                  onClick={() => {
                    onOpenCreateNew(query);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة "{query}" كعميل جديد
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 p-2 text-center border-t border-border/50">
             <button 
               onClick={(e) => {
                 e.preventDefault();
                 window.open('/customers', '_blank');
               }}
               className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
             >
               <ExternalLink className="w-3 h-3" />
               إدارة جميع العملاء
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
