"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Receipt, ShieldCheck, TrendingUp, Mail, Lock, 
  ArrowLeft, Loader2, CheckCircle2, Zap, Eye, EyeOff,
  FileSpreadsheet, Sparkles, Building2, Check, ArrowUpRight
} from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Normalize username & password (supports Arabic-Indic numerals & username without @)
  const normalizeIdentifier = (val: string) => {
    let normalized = val.trim().replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    if (!normalized.includes('@')) {
      normalized = `${normalized}@fatoora.app`;
    }
    return normalized;
  };

  const normalizePassword = (val: string) => {
    return val.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const authEmail = normalizeIdentifier(email);
      const authPassword = normalizePassword(password);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error, data } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user && !data.session) {
          setMessage('تم إنشاء الحساب بنجاح! راجع بريدك لتأكيد الحساب، أو سجل دخولك الآن.');
          setIsLogin(true);
        } else {
          router.push('/');
          router.refresh();
        }
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Invalid login') || errMsg.includes('credentials')) {
        setError('بيانات الدخول غير صحيحة، يرجى التأكد من اسم المستخدم وكلمة المرور');
      } else if (errMsg.includes('already registered')) {
        setError('هذا المستخدم مسجل بالفعل');
      } else if (errMsg.includes('Password should be at least')) {
        setError('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const authEmail = normalizeIdentifier(email);
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('تم إرسال رابط استعادة كلمة المرور بنجاح.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setMessage(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-indigo-600 selection:text-white overflow-hidden" dir="rtl">
      
      {/* Background Glow Mesh */}
      <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glass Card Container */}
      <main className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-[#0f172a]/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ======================================================== */}
          {/* Right Column: Promotional & SaaS Showcase (RTL View) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative bg-gradient-to-br from-slate-900/40 via-indigo-950/20 to-slate-900/60 border-b lg:border-b-0 lg:border-l border-slate-800/60 overflow-hidden">
            
            {/* Top Brand Tag */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                  <Receipt className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>فاتورة</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">PRO</span>
                  </h1>
                  <p className="text-[11px] text-slate-400">المنظومة المحاسبية المتكاملة لإدارة الفواتير</p>
                </div>
              </div>

              {/* Catchphrase */}
              <div className="space-y-3 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  معتمد ومتوافق مع اشتراطات هيئة الزكاة (ZATCA)
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
                  إدارة ذكية للفواتير، <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                    وعروض الأسعار وكشوف الحساب
                  </span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  أنشئ فواتيرك الضريبية وعروض الأسعار بدقة، وشارك كشوف الحساب الاحترافية لعملائك مع تتبع مباشر للأرصدة والمستحقات.
                </p>
              </div>
            </div>

            {/* Live Interactive Mock Invoice Preview Card */}
            <div className="my-8 relative">
              <div className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500">
                
                {/* Card Glow Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      INV
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>فاتورة ضريبية</span>
                        <span className="text-[10px] font-mono text-indigo-400">INV-2026-001</span>
                      </div>
                      <div className="text-[10px] text-slate-400">تاريخ الإصدار: اليوم · معتمدة مع ZATCA QR</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    مدفوعة
                  </span>
                </div>

                {/* Card Numbers */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 mb-0.5">المبلغ قبل الضريبة</div>
                    <div className="text-xs font-bold font-mono text-slate-200">10,000.00 ر.س</div>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 mb-0.5">ضريبة القيمة المضافة (15%)</div>
                    <div className="text-xs font-bold font-mono text-indigo-300">1,500.00 ر.س</div>
                  </div>
                  <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20">
                    <div className="text-[10px] text-indigo-300 font-medium mb-0.5">الإجمالي النهائي</div>
                    <div className="text-xs font-extrabold font-mono text-indigo-400">11,500.00 ر.س</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom 3 Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>باركود ZATCA مدمج</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span>كشف حساب تفصيلي</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>8 قوالب طباعة أنيقة</span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* Left Column: Clean Modern Login Form */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-slate-900/50">
            <div className="w-full max-w-sm mx-auto space-y-6">
              
              {/* Form Title */}
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isForgotPassword ? 'استعادة كلمة المرور' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isForgotPassword 
                    ? 'أدخل اسم المستخدم أو البريد المسجل لاستلام رابط الاستعادة' 
                    : isLogin 
                    ? 'أدخل بيانات حسابك للمتابعة إلى لوحة التحكم' 
                    : 'ابدأ إدارة أعمالك وفواتيرك باحترافية وسهولة'}
                </p>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">!</div>
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{message}</span>
                </div>
              )}

              {/* Form Fields */}
              {isForgotPassword ? (
                /* Forgot Password View */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">اسم المستخدم أو البريد الإلكتروني</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-3 pr-10 pl-3.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono"
                        placeholder="اسم المستخدم أو البريد الإلكتروني"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال رابط الاستعادة</span>}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
                    className="w-full text-xs text-slate-400 hover:text-white py-2 transition-colors text-center"
                  >
                    العودة لشاشة الدخول
                  </button>
                </form>
              ) : (
                /* Standard Login / Signup Form */
                <form onSubmit={handleAuth} className="space-y-4">
                  
                  {/* Identifier Input (Clean, No hint numbers!) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {isLogin ? 'اسم المستخدم أو البريد الإلكتروني' : 'البريد الإلكتروني'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-3 pr-10 pl-3.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono" 
                        placeholder="اسم المستخدم أو البريد الإلكتروني"
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">كلمة المرور</label>
                      {isLogin && (
                        <button 
                          type="button" 
                          onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }} 
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl py-3 pr-10 pl-10 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:translate-y-0 mt-6"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
                        <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
                      </>
                    )}
                  </button>

                  {/* Switch between Login and Signup */}
                  <div className="text-center pt-4 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">
                      {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                    </span>
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                    >
                      {isLogin ? 'أنشئ حساباً جديداً' : 'سجل دخولك'}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
