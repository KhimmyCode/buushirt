'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { Mail, ArrowRight, AlertCircle, Shirt } from 'lucide-react';

export default function LoginPage() {
  const { userEmail, login, isMounted } = useOrder();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them to /order/info directly
  useEffect(() => {
    if (isMounted && userEmail) {
      router.push('/order/info');
    }
  }, [userEmail, isMounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลของคุณ');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'การเข้าสู่ระบบล้มเหลว');
      }

      // Success: Save email in context
      login(data.email);
      router.push('/order/info');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md mx-auto w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/30 dark:border-slate-800/50 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Shirt className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-855 dark:text-slate-100 tracking-tight">
            เริ่มต้นสั่งเสื้อยืด ✌️
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            กรอกอีเมลเพื่อเริ่มกำหนดตัวเลือกเสื้อยืดของกลุ่มคุณและคำนวณราคา
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="loginEmail" className="text-xs font-black text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              อีเมลของคุณ
            </label>
            <input
              type="email"
              id="loginEmail"
              required
              disabled={loading}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 text-sm focus:outline-none transition-all disabled:opacity-50 text-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:active:scale-100 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                <span>ดำเนินการต่อ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed">
            * ระบบจะไม่ใช้รหัสผ่านเพื่อความสะดวกและปลอดภัยสูงสุด ข้อมูลและประวัติทั้งหมดจะถูกเชื่อมโยงกับอีเมลนี้โดยอัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}
