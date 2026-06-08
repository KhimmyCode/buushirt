'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { Shirt, LogOut, History, BookOpen, Home, ShoppingCart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { userEmail, logout } = useOrder();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/manual', label: 'คู่มือการใช้งาน', icon: BookOpen },
    { href: '/history', label: 'ประวัติสั่งซื้อ', icon: History },
  ];

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      logout();
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Determine order flow link
  const orderHref = userEmail ? '/order/info' : '/login';
  const isOrderActive = pathname.startsWith('/order') || pathname === '/login';

  return (
    <>
      {/* Top Floating Glass Capsule Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200/30 dark:border-slate-800/40 shadow-xl rounded-2xl transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-md shadow-blue-500/20">
                  <Shirt className="h-5 w-5" />
                </div>
                <span className="font-black text-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
                  BUUShirt
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Action/Session */}
            <div className="hidden md:flex items-center gap-4">
              {userEmail ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200/30 dark:border-slate-800/40 font-semibold max-w-[180px] truncate">
                    {userEmail}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-300"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ออกระบบ</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>สั่งซื้อตอนนี้</span>
                </Link>
              )}
            </div>

            {/* Mobile Top Navbar - Right Actions (Logout or Sign In icon) */}
            <div className="flex md:hidden items-center gap-2">
              {userEmail ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200/20 dark:border-slate-800/40 font-medium max-w-[100px] truncate">
                    {userEmail.split('@')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg active:scale-95 transition-all"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Gen Z Capsule Dock) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border border-slate-200/30 dark:border-slate-800/40 shadow-2xl rounded-2xl px-2 py-2 flex justify-around items-center transition-all duration-300">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            isActive('/') && !isOrderActive
              ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">หน้าแรก</span>
        </Link>

        <Link
          href="/manual"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            isActive('/manual')
              ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[10px]">คู่มือ</span>
        </Link>

        <Link
          href={orderHref}
          className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all duration-200 -translate-y-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ${
            isOrderActive ? 'scale-110 ring-4 ring-white dark:ring-slate-900' : 'opacity-90'
          }`}
        >
          <Shirt className="h-5 w-5 animate-pulse" />
          <span className="text-[9px] font-black">สั่งเสื้อ</span>
        </Link>

        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
            isActive('/history')
              ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-[10px]">ประวัติ</span>
        </Link>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-24"></div>
    </>
  );
};
