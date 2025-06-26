"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

/**
 * PUBLIC_INTERFACE
 * Home Page ("/").
 * - Strict minimalist: Only shows Login and Sign Up options as CTA buttons. Removes all text, description, logo, or graphics.
 * - Brand palette and modern accessibility.
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect immediately to dashboard if logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // While checking auth, show nothing (or a subtle loading).
  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-2">
        <span className="text-gray-500 dark:text-zinc-400 text-lg" aria-live="polite">Loading…</span>
      </main>
    );
  }

  // Only show Login and Sign Up options for unauthenticated users
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-3 bg-background dark:bg-dark-bg">
      <div
        className="w-full max-w-xs flex flex-col gap-5 items-center rounded-xl shadow-md border border-muted dark:border-dark-muted p-8 bg-white dark:bg-dark-surface"
        style={{
          background: "var(--background, #fff)",
          borderColor: "var(--muted, #e5e7eb)"
        }}
      >
        <a
          href="/login"
          className="block w-full text-center rounded-lg text-lg font-bold px-6 py-3 mb-1 bg-primary text-white shadow focus:outline-none focus:ring-4 focus:ring-primary/30 hover:bg-primary/90 transition"
          style={{
            backgroundColor: "var(--primary, #2563eb)",
            color: "#fff",
            border: "2px solid var(--primary, #2563eb)",
            letterSpacing: 0.02
          }}
          role="button"
          tabIndex={0}
        >
          Login
        </a>
        <a
          href="/register"
          className="block w-full text-center rounded-lg text-lg font-bold px-6 py-3 bg-sunshine text-contrastGray shadow focus:outline-none focus:ring-4 focus:ring-sunshine/30 hover:bg-sunshine/90 hover:text-primary transition"
          style={{
            backgroundColor: "var(--sunshine, #facc15)",
            color: "var(--contrast-gray, #374151)",
            border: "2px solid var(--sunshine, #facc15)",
            letterSpacing: 0.02
          }}
          role="button"
          tabIndex={0}
        >
          Sign Up
        </a>
      </div>
    </main>
  );
}
