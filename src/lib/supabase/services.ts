import { createClient } from './client';
import { Database } from './database.types';

export const supabase = createClient();

// === خدمة الكيانات (Entities) ===
export async function getEntities() {
  const { data, error } = await supabase.from('entities').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createEntity(entity: Omit<Database['public']['Tables']['entities']['Row'], 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase.from('entities').insert(entity).select().single();
  if (error) throw error;
  return data;
}

// === خدمة العملاء (Customers) ===
export async function getCustomers(entityId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCustomer(customer: any) {
  const { data, error } = await supabase.from('customers').insert(customer).select().single();
  if (error) throw error;
  return data;
}

// === خدمة المنتجات (Products) ===
export async function getProducts(entityId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProduct(product: any) {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

// === خدمة الفواتير (Invoices) ===
export async function getInvoices(entityId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name)')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInvoiceDetails(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(*)')
    .eq('id', invoiceId)
    .single();
  
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId);
    
  if (itemsError) throw itemsError;

  return { invoice: data, items };
}

// === توليد الرقم التسلسلي التلقائي للمستندات ===
export async function getNextDocumentNumber(entityId: string, type: 'quotation' | 'invoice'): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'quotation' ? `Q-${year}-` : `INV-${year}-`;
  
  try {
    let query = supabase
      .from('invoices')
      .select('invoice_number')
      .eq('entity_id', entityId)
      .ilike('invoice_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (type === 'quotation') {
      query = query.eq('type', 'quotation');
    } else {
      query = query.neq('type', 'quotation');
    }
    
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return `${prefix}001`;
    }
    
    let maxNum = 0;
    for (const row of data) {
      const numPart = row.invoice_number?.replace(prefix, '').trim();
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating next document number:', err);
    return `${prefix}001`;
  }
}
