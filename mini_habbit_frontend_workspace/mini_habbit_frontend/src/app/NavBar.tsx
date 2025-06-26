"use client";

import React from "react";
import { useAuth } from "./auth";
import { useRouter, usePathname } from "next/navigation";

/**
 * PUBLIC_INTERFACE
 * NavBar component
 * Shows navigation links and auth-aware options (dashboard/logout vs login/register).
 * Minimal, sticky top navigation for global layout.
 * Highlights the active route.
 */
export function NavBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Utility to check if a nav link is active
  const isActive = (href: string) => {
    // Exact for /dashboard, /login, /register; home active only at /
    if (href === "/") return pathname === "/";
    if (href === "/dashboard") return pathname.startsWith("/dashboard");
    if (href === "/login") return pathname.startsWith("/login");
    if (href === "/register") return pathname.startsWith("/register");
    return false;
  };

  // Handle logout and route to login on success
  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <nav
      className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm sticky top-0 z-30"
      aria-label="Main navigation"
    >
      {/* Brand/Logo */}
      <a
        href="/"
        className={`text-lg font-extrabold tracking-tight text-primary hover:opacity-80 transition-all ${
          isActive("/") ? "underline underline-offset-4" : ""
        }`}
      >
        TinyHabit
      </a>
      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
        {/* Show loading indicator if user loading */}
        {loading && (
          <span className="text-gray-400 px-2 animate-pulse select-none">…</span>
        )}
        {/* Authenticated navigation */}
        {!loading && user && (
          <>
            <a
              href="/dashboard"
              className={`rounded px-3 py-2 font-semibold shadow focus:outline-none focus:ring-2 transition
                ${
                  isActive("/dashboard")
                    ? "bg-primary text-white underline underline-offset-4"
                    : "bg-primary text-white hover:bg-blue-700 focus:ring-primary/50"
                }
              `}
            >
              Dashboard
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className={`rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 transition ${
                loading
                  ? "bg-gray-50 text-gray-400 opacity-60"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 focus:ring-primary/30"
              }`}
              disabled={loading}
              aria-disabled={loading}
            >
              Logout
            </button>
            {/* Display user email (desktop only, subtle) */}
            <span className="hidden md:inline ml-3 px-2 text-gray-500 dark:text-zinc-400 font-normal whitespace-nowrap truncate max-w-[140px]">
              {user.email}
            </span>
          </>
        )}
        {/* Unauthenticated navigation */}
        {!loading && !user && (
          <>
            <a
              href="/login"
              className={`rounded px-3 py-2 font-semibold shadow focus:outline-none focus:ring-2 transition
                ${
                  isActive("/login")
                    ? "bg-primary text-white underline underline-offset-4"
                    : "bg-primary text-white hover:bg-blue-700 focus:ring-primary/50"
                }
              `}
            >
              Login
            </a>
            <a
              href="/register"
              className={`rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 transition
                ${
                  isActive("/register")
                    ? "bg-gray-200 dark:bg-zinc-700 text-primary underline underline-offset-4"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 focus:ring-primary/30"
                }
              `}
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
