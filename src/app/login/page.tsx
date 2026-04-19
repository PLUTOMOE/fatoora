"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { Receipt, ShieldCheck, TrendingUp, Mail, Lock, ArrowLeft, Loader2, CheckCircle2, Zap, Sun, Moon, Globe, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const { resolvedTheme, setTheme } = useTheme();
  const { lang } = useTranslation();
  const setLanguage = useStore(s => s.setLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
            setMessage('تم إنشاء الحساب بنجاح! راجع صندوق بريدك الإلكتروني لتأكيد الحساب والتمكن من تسجيل الدخول.');
            setIsLogin(true);
        } else {
            router.push('/');
            router.refresh();
        }
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Invalid login') || errMsg.includes('credentials')) {
          setError('البيانات المدخلة غير صحيحة، تأكد من البريد أو كلمة المرور');
      } else if (errMsg.includes('already registered')) {
          setError('هذا البريد الإلكتروني مسجل بالفعل');
      } else if (errMsg.includes('Password should be at least')) {
          setError('كلمة المرور ضعيفة، يجب أن تتكون من 6 أحرف على الأقل');
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch(err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
      <div className="bg-[#131b2e] dark:bg-[#0a0f1a] text-[#faf8ff] h-screen overflow-hidden flex items-center justify-center relative selection:bg-[#3d32e6] selection:text-white" dir="rtl">
        
        {/* Ambient Light Leaks */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#3d32e6]/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#6a1edb]/15 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Main Container */}
        <main className="w-full max-w-7xl mx-auto px-3 md:px-6 relative z-10">
          <div className="glass-panel rounded-[1.5rem] cinematic-shadow overflow-hidden flex flex-col lg:flex-row" style={{height: 'calc(100vh - 2.5rem)'}}>
            
            {/* Promotional Area (Right Side - RTL) */}
            <div className="w-full lg:w-3/5 p-5 lg:p-8 flex flex-col relative z-20 overflow-hidden">
              {/* Brand */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3d32e6] to-[#5852ff] flex items-center justify-center shadow-lg shadow-[#3d32e6]/30">
                  <Receipt className="text-white w-5 h-5" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">فاتورة</h1>
              </div>
              
              {/* Headline */}
              <div className="mb-4">
                <h2 className="text-2xl lg:text-4xl font-bold leading-tight mb-2 text-gradient">
                  مستقبل الإدارة <br/>المالية الذكية
                </h2>
                <p className="text-[#c5c4de] text-sm max-w-md font-light leading-relaxed">
                  منصة متكاملة تجمع بين الدقة المحاسبية والذكاء الاصطناعي لتطوير أعمالك بسلاسة.
                </p>
              </div>
              
              <div className="hidden lg:flex flex-1 items-center justify-center relative py-2">
                <div className="absolute w-48 h-48 bg-[#3d32e6]/20 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
                <img 
                  alt="Invoicing and Financial Management 3D Illustration" 
                  className="relative z-10 w-full max-w-[220px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Lu7szjGBPAgrd1X19-q3-inTavqzBOLM9SiMUXQkE4qFtx7vUBi__lu6UZ_CGQwMb3OEbwOlvZr5PXxu7BeJcGWSZukfSTs1mbcyrHGq6KEuq6BtIBSwe4DzOsGSWHRsDHuDLuWTicw8bp-dVNC98MQcNQ8dXa3ZxB_abWl2cxi3ghsCCt78pjinSkp701x1c-THay6SFihm4w9A90NWSF_5QTThDtFQdQeAU5tmT9tWyJlz8B-0ZZHnSh7TsbLVvciv7I_CPJQ" 
                  style={{ animation: 'float-cinematic 8s ease-in-out infinite' }}
                />
              </div>
              
              {/* Feature Cards - hidden on small screens */}
              <div className="hidden md:grid grid-cols-2 gap-4 mt-auto">
                <div className="group relative p-4 rounded-xl bg-[#283044]/50 border border-[#c7c4d9]/10 hover:bg-[#283044]/80 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-3 border border-green-500/30">
                    <ShieldCheck className="text-green-400 w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">معتمد من هيئة الزكاة</h3>
                  <p className="text-xs text-[#c5c4de]">ربط مباشر مع أنظمة ZATCA للمرحلة الثانية.</p>
                </div>
                
                <div className="group relative p-4 rounded-xl bg-[#283044]/50 border border-[#c7c4d9]/10 hover:bg-[#283044]/80 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#6a1edb]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-8 h-8 rounded-lg bg-[#6a1edb]/20 flex items-center justify-center mb-3 border border-[#6a1edb]/30">
                    <TrendingUp className="text-[#eaddff] w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">تحليلات ذكية</h3>
                  <p className="text-xs text-[#c5c4de]">رؤى مالية فورية مدعومة بالذكاء الاصطناعي.</p>
                </div>
              </div>
            </div>
            
            {/* Login Form Area (Left Side - RTL) */}
            <div className="w-full lg:w-2/5 bg-[#131b2e]/80 p-5 lg:p-8 flex flex-col justify-center relative border-r border-[#c7c4d9]/10 overflow-y-auto">
              <div className="max-w-sm w-full mx-auto">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isForgotPassword ? 'استعادة كلمة المرور' : isLogin ? 'مرحباً بعودتك' : 'ابدأ رحلة النجاح'}
                </h2>
                <p className="text-[#c5c4de] text-sm mb-6">
                  {isForgotPassword 
                    ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.' 
                    : isLogin 
                      ? 'سجل دخولك للوصول إلى لوحة التحكم الخاصة بك.' 
                      : 'أنشئ حسابك لإدارة شركاتك وفواتيرك بشكل احترافي ومتوافق.'}
                </p>

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

                {isForgotPassword ? (
                  /* Forgot Password Form */
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#dae2fd]">البريد الإلكتروني</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <Mail className="w-5 h-5 text-[#777588]" />
                        </div>
                        <input 
                          type="email" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#283044]/60 border border-[#c7c4d9]/20 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-[#777588] focus:border-[#3d32e6] focus:ring-1 focus:ring-[#3d32e6] transition-all text-left font-mono" 
                          dir="ltr" 
                          placeholder="name@company.com" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || !email}
                      className="w-full bg-gradient-to-br from-[#3d32e6] to-[#5852ff] hover:from-[#5852ff] hover:to-[#3d32e6] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(61,50,230,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 mt-8"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>إرسال رابط الاستعادة</span>
                        </>
                      )}
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
                      className="w-full bg-transparent border border-[#c7c4d9]/20 hover:bg-white/5 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      العودة لتسجيل الدخول
                    </button>
                  </form>
                ) : (
                  /* Login / Signup Form */
                  <>
                  <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#dae2fd]">البريد الإلكتروني</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <Mail className="w-5 h-5 text-[#777588]" />
                        </div>
                        <input 
                          type="email" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#283044]/60 border border-[#c7c4d9]/20 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-[#777588] focus:border-[#3d32e6] focus:ring-1 focus:ring-[#3d32e6] transition-all text-left font-mono" 
                          dir="ltr" 
                          placeholder="name@company.com" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#dae2fd]">كلمة المرور</label>
                        {isLogin && (
                          <button 
                            type="button" 
                            onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }} 
                            className="text-xs text-[#c2c1ff] hover:underline"
                          >
                            نسيت كلمة المرور؟
                          </button>
                        )}
                      </div>
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
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-br from-[#3d32e6] to-[#5852ff] hover:from-[#5852ff] hover:to-[#3d32e6] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(61,50,230,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 mt-8"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب مجاناً'}</span>
                          <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="mt-8 mb-6 relative flex items-center">
                    <div className="flex-grow border-t border-[#c7c4d9]/20"></div>
                    <span className="flex-shrink-0 mx-4 text-[#777588] text-sm font-medium">أو</span>
                    <div className="flex-grow border-t border-[#c7c4d9]/20"></div>
                  </div>

                  {/* Google Login Button */}
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white text-slate-900 border border-[#c7c4d9]/20 hover:bg-gray-100 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50" 
                    type="button"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    <span>الدخول باستخدام جوجل</span>
                  </button>

                  <p className="text-center text-xs text-[#777588] mt-8">
                    {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
                      className="text-[#e2dfff] hover:underline font-medium"
                    >
                      {isLogin ? 'أنشئ حساباً جديداً' : 'سجل دخولك'}
                    </button>
                    <br className="mt-2" />
                    بتسجيل الدخول، أنت توافق على <a className="text-[#e2dfff] hover:underline" href="#">شروط الخدمة</a> و <a className="text-[#e2dfff] hover:underline" href="#">سياسة الخصوصية</a>.
                  </p>
                  </>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
  );
}
