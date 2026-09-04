import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuackQuack Studio - Photobooth & Arcade Hub",
  description: "Trải nghiệm chụp ảnh photobooth nghệ thuật cùng game bắn vịt cổ điển 60 FPS trong không gian mở siêu thực.",
  icons: {
    icon: [
      { url: "/Mascot.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/Mascot.png",
    apple: "/Mascot.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${ibmPlexSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
