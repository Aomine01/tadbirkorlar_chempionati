import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yosh Tadbirkorlar Chempionati | Digital Sovereign Initiative",
  description: "Startapingiz, biznesingiz yoki g'oyangizni taqdim eting va 10 million dollarlik investitsiya uchun kurashing.",
  manifest: "/manifest.json",
  icons: { icon: "/chempionatMiniLogo.png" },
};

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${plusJakartaSans.variable} ${manrope.variable} antialiased dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-surface text-on-surface overflow-x-hidden m-0 p-0 h-full">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
