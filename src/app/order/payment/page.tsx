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
  const [receiptInfo, setReceiptInfo] = useState<{
    name: string;
    shirtCount: number;
    grandTotal: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setSlipFile(file);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setSlipPreview(objectUrl);

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

      setReceiptInfo({
        name: customerInfo.name,
        shirtCount: customerInfo.shirtCount,
        grandTotal: summary.grandTotal,
      });
      setCreatedOrderId(data.orderId);
      setIsSuccess(true);
      clearWizard();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="text-center py-6 space-y-6">
        <div className="mx-auto flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            สั่งซื้อสำเร็จแล้ว
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            ระบบได้รับข้อมูลสลิปและใบสั่งเสื้อยืดของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบภายใน 1 วันทำการ
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-slate-400 text-xs font-medium">หมายเลขใบสั่งซื้อ</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">{createdOrderId}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ผู้รับพัสดุ</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{receiptInfo?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">จำนวนสั่งผลิต</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{receiptInfo?.shirtCount || 0} ตัว</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
            <span className="font-semibold text-slate-900 dark:text-white">ยอดชำระสุทธิ</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {(receiptInfo?.grandTotal || 0).toLocaleString()} บาท
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>ดูประวัติและติดตามสถานะ</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors text-sm"
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
      <div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">STEP 4 / 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
          ชำระเงินผ่าน PromptPay
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          สแกน QR Code ด้านล่างเพื่อชำระเงิน จากนั้นอัปโหลดสลิปเพื่อยืนยันคำสั่งซื้อ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: PromptPay QR Code */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Payment.jpeg" alt="Scan to Pay" className="w-full h-auto object-contain" />
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">ยอดโอนเงิน</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.grandTotal.toLocaleString()}.00
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">THB</span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-center max-w-[300px]">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              บันทึกภาพ QR Code ไว้เพื่อเปิดสแกนด้วยแอปธนาคารบนมือถือได้ทันที
            </p>
          </div>
        </div>

        {/* Right: Upload slip form */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">อัปโหลดสลิปโอนเงิน</h3>
            <p className="text-xs text-slate-400">รองรับ PNG, JPG หรือ JPEG (ขนาดสูงสุด 5MB)</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!slipPreview ? (
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center gap-2.5 bg-slate-50/60 dark:bg-slate-900/30 cursor-pointer transition-colors">
              <input
                type="file"
                id="slipUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">คลิกเพื่อเลือกรูปภาพสลิป</p>
                <p className="text-xs text-slate-400">หรือลากไฟล์ภาพมาวางที่นี่</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {slipFile?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  title="ลบไฟล์"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-[3/4] max-h-[200px] mx-auto rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slipPreview} alt="Payment Slip Preview" className="h-full object-contain" />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.push('/order/review')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>

            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
