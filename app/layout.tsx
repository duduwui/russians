import type { Metadata } from "next";
import { Poppins, Inter, Vazirmatn } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreshCart POS - Point of Sale System",
  description: "Modern Point of Sale & Retail Management for FreshCart Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full overflow-hidden" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${vazirmatn.variable} font-sans antialiased h-screen max-h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F1728]`}
      >
        {children}
      </body>
    </html>
  );
}
