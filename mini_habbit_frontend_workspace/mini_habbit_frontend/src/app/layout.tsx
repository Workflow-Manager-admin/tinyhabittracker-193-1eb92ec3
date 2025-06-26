import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { AuthProvider } from "./auth";
import { NavBar } from "./NavBar";

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
 * Create a singleton QueryClient outside the component,
 * avoids re-creating the query client per render.
 */
const queryClient = new QueryClient();

/**
 * PUBLIC_INTERFACE
 * Root layout for the app.
 * - Includes React Query Provider, AuthProvider, NavBar
 * - Loads Tailwind + custom global CSS
 * - Sets fonts, base color theme, and structure
 * - NavBar is always visible, content is children.
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
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {/* NavBar is always at top */}
            <NavBar />
            <main className="flex-1 flex flex-col">{children}</main>
            {/* React Query DevTools: visible in development */}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
