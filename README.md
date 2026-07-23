# Buucuties.jersey — ระบบสั่งเสื้อยืดออนไลน์

เว็บแอปพลิเคชันสำหรับสั่งผลิตเสื้อยืดสกรีนลายแบบ Pre-order (พิมพ์ชื่อ/เบอร์/ข้อความกำหนดเองได้ต่อตัว) ตั้งแต่เลือกลาย กรอกข้อมูลจัดส่ง คำนวณราคาอัตโนมัติตามจำนวน แนบสลิปโอนเงิน ไปจนถึงติดตามสถานะออเดอร์และแดชบอร์ดสำหรับแอดมิน

พัฒนาโดยใช้ [Next.js 14 (App Router)](https://nextjs.org/) + TypeScript + Tailwind CSS

## ฟีเจอร์หลัก

- **แคตตาล็อกดีไซน์เสื้อ** — หน้าแรกแสดงลายเสื้อให้เลือก 3 แบบ (Calm Twilight, Golden Shore, Oceanic Blue) พร้อมไซส์ตั้งแต่ S ถึง 5XL
- **เข้าสู่ระบบแบบไม่ใช้รหัสผ่าน (Passwordless)** — ผู้ใช้กรอกแค่อีเมลเพื่อเริ่มสั่งซื้อและผูกประวัติคำสั่งซื้อไว้กับอีเมลนั้น
- **ขั้นตอนสั่งซื้อ 4 สเต็ป** (`/order/*`):
  1. **ข้อมูลผู้รับ & จัดส่ง** — ชื่อ, ที่อยู่, เบอร์โทร, จำนวนเสื้อ (1–20 ตัว)
  2. **ปรับแต่งลายเสื้อ** — เลือกดีไซน์/ไซส์ต่อตัว, ชื่อสกรีน, เบอร์หลังเสื้อ, ข้อความเพิ่มเติม (เช่น คณะ/แผนก) พร้อมปุ่ม "ใช้ดีไซน์นี้กับทุกตัว"
  3. **ตรวจสอบรายการ** — สรุปรายการเสื้อทั้งหมด ราคารวม และช่องกรอกโค้ดส่วนลด (Redeem Code)
  4. **ชำระเงิน** — แสดง QR PromptPay พร้อมยอดที่ต้องโอน และอัปโหลดสลิปยืนยันการชำระเงิน
- **เครื่องคำนวณราคาแบบ Bulk Tier** — ราคาต่อตัวลดลงตามจำนวนที่สั่ง และมีค่าธรรมเนียมเพิ่มตามไซส์พิเศษ
- **ระบบโค้ดส่วนลด (Redeem Code)** — รองรับโค้ดแบบ "ส่งฟรี" (สั่ง 5 ตัวขึ้นไป) และ "ลดราคาต่อตัว" (สั่ง 20 ตัวขึ้นไป) ตรวจสอบและตัดสิทธิ์การใช้งานทั้งฝั่ง client และ server
- **ประวัติการสั่งซื้อ** (`/history`) — ผู้ใช้ค้นหาออเดอร์ของตัวเองด้วยอีเมล ดูสถานะ, เลขพัสดุ, และสลิปที่อัปโหลดไว้
- **แดชบอร์ดแอดมิน** (`/admin`) — ล็อกอินด้วยรหัสผ่านแยกต่างหาก จัดการออเดอร์ทั้งหมด: ค้นหา/กรองตามสถานะ, อัปเดตสถานะและเลขพัสดุ, ลบ (ซ่อน) ออเดอร์แบบ soft-delete
- **คู่มือการใช้งาน** (`/manual`) — อธิบายวิธีสั่งซื้อ ตารางราคา วิธีชำระเงิน และ FAQ

## โครงสร้างราคา (Bulk Pricing)

| จำนวนเสื้อ | ราคา/ตัว | ค่าจัดส่ง |
|---|---|---|
| 1–2 ตัว | 359 บาท | 40 บาท |
| 3–4 ตัว | 349 บาท | 40 บาท |
| 5–9 ตัว | 339 บาท | 60 บาท |
| 10–19 ตัว | 329 บาท | 80 บาท |
| 20 ตัวขึ้นไป | 319 บาท | 80 บาท |

ส่วนเพิ่มตามไซส์: 2XL +10 บาท, 3XL +20 บาท, 4XL +30 บาท, 5XL +40 บาท (ต่อตัว)

ราคาจะถูกคำนวณซ้ำฝั่ง server ที่ `POST /api/checkout` เพื่อป้องกันการปลอมแปลงราคาจาก client

## เส้นทางผู้ใช้งาน (User Flow)

```
หน้าแรก (/) → เข้าสู่ระบบด้วยอีเมล (/login) → กรอกข้อมูลจัดส่ง (/order/info)
  → เลือกลาย/ไซส์/ข้อความสกรีน (/order/items) → ตรวจสอบ + ใส่โค้ดส่วนลด (/order/review)
  → อัปโหลดสลิปโอนเงิน (/order/payment) → สำเร็จ → ติดตามสถานะ (/history)
```

สถานะออเดอร์: `รอตรวจสอบ` → `ตรวจสอบเสร็จสิ้น` → `กำลังผลิต` → `จัดส่งแล้ว`

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx                  # หน้าแรก — แคตตาล็อกดีไซน์เสื้อ
│   ├── login/page.tsx            # ล็อกอินลูกค้าด้วยอีเมล (passwordless)
│   ├── order/
│   │   ├── layout.tsx            # gate ต้องล็อกอินก่อน + แสดง step progress
│   │   ├── info/page.tsx         # STEP 1: ข้อมูลผู้รับ/จัดส่ง
│   │   ├── items/page.tsx        # STEP 2: ปรับแต่งลายเสื้อแต่ละตัว
│   │   ├── review/page.tsx       # STEP 3: สรุปรายการ + โค้ดส่วนลด
│   │   └── payment/page.tsx      # STEP 4: ชำระเงิน + อัปโหลดสลิป
│   ├── history/page.tsx          # ประวัติ/ติดตามสถานะคำสั่งซื้อของลูกค้า
│   ├── manual/page.tsx           # คู่มือการใช้งาน (FAQ, วิธีสั่งซื้อ, ราคา)
│   ├── admin/
│   │   ├── page.tsx              # ล็อกอินแอดมิน
│   │   └── dashboard/page.tsx    # จัดการออเดอร์ทั้งหมด
│   └── api/
│       ├── auth/login|logout     # session ลูกค้า (HMAC-signed cookie)
│       ├── admin/login           # session แอดมิน
│       ├── admin/orders          # CRUD ออเดอร์สำหรับแอดมิน
│       ├── checkout              # สร้างออเดอร์ + คำนวณราคาฝั่ง server + อัปโหลดสลิป
│       ├── history               # ดึงประวัติออเดอร์ตามอีเมลที่ล็อกอิน
│       └── promo/validate        # ตรวจสอบโค้ดส่วนลด
├── components/
│   ├── Navbar.tsx                # แถบนำทางแบบ floating capsule (desktop + mobile bottom nav)
│   └── StepProgress.tsx          # แถบแสดงความคืบหน้า 4 สเต็ปของการสั่งซื้อ
├── context/
│   └── OrderContext.tsx          # state การสั่งซื้อทั้งหมด (persist ผ่าน localStorage) + pricing engine
├── lib/
│   ├── designs.ts                 # ข้อมูลลายเสื้อ + ไซส์ที่รองรับ
│   ├── session.ts                 # เซ็น/ตรวจสอบ session token ด้วย HMAC SHA256
│   └── sheets.ts                  # เข้าถึงฐานข้อมูล (Google Sheets, fallback เป็นไฟล์ local JSON)
└── data/
    └── localDb.json               # ฐานข้อมูลสำรองเมื่อไม่ได้ตั้งค่า Google Sheets
```

## การจัดเก็บข้อมูล

ระบบใช้ **Google Sheets เป็นฐานข้อมูลหลัก** (ผ่าน Google Sheets API) โดยมี 3 ชีต: `Orders`, `OrderItems`, `Redeem_Code` หากไม่ได้ตั้งค่า environment variables ที่จำเป็น ระบบจะ fallback ไปเก็บข้อมูลในไฟล์ `src/data/localDb.json` โดยอัตโนมัติ

สลิปโอนเงินที่อัปโหลดจะพยายามอัปโหลดขึ้น Google Drive ก่อน หากล้มเหลวจะบันทึกไว้ที่ `public/uploads/slips/` แทน

## Environment Variables

| ตัวแปร | ใช้สำหรับ |
|---|---|
| `SESSION_SECRET` / `ADMIN_PASSWORD` | secret key สำหรับเซ็น session token (HMAC) |
| `ADMIN_PASSWORD` | รหัสผ่านเข้าแดชบอร์ดแอดมิน |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | อีเมล Service Account สำหรับ Google Sheets/Drive API |
| `GOOGLE_PRIVATE_KEY` | private key ของ Service Account |
| `GOOGLE_SPREADSHEET_ID` | ID ของ Google Sheet ที่ใช้เก็บออเดอร์ |
| `GOOGLE_DRIVE_FOLDER_ID` | โฟลเดอร์ปลายทางสำหรับอัปโหลดสลิป |

## เริ่มต้นใช้งาน (Development)

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูผลลัพธ์

```bash
npm run build   # build production
npm run start   # รัน production server
npm run lint    # ตรวจสอบ code style
```

## Deploy

โปรเจกต์นี้เหมาะกับการ deploy บน [Vercel](https://vercel.com/) — ดูรายละเอียดเพิ่มเติมที่ [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
