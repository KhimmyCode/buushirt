'use client';

import React from 'react';
import Link from 'next/link';
import { SHIRT_DESIGNS, SHIRT_SIZES } from '@/lib/designs';
import { Shirt } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-grow flex flex-col justify-start pb-20 pt-8">
      {/* Product Catalog */}
      <section className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            แคตตาล็อกดีไซน์สุดเท่ 🎨
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            เลือกแบบสกรีนที่คุณชอบ เพื่อนำไปปรับแต่งชื่อ เบอร์ หรือคณะต่อได้เลย!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SHIRT_DESIGNS.map((design) => (
            <div
              key={design.id}
              style={{ borderColor: design.accentColor + '40' }}
              className="bg-white dark:bg-slate-900 border-2 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview with Zoom effect */}
              <div className="relative w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {/* Accent color bar at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(to right, ${design.accentColor}, transparent)` }}
                />
              </div>

              {/* Info Block */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2.5">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-xl tracking-tight">
                    {design.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    {design.description}
                  </p>

                  {/* Sizes Badges */}
                  <div className="pt-2">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-1.5 font-black uppercase tracking-wider">
                      ไซส์ที่รองรับ:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {SHIRT_SIZES.map((s) => (
                        <span
                          key={s.value}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/10"
                        >
                          {s.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">เริ่มต้นเพียง</span>
                    <span className="text-2xl font-black" style={{ color: design.accentColor }}>
                      359.-
                    </span>
                    <span className="text-[10px] text-slate-500 ml-0.5">บ./ตัว</span>
                  </div>

                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-white active:scale-95 rounded-xl shadow-lg transition-all"
                    style={{ backgroundColor: design.accentColor, boxShadow: `0 4px 14px ${design.accentColor}40` }}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>สั่งซื้อแบบนี้</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-850 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center">
          <p>© 2026 Buucuties.jersey. All Rights Reserved. ระบบสั่งผลิตเสื้อยืดออนไลน์สัญชาติไทย</p>
          <div className="flex gap-4 font-bold">
            <Link href="/manual" className="hover:text-blue-600 transition-colors">คู่มือการใช้งาน</Link>
            <Link href="/history" className="hover:text-blue-600 transition-colors">ตรวจสอบประวัติ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
