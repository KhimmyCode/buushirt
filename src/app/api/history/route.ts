import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrderHistory, getDeletedOrderIds } from '@/lib/sheets';
import { verifyToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Authenticate check via cookie
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนดึงข้อมูลประวัติ' }, { status: 401 });
    }

    const decoded = verifyToken(sessionToken);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }
    const sessionEmail = decoded.email;

    // 2. Fetch history + deleted IDs in parallel
    const [history, deletedIds] = await Promise.all([
      getOrderHistory(sessionEmail),
      getDeletedOrderIds(),
    ]);

    // 3. Filter out soft-deleted orders (admin deleted — hidden from customer too)
    const filteredHistory = history.filter(
      (item) => !deletedIds.includes(item.order.OrderID)
    );

    // 4. Return sorted by newest first
    const sortedHistory = filteredHistory.sort((a, b) =>
      new Date(b.order.Timestamp).getTime() - new Date(a.order.Timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      email: sessionEmail,
      history: sortedHistory,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการสั่งซื้อ' }, { status: 500 });
  }
}
