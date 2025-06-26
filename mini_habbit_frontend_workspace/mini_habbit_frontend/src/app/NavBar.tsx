"use client";

import React from "react";
import { useAuth } from "./auth";
import { useRouter } from "next/navigation";

/**
 * PUBLIC_INTERFACE
 * NavBar component
 * Shows navigation links and auth-aware options (login/register or dashboard/logout).
 * Used in the root layout for persistent global navigation.
 */
export function NavBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm sticky top-0 z-30">
      {/* Brand */}
      <a href="/" className="text-lg font-extrabold tracking-tight text-primary hover:opacity-80 transition-all">
        TinyHabit
      </a>
      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
        {/* Authenticated: Dashboard + Logout */}
        {user ? (
          <>
            <a
              href="/dashboard"
              className="rounded px-3 py-2 bg-primary text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            >
              Dashboard
            </a>
            <button
              type="button"
              onClick={() => logout().then(() => router.replace("/login"))}
              className="rounded px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              disabled={loading}
            >
              Logout
            </button>
          </>
        ) : (
          // Not authenticated: Login + Register
          <>
            <a
              href="/login"
              className="rounded px-3 py-2 bg-primary text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            >
              Register
            </a>
          </>
        )}
        {/* Subtle user email for authenticated user */}
        {user && (
          <span className="hidden md:inline ml-3 px-2 text-gray-500 dark:text-zinc-400 font-normal whitespace-nowrap truncate max-w-[140px]">
            {user.email}
          </span>
        )}
      </div>
    </nav>
  );
}
