import { NextResponse } from 'next/server';
import { getPromoCodeUsageCount } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const { promoCode, qty } = await request.json();
    if (!promoCode) {
      return NextResponse.json({ error: 'กรุณากรอกโค้ด' }, { status: 400 });
    }

    const code = promoCode.toUpperCase().trim();

    if (code === 'BUUFREE') {
      if (qty < 5) {
        return NextResponse.json({ valid: false, error: 'โค้ด BUUFREE ใช้ได้เฉพาะเมื่อสั่งเสื้อ 5 ตัวขึ้นไป' });
      }
      const usageCount = await getPromoCodeUsageCount('BUUFREE');
      if (usageCount >= 20) {
        return NextResponse.json({ valid: false, error: 'โค้ด BUUFREE ถูกใช้งานครบ 20 สิทธิ์แล้ว' });
      }
      return NextResponse.json({
        valid: true,
        type: 'free_shipping',
        code: 'BUUFREE',
        remaining: 20 - usageCount
      });
    }

    if (code === 'BUUCUTIES299') {
      if (qty < 20) {
        return NextResponse.json({ valid: false, error: 'โค้ด BUUCUTIES299 ใช้ได้เฉพาะเมื่อสั่งเสื้อ 20 ตัวขึ้นไป' });
      }
      const usageCount = await getPromoCodeUsageCount('BUUCUTIES299');
      if (usageCount >= 5) {
        return NextResponse.json({ valid: false, error: 'โค้ด BUUCUTIES299 ถูกใช้งานครบ 5 สิทธิ์แล้ว' });
      }
      return NextResponse.json({
        valid: true,
        type: 'price_discount',
        code: 'BUUCUTIES299',
        remaining: 5 - usageCount
      });
    }

    return NextResponse.json({ valid: false, error: 'โค้ดส่วนลดไม่ถูกต้อง' });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบโค้ดส่วนลด' }, { status: 500 });
  }
}
