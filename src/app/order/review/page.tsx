'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { SHIRT_DESIGNS } from '@/lib/designs';
import { ArrowLeft, ArrowRight, User, MapPin, Phone, CheckCircle, Info } from 'lucide-react';

export default function OrderReviewPage() {
  const { customerInfo, shirtItems, getSummary, setStep, promoCode, promoType, setPromoCode } = useOrder();
  const router = useRouter();
  const summary = getSummary();

  const [couponCode, setCouponCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [validating, setValidating] = React.useState(false);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setValidating(true);
    setCouponError('');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: code, qty: customerInfo.shirtCount }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoCode(data.code, data.type);
        setCouponCode('');
      } else {
        setCouponError(data.error || 'ตรวจสอบโค้ดไม่สำเร็จ');
      }
    } catch {
      setCouponError('ไม่สามารถเชื่อมต่อระบบตรวจสอบโค้ดได้');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoCode('');
  };

  const handleNext = () => {
    setStep('payment');
    router.push('/order/payment');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="inline-block px-2 py-0.5 bg-blue-150/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md mb-2 border border-blue-500/20">
          STEP 3 OF 4
        </span>
        <h2 className="text-xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
          ตรวจสอบความถูกต้อง 🔍
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          ตรวจสอบข้อมูลจัดส่ง รายละเอียดการสกรีนเสื้อ และราคารวมทั้งหมดก่อนดำเนินการชำระเงิน
        </p>
      </div>

      <div className="space-y-6">
        {/* Recipient Info Card */}
        <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
          <h3 className="text-base font-black text-slate-850 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-850 pb-2.5">
            ข้อมูลจัดส่งพัสดุ 🚚
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="flex items-start gap-2.5">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ชื่อผู้รับ</span>
                <span className="font-semibold text-slate-800 dark:text-slate-350">{customerInfo.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">เบอร์โทรศัพท์</span>
                <span className="font-bold text-slate-800 dark:text-slate-350">{customerInfo.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ที่อยู่จัดส่ง</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{customerInfo.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Shirt Customizations */}
        <div className="space-y-3">
          <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200 pl-1">
            รายการเสื้อยืดสั่งผลิต ({customerInfo.shirtCount} ตัว)
          </h3>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block border border-slate-200/50 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/65 text-xs font-black text-slate-450 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800">
                    <th className="py-3.5 px-4 w-12 text-center">ตัวที่</th>
                    <th className="py-3.5 px-4">แบบเสื้อ</th>
                    <th className="py-3.5 px-4 w-20 text-center">ไซส์</th>
                    <th className="py-3.5 px-4">ข้อความสกรีนบนเสื้อ</th>
                    <th className="py-3.5 px-4 w-24 text-center">เบอร์หลัง</th>
                    <th className="py-3.5 px-4">ข้อความเพิ่มเติม</th>
                    <th className="py-3.5 px-4 w-28 text-right">ราคา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                  {shirtItems.map((item, idx) => {
                    const design = SHIRT_DESIGNS.find((d) => d.id === item.designId);
                    const designName = design ? design.name.split(' (')[0] : item.designId;
                    const itemPrice = summary.itemPrices[idx];
                    const sizeExtra = item.size === '2XL' ? 10 : item.size === '3XL' ? 20 : 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 px-4 text-center font-black text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200">
                          {designName}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black px-2 py-0.5 rounded text-xs border border-slate-200/10">
                            {item.size}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]" title={item.printName || '-'}>
                          {item.printName || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {item.backNumber || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]" title={item.customText || '-'}>
                          {item.customText || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-800 dark:text-slate-200">
                          {itemPrice} บาท
                          {sizeExtra > 0 && (
                            <span className="text-[9px] text-slate-450 block font-normal mt-0.5">
                              (+{sizeExtra} บ. ไซส์ {item.size})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (Visible on mobile, hidden on desktop) */}
          <div className="md:hidden space-y-4">
            {shirtItems.map((item, idx) => {
              const design = SHIRT_DESIGNS.find((d) => d.id === item.designId);
              const designName = design ? design.name.split(' (')[0] : item.designId;
              const itemPrice = summary.itemPrices[idx];
              const sizeExtra = item.size === '2XL' ? 10 : item.size === '3XL' ? 20 : 0;

              return (
                <div key={idx} className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black rounded-lg">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
                        {designName}
                      </span>
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black px-2.5 py-0.5 rounded-lg text-xs border border-slate-200/10">
                      ไซส์ {item.size}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">ชื่อสกรีน:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {item.printName || <span className="text-slate-350 dark:text-slate-650 italic">ไม่ระบุ</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">เบอร์หลัง:</span>
                      <span className="font-black text-slate-700 dark:text-slate-300">
                        {item.backNumber || <span className="text-slate-350 dark:text-slate-650 italic">ไม่ระบุ</span>}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-medium">ข้อความเพิ่มเติม:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.customText || <span className="text-slate-350 dark:text-slate-655 italic">ไม่ระบุ</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900 text-xs">
                    <span className="text-slate-400 font-medium">ราคาเสื้อ:</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {itemPrice} บาท {sizeExtra > 0 && `(ไซส์ ${item.size} +${sizeExtra} บ.)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Price Calculation & Invoice breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Policy Indicator & Redeem Code */}
          <div className="space-y-4">
            <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 text-xs text-slate-500 space-y-2.5">
              <h4 className="font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-4 h-4 text-blue-500" />
                การคิดราคาและส่วนลดของคุณ (ราคาปกติ):
              </h4>
              <div className="space-y-1.5 pl-1 font-medium">
                <p className={customerInfo.shirtCount >= 20 ? 'font-black text-blue-600 dark:text-blue-400' : ''}>
                  • BUY 20+ ตัว: ตัวละ 319 บาท (ค่าส่ง 80 บ.) {customerInfo.shirtCount >= 20 && '👈 อัตราปกติของคุณ'}
                </p>
                <p className={customerInfo.shirtCount >= 10 && customerInfo.shirtCount <= 19 ? 'font-black text-blue-600 dark:text-blue-400' : ''}>
                  • BUY 10+ ตัว: ตัวละ 329 บาท (ค่าส่ง 80 บ.) {customerInfo.shirtCount >= 10 && customerInfo.shirtCount <= 19 && '👈 อัตราปกติของคุณ'}
                </p>
                <p className={customerInfo.shirtCount >= 5 && customerInfo.shirtCount <= 9 ? 'font-black text-blue-600 dark:text-blue-400' : ''}>
                  • BUY 5+ ตัว: ตัวละ 339 บาท (ค่าส่ง 60 บ.) {customerInfo.shirtCount >= 5 && customerInfo.shirtCount <= 9 && '👈 อัตราปกติของคุณ'}
                </p>
                <p className={customerInfo.shirtCount >= 3 && customerInfo.shirtCount <= 4 ? 'font-black text-blue-600 dark:text-blue-400' : ''}>
                  • BUY 3+ ตัว: ตัวละ 349 บาท (ค่าส่ง 40 บ.) {customerInfo.shirtCount >= 3 && customerInfo.shirtCount <= 4 && '👈 อัตราปกติของคุณ'}
                </p>
                <p className={customerInfo.shirtCount <= 2 ? 'font-black text-blue-650 dark:text-blue-400' : ''}>
                  • BUY 1 ตัว: ตัวละ 359 บาท (ค่าส่ง 40 บ.) {customerInfo.shirtCount <= 2 && '👈 อัตราปกติของคุณ'}
                </p>
              </div>
            </div>

            {/* Redeem Code UI */}
            <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                🎟️ กรอกโค้ดส่วนลด (Redeem Code)
              </h4>
              
              {!promoCode ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 font-bold placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validating || !couponCode.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                    >
                      {validating ? 'ตรวจ...' : 'ใช้โค้ด'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 font-semibold">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className={`flex items-center justify-between border rounded-xl px-4 py-3 text-xs ${
                    summary.promoType 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    <div className="space-y-0.5">
                      <p className="font-black">
                        {summary.promoType ? '✓' : '⚠️'} ประยุกต์ใช้โค้ด {promoCode} {summary.promoType ? 'สำเร็จ' : 'ยังไม่เข้าเงื่อนไข'}
                      </p>
                      <p className="text-[10px] opacity-80 font-medium">
                        {summary.promoType 
                          ? (summary.promoType === 'free_shipping' ? 'ได้รับสิทธิ์จัดส่งฟรีเรียบร้อย' : 'ปรับราคาเสื้อลงเหลือตัวละ 299 บาท')
                          : (promoType === 'free_shipping' ? 'โค้ดนี้ใช้ได้เฉพาะเมื่อสั่งซื้อ 5 ตัวขึ้นไป' : 'โค้ดนี้ใช้ได้เฉพาะเมื่อสั่งซื้อ 20 ตัวขึ้นไป')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-black text-rose-400 hover:text-rose-500 underline hover:no-underline shrink-0"
                    >
                      ยกเลิกโค้ด
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown Invoice */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 text-sm">
            <h4 className="font-black text-slate-800 dark:text-slate-200 border-b border-slate-200/40 dark:border-slate-850 pb-2">
              สรุปรายละเอียดค่าใช้จ่าย 🧾
            </h4>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-450 dark:text-slate-400">เสื้อยืด ({customerInfo.shirtCount} ตัว x {summary.basePricePerUnit} บาท)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {(summary.basePricePerUnit * customerInfo.shirtCount).toLocaleString()} บาท
              </span>
            </div>
            {summary.sizeSurchargesTotal > 0 && (
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-450 dark:text-slate-400">บวกเพิ่มไซส์พิเศษ (2XL ขึ้นไป)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  +{summary.sizeSurchargesTotal.toLocaleString()} บาท
                </span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200/40 dark:border-slate-850 pb-2 text-xs font-semibold">
              <span className="text-slate-450 dark:text-slate-400">ค่าจัดส่งจัดส่งพัสดุด่วน</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {summary.shippingFee === 0 ? (
                  <span className="text-emerald-500 font-black">ฟรีค่าจัดส่ง</span>
                ) : (
                  `${summary.shippingFee} บาท`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">ยอดชำระสุทธิ</span>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">
                {summary.grandTotal.toLocaleString()} บาท
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setStep('items');
              router.push('/order/items');
            }}
            className="flex items-center gap-1.5 px-5 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3.5 font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ยืนยันและชำระเงิน</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
