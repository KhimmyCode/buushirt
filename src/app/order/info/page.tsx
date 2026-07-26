'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { ArrowRight, User, MapPin, Phone, Hash, AlertCircle, Info } from 'lucide-react';

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
    if (isNaN(count) || count < 1 || count > 30) {
      newErrors.shirtCount = 'จำนวนเสื้อที่สั่งได้ต้องอยู่ระหว่าง 1 ถึง 30 ตัว';
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

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 transition-colors text-slate-900 dark:text-white ${
      hasError
        ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/30 focus:border-blue-500'
    }`;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">STEP 1 / 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
          ข้อมูลผู้รับและจัดส่ง
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          กรอกรายละเอียดการติดต่อจัดส่ง พร้อมระบุจำนวนเสื้อยืดที่ต้องการสั่งทำ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            ชื่อ-นามสกุล ผู้รับเสื้อ
          </label>
          <input
            type="text"
            id="name"
            placeholder="เช่น นายรักเรียน ดีเลิศ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass(!!errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Shipping address */}
        <div className="space-y-1.5">
          <label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            ที่อยู่จัดส่งโดยละเอียด
          </label>
          <textarea
            id="address"
            rows={3}
            placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass(!!errors.address)}
          />
          {errors.address && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Shirt Count */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-slate-400" />
              จำนวนเสื้อ (1-30 ตัว)
            </label>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 w-fit">
              <button
                type="button"
                onClick={() => setShirtCount(Math.max(1, shirtCount - 1))}
                disabled={shirtCount <= 1}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-40"
              >
                −
              </button>
              <div className="w-10 text-center text-base font-bold text-slate-900 dark:text-white">
                {shirtCount}
              </div>
              <button
                type="button"
                onClick={() => setShirtCount(Math.min(30, shirtCount + 1))}
                disabled={shirtCount >= 30}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 1, label: '1 ตัว · 359 บ.' },
            { value: 3, label: '3 ตัว · 349 บ.' },
            { value: 5, label: '5 ตัว · 339 บ.' },
            { value: 10, label: '10 ตัว · 329 บ.' },
            { value: 20, label: '20 ตัว · 319 บ.' },
            { value: 30, label: '30 ตัว · 319 บ.' },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setShirtCount(preset.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                shirtCount === preset.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Pricing info badge */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-2">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            ราคาตามจำนวนที่สั่ง
          </h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>1-2 ตัว: <strong className="text-slate-800 dark:text-slate-200">359 บาท/ตัว</strong> (ค่าส่ง 40 บ.)</li>
            <li>3-4 ตัว: <strong className="text-slate-800 dark:text-slate-200">349 บาท/ตัว</strong> (ค่าส่ง 40 บ.)</li>
            <li>5-9 ตัว: <strong className="text-slate-800 dark:text-slate-200">339 บาท/ตัว</strong> (ค่าส่ง 60 บ.)</li>
            <li>10-19 ตัว: <strong className="text-slate-800 dark:text-slate-200">329 บาท/ตัว</strong> (ค่าส่ง 80 บ.)</li>
            <li>20 ตัวขึ้นไป: <strong className="text-slate-800 dark:text-slate-200">319 บาท/ตัว</strong> (ค่าส่ง 80 บ.)</li>
            <li className="pt-1 text-slate-500">ไซส์พิเศษ: 2XL +10 / 3XL +20 / 4XL +30 / 5XL +40 บาท ต่อตัว</li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-sm"
          >
            <span>ถัดไป: เลือกแบบเสื้อ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
