import { NextResponse } from 'next/server';
import { validateRedeemCode } from '@/lib/sheets';

export async function POST(request: Request) {
  try {
    const { promoCode, qty } = await request.json();
    if (!promoCode) {
      return NextResponse.json({ error: 'กรุณากรอกโค้ด' }, { status: 400 });
    }

    const result = await validateRedeemCode(promoCode, qty);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    return NextResponse.json({
      valid: true,
      type: result.type,
      code: promoCode.toUpperCase().trim(),
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบโค้ดส่วนลด' }, { status: 500 });
  }
}
