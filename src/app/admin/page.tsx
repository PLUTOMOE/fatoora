"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, Trash2, Building2, Receipt, AlertTriangle, 
  Loader2, TrendingUp, RefreshCw, ShieldCheck, Clock,
  UserCheck, BarChart3, DollarSign, Activity
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata?: { full_name?: string };
}

interface UserWithStats extends AuthUser {
  entity_count?: number;
  invoice_count?: number;
  invoice_total?: number;
}

interface PlatformStats {
  users: number;
  entities: number;
  invoices: number;
  revenue: number;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ users: 0, entities: 0, invoices: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const supabase = createClient();

  const fetchPlatformStats = async () => {
    try {
      const [{ count: entCount }, { count: invCount }, { data: invData }] = await Promise.all([
        supabase.from('entities').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total'),
      ]);

      const revenue = invData?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0;
      return { entities: entCount || 0, invoices: invCount || 0, revenue };
    } catch {
      return { entities: 0, invoices: 0, revenue: 0 };
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const [{ count: entCount }, { count: invCount }, { data: invData }] = await Promise.all([
        supabase.from('entities').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('invoices').select('total').eq('user_id', userId),
      ]);
      const total = invData?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0;
      return { entity_count: entCount || 0, invoice_count: invCount || 0, invoice_total: total };
    } catch {
      return { entity_count: 0, invoice_count: 0, invoice_total: 0 };
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('لا توجد جلسة نشطة');

      const [res, dbStats] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        fetchPlatformStats()
      ]);

      if (!res.ok) throw new Error((await res.json()).error || 'فشل في جلب المستخدمين');

      const data = await res.json();
      const rawUsers: AuthUser[] = data.users || [];

      // Fetch per-user stats in parallel
      const enriched = await Promise.all(
        rawUsers.map(async (u) => {
          const s = await fetchUserStats(u.id);
          return { ...u, ...s };
        })
      );

      setUsers(enriched);
      setStats({ users: enriched.length, ...dbStats });
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === '38mhamdy@gmail.com') {
      alert('لا يمكن حذف حساب السوبر أدمن الأساسي!');
      return;
    }
    if (!confirm(`هل أنت متأكد من حذف حساب ${email}؟\n\nسيؤدي هذا إلى حذف جميع شركاته وفواتيره نهائياً.`)) return;

    try {
      setDeletingId(userId);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'فشل في الحذف');
      await fetchUsers();
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#5B5BD6]" />
        <p className="text-sm text-muted-foreground">جاري تحميل بيانات المنصة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#E5484D]" />
            <h1 className="text-2xl font-extrabold text-foreground">لوحة التحكم العليا</h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
          </p>
        </div>
        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="المستخدمون" value={stats.users} color="blue" />
        <StatCard icon={Building2} label="الشركات المنشأة" value={stats.entities} color="indigo" />
        <StatCard icon={Receipt} label="الفواتير المُصدرة" value={stats.invoices} color="emerald" />
        <StatCard 
          icon={DollarSign} 
          label="إجمالي الإيرادات" 
          value={`${stats.revenue.toLocaleString()} ر.س`} 
          color="amber" 
          isText 
        />
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#5B5BD6]" />
            <h2 className="text-[15px] font-semibold text-foreground">سجل المستخدمين</h2>
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{users.length} مستخدم</span>
        </div>

        {/* Mobile: Cards */}
        <div className="divide-y divide-border lg:hidden">
          {users.map(u => (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                    {u.user_metadata?.full_name || u.email.split('@')[0]}
                    {u.email === '38mhamdy@gmail.com' && (
                      <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">المالك</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{u.email}</div>
                </div>
                <button
                  onClick={() => handleDeleteUser(u.id, u.email)}
                  disabled={deletingId === u.id || u.email === '38mhamdy@gmail.com'}
                  className="text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors disabled:opacity-30"
                >
                  {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3 text-[12px]">
                <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                  🏢 {u.entity_count} شركة
                </span>
                <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                  🧾 {u.invoice_count} فاتورة
                </span>
                <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                  💰 {(u.invoice_total || 0).toLocaleString()} ر.س
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground/70">
                انضم: {new Date(u.created_at).toLocaleDateString('ar-SA')}
                {u.last_sign_in_at && <> · آخر دخول: {new Date(u.last_sign_in_at).toLocaleDateString('ar-SA')}</>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">المستخدم</th>
                <th className="px-5 py-3 font-medium">الشركات</th>
                <th className="px-5 py-3 font-medium">الفواتير</th>
                <th className="px-5 py-3 font-medium">الإيرادات</th>
                <th className="px-5 py-3 font-medium">تاريخ الانضمام</th>
                <th className="px-5 py-3 font-medium">آخر دخول</th>
                <th className="px-5 py-3 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-[13px] text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#5B5BD6]/10 flex items-center justify-center text-[#5B5BD6] text-[10px] font-bold flex-shrink-0">
                        {(u.user_metadata?.full_name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div>{u.user_metadata?.full_name || u.email.split('@')[0]}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                      {u.email === '38mhamdy@gmail.com' && (
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">مالك</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-foreground tabular-nums">{u.entity_count}</td>
                  <td className="px-5 py-3.5 text-[13px] text-foreground tabular-nums">{u.invoice_count}</td>
                  <td className="px-5 py-3.5 text-[13px] text-foreground tabular-nums">{(u.invoice_total || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground">ر.س</span></td>
                  <td className="px-5 py-3.5 text-[12px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="px-5 py-3.5 text-[12px] text-muted-foreground">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('ar-SA') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      disabled={deletingId === u.id || u.email === '38mhamdy@gmail.com'}
                      className="flex items-center gap-1.5 text-[12px] text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                    >
                      {deletingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">لا يوجد مستخدمون بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isText }: { 
  icon: any; label: string; value: any; color: string; isText?: boolean 
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={`font-bold text-foreground ${isText ? 'text-[18px]' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}
