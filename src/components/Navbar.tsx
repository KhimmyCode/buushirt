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
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const orderHref = userEmail ? '/order/info' : '/login';
  const isOrderActive = pathname.startsWith('/order') || pathname === '/login';

  // Admin section renders its own header — skip the customer navbar there
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logowhite.png" alt="" className="h-7 w-auto dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logoblack.png" alt="" className="h-7 w-auto hidden dark:block" />
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Buucuties.jersey
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop session */}
            <div className="hidden md:flex items-center gap-3">
              {userEmail ? (
                <>
                  <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                    {userEmail}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>สั่งซื้อตอนนี้</span>
                </Link>
              )}
            </div>

            {/* Mobile session */}
            <div className="flex md:hidden items-center gap-2">
              {userEmail ? (
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 rounded-lg"
                  aria-label="ออกจากระบบ"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
              isActive('/') && !isOrderActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">หน้าแรก</span>
          </Link>

          <Link
            href="/manual"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
              isActive('/manual') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-medium">คู่มือ</span>
          </Link>

          <Link
            href={orderHref}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl ${
              isOrderActive
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
            }`}
          >
            <Shirt className="h-5 w-5" />
            <span className="text-[10px] font-semibold">สั่งเสื้อ</span>
          </Link>

          <Link
            href="/history"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${
              isActive('/history') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] font-medium">ประวัติ</span>
          </Link>
        </div>
      </div>

      {/* Mobile bottom-nav spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
};
