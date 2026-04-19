import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ notifications: [], count: 0 });

    const today = new Date().toISOString().split('T')[0];
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Invoices due within 3 days (unpaid)
    const { data: dueSoon } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, total, due_date')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', in3Days)
      .order('due_date', { ascending: true });

    // Overdue invoices
    const { data: overdue } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, total, due_date')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date', { ascending: true })
      .limit(5);

    const notifications = [
      ...(overdue || []).map(inv => ({
        id: `overdue-${inv.id}`,
        type: 'overdue',
        title: 'فاتورة متأخرة',
        desc: `${inv.invoice_number || `INV-${inv.id}`} · ${inv.customer_name || '—'}`,
        amount: inv.total,
        date: inv.due_date,
        invoiceId: inv.id,
        color: '#E5484D',
      })),
      ...(dueSoon || []).map(inv => ({
        id: `due-${inv.id}`,
        type: 'due_soon',
        title: 'فاتورة تستحق قريباً',
        desc: `${inv.invoice_number || `INV-${inv.id}`} · ${inv.customer_name || '—'}`,
        amount: inv.total,
        date: inv.due_date,
        invoiceId: inv.id,
        color: '#F59E0B',
      })),
    ];

    return NextResponse.json({ notifications, count: notifications.length });
  } catch (error) {
    return NextResponse.json({ notifications: [], count: 0 });
  }
}
