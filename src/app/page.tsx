'use client';

import React from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { SHIRT_DESIGNS, SHIRT_SIZES, NEW_COLLECTION_DESIGNS } from '@/lib/designs';
import { Shirt, ArrowRight, UserRound, PenLine, QrCode, Truck, Sparkles } from 'lucide-react';

const HOW_IT_WORKS = [
  { icon: UserRound, title: 'เข้าสู่ระบบด้วยอีเมล', desc: 'ไม่ต้องสมัครสมาชิก ไม่ต้องตั้งรหัสผ่าน' },
  { icon: PenLine, title: 'เลือกลาย ไซส์ และสกรีนชื่อ', desc: 'กำหนดชื่อ เบอร์ และคณะได้ทีละตัว' },
  { icon: QrCode, title: 'ชำระผ่าน PromptPay', desc: 'สแกนจ่ายแล้วอัปโหลดสลิปยืนยัน' },
  { icon: Truck, title: 'ติดตามสถานะได้ตลอด', desc: 'เช็กความคืบหน้าได้ที่หน้าประวัติสั่งซื้อ' },
];

export default function HomePage() {
  const { userEmail } = useOrder();
  const orderHref = userEmail ? '/order/info' : '/login';

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto w-full px-4 py-14 md:py-20 text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 uppercase tracking-wide">
            <Shirt className="w-3.5 h-3.5" />
            BUU Jersey · Pre-order
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto text-balance">
            เสื้อ Jersey เท่ๆ ในสไตล์ชาว BUU
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            เลือกลาย เลือกไซส์ กำหนดชื่อสกรีนของแต่ละตัว แล้วจ่ายผ่าน PromptPay — ยิ่งสั่งเยอะ ยิ่งได้ราคาถูกลง
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={orderHref}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              <span>เริ่มสั่ง Jersey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/manual"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span>ดูวิธีสั่งซื้อ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Collection Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/10">
        <div className="max-w-6xl mx-auto w-full px-4 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                New Collection
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                คอลเลกชันใหม่ล่าสุด
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                3 ลายใหม่ Ocean Grace, Pink Velvet และ Black Pearl มาแล้ว พร้อมให้สั่งทำวันนี้
              </p>
            </div>
            <Link
              href={orderHref}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shrink-0"
            >
              <span>ช้อปคอลเลกชันใหม่</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {NEW_COLLECTION_DESIGNS.map((design) => (
              <Link
                href={orderHref}
                key={design.id}
                className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div className="relative bg-slate-50 dark:bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-600">
                    NEW
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{design.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {design.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto w-full px-4 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">STEP {idx + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Catalog */}
      <section className="max-w-6xl mx-auto w-full px-4 py-6 md:py-10 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            เลือกลายเสื้อ
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            เลือกแบบสกรีนที่ชอบ แล้วปรับแต่งชื่อ เบอร์ หรือคณะได้ในขั้นตอนถัดไป
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHIRT_DESIGNS.map((design) => (
            <div
              key={design.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col"
            >
              <div className="relative w-full bg-slate-50 dark:bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.imageUrl} alt={design.name} className="w-full h-auto object-contain" />
                {design.isNew && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-600">
                    NEW
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                    {design.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {design.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {SHIRT_SIZES.map((s) => (
                      <span
                        key={s.value}
                        className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-800"
                      >
                        {s.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">เริ่มต้นเพียง</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      359<span className="text-xs font-medium text-slate-400 ml-1">บาท/ตัว</span>
                    </span>
                  </div>

                  <Link
                    href={orderHref}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <span>สั่งซื้อ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center">
          <p>© 2026 Buucuties.jersey — ระบบสั่งผลิตเสื้อยืดออนไลน์สัญชาติไทย</p>
          <div className="flex gap-5 font-medium">
            <Link href="/manual" className="hover:text-blue-600 transition-colors">คู่มือการใช้งาน</Link>
            <Link href="/history" className="hover:text-blue-600 transition-colors">ตรวจสอบประวัติ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
