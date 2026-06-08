'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { ArrowRight, User, MapPin, Phone, Hash, AlertCircle, Sparkles } from 'lucide-react';

export default function OrderInfoPage() {
  const { customerInfo, updateCustomerInfo, setStep } = useOrder();
  const router = useRouter();

  // Local form states initialized with context values
  const [name, setName] = useState(customerInfo.name);
  const [address, setAddress] = useState(customerInfo.address);
  const [phone, setPhone] = useState(customerInfo.phone);
  const [shirtCount, setShirtCount] = useState(customerInfo.shirtCount);

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state if context changes
  useEffect(() => {
    setName(customerInfo.name);
    setAddress(customerInfo.address);
    setPhone(customerInfo.phone);
    setShirtCount(customerInfo.shirtCount);
  }, [customerInfo]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อผู้รับ';
    }

    if (!address.trim()) {
      newErrors.address = 'กรุณากรอกที่อยู่สำหรับจัดส่ง';
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'เบอร์โทรศัพท์มือถือไม่ถูกต้อง (ต้องมี 10 หลักและขึ้นต้นด้วย 0)';
      }
    }

    const count = Number(shirtCount);
    if (isNaN(count) || count < 1 || count > 20) {
      newErrors.shirtCount = 'จำนวนเสื้อที่สั่งได้ต้องอยู่ระหว่าง 1 ถึง 20 ตัว';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      updateCustomerInfo({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        shirtCount: Number(shirtCount),
      });
      setStep('items');
      router.push('/order/items');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <span className="inline-block px-2 py-0.5 bg-blue-150/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md mb-2 border border-blue-500/20">
          STEP 1 OF 4
        </span>
        <h2 className="text-xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
          ข้อมูลผู้รับ & จัดส่ง 🚚
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          กรอกรายละเอียดการติดต่อจัดส่ง พร้อมระบุจำนวนเสื้อยืดที่กลุ่มของคุณต้องการสั่งทำ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <User className="w-4 h-4 text-slate-400" />
            ชื่อ-นามสกุล ผู้รับเสื้อ
          </label>
          <input
            type="text"
            id="name"
            placeholder="เช่น นายรักเรียน ดีเลิศ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-none focus:ring-4 transition-all text-slate-800 dark:text-slate-150 ${
              errors.name
                ? 'border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950/20 text-rose-600'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:ring-blue-950/30'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Shipping address */}
        <div className="space-y-2">
          <label htmlFor="address" className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-slate-400" />
            ที่อยู่จัดส่งโดยละเอียด
          </label>
          <textarea
            id="address"
            rows={3}
            placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-none focus:ring-4 transition-all text-slate-800 dark:text-slate-150 ${
              errors.address
                ? 'border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950/20 text-rose-600'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:ring-blue-950/30'
            }`}
          />
          {errors.address && (
            <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-slate-400" />
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <input
              type="text"
              id="phone"
              maxLength={10}
              placeholder="เช่น 0891234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-none focus:ring-4 transition-all text-slate-800 dark:text-slate-150 ${
                errors.phone
                  ? 'border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950/20 text-rose-600'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-800 dark:focus:ring-blue-950/30'
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Shirt Count - Redesigned Mobile Stepper & Preset Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Hash className="w-4 h-4 text-slate-400" />
              จำนวนเสื้อที่ต้องการสั่ง (1-20 ตัว)
            </label>
            
            {/* Stepper controls */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setShirtCount(Math.max(1, shirtCount - 1))}
                disabled={shirtCount <= 1}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-slate-750 dark:text-slate-200"
              >
                -
              </button>
              <div className="w-12 text-center text-lg font-black text-slate-800 dark:text-slate-100">
                {shirtCount}
              </div>
              <button
                type="button"
                onClick={() => setShirtCount(Math.min(20, shirtCount + 1))}
                disabled={shirtCount >= 20}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-slate-750 dark:text-slate-200"
              >
                +
              </button>
            </div>

            {/* Quick Presets Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { value: 1, label: '1 ตัว (359 บ.)' },
                { value: 3, label: '3 ตัว ⚡ ตัวละ 349 บ.' },
                { value: 10, label: '10 ตัว 👥 ตัวละ 329 บ.' },
                { value: 20, label: '20 ตัว 🏷️ ตัวละ 319 บ.' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setShirtCount(preset.value)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                    shirtCount === preset.value
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing info badge */}
        <div className="p-4 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100/60 dark:border-blue-900/30 rounded-2xl space-y-2">
          <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-500" />
            ข้อมูลราคาและโปรโมชันตามจำนวน (Bulk Tier):
          </h4>
          <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 pl-4 list-disc font-medium">
            <li>สั่งซื้อ 1-2 ตัว: ราคาตัวละ <strong className="text-slate-800 dark:text-slate-200">359 บาท</strong> (ค่าส่ง 40 บาท)</li>
            <li>สั่งซื้อ 3-4 ตัว: ราคาตัวละ <strong className="text-slate-800 dark:text-slate-200">349 บาท</strong> (ค่าส่ง 40 บาท)</li>
            <li>สั่งซื้อ 5-9 ตัว: ราคาตัวละ <strong className="text-slate-800 dark:text-slate-200">339 บาท</strong> (ค่าส่ง 60 บาท)</li>
            <li>สั่งซื้อ 10-19 ตัว: ราคาตัวละ <strong className="text-slate-800 dark:text-slate-200">329 บาท</strong> (ค่าส่ง 80 บาท)</li>
            <li>สั่งซื้อ 20 ตัวขึ้นไป: ราคาตัวละ <strong className="text-slate-800 dark:text-slate-200">319 บาท</strong> (ค่าส่ง 80 บาท)</li>
            <li>ไซส์พิเศษ: 2XL +10 บาท/ตัว, 3XL +20 บาท/ตัว</li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
          >
            <span>ถัดไป: เลือกแบบเสื้อ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
