import type { Metadata } from "next";
import { Agdasima, Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";

const agdasima = Agdasima({
  variable: "--font-agdasima",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tadbirkorlar Chempionati | Tez kunda",
  description: "Startapingiz, biznesingiz yoki g'oyangizni taqdim eting va 10 million dollarlik investitsiya uchun kurashing.",
  manifest: "/manifest.json",
  icons: { icon: "/chempionatMiniLogo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${agdasima.variable} ${poppins.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
