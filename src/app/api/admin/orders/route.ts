import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllOrders, getDeletedOrderIds, deleteOrder } from '@/lib/sheets';
import { verifyToken } from '@/lib/session';

function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded?.role === 'admin';
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [data, deletedIds] = await Promise.all([
      getAllOrders(),
      Promise.resolve(getDeletedOrderIds()),
    ]);
    // Sort by timestamp descending (newest first)
    data.sort((a, b) =>
      new Date(b.order.Timestamp).getTime() - new Date(a.order.Timestamp).getTime()
    );
    return NextResponse.json({ orders: data, deletedOrderIds: deletedIds });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลออเดอร์ได้' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'ต้องระบุ OrderID' }, { status: 400 });
    }
    deleteOrder(orderId);
    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Admin delete order error:', error);
    return NextResponse.json({ error: 'ไม่สามารถลบออเดอร์ได้' }, { status: 500 });
  }
}
