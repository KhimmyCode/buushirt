'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Search, RefreshCw, LogOut, ChevronDown, ChevronUp,
  Truck, Clock, CheckCircle2, AlertCircle, Loader2, X,
  Trash2, ExternalLink, User, MapPin, Phone, Mail, ShoppingBag,
  FileImage, Hash
} from 'lucide-react';

interface OrderItem {
  OrderID: string;
  ItemIndex: number;
  DesignName: string;
  Size: string;
  PrintName: string;
  BackNumber: string;
  CustomText: string;
  ItemPrice: number;
}

interface Order {
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
  PromoCode?: string;
}

interface OrderData {
  order: Order;
  items: OrderItem[];
}

const STATUS_OPTIONS = ['รอตรวจสอบ', 'ตรวจสอบเสร็จสิ้น', 'กำลังผลิต', 'จัดส่งแล้ว'];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  'รอตรวจสอบ': { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Clock className="w-3 h-3" /> },
  'ตรวจสอบเสร็จสิ้น': { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', icon: <CheckCircle2 className="w-3 h-3" /> },
  'กำลังผลิต': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: <Package className="w-3 h-3" /> },
  'จัดส่งแล้ว': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <Truck className="w-3 h-3" /> },
  'ถูกลบ': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: <Trash2 className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${s.bg} ${s.border} ${s.text}`}>
      {s.icon}{status}
    </span>
  );
}

// Confirm delete modal
function DeleteModal({ order, onClose, onConfirm }: {
  order: Order;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">ยืนยันการลบออเดอร์</h3>
              <p className="text-xs text-slate-500 mt-0.5">{order.OrderID}</p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400 space-y-1">
            <p className="font-black">⚠ หมายเหตุ</p>
            <p>ออเดอร์จะถูกซ่อนในหน้า Admin เท่านั้น — <strong>ข้อมูลใน Google Sheets จะยังคงอยู่ครบ</strong> ไม่ถูกลบออก</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
              ยกเลิก
            </button>
            <button onClick={onConfirm} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all active:scale-[0.98]">
              <Trash2 className="w-4 h-4" /> ลบออเดอร์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update status modal
function UpdateModal({ orderData, onClose, onUpdated }: {
  orderData: OrderData;
  onClose: () => void;
  onUpdated: (orderId: string, status: string, tracking: string) => void;
}) {
  const { order } = orderData;
  const [status, setStatus] = useState(order.Status);
  const [tracking, setTracking] = useState(order.TrackingNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${order.OrderID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: tracking }),
      });
      if (res.ok) {
        onUpdated(order.OrderID, status, tracking);
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">อัปเดตสถานะ</p>
            <p className="text-sm font-black text-white">{order.OrderID}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">สถานะ</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors pr-10"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tracking Number <span className="text-slate-600 font-normal">(ถ้ามี)</span></label>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="เลขพัสดุ..."
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">ยกเลิก</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all active:scale-[0.98]">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก</> : '✓ บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Expanded order detail card
function OrderCard({
  orderData,
  isDeleted,
  onUpdate,
  onDelete,
}: {
  orderData: OrderData;
  isDeleted: boolean;
  onUpdate: (od: OrderData) => void;
  onDelete: (od: OrderData) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { order, items } = orderData;

  const date = new Date(order.Timestamp).toLocaleDateString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const isSlipValid = order.SlipUrl && !order.SlipUrl.startsWith('[') && (order.SlipUrl.startsWith('http') || order.SlipUrl.startsWith('/'));

  return (
    <div className={`rounded-2xl border transition-all ${isDeleted
      ? 'bg-red-950/10 border-red-500/15 opacity-60'
      : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700/80'
    }`}>
      {/* Header row */}
      <div
        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-white text-sm">{order.OrderID}</span>
            <StatusBadge status={isDeleted ? 'ถูกลบ' : order.Status} />
            {order.TrackingNumber && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                <Truck className="w-2.5 h-2.5" /> {order.TrackingNumber}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.CustomerName}</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.Email}</span>
            <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{order.TotalItems} ตัว</span>
            <span className="text-emerald-400 font-black">{order.TotalPrice.toLocaleString()} บ.</span>
            <span className="text-slate-600">{date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isDeleted && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdate(orderData); }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all"
              >
                <Package className="w-3.5 h-3.5" /> อัปเดต
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(orderData); }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <div className="text-slate-500">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-4 md:px-5 pb-5 border-t border-slate-800/60 pt-4 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping info */}
            <div className="bg-slate-800/40 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">รายละเอียดการจัดส่ง</h4>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">ชื่อผู้รับ: </span><span className="text-slate-200 font-bold">{order.CustomerName}</span></div>
                </div>
                <div className="flex gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">Email: </span><span className="text-slate-300">{order.Email}</span></div>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">โทร: </span><span className="text-slate-300 font-mono">{order.Phone}</span></div>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">ที่อยู่: </span><span className="text-slate-300 leading-relaxed">{order.ShippingAddress}</span></div>
                </div>
                {order.TrackingNumber && (
                  <div className="flex gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <div><span className="text-slate-500">Tracking: </span>
                      <span className="text-emerald-400 font-black font-mono">{order.TrackingNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-slate-800/40 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">การชำระเงิน</h4>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <Hash className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">OrderID: </span><span className="text-slate-300 font-mono">{order.OrderID}</span></div>
                </div>
                <div className="flex gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div><span className="text-slate-500">ยอดรวม: </span>
                    <span className="text-emerald-400 font-black text-sm">{order.TotalPrice.toLocaleString()} บาท</span>
                    <span className="text-slate-500 ml-1">({order.TotalItems} ตัว)</span>
                  </div>
                </div>
                {order.PromoCode && (
                  <div className="flex gap-2 items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-bold">
                      🎟️ โค้ดส่วนลด: {order.PromoCode}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 items-start">
                  <FileImage className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500">สลิปโอนเงิน: </span>
                    {isSlipValid ? (
                      <a href={order.SlipUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                        onClick={(e) => e.stopPropagation()}>
                        ดูสลิป <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-red-400 font-bold">ไม่มีสลิป / อัปโหลดไม่สำเร็จ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">รายการเสื้อ ({items.length} ตัว)</h4>
            <div className="rounded-xl border border-slate-800/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-500 font-black uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-center w-10">#</th>
                    <th className="px-3 py-2.5 text-left">แบบ</th>
                    <th className="px-3 py-2.5 text-center w-12">ไซส์</th>
                    <th className="px-3 py-2.5 text-left">ชื่อสกรีน</th>
                    <th className="px-3 py-2.5 text-center w-12">เบอร์</th>
                    <th className="px-3 py-2.5 text-left">หมายเหตุ</th>
                    <th className="px-3 py-2.5 text-right w-20">ราคา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {items.map((item) => (
                    <tr key={item.ItemIndex} className="text-slate-300 hover:bg-slate-800/20 transition-colors">
                      <td className="px-3 py-3 text-center text-slate-500 font-bold">{item.ItemIndex}</td>
                      <td className="px-3 py-3 font-bold text-slate-100">{item.DesignName}</td>
                      <td className="px-3 py-3 text-center font-black">{item.Size}</td>
                      <td className="px-3 py-3">{item.PrintName || <span className="text-slate-600">-</span>}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold">{item.BackNumber || <span className="text-slate-600">-</span>}</td>
                      <td className="px-3 py-3 text-slate-400">{item.CustomText || <span className="text-slate-600">-</span>}</td>
                      <td className="px-3 py-3 text-right font-black text-slate-100">{item.ItemPrice} บ.</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800/40 border-t border-slate-700/60">
                    <td colSpan={6} className="px-3 py-2.5 text-right text-xs font-black text-slate-400">รวมทั้งหมด</td>
                    <td className="px-3 py-2.5 text-right text-sm font-black text-emerald-400">{order.TotalPrice.toLocaleString()} บ.</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) { router.push('/admin'); return; }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders || []);
      setDeletedIds(data.deletedOrderIds || []);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin');
  };

  const handleUpdated = (orderId: string, status: string, tracking: string) => {
    setOrders((prev) => prev.map((od) =>
      od.order.OrderID === orderId
        ? { ...od, order: { ...od.order, Status: status, TrackingNumber: tracking } }
        : od
    ));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const orderId = deleteTarget.order.OrderID;
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        setDeletedIds((prev) => [...prev, orderId]);
      }
    } catch { }
    setDeleteTarget(null);
  };

  const activeOrders = orders.filter((od) => !deletedIds.includes(od.order.OrderID));
  const filteredOrders = orders.filter((od) => {
    const isDeleted = deletedIds.includes(od.order.OrderID);
    if (!showDeleted && isDeleted) return false;
    if (showDeleted && !isDeleted) return false;
    const matchStatus = filterStatus === 'ทั้งหมด' || od.order.Status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      od.order.OrderID.toLowerCase().includes(q) ||
      od.order.Email.toLowerCase().includes(q) ||
      od.order.CustomerName.toLowerCase().includes(q) ||
      od.order.Phone.includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    total: activeOrders.length,
    'รอตรวจสอบ': activeOrders.filter((o) => o.order.Status === 'รอตรวจสอบ').length,
    'ตรวจสอบเสร็จสิ้น': activeOrders.filter((o) => o.order.Status === 'ตรวจสอบเสร็จสิ้น').length,
    'กำลังผลิต': activeOrders.filter((o) => o.order.Status === 'กำลังผลิต').length,
    'จัดส่งแล้ว': activeOrders.filter((o) => o.order.Status === 'จัดส่งแล้ว').length,
    deleted: deletedIds.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      {selectedOrder && (
        <UpdateModal orderData={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={handleUpdated} />
      )}
      {deleteTarget && (
        <DeleteModal order={deleteTarget.order} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Buucuties.jersey Admin</h1>
            <p className="text-[10px] text-slate-500">จัดการคำสั่งซื้อ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchOrders(true)} disabled={refreshing}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="รีเฟรช">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
            <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'ทั้งหมด', value: counts.total, color: 'text-white', bg: 'bg-white/5 border-white/10' },
            { label: 'รอตรวจสอบ', value: counts['รอตรวจสอบ'], color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
            { label: 'ตรวจสอบแล้ว', value: counts['ตรวจสอบเสร็จสิ้น'], color: 'text-teal-400', bg: 'bg-teal-500/5 border-teal-500/20' },
            { label: 'กำลังผลิต', value: counts['กำลังผลิต'], color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
            { label: 'จัดส่งแล้ว', value: counts['จัดส่งแล้ว'], color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
            { label: 'ถูกลบ', value: counts.deleted, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-3 space-y-0.5 ${stat.bg}`}>
              <p className="text-[10px] text-slate-500 font-bold">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toggle deleted / active */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหา OrderID, Email, ชื่อ, เบอร์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowDeleted(false); setFilterStatus('ทั้งหมด'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${!showDeleted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40'}`}
            >
              ออเดอร์ทั่วไป
            </button>
            <button
              onClick={() => { setShowDeleted(true); setFilterStatus('ทั้งหมด'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${showDeleted ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40'}`}
            >
              ถูกลบ ({counts.deleted})
            </button>
          </div>
        </div>

        {/* Status filter (only when viewing active orders) */}
        {!showDeleted && (
          <div className="flex gap-2 flex-wrap">
            {['ทั้งหมด', ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">กำลังโหลดออเดอร์...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => fetchOrders()} className="text-xs text-indigo-400 hover:underline">ลองใหม่</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600">
            <Package className="w-10 h-10" />
            <p className="text-sm">{showDeleted ? 'ไม่มีออเดอร์ที่ถูกลบ' : 'ไม่พบออเดอร์'}{search ? ` ที่ค้นหา "${search}"` : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-bold">
              แสดง {filteredOrders.length} ออเดอร์{showDeleted ? ' (ที่ถูกลบ)' : ''}
            </p>
            <div className="space-y-2">
              {filteredOrders.map((od) => (
                <OrderCard
                  key={od.order.OrderID}
                  orderData={od}
                  isDeleted={deletedIds.includes(od.order.OrderID)}
                  onUpdate={setSelectedOrder}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
