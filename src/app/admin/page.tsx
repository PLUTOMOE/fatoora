"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Trash2, Building2, Receipt, AlertTriangle, Loader2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('لا توجد جلسة نشطة');

      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل في جلب المستخدمين');
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === '38mhamdy@gmail.com') {
      alert('لا يمكن حذف حساب السوبر أدمن الأساسي!');
      return;
    }

    if (!confirm(`هل أنت متأكد تماماً من رغبتك في حذف الحساب ${email}؟\n\nتحذير: هذا سيؤدي أيضاً إلى حذف كل الشركات والفواتير والعملاء المرتبطين بهذا الحساب نهائياً، ولا يمكن التراجع عن هذا الإجراء!`)) {
      return;
    }

    try {
      setDeletingId(userId);
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل في الحذف');
      }

      alert('تم حذف الحساب وكافة بياناته بنجاح.');
      await fetchUsers(); // Refresh
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">لوحة التحكم العليا</h1>
          <p className="text-slate-500 mt-1">خاصة بك فقط، للتحكم في كافة مستخدمي منصة (فاتورة)</p>
        </div>
        <button onClick={fetchUsers} className="bg-white border shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">تحديث البيانات</button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-4 border border-red-100">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="mt-0.5 font-medium">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-500">إجمالي الحسابات</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-black mt-4">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 opacity-90 z-10 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded">قريباً (إحصائيات الكيانات)</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-500">الشركات المنشأة</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Building2 size={20} /></div>
          </div>
          <p className="text-3xl font-black mt-4">--</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 opacity-90 z-10 flex items-center justify-center">
             <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded">قريباً (إحصائيات الفواتير)</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-500">الفواتير المُصدرة</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Receipt size={20} /></div>
          </div>
          <p className="text-3xl font-black mt-4">--</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">سجل المستخدمين المسجلين</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-4">البريد الإلكتروني</th>
                <th className="px-6 py-4">تاريخ التسجيل</th>
                <th className="px-6 py-4">آخر تسجيل دخول</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                       {u.email}
                       {u.email === '38mhamdy@gmail.com' && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-full font-bold">المالك</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500" dir="ltr">{new Date(u.created_at).toLocaleString('ar-SA')}</td>
                  <td className="px-6 py-4 text-slate-500" dir="ltr">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ar-SA') : 'لم يسجل دخول بعد'}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      disabled={deletingId === u.id || u.email === '38mhamdy@gmail.com'}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span>حذف وحظر</span>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">لا يوجد مستخدمين بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
