import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { google } from 'googleapis';
import { verifyToken } from '@/lib/session';
import { saveOrder, OrderRow, OrderItemRow, validateRedeemCode, markRedeemCodeAsUsed } from '@/lib/sheets';
import { SHIRT_DESIGNS, SHIRT_SIZES } from '@/lib/designs';

// Upload slip image (base64) to Google Drive, return public view URL
async function uploadSlipToDrive(
  base64Data: string,
  orderId: string
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!folderId || !email || !privateKey) {
    throw new Error('Google Drive not configured');
  }

  // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  // Detect image type from base64 header
  const mimeType = base64Data.startsWith('data:image/png') ? 'image/png'
    : base64Data.startsWith('data:image/jpg') || base64Data.startsWith('data:image/jpeg') ? 'image/jpeg'
    : 'image/png';

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Upload file to Drive
  const response = await drive.files.create({
    requestBody: {
      name: `slip-${orderId}.png`,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id',
    supportsAllDrives: true,
  });

  const fileId = response.data.id!;

  // Make file readable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
}

// Upload slip handling: Vercel Blob -> Google Drive -> Local Storage Fallback
async function uploadSlip(
  base64Data: string,
  orderId: string
): Promise<string> {
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  // Detect MIME type
  const mimeType = base64Data.startsWith('data:image/png') ? 'image/png'
    : base64Data.startsWith('data:image/jpg') || base64Data.startsWith('data:image/jpeg') ? 'image/jpeg'
    : 'image/png';

  // 1. Try Vercel Blob if token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      console.log('Uploading slip to Vercel Blob...');
      const blob = await put(`slips/slip-${orderId}.png`, buffer, {
        access: 'public',
        contentType: mimeType,
      });
      console.log('Successfully uploaded slip to Vercel Blob:', blob.url);
      return blob.url;
    } catch (blobError) {
      console.error('Failed to upload slip to Vercel Blob, trying other methods:', blobError);
    }
  }

  // 2. Try Google Drive upload
  try {
    console.log('Attempting Google Drive upload...');
    return await uploadSlipToDrive(base64Data, orderId);
  } catch (driveError) {
    console.error('Failed to upload slip to Google Drive, using local fallback:', driveError);

    // 3. Save locally on the server disk
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `slip-${orderId}.png`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);

      console.log(`Saved slip locally as fallback: ${filepath}`);
      return `/uploads/slips/${filename}`;
    } catch (localError) {
      console.error('Failed to save slip locally:', localError);
      return `[SLIP_NOT_UPLOADED] ${orderId}`;
    }
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate check via cookie
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 });
    }

    const decoded = verifyToken(sessionToken);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }
    const sessionEmail = decoded.email;

    const payload = await request.json();
    const { customerInfo, shirtItems, slipBase64, promoCode } = payload;

    // 2. Validate input
    if (!slipBase64) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดหลักฐานการโอนเงิน' }, { status: 400 });
    }
    if (!customerInfo || !shirtItems || !Array.isArray(shirtItems) || shirtItems.length === 0) {
      return NextResponse.json({ error: 'ข้อมูลคำสั่งซื้อไม่ครบถ้วน' }, { status: 400 });
    }

    const { name, address, phone, shirtCount } = customerInfo;
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return NextResponse.json({ error: 'ชื่อผู้รับไม่ถูกต้อง (ต้องไม่ว่างและไม่เกิน 100 ตัวอักษร)' }, { status: 400 });
    }
    if (typeof address !== 'string' || !address.trim() || address.length > 500) {
      return NextResponse.json({ error: 'ที่อยู่ผู้รับไม่ถูกต้อง (ต้องไม่ว่างและไม่เกิน 500 ตัวอักษร)' }, { status: 400 });
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'กรุณากรอกเบอร์โทรศัพท์' }, { status: 400 });
    }

    // Validate phone number format (Thai 10 digit phone format)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json({ error: 'เบอร์โทรศัพท์มือถือไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 10 หลัก)' }, { status: 400 });
    }

    // Validate shirt count limit
    const qty = shirtItems.length;
    if (qty !== shirtCount || qty < 1 || qty > 20) {
      return NextResponse.json({ error: 'จำนวนเสื้อต้องอยู่ระหว่าง 1 ถึง 20 ตัว' }, { status: 400 });
    }

    // Validate shirt customizations for script injection / size limits
    for (const item of shirtItems) {
      if (!item.designId || typeof item.designId !== 'string') {
        return NextResponse.json({ error: 'แบบเสื้อไม่ถูกต้อง' }, { status: 400 });
      }
      const validSizes = SHIRT_SIZES.map(s => s.value);
      if (!item.size || typeof item.size !== 'string' || !validSizes.includes(item.size)) {
        return NextResponse.json({ error: 'ไซส์เสื้อไม่ถูกต้อง' }, { status: 400 });
      }
      if (item.printName && (typeof item.printName !== 'string' || item.printName.length > 30)) {
        return NextResponse.json({ error: 'ชื่อสกรีนยาวเกินไป (ไม่เกิน 30 ตัวอักษร)' }, { status: 400 });
      }
      if (item.backNumber && (typeof item.backNumber !== 'string' || item.backNumber.length > 5)) {
        return NextResponse.json({ error: 'เบอร์สกรีนยาวเกินไป (ไม่เกิน 5 ตัวอักษร)' }, { status: 400 });
      }
      if (item.customText && (typeof item.customText !== 'string' || item.customText.length > 100)) {
        return NextResponse.json({ error: 'หมายเหตุยาวเกินไป (ไม่เกิน 100 ตัวอักษร)' }, { status: 400 });
      }
    }

    // 3. Generate unique Order ID: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${yyyy}${mm}${dd}-${randomSuffix}`;

    // 4. Server-side Price calculation (anti-tamper)
    // BUY1=359+40s, BUY3+=349+40s, BUY5+=339+60s, BUY10+=329+80s, BUY20+=319+80s
    let basePricePerUnit = 359;
    let shippingFee = 40;
    if (qty >= 20) {
      basePricePerUnit = 319;
      shippingFee = 80;
    } else if (qty >= 10) {
      basePricePerUnit = 329;
      shippingFee = 80;
    } else if (qty >= 5) {
      basePricePerUnit = 339;
      shippingFee = 60;
    } else if (qty >= 3) {
      basePricePerUnit = 349;
      shippingFee = 40;
    }

    // Validate and Apply Promo Code server-side
    let finalBasePrice = basePricePerUnit;
    let finalShippingFee = shippingFee;
    let validatedCode = '';

    if (promoCode) {
      const promoResult = await validateRedeemCode(promoCode, qty);
      if (!promoResult.valid) {
        return NextResponse.json({ error: promoResult.error || 'โค้ดส่วนลดไม่ถูกต้อง' }, { status: 400 });
      }

      validatedCode = promoCode.toUpperCase().trim();
      if (promoResult.type === 'free_shipping') {
        finalShippingFee = 0;
      } else if (promoResult.type === 'price_discount') {
        finalBasePrice = 299;
      }
    }

    let sizeSurchargesTotal = 0;
    const itemsRows: OrderItemRow[] = shirtItems.map((item, idx) => {
      let extra = 0;
      if (item.size === '2XL') extra = 10;
      else if (item.size === '3XL') extra = 20;
      else if (item.size === '4XL') extra = 30;
      else if (item.size === '5XL') extra = 40;

      sizeSurchargesTotal += extra;
      const itemPrice = finalBasePrice + extra;

      const design = SHIRT_DESIGNS.find((d) => d.id === item.designId);
      const designName = design ? design.name : item.designId;

      return {
        OrderID: orderId,
        ItemIndex: idx + 1,
        DesignName: designName,
        Size: item.size,
        PrintName: item.printName || '-',
        BackNumber: item.backNumber || '-',
        CustomText: item.customText || '-',
        ItemPrice: itemPrice,
      };
    });

    const totalPrice = (finalBasePrice * qty) + sizeSurchargesTotal + finalShippingFee;

    // 5. Upload slip
    const slipUrl = await uploadSlip(slipBase64, orderId);

    const orderRow: OrderRow = {
      OrderID: orderId,
      Timestamp: now.toISOString(),
      Email: sessionEmail,
      CustomerName: name.trim(),
      ShippingAddress: address.trim(),
      Phone: phone.trim(),
      TotalItems: qty,
      TotalPrice: totalPrice,
      SlipUrl: slipUrl,
      Status: 'รอตรวจสอบ',
      TrackingNumber: '',
      PromoCode: validatedCode,
    };

    // 6. Save to DB (Google Sheets or Local fallback)
    await saveOrder(orderRow, itemsRows);

    if (validatedCode) {
      await markRedeemCodeAsUsed(validatedCode);
    }

    return NextResponse.json({
      success: true,
      orderId,
      totalPrice,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดระหว่างส่งใบสั่งซื้อ' }, { status: 500 });
  }
}

