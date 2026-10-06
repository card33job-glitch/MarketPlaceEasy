import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

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
  title: "MarketPlaceEasy – Ton annonce Marketplace en une photo",
  description:
    "Prends une photo, l'IA rédige le titre, la description, choisit la catégorie et estime le prix de ton annonce Facebook Marketplace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr-CA"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
          {children}
        </main>
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
