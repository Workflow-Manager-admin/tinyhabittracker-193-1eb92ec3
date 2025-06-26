"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

/**
 * PUBLIC_INTERFACE
 * Home Page ("/").
 * - Minimalist: No Next.js or Vercel starter content.
 * - Authenticated users are redirected to /dashboard.
 * - Unauthenticated users see a simple welcome/cta for TinyHabitTracker.
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
        <span className="text-gray-500 dark:text-zinc-400 text-lg">Loading…</span>
      </main>
    );
  }

  // Show minimalist landing (only if not logged in)
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-3 bg-background dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-lg border border-muted dark:border-dark-muted shadow-lg p-8 flex flex-col items-center gap-4 bg-surface dark:bg-dark-surface">
        <span
          className="text-contrastGray dark:text-white text-4xl font-extrabold tracking-tight mb-2"
          style={{ color: "var(--contrast-gray, #374151)" }}
        >
          TinyHabitTracker
        </span>
        <span className="text-contrastGray dark:text-zinc-200 text-center text-lg mb-4" style={{ color: "var(--contrast-gray, #374151)" }}>
          Build great habits, one tiny step at a time. <br />
          Simple. Private. Effective.
        </span>
        <a
          href="/register"
          className="mt-4 px-6 py-2 rounded font-semibold text-contrastGray text-lg bg-sunshine hover:bg-primary hover:text-white transition shadow focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundColor: "var(--sunshine, #facc15)",
            color: "var(--contrast-gray, #374151)",
          }}
        >
          Get Started — Sign Up
        </a>
        <a
          href="/login"
          className="text-primary text-sm mt-2 hover:text-sunshine hover:underline transition"
        >
          Already have an account? Sign In
        </a>
      </div>
      <footer className="mt-8 text-xs text-muted dark:text-dark-muted text-center">
        © {new Date().getFullYear()} TinyHabitTracker. All rights reserved.
      </footer>
    </main>
  );
}
