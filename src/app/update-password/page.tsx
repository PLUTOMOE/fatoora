"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Receipt } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setMessage('تم تحديث كلمة المرور بنجاح! سيتم تحويلك للرئيسية...');
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      if (err.message?.includes('Password should be at least')) {
        setError('كلمة المرور ضعيفة، يجب أن تتكون من 6 أحرف على الأقل');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#131b2e] dark:bg-[#0a0f1a] text-[#faf8ff] h-screen overflow-hidden flex items-center justify-center relative selection:bg-[#3d32e6] selection:text-white" dir="rtl">
      
      {/* Ambient Light Leaks */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#3d32e6]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#6a1edb]/15 rounded-full blur-[100px] pointer-events-none"></div>
      
      <main className="w-full max-w-md mx-auto px-4 relative z-10">
        <div className="glass-panel p-8 rounded-[1.5rem] cinematic-shadow relative overflow-hidden bg-[#131b2e]/80 border border-[#c7c4d9]/10">
          
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3d32e6] to-[#5852ff] flex items-center justify-center shadow-lg shadow-[#3d32e6]/30">
              <Receipt className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">فاتورة</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">تعيين كلمة مرور جديدة</h2>
            <p className="text-[#c5c4de] text-sm">قم بإدخال كلمة المرور الجديدة لحسابك.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] p-4 rounded-lg flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 text-[13px] p-4 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#dae2fd]">كلمة المرور الجديدة</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Lock className="w-5 h-5 text-[#777588]" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#283044]/60 border border-[#c7c4d9]/20 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-[#777588] focus:border-[#3d32e6] focus:ring-1 focus:ring-[#3d32e6] transition-all text-left font-mono" 
                  dir="ltr" 
                  placeholder="••••••••" 
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !password}
              className="w-full bg-gradient-to-br from-[#3d32e6] to-[#5852ff] hover:from-[#5852ff] hover:to-[#3d32e6] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(61,50,230,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>تحديث وحفظ</span>
                  <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
                </>
              )}
            </button>
          </form>
          
        </div>
      </main>
    </div>
  );
}
