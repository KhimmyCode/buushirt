'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { SHIRT_DESIGNS, SHIRT_SIZES } from '@/lib/designs';
import { ArrowLeft, ArrowRight, User, MapPin, Phone, CheckCircle, Tag, X } from 'lucide-react';

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
      <div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">STEP 3 / 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
          ตรวจสอบความถูกต้อง
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          ตรวจสอบข้อมูลจัดส่ง รายละเอียดการสกรีนเสื้อ และราคารวมก่อนดำเนินการชำระเงิน
        </p>
      </div>

      {/* Recipient Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">ข้อมูลจัดส่งพัสดุ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">ชื่อผู้รับ</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{customerInfo.name}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">เบอร์โทรศัพท์</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{customerInfo.phone}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">ที่อยู่จัดส่ง</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{customerInfo.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Shirt Customizations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 pl-1">
          รายการเสื้อยืด ({customerInfo.shirtCount} ตัว)
        </h3>

        {/* Desktop Table View */}
        <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">แบบเสื้อ</th>
                  <th className="py-3 px-4 w-16 text-center">ไซส์</th>
                  <th className="py-3 px-4">ข้อความสกรีน</th>
                  <th className="py-3 px-4 w-20 text-center">เบอร์หลัง</th>
                  <th className="py-3 px-4">เพิ่มเติม</th>
                  <th className="py-3 px-4 w-24 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {shirtItems.map((item, idx) => {
                  const design = SHIRT_DESIGNS.find((d) => d.id === item.designId);
                  const designName = design ? design.name.split(' (')[0] : item.designId;
                  const itemPrice = summary.itemPrices[idx];
                  const sizeObj = SHIRT_SIZES.find((s) => s.value === item.size);
                  const sizeExtra = sizeObj ? sizeObj.extraCharge : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{designName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded text-xs">
                          {item.size}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]" title={item.printName || '-'}>
                        {item.printName || <span className="text-slate-300 dark:text-slate-700">-</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                        {item.backNumber || <span className="text-slate-300 dark:text-slate-700">-</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]" title={item.customText || '-'}>
                        {item.customText || <span className="text-slate-300 dark:text-slate-700">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {itemPrice} บาท
                        {sizeExtra > 0 && (
                          <span className="text-[9px] text-slate-400 block font-normal">+{sizeExtra} บ.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden space-y-3">
          {shirtItems.map((item, idx) => {
            const design = SHIRT_DESIGNS.find((d) => d.id === item.designId);
            const designName = design ? design.name.split(' (')[0] : item.designId;
            const itemPrice = summary.itemPrices[idx];
            const sizeObj = SHIRT_SIZES.find((s) => s.value === item.size);
            const sizeExtra = sizeObj ? sizeObj.extraCharge : 0;

            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-full">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{designName}</span>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded text-xs">
                    ไซส์ {item.size}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">ชื่อสกรีน</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.printName || <span className="text-slate-300 dark:text-slate-600">ไม่ระบุ</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">เบอร์หลัง</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.backNumber || <span className="text-slate-300 dark:text-slate-600">ไม่ระบุ</span>}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">ข้อความเพิ่มเติม</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.customText || <span className="text-slate-300 dark:text-slate-600">ไม่ระบุ</span>}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400">ราคาเสื้อ</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {itemPrice} บาท {sizeExtra > 0 && `(+${sizeExtra} บ.)`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeem code + invoice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Redeem Code UI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" />
            โค้ดส่วนลด
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
                  placeholder="กรอกโค้ด"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validating || !couponCode.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg disabled:opacity-50 transition-colors shrink-0"
                >
                  {validating ? 'ตรวจสอบ...' : 'ใช้โค้ด'}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            </div>
          ) : (
            <div
              className={`flex items-center justify-between border rounded-xl px-4 py-3 text-xs ${
                summary.promoType
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
              }`}
            >
              <div className="space-y-0.5">
                <p className="font-semibold">
                  {summary.promoType ? '✓' : '⚠'} โค้ด {promoCode} {summary.promoType ? 'ใช้งานได้' : 'ยังไม่เข้าเงื่อนไข'}
                </p>
                <p className="opacity-80">
                  {summary.promoType
                    ? summary.promoType === 'free_shipping'
                      ? 'ได้รับสิทธิ์จัดส่งฟรี'
                      : 'ปรับราคาเสื้อลงเหลือตัวละ 299 บาท'
                    : promoType === 'free_shipping'
                    ? 'ใช้ได้เมื่อสั่งซื้อ 5 ตัวขึ้นไป'
                    : 'ใช้ได้เมื่อสั่งซื้อ 20 ตัวขึ้นไป'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Pricing Breakdown Invoice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">สรุปค่าใช้จ่าย</h4>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">เสื้อยืด ({customerInfo.shirtCount} × {summary.basePricePerUnit} บ.)</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {(summary.basePricePerUnit * customerInfo.shirtCount).toLocaleString()} บาท
            </span>
          </div>
          {summary.sizeSurchargesTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">ค่าไซส์พิเศษ</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                +{summary.sizeSurchargesTotal.toLocaleString()} บาท
              </span>
            </div>
          )}
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
            <span className="text-slate-500">ค่าจัดส่ง</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {summary.shippingFee === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">ฟรีค่าจัดส่ง</span>
              ) : (
                `${summary.shippingFee} บาท`
              )}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-semibold text-slate-900 dark:text-white">ยอดชำระสุทธิ</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {summary.grandTotal.toLocaleString()} บาท
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            setStep('items');
            router.push('/order/items');
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          <span>ยืนยันและชำระเงิน</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
