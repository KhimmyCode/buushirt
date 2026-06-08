'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useOrder } from '@/context/OrderContext';
import { History, Calendar, CreditCard, ChevronDown, ChevronUp, Package, Truck, User, MapPin, Mail, AlertCircle, RefreshCw } from 'lucide-react';

interface OrderRow {
  OrderID: string;
  Timestamp: string;
  Email: string;
  CustomerName: string;
  ShippingAddress: string;
  Phone: string;
  TotalItems: number;
  TotalPrice: number;
  SlipUrl: string;
  Status: string;
  TrackingNumber: string;
}

interface OrderItemRow {
  OrderID: string;
  ItemIndex: number;
  DesignName: string;
  Size: string;
  PrintName: string;
  BackNumber: string;
  CustomText: string;
  ItemPrice: number;
}

interface HistoryItem {
  order: OrderRow;
  items: OrderItemRow[];
}

export default function HistoryPage() {
  const { userEmail, login, isMounted } = useOrder();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Passwordless login form states (used if not logged in)
  const [inputEmail, setInputEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch order history from API
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (response.ok) {
        setHistoryList(data.history || []);
      } else {
        // If API returned 401, user is actually logged out
        setHistoryList([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted && userEmail) {
      fetchHistory();
    }
  }, [userEmail, isMounted, fetchHistory]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setLoginError('กรุณากรอกอีเมล');
      return;
    }

    setLoading(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'การเข้าสู่ระบบล้มเหลว');
      }

      login(data.email); // Sets state in context
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'จัดส่งแล้ว':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <Truck className="w-3.5 h-3.5" />
            จัดส่งแล้ว
          </span>
        );
      case 'กำลังผลิต':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Package className="w-3.5 h-3.5" />
            กำลังผลิต
          </span>
        );
      case 'ตรวจสอบเสร็จสิ้น':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
            <RefreshCw className="w-3.5 h-3.5" />
            ตรวจสอบเสร็จสิ้น
          </span>
        );
      case 'รอตรวจสอบ':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            รอตรวจสอบ
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const renderTimeline = (status: string) => {
    const steps = [
      { label: 'รับออเดอร์', active: true },
      { label: 'ตรวจสอบเสร็จ', active: status === 'ตรวจสอบเสร็จสิ้น' || status === 'กำลังผลิต' || status === 'จัดส่งแล้ว' },
      { label: 'กำลังผลิต', active: status === 'กำลังผลิต' || status === 'จัดส่งแล้ว' },
      { label: 'จัดส่งแล้ว', active: status === 'จัดส่งแล้ว' },
    ];
    return (
      <div className="flex items-center justify-between w-full max-w-xs sm:max-w-md mx-auto py-3.5 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/35 dark:border-slate-850">
        {steps.map((step, sIdx) => (
          <React.Fragment key={sIdx}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                step.active ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {sIdx + 1}
              </div>
              <span className={`text-[9px] font-black mt-1 text-center ${
                step.active ? 'text-slate-700 dark:text-slate-350' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
            {sIdx < steps.length - 1 && (
              <div className="flex-1 px-1">
                <div className={`h-0.5 rounded-full ${
                  steps[sIdx + 1].active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-850'
                }`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login Gate if user not logged in
  if (!userEmail) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-16 flex-grow flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ตรวจสอบประวัติการสั่งซื้อ
            </h1>
            <p className="text-xs text-slate-500">
              กรุณากรอกอีเมลที่ใช้สั่งซื้อเพื่อตรวจสอบสถานะของเสื้อสกรีน
            </p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                ที่อยู่อีเมลของคุณ
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="example@email.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-850 dark:bg-slate-800 text-sm focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-70 rounded-xl shadow-md shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>ดึงประวัติการสั่งซื้อ</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 flex-grow flex flex-col justify-start pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-250/20 dark:border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-805 dark:text-slate-100 flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600" />
            ประวัติการสั่งซื้อของคุณ 📦
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            ตรวจสอบรายละเอียด ติดตามสถานะ หรือรับเลขพัสดุสำหรับอีเมล: <span className="font-bold text-slate-700 dark:text-slate-350">{userEmail}</span>
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200/50 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {loading && historyList.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold animate-pulse">กำลังดึงข้อมูลใบสั่งซื้อ...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-16 text-center space-y-4">
          <div className="mx-auto inline-flex p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-400 rounded-full">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">ไม่พบประวัติการสั่งซื้อ</p>
            <p className="text-xs text-slate-400">อีเมลนี้ยังไม่มีประวัติการส่งใบสั่งซื้อเข้ามาในระบบ</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => {
            const isExpanded = expandedOrderId === item.order.OrderID;

            return (
              <div
                key={item.order.OrderID}
                className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
              >
                {/* Card Header (always visible) */}
                <div
                  onClick={() => toggleExpand(item.order.OrderID)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-wider">
                        #{item.order.OrderID}
                      </span>
                      {getStatusBadge(item.order.Status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-450" />
                        {formatDate(item.order.Timestamp)}
                      </span>
                      <span>•</span>
                      <span className="font-bold">สั่งสกรีน {item.order.TotalItems} ตัว</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-900">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">ยอดชำระสุทธิ</span>
                      <span className="text-base font-black bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">
                        {item.order.TotalPrice.toLocaleString()} บาท
                      </span>
                    </div>

                    <div className="p-1.5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Card Content (Visible when expanded) */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[1600px] border-t border-slate-150/40 dark:border-slate-900' : 'max-h-0 pointer-events-none'
                  } overflow-hidden`}
                >
                  <div className="p-5 md:p-6 bg-slate-50/20 dark:bg-slate-950/20 space-y-6">
                    {/* Visual Progress Steps Tracker */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">สถานะการผลิตและจัดส่ง</h4>
                      {renderTimeline(item.order.Status)}
                    </div>

                    {/* Inner Grid: Shipping info & Slip/Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {/* Shipping info */}
                      <div className="bg-white dark:bg-slate-950 border border-slate-200/55 dark:border-slate-850 p-4 rounded-2xl space-y-3 shadow-sm">
                        <h4 className="font-black text-slate-750 dark:text-slate-350 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          รายละเอียดการจัดส่ง
                        </h4>
                        <div className="space-y-2.5 text-xs font-semibold">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span><strong className="text-slate-400 font-medium">ชื่อผู้รับ:</strong> {item.order.CustomerName}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span className="leading-relaxed"><strong className="text-slate-400 font-medium">ที่อยู่จัดส่ง:</strong> {item.order.ShippingAddress}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span><strong className="text-slate-400 font-medium">เบอร์โทรศัพท์:</strong> {item.order.Phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Slip / Tracking */}
                      <div className="bg-white dark:bg-slate-950 border border-slate-200/55 dark:border-slate-850 p-4 rounded-2xl space-y-3 shadow-sm">
                        <h4 className="font-black text-slate-750 dark:text-slate-350 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          หลักฐานการโอนและขนส่ง
                        </h4>
                        <div className="space-y-3.5 text-xs font-semibold">
                          {/* Tracking number */}
                          <div>
                            <span className="text-slate-400 block mb-1">เลขพัสดุจัดส่ง</span>
                            {item.order.TrackingNumber ? (
                              <span className="inline-block bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-black px-3 py-1.5 rounded-lg border border-blue-200/20 text-sm tracking-widest">
                                {item.order.TrackingNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-medium">อยู่ระหว่างการบรรจุและเตรียมจัดส่งสินค้า</span>
                            )}
                          </div>
                          {/* Slip Preview URL */}
                          <div>
                            <span className="text-slate-400 block mb-1">รูปหลักฐานสลิปโอนเงิน</span>
                            {item.order.SlipUrl && (item.order.SlipUrl.startsWith('http') || item.order.SlipUrl.startsWith('/')) ? (
                              <a
                                href={item.order.SlipUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>คลิกที่นี่เพื่อดูสลิปที่อัปโหลด</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic font-medium">ไม่พบสลิปในระบบ</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shirts customizations table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-750 dark:text-slate-300 pl-1 uppercase tracking-wider">
                        รายละเอียดเสื้อยืดสั่งผลิต ({item.order.TotalItems} ตัว)
                      </h4>
                      
                      {/* Desktop Table View */}
                      <div className="hidden md:block border border-slate-200/50 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/60 font-black text-slate-450 border-b border-slate-100 dark:border-slate-900">
                              <th className="py-3 px-3 w-10 text-center">ตัวที่</th>
                              <th className="py-3 px-3">แบบเสื้อ</th>
                              <th className="py-3 px-3 w-12 text-center">ไซส์</th>
                              <th className="py-3 px-3">ข้อความบนเสื้อ</th>
                              <th className="py-3 px-3 w-16 text-center">เบอร์</th>
                              <th className="py-3 px-3">เพิ่มเติม</th>
                              <th className="py-3 px-3 w-20 text-right">ราคา</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                            {item.items.map((shirt) => (
                              <tr key={shirt.ItemIndex} className="text-slate-600 dark:text-slate-400">
                                <td className="py-3.5 px-3 text-center font-bold text-slate-400">{shirt.ItemIndex}</td>
                                <td className="py-3.5 px-3 font-black text-slate-850 dark:text-slate-200">{shirt.DesignName}</td>
                                <td className="py-3.5 px-3 text-center font-black">{shirt.Size}</td>
                                <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-350">{shirt.PrintName || '-'}</td>
                                <td className="py-3.5 px-3 text-center font-black text-slate-700 dark:text-slate-350">{shirt.BackNumber || '-'}</td>
                                <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-400">{shirt.CustomText || '-'}</td>
                                <td className="py-3.5 px-3 text-right font-black text-slate-850 dark:text-slate-200">
                                  {shirt.ItemPrice} บาท
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View (Visible on mobile) */}
                      <div className="md:hidden space-y-3">
                        {item.items.map((shirt) => (
                          <div key={shirt.ItemIndex} className="bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 p-4 rounded-xl space-y-2.5 text-xs shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                              <span className="font-bold text-slate-850 dark:text-slate-200">
                                ตัวที่ {shirt.ItemIndex}: {shirt.DesignName.split(' (')[0]}
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black px-2 py-0.5 rounded text-[10px]">
                                ไซส์ {shirt.Size}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 font-semibold">
                              <div>
                                <span className="text-slate-400 block font-medium">ชื่อบนเสื้อ:</span>
                                <span className="text-slate-700 dark:text-slate-300">{shirt.PrintName || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">เบอร์หลัง:</span>
                                <span className="font-black text-slate-700 dark:text-slate-300">{shirt.BackNumber || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-400 block font-medium">ข้อความเพิ่มเติม:</span>
                                <span className="text-slate-650 dark:text-slate-400">{shirt.CustomText || <span className="text-slate-300 dark:text-slate-700 italic">-</span>}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900">
                              <span className="text-slate-450 font-medium">ราคา:</span>
                              <span className="font-black text-slate-850 dark:text-slate-200">{shirt.ItemPrice} บาท</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
