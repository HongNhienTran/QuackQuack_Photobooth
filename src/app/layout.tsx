import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quack Studio - Photobooth & Arcade Hub",
  description: "Trải nghiệm chụp ảnh photobooth nghệ thuật cùng game bắn vịt cổ điển 60 FPS trong không gian mở siêu thực.",
  icons: {
    icon: [
      { url: "/Logo_QuackQuack.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/Logo_QuackQuack.png",
    apple: "/Logo_QuackQuack.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
