import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Cryptographically signed token containing email and timestamp
    const tokenPayload = {
      email: cleanEmail,
      createdAt: Date.now(),
    };
    const sessionToken = signToken(tokenPayload);

    // Set cookie
    cookies().set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true, email: cleanEmail });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดของระบบ' }, { status: 500 });
  }
}
