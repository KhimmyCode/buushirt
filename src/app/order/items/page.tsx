'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { SHIRT_DESIGNS, SHIRT_SIZES } from '@/lib/designs';
import { ArrowLeft, ArrowRight, Shirt, Type, Hash, Award, HelpCircle, Sparkles } from 'lucide-react';

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
    
    // Update all items from index 1 to the end
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

  return (
    <div className="pb-24 relative">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <span className="inline-block px-2 py-0.5 bg-blue-150/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md mb-2 border border-blue-500/20">
          STEP 2 OF 4
        </span>
        <h2 className="text-xl md:text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
          ปรับแต่งลายเสื้อยืด 🎨
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          กำหนดดีไซน์สกรีน เลือกไซส์ และเขียนข้อความสกรีนสำหรับเสื้อสั่งผลิตทั้ง {customerInfo.shirtCount} ตัว
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-8">
        {shirtItems.map((item, idx) => {
          // Find selected design object
          const selectedDesign = SHIRT_DESIGNS.find((d) => d.id === item.designId) || SHIRT_DESIGNS[0];

          return (
            <div
              key={idx}
              className="p-5 md:p-6 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-3xl space-y-6 transition-all shadow-sm"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-850 pb-3 flex-wrap">
                <div className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-lg text-xs font-black">
                  {idx + 1}
                </div>
                <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">
                  เสื้อตัวที่ {idx + 1}
                </h3>

                {/* Apply to All shortcut next to first item */}
                {idx === 0 && customerInfo.shirtCount > 1 && (
                  <button
                    type="button"
                    onClick={handleApplyToAll}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/20 border border-blue-150/40 dark:border-blue-900/30 rounded-xl active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ใช้ดีไซน์/ไซส์นี้กับทุกตัว</span>
                  </button>
                )}
              </div>

              {/* Grid Layout: Config on Left, Preview on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Preview Card */}
                <div className="flex flex-col items-center justify-start bg-white dark:bg-slate-950 border border-slate-200/45 dark:border-slate-850 p-4 rounded-2xl shadow-sm lg:order-last">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-3">ตัวอย่างลายเสื้อที่เลือก</span>
                  <div className="relative w-full aspect-square max-w-[160px] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDesign.imageUrl}
                      alt={selectedDesign.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-3 text-center">
                    {selectedDesign.name}
                  </span>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 text-center line-clamp-2">
                    {selectedDesign.description}
                  </p>
                </div>

                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-5">
                  
                  {/* Design Selection - Horizontal Visual Card Scroller */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-650 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Shirt className="w-3.5 h-3.5 text-slate-405" />
                      เลือกแบบลายสกรีน:
                    </label>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scroll-smooth">
                      {SHIRT_DESIGNS.map((d) => {
                        const isSelected = item.designId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDesignChange(idx, d.id)}
                            className={`flex-shrink-0 w-36 snap-start text-left bg-white dark:bg-slate-950 border rounded-2xl overflow-hidden hover:shadow-md active:scale-95 transition-all ${
                              isSelected
                                ? 'border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950/40'
                                : 'border-slate-200 dark:border-slate-850'
                            }`}
                          >
                            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2.5 space-y-0.5">
                              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{d.name.split(' (')[0]}</p>
                              <p className="text-[8px] text-slate-400 dark:text-slate-500 line-clamp-1">{d.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection - Clickable Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-650 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-slate-405" />
                      เลือกไซส์เสื้อ:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {SHIRT_SIZES.map((s) => {
                        const isSelected = item.size === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => handleSizeChange(idx, s.value)}
                            className={`py-2 px-1 text-center rounded-xl border text-xs font-black transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span className="block text-sm">{s.value}</span>
                            <span className="block text-[8px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                              {s.extraCharge > 0 ? `+${s.extraCharge} บ.` : 'ปกติ'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Print Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Print Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-655 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Type className="w-3.5 h-3.5 text-slate-400" />
                        ชื่อสกรีนหน้าอก/หลังเสื้อ
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น JOHN หรือ สมชาย"
                        value={item.printName}
                        onChange={(e) => handleTextChange(idx, 'printName', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 text-slate-800 dark:text-slate-100 transition-all"
                      />
                    </div>

                    {/* Back Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-655 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        เบอร์หลังเสื้อ
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="เช่น 10 หรือ 99"
                        value={item.backNumber}
                        onChange={(e) => handleTextChange(idx, 'backNumber', e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 text-slate-800 dark:text-slate-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Custom Text Extra */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-655 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      ข้อมูลเพิ่มเติม (ชื่อรุ่น / ภาควิชา / คณะ)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น SE-12 หรือ คณะวิศวกรรมศาสตร์"
                      value={item.customText}
                      onChange={(e) => handleTextChange(idx, 'customText', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Back and Navigation Actions */}
        <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setStep('info');
              router.push('/order/info');
            }}
            className="flex items-center gap-1.5 px-5 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Floating Glassmorphic Sticky Calculator Dock */}
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl bg-white/75 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-center md:text-left">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">เสื้อสั่งผลิต</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {customerInfo.shirtCount} ตัว
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                ราคาตัวละ
              </span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                {summary.basePricePerUnit} บาท
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
            <div>
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">ยอดสุทธิรวมจัดส่ง</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">
                  {summary.grandTotal.toLocaleString()} บาท
                </span>
                {summary.shippingFee === 0 ? (
                  <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                    ส่งฟรี!
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold">
                    (+ส่ง {summary.shippingFee} บ.)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
          >
            <span>ถัดไป: ตรวจสอบรายการ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
