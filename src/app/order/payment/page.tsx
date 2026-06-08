'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { ArrowLeft, Check, Upload, FileText, AlertCircle, ShoppingBag, Trash2, ShieldCheck } from 'lucide-react';

export default function OrderPaymentPage() {
  const { customerInfo, shirtItems, getSummary, clearWizard, promoCode } = useOrder();
  const router = useRouter();
  const summary = getSummary();

  // Form states
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success states
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setSlipFile(file);
    setError(null);

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setSlipPreview(objectUrl);

    // Convert file to base64 for API transmission
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSlipBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSlipFile(null);
    setSlipPreview(null);
    setSlipBase64('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slipBase64) {
      setError('กรุณาอัปโหลดสลิปเพื่อยืนยันการโอนเงิน');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          shirtItems,
          slipBase64,
          promoCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการทำรายการ');
      }

      // Success
      setCreatedOrderId(data.orderId);
      setIsSuccess(true);
      clearWizard(); // Reset checkout wizard in context/localStorage
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Success Screen (Digital Receipt Card Layout)
  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-450 rounded-full shadow-lg shadow-emerald-500/20 animate-bounce">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
            สั่งซื้อสำเร็จแล้ว! 🎉
          </h2>
          <p className="text-slate-505 dark:text-slate-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
            ระบบได้รับข้อมูลสลิปและใบสั่งเสื้อยืดของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลภายใน 1 วันทำการ
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-6 text-left space-y-4 shadow-sm relative overflow-hidden">
          {/* Side notches to mock a ticket */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white dark:bg-slate-900 rounded-r-full -ml-2 border-r border-slate-200/50 dark:border-slate-850"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white dark:bg-slate-900 rounded-l-full -mr-2 border-l border-slate-200/50 dark:border-slate-850"></div>

          <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">ใบสั่งซื้อ (OrderID)</span>
            <span className="font-black text-slate-800 dark:text-slate-250 text-sm tracking-wider">{createdOrderId}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ผู้รับพัสดุ</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{customerInfo.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">จำนวนสั่งผลิต</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{customerInfo.shirtCount} ตัว</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">ยอดชำระสุทธิ</span>
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">
              {summary.grandTotal.toLocaleString()} บาท
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>ดูประวัติและติดตามสถานะ</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="inline-block px-2 py-0.5 bg-blue-150/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md mb-2 border border-blue-500/20">
          STEP 4 OF 4
        </span>
        <h2 className="text-xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
          ชำระเงินผ่าน PromptPay 💸
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          สแกนคิวอาร์โค้ด PromptPay ด้านล่างเพื่อทำการชำระเงิน จากนั้นส่งภาพหลักฐานเพื่อยืนยันคำสั่งซื้อ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: PromptPay QR Code Mockup */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-[#00377e] to-[#001d4a] text-white rounded-3xl overflow-hidden shadow-2xl border border-blue-900/50">
            {/* Header branding */}
            <div className="p-4 text-center border-b border-[#002f6c]/60 space-y-1">
              <span className="text-[9px] tracking-widest text-[#00e5ff] font-black block">
                THAI QR PAYMENT
              </span>
              {/* Logo block */}
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <span className="text-xs font-black bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent">
                  Prompt Pay
                </span>
              </div>
            </div>

            {/* QR box */}
            <div className="p-6 bg-white flex flex-col items-center justify-center relative">
              {/* Mock QR SVG */}
              <svg className="w-44 h-44 text-slate-900" viewBox="0 0 100 100">
                <rect x="5" y="5" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="currentColor" />

                <rect x="70" y="5" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="currentColor" />

                <rect x="5" y="70" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="currentColor" />

                {/* Random blocks */}
                <rect x="35" y="5" width="8" height="8" fill="currentColor" />
                <rect x="48" y="5" width="16" height="5" fill="currentColor" />
                <rect x="35" y="18" width="16" height="12" fill="currentColor" />
                <rect x="58" y="15" width="6" height="15" fill="currentColor" />

                <rect x="5" y="35" width="12" height="12" fill="currentColor" />
                <rect x="22" y="35" width="8" height="22" fill="currentColor" />
                <rect x="5" y="53" width="12" height="12" fill="currentColor" />

                <rect x="35" y="35" width="28" height="8" fill="currentColor" />
                <rect x="70" y="35" width="12" height="16" fill="currentColor" />
                <rect x="88" y="35" width="7" height="8" fill="currentColor" />

                <rect x="35" y="48" width="10" height="20" fill="currentColor" />
                <rect x="50" y="48" width="14" height="14" fill="currentColor" />
                <rect x="70" y="56" width="25" height="8" fill="currentColor" />

                <rect x="35" y="73" width="20" height="22" fill="currentColor" />
                <rect x="60" y="70" width="8" height="25" fill="currentColor" />
                <rect x="73" y="70" width="22" height="8" fill="currentColor" />
                <rect x="73" y="83" width="12" height="12" fill="currentColor" />
                <rect x="90" y="83" width="5" height="12" fill="currentColor" />

                {/* Center mini-icon */}
                <rect x="42" y="42" width="16" height="16" fill="white" rx="2" />
                <circle cx="50" cy="50" r="5" fill="#002f6c" />
              </svg>

              <span className="text-[9px] text-slate-400 mt-3 font-bold">BUUShirt Shop (089-XXX-XXXX)</span>
            </div>

            {/* QR Footer showing exact amount */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">ยอดโอนเงิน</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {summary.grandTotal.toLocaleString()}.00
              </span>
              <span className="text-xs font-black text-slate-500 ml-1">THB</span>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-center max-w-[320px]">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
              💡 แนะนำ: บันทึกหน้าจอรูป QR Code นี้เพื่อเปิดสแกนด้วยแอปธนาคารบนสมาร์ตโฟนของคุณได้ทันที
            </p>
          </div>
        </div>

        {/* Right: Upload slip form */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
              อัปโหลดสลิปโอนเงิน 🧾
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">รองรับ PNG, JPG หรือ JPEG (ขนาดสูงสุด 5MB)</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Slip Drag-and-drop or select box */}
          {!slipPreview ? (
            <div className="relative border-2 border-dashed border-slate-350 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/10 cursor-pointer transition-all hover:bg-slate-100/40">
              <input
                type="file"
                id="slipUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-3 bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-300">คลิกเพื่อเลือกรูปภาพสลิป</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">หรือลากไฟล์ภาพมาวางที่นี่</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {slipFile?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
                  title="ลบไฟล์"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Image */}
              <div className="relative aspect-[3/4] max-h-[220px] mx-auto rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slipPreview}
                  alt="Payment Slip Preview"
                  className="h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                router.push('/order/review');
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>

            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3.5 font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:active:scale-100 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ยืนยันสลิปโอนเงิน</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
