import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateOrderStatus } from '@/lib/sheets';
import { verifyToken } from '@/lib/session';

function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded?.role === 'admin';
}

const VALID_STATUSES = ['รอตรวจสอบ', 'ตรวจสอบเสร็จสิ้น', 'กำลังผลิต', 'จัดส่งแล้ว'];

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = params;
    const { status, trackingNumber } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `สถานะไม่ถูกต้อง ต้องเป็น: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    await updateOrderStatus(orderId, status, trackingNumber ?? '');

    return NextResponse.json({ success: true, orderId, status, trackingNumber });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตสถานะได้' }, { status: 500 });
  }
}
