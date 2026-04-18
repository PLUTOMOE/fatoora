import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

const SUPER_ADMIN_EMAIL = '38mhamdy@gmail.com';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    // If not the super admin, redirect them out immediately
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Super Admin Top Banner */}
      <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 shadow-md">
        <ShieldAlert className="w-5 h-5" />
        <span>منطقة الإدارة العليا (Super Admin) - الوصول مقتصر على {SUPER_ADMIN_EMAIL} فقط</span>
      </div>
      
      {/* Admin Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
