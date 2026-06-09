export interface ShirtDesign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  accentColor: string;
}

export const SHIRT_DESIGNS: ShirtDesign[] = [
  {
    id: "calm-twilight",
    name: "Calm Twilight",
    description: "เสื้อโทนขาวเทา ขลิบสีเทาเงิน ดีไซน์สง่างาม พิมพ์ลาย Burapha Est.1955 ด้านหน้า ปรับชื่อ-เบอร์ด้านหลังได้",
    imageUrl: "/calm-twilight.png",
    accentColor: "#9ca3af",
  },
  {
    id: "golden-shore",
    name: "Golden Shore",
    description: "เสื้อโทนขาวทองหรูหรา ขลิบสีทองแชมเปญ ดีไซน์พรีเมียม พิมพ์ลาย Burapha Est.1955 ด้านหน้า ปรับชื่อ-เบอร์ด้านหลังได้",
    imageUrl: "/golden-shore.png",
    accentColor: "#d4a853",
  },
  {
    id: "oceanic-blue",
    name: "Oceanic Blue",
    description: "เสื้อโทนขาวน้ำเงิน ขลิบสีกรมท่าเข้ม ดูสดใสมีพลัง พิมพ์ลาย Burapha Est.1955 ด้านหน้า ปรับชื่อ-เบอร์ด้านหลังได้",
    imageUrl: "/oceanic-blue.png",
    accentColor: "#3b5ea6",
  },
];

export const SHIRT_SIZES = [
  { value: "S", label: "S (รอบอก 36\")", extraCharge: 0 },
  { value: "M", label: "M (รอบอก 38\")", extraCharge: 0 },
  { value: "L", label: "L (รอบอก 40\")", extraCharge: 0 },
  { value: "XL", label: "XL (รอบอก 42\")", extraCharge: 0 },
  { value: "2XL", label: "2XL (รอบอก 44\")", extraCharge: 10 },
  { value: "3XL", label: "3XL (รอบอก 46\")", extraCharge: 20 },
  { value: "4XL", label: "4XL (รอบอก 48\")", extraCharge: 30 },
  { value: "5XL", label: "5XL (รอบอก 50\")", extraCharge: 40 },
];
