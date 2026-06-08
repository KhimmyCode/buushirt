'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shirt, CreditCard, Search, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export default function ManualPage() {
  const [openSection, setOpenSection] = useState<string | null>('how-to-order');

  const sections: ManualSection[] = [
    {
      id: 'how-to-order',
      title: 'วิธีสั่งซื้อเสื้อยืด (How to Order)',
      icon: Shirt,
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <ol className="list-decimal list-inside space-y-3 pl-1">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">เข้าสู่ระบบด้วยอีเมล:</strong>{' '}
              กดปุ่ม &quot;เริ่มสั่งทำเสื้อยืด&quot; ที่หน้าแรก จากนั้นกรอกอีเมลของคุณเพื่อเข้าสู่ระบบ (ไม่ต้องสมัครสมาชิก)
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">กรอกข้อมูลผู้รับ:</strong>{' '}
              กรอกชื่อ-นามสกุล ที่อยู่จัดส่ง และเบอร์โทรศัพท์ให้ครบถ้วน พร้อมระบุจำนวนเสื้อที่ต้องการสั่ง
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">เลือกแบบเสื้อและระบุรายละเอียด:</strong>{' '}
              เลือกดีไซน์เสื้อ ไซส์ ใส่ชื่อและเบอร์หลัง (ถ้ามี) สำหรับเสื้อแต่ละตัว
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">ตรวจสอบและชำระเงิน:</strong>{' '}
              ตรวจทานรายละเอียดทั้งหมด โอนเงินผ่าน PromptPay และอัปโหลดสลิปโอนเงิน
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">รอรับเสื้อ:</strong>{' '}
              ระบบจะแจ้งสถานะการผลิตและจัดส่ง ตรวจสอบได้ที่หน้า &quot;ประวัติสั่งซื้อ&quot;
            </li>
          </ol>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>เคล็ดลับ: ยิ่งสั่งจำนวนมากยิ่งได้ราคาถูกลง! สั่ง 5+ ตัวเริ่มลดราคา</span>
          </div>
        </div>
      ),
    },
    {
      id: 'pricing',
      title: 'ราคาและโปรโมชั่น (Pricing)',
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>ราคาเสื้อขึ้นอยู่กับจำนวนที่สั่งรวมในออเดอร์เดียวกัน:</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-500">
                <tr>
                  <th className="px-4 py-3">จำนวน</th>
                  <th className="px-4 py-3">ราคา/ตัว</th>
                  <th className="px-4 py-3">ค่าส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="px-4 py-3 font-bold">BUY 1</td><td className="px-4 py-3 text-blue-600 font-black">359 บ.</td><td className="px-4 py-3">+40 บ.</td></tr>
                <tr><td className="px-4 py-3 font-bold">BUY 3+</td><td className="px-4 py-3 text-teal-600 font-black">349 บ.</td><td className="px-4 py-3">+40 บ.</td></tr>
                <tr className="bg-indigo-50/50 dark:bg-indigo-950/20"><td className="px-4 py-3 font-bold">BUY 5+ 🔥</td><td className="px-4 py-3 text-purple-600 font-black">339 บ.</td><td className="px-4 py-3">+60 บ.</td></tr>
                <tr><td className="px-4 py-3 font-bold">BUY 10+</td><td className="px-4 py-3 text-amber-600 font-black">329 บ.</td><td className="px-4 py-3">+80 บ.</td></tr>
                <tr><td className="px-4 py-3 font-bold">BUY 20+</td><td className="px-4 py-3 text-rose-600 font-black">319 บ.</td><td className="px-4 py-3">+80 บ.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">* ไซส์ 2XL บวกเพิ่ม 10 บาท / ไซส์ 3XL บวกเพิ่ม 20 บาท</p>
        </div>
      ),
    },
    {
      id: 'payment',
      title: 'วิธีชำระเงิน (Payment)',
      icon: CreditCard,
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <ul className="list-disc list-inside space-y-3 pl-1">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">โอนพอดีจำนวนที่ถูกต้อง:</strong>{' '}
              ในหน้าชำระเงิน ระบบจะแสดงยอดชำระสุทธิที่คำนวณส่วนลดเรียบร้อยแล้ว โปรดโอนให้ตรงกับจำนวนดังกล่าว
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">การสแกนจ่าย:</strong>{' '}
              เปิดแอปธนาคาร เลือกเมนู &quot;สแกนจ่าย&quot; หรือ &quot;สแกน QR&quot; แล้วสแกน QR Code ในหน้าเว็บ
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">อัปโหลดสลิป:</strong>{' '}
              หลังโอนเงินสำเร็จ บันทึกสลิปและอัปโหลดในฟิลด์ &quot;อัปโหลดสลิปโอนเงิน&quot; จากนั้นกด &quot;ยืนยันการชำระเงิน&quot;
            </li>
          </ul>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>หมายเหตุ: สลิปโอนเงินจะถูกตรวจสอบโดยผู้ดูแลระบบ หากถูกต้อง สถานะจะเปลี่ยนเป็น &quot;กำลังผลิต&quot; ภายใน 1-2 วันทำการ</span>
          </div>
        </div>
      ),
    },
    {
      id: 'how-to-track',
      title: 'การตรวจสอบสถานะและประวัติการสั่งซื้อ (Track Order)',
      icon: Search,
      content: (
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>ตรวจสอบสถานะออเดอร์ได้ที่หน้า &quot;ประวัติสั่งซื้อ&quot; โดย:</p>
          <ol className="list-decimal list-inside space-y-3 pl-1">
            <li>กดเมนู &quot;ประวัติสั่งซื้อ&quot; ในแถบนำทาง</li>
            <li>กรอกอีเมลที่ใช้สั่งซื้อ แล้วกด &quot;ดึงประวัติการสั่งซื้อ&quot;</li>
            <li>ระบบจะแสดงออเดอร์ทั้งหมดพร้อมสถานะ กดที่ออเดอร์เพื่อดูรายละเอียด</li>
          </ol>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
            {[
              { label: 'รอตรวจสอบ', desc: 'ได้รับออเดอร์แล้ว กำลังตรวจสอบสลิป', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
              { label: 'ตรวจสอบเสร็จสิ้น', desc: 'สลิปผ่านแล้ว เตรียมเข้าสู่สายการผลิต', color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400' },
              { label: 'กำลังผลิต', desc: 'สลิปผ่านแล้ว กำลังสกรีนเสื้อ', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' },
              { label: 'จัดส่งแล้ว', desc: 'เสื้อถูกส่งแล้ว พร้อมเลขพัสดุ', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 space-y-1 ${s.color}`}>
                <p className="font-black">{s.label}</p>
                <p className="text-[10px] opacity-75">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'คำถามที่พบบ่อย (FAQ)',
      icon: BookOpen,
      content: (
        <div className="space-y-4 text-sm">
          {[
            {
              q: 'สั่งได้สูงสุดกี่ตัวต่อออเดอร์?',
              a: 'ระบบรองรับสูงสุด 20 ตัวต่อออเดอร์ หากต้องการมากกว่านั้น กรุณาแบ่งเป็นหลายออเดอร์',
            },
            {
              q: 'เสื้อแต่ละตัวในออเดอร์เดียวกันใช้แบบต่างกันได้ไหม?',
              a: 'ได้เลย! แต่ละตัวสามารถเลือกแบบเสื้อ ไซส์ ชื่อ และเบอร์แตกต่างกันได้ทั้งหมด',
            },
            {
              q: 'ระยะเวลาผลิตและจัดส่งนานแค่ไหน?',
              a: 'หลังปิด Pre-order ใช้เวลาผลิตประมาณ 7-14 วันทำการ และจัดส่งอีก 1-3 วัน',
            },
            {
              q: 'ถ้าโอนเงินไปแล้วแต่ลืมอัปโหลดสลิป ทำอย่างไร?',
              a: 'ติดต่อผู้ดูแลระบบพร้อมแนบรูปสลิปโอนเงินและ OrderID ของคุณ',
            },
          ].map((item, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 font-bold text-slate-700 dark:text-slate-300 text-xs">
                Q: {item.q}
              </div>
              <div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                A: {item.a}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12 flex-grow">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-blue-600" />
          คู่มือการใช้งาน BUUShirt
        </h1>
        <p className="text-xs text-slate-500">วิธีสั่งซื้อ ชำระเงิน และติดตามสถานะเสื้อยืดของคุณ</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-800 dark:text-slate-100 text-sm">{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
