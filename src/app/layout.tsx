import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";
import { Navbar } from "@/components/Navbar";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Buucuties.jersey | Pre-order 1st",
  description: "Buucuties.jersey Payment ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable}`}>
      <body className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased min-h-screen flex flex-col">
        <OrderProvider>
          <Navbar />
          <main className="flex-grow flex flex-col justify-start pb-24 md:pb-0">
            {children}
          </main>
        </OrderProvider>
      </body>
    </html>
  );
}

