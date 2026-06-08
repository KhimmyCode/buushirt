'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'รหัสผ่านไม่ถูกต้อง');
        setPassword('');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mx-auto">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Buucuties.jersey Admin</h1>
              <p className="text-xs text-slate-400 mt-1">กรุณาใส่รหัสผ่านเพื่อเข้าสู่หลังบ้าน</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-red-400 text-xs font-medium">⚠ {error}</span>
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/40"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> เข้าสู่ระบบหลังบ้าน</>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-600">
            🔒 เฉพาะผู้ดูแลระบบเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
