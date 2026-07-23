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

const STATUS_STYLES: Record<string, string> = {
  'จัดส่งแล้ว': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'กำลังผลิต': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'ตรวจสอบเสร็จสิ้น': 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  'รอตรวจสอบ': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function HistoryPage() {
  const { userEmail, login, isMounted } = useOrder();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [inputEmail, setInputEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (response.ok) {
        setHistoryList(data.history || []);
      } else {
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

      login(data.email);
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
    const cls = STATUS_STYLES[status] || STATUS_STYLES['รอตรวจสอบ'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
        {status || 'รอตรวจสอบ'}
      </span>
    );
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
      <div className="flex items-center justify-between w-full max-w-md mx-auto py-3 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
        {steps.map((step, sIdx) => (
          <React.Fragment key={sIdx}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {sIdx + 1}
              </div>
              <span
                className={`text-[9px] font-medium mt-1 text-center ${
                  step.active ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {sIdx < steps.length - 1 && (
              <div className="flex-1 px-1">
                <div className={`h-0.5 rounded-full ${steps[sIdx + 1].active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
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
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login gate
  if (!userEmail) {
    return (
      <div className="max-w-sm mx-auto w-full px-4 py-16 flex-grow flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">ตรวจสอบประวัติการสั่งซื้อ</h1>
            <p className="text-xs text-slate-500">กรอกอีเมลที่ใช้สั่งซื้อเพื่อตรวจสอบสถานะ</p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
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
    <div className="max-w-4xl mx-auto w-full px-4 py-10 flex-grow flex flex-col justify-start pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            ประวัติการสั่งซื้อของคุณ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            อีเมล: <span className="font-medium text-slate-700 dark:text-slate-300">{userEmail}</span>
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {loading && historyList.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">กำลังดึงข้อมูลใบสั่งซื้อ...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center space-y-3">
          <div className="mx-auto inline-flex p-3 bg-slate-50 dark:bg-slate-800/40 text-slate-400 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">ไม่พบประวัติการสั่งซื้อ</p>
          <p className="text-xs text-slate-400">อีเมลนี้ยังไม่มีคำสั่งซื้อในระบบ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyList.map((item) => {
            const isExpanded = expandedOrderId === item.order.OrderID;

            return (
              <div
                key={item.order.OrderID}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-fade-in"
              >
                <div
                  onClick={() => toggleExpand(item.order.OrderID)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">#{item.order.OrderID}</span>
                      {getStatusBadge(item.order.Status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.order.Timestamp)}
                      </span>
                      <span>•</span>
                      <span className="font-medium">สั่งสกรีน {item.order.TotalItems} ตัว</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">ยอดชำระ</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.order.TotalPrice.toLocaleString()} บาท
                      </span>
                    </div>

                    <div className="p-1.5 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[1600px] border-t border-slate-100 dark:border-slate-800' : 'max-h-0 pointer-events-none'
                  } overflow-hidden`}
                >
                  <div className="p-4 md:p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-5">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 text-center">สถานะการผลิตและจัดส่ง</h4>
                      {renderTimeline(item.order.Status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
                          รายละเอียดการจัดส่ง
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span><strong className="text-slate-400 font-normal">ชื่อผู้รับ:</strong> {item.order.CustomerName}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span className="leading-relaxed"><strong className="text-slate-400 font-normal">ที่อยู่:</strong> {item.order.ShippingAddress}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Truck className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span><strong className="text-slate-400 font-normal">เบอร์โทร:</strong> {item.order.Phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
                          หลักฐานการโอนและขนส่ง
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block mb-1">เลขพัสดุจัดส่ง</span>
                            {item.order.TrackingNumber ? (
                              <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold px-2.5 py-1 rounded-lg text-xs tracking-wide">
                                {item.order.TrackingNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400">อยู่ระหว่างการเตรียมจัดส่ง</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">รูปหลักฐานสลิปโอนเงิน</span>
                            {item.order.SlipUrl && (item.order.SlipUrl.startsWith('http') || item.order.SlipUrl.startsWith('/')) ? (
                              <a
                                href={item.order.SlipUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>ดูสลิปที่อัปโหลด</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">ไม่พบสลิปในระบบ</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shirts customizations table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1">
                        รายละเอียดเสื้อ Jersey สั่งผลิต ({item.order.TotalItems} ตัว)
                      </h4>

                      <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-3">แบบเสื้อ</th>
                              <th className="py-2.5 px-3 w-14 text-center">ไซส์</th>
                              <th className="py-2.5 px-3">ข้อความบนเสื้อ</th>
                              <th className="py-2.5 px-3 w-16 text-center">เบอร์</th>
                              <th className="py-2.5 px-3">เพิ่มเติม</th>
                              <th className="py-2.5 px-3 w-20 text-right">ราคา</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {item.items.map((shirt) => (
                              <tr key={shirt.ItemIndex} className="text-slate-600 dark:text-slate-400">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{shirt.ItemIndex}</td>
                                <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{shirt.DesignName}</td>
                                <td className="py-2.5 px-3 text-center font-semibold">{shirt.Size}</td>
                                <td className="py-2.5 px-3">{shirt.PrintName || '-'}</td>
                                <td className="py-2.5 px-3 text-center font-medium">{shirt.BackNumber || '-'}</td>
                                <td className="py-2.5 px-3">{shirt.CustomText || '-'}</td>
                                <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">{shirt.ItemPrice} บาท</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="md:hidden space-y-2.5">
                        {item.items.map((shirt) => (
                          <div key={shirt.ItemIndex} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                ตัวที่ {shirt.ItemIndex}: {shirt.DesignName.split(' (')[0]}
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                                ไซส์ {shirt.Size}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-400 block">ชื่อบนเสื้อ</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{shirt.PrintName || '-'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">เบอร์หลัง</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{shirt.BackNumber || '-'}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-400 block">ข้อความเพิ่มเติม</span>
                                <span className="text-slate-600 dark:text-slate-400">{shirt.CustomText || '-'}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-slate-400">ราคา</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{shirt.ItemPrice} บาท</span>
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
