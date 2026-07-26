'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { SHIRT_DESIGNS, SHIRT_SIZES } from '@/lib/designs';
import { ArrowLeft, ArrowRight, Shirt, Type, Hash, Award, HelpCircle, Copy } from 'lucide-react';

export default function OrderItemsPage() {
  const { customerInfo, shirtItems, updateShirtItem, getSummary, setStep } = useOrder();
  const router = useRouter();
  const summary = getSummary();

  const handleDesignChange = (index: number, designId: string) => {
    updateShirtItem(index, { designId });
  };

  const handleSizeChange = (index: number, size: string) => {
    updateShirtItem(index, { size });
  };

  const handleTextChange = (index: number, field: 'printName' | 'backNumber' | 'customText', value: string) => {
    updateShirtItem(index, { [field]: value });
  };

  // Helper to copy design & size of the first item to all other items
  const handleApplyToAll = () => {
    const firstItem = shirtItems[0];
    if (!firstItem) return;

    for (let i = 1; i < shirtItems.length; i++) {
      updateShirtItem(i, {
        designId: firstItem.designId,
        size: firstItem.size,
      });
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
    router.push('/order/review');
  };

  const textInputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition-colors';

  return (
    <div className="pb-28 relative">
      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">STEP 2 / 4</span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
          ปรับแต่งลายเสื้อยืด
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          กำหนดดีไซน์ ไซส์ และข้อความสกรีนสำหรับเสื้อทั้ง {customerInfo.shirtCount} ตัว
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        {shirtItems.map((item, idx) => {
          const selectedDesign = SHIRT_DESIGNS.find((d) => d.id === item.designId) || SHIRT_DESIGNS[0];

          return (
            <div
              key={idx}
              className="p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  เสื้อตัวที่ {idx + 1}
                </h3>

                {idx === 0 && customerInfo.shirtCount > 1 && (
                  <button
                    type="button"
                    onClick={handleApplyToAll}
                    className="ml-auto flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/50"
                  >
                    <Copy className="w-3 h-3" />
                    <span>ใช้แบบนี้กับทุกตัว</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Visual Preview Card */}
                <div className="flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-xl lg:order-last">
                  <div className="relative w-full aspect-square max-w-[140px] rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedDesign.imageUrl} alt={selectedDesign.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2.5 text-center">
                    {selectedDesign.name}
                  </span>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Design Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5" />
                      แบบลายสกรีน
                    </label>

                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {SHIRT_DESIGNS.map((d) => {
                        const isSelected = item.designId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDesignChange(idx, d.id)}
                            className={`relative flex-shrink-0 w-28 text-left bg-white dark:bg-slate-950 border rounded-xl overflow-hidden transition-colors ${
                              isSelected
                                ? 'border-blue-600 ring-1 ring-blue-600'
                                : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                              {d.isNew && (
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white bg-blue-600">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {d.name.split(' (')[0]}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      ไซส์เสื้อ
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {SHIRT_SIZES.map((s) => {
                        const isSelected = item.size === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => handleSizeChange(idx, s.value)}
                            className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span className="block">{s.value}</span>
                            {s.extraCharge > 0 && (
                              <span className="block text-[9px] font-normal opacity-80 mt-0.5">
                                +{s.extraCharge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Print Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5" />
                        ชื่อสกรีนหลัง
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น TOON"
                        value={item.printName}
                        onChange={(e) => handleTextChange(idx, 'printName', e.target.value)}
                        className={textInputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        เบอร์หลังเสื้อ
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="เช่น 1, 01 หรือ 99"
                        value={item.backNumber}
                        onChange={(e) => handleTextChange(idx, 'backNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                        className={textInputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      ข้อความเพิ่มเติม (เช่น คณะ)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Engineering"
                      value={item.customText}
                      onChange={(e) => handleTextChange(idx, 'customText', e.target.value)}
                      className={textInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Back navigation */}
        <div className="flex justify-start pt-2">
          <button
            type="button"
            onClick={() => {
              setStep('info');
              router.push('/order/info');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Sticky Calculator Dock */}
        <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
            <div>
              <span className="text-[10px] text-slate-400 block">{customerInfo.shirtCount} ตัว</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {summary.basePricePerUnit} บ./ตัว
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-slate-400 block">ยอดสุทธิ</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {summary.grandTotal.toLocaleString()} บาท
                </span>
                {summary.shippingFee === 0 && (
                  <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                    ส่งฟรี
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-sm"
          >
            <span>ถัดไป: ตรวจสอบรายการ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
