import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { Providers } from "./Providers";

/**
 * Base font setup (Geist, Geist_Mono—modern, minimal, clean).
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * PUBLIC_INTERFACE
 * Global metadata for the app (title, description)
 */
export const metadata: Metadata = {
  title: "TinyHabitTracker",
  description: "A tiny habit tracking web app.",
};

/**
 * PUBLIC_INTERFACE
 * Root layout for the app (Server Component).
 * - Loads Tailwind + custom global CSS.
 * - Sets fonts, base color theme, structure (html, body).
 * - Delegates all client-logic/context to <Providers> (client component).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
