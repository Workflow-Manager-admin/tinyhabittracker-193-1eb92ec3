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
    <main className="flex flex-col items-center justify-center min-h-screen px-3 bg-white dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-zinc-700 shadow-lg p-8 flex flex-col items-center gap-4 bg-white dark:bg-zinc-900">
        <span className="text-primary text-4xl font-extrabold tracking-tight mb-2">TinyHabitTracker</span>
        <span className="text-gray-700 dark:text-zinc-200 text-center text-lg mb-4">
          Build great habits, one tiny step at a time. <br />
          Simple. Private. Effective.
        </span>
        <a
          href="/register"
          className="mt-4 px-6 py-2 rounded font-semibold text-white text-lg bg-primary hover:bg-blue-700 transition shadow focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Get Started — Sign Up
        </a>
        <a
          href="/login"
          className="text-primary text-sm mt-2 hover:underline"
        >
          Already have an account? Sign In
        </a>
      </div>
      <footer className="mt-8 text-xs text-gray-400 dark:text-zinc-700 text-center">
        © {new Date().getFullYear()} TinyHabitTracker. All rights reserved.
      </footer>
    </main>
  );
}
