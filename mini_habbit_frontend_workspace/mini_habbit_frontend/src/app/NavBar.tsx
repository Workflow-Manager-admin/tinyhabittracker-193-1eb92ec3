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
      className={
        // Branded palette: white nav background, sunshine primary actions, contrast gray text
        "w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-muted dark:border-dark-muted shadow-sm sticky top-0 z-30"
      }
      aria-label="Main navigation"
    >
      {/* Brand/Logo */}
      <a
        href="/"
        className={`text-lg font-extrabold tracking-tight hover:opacity-90 transition-all ${
          isActive("/") ? "underline underline-offset-4" : ""
        }`}
        style={{
          color: "var(--contrast-gray, #374151)",
        }}
      >
        TinyHabit
      </a>
      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
        {/* Show loading indicator if user loading */}
        {loading && (
          <span className="text-secondary px-2 animate-pulse select-none">…</span>
        )}
        {/* Authenticated navigation */}
        {!loading && user && (
          <>
            <a
              href="/dashboard"
              className={`rounded px-3 py-2 font-semibold shadow focus:outline-none focus:ring-2 transition
                ${
                  isActive("/dashboard")
                    ? "bg-sunshine text-contrastGray underline underline-offset-4"
                    : "bg-sunshine text-contrastGray hover:bg-primary/90 hover:text-white focus:ring-primary/50"
                }
              `}
              style={{
                backgroundColor: "var(--sunshine, #facc15)",
                color: "var(--contrast-gray, #374151)",
              }}
            >
              Dashboard
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className={`rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 transition ${
                loading
                  ? "bg-muted text-secondary opacity-60"
                  : "bg-white text-contrastGray hover:bg-muted focus:ring-sunshine/40"
              }`}
              style={{
                color: "var(--contrast-gray, #374151)",
                backgroundColor: "#fff",
              }}
              disabled={loading}
              aria-disabled={loading}
            >
              Logout
            </button>
            {/* Display user email (desktop only, subtle) */}
            <span
              className="hidden md:inline ml-3 px-2 font-normal whitespace-nowrap truncate max-w-[140px]"
              style={{
                color: "var(--contrast-gray, #64748b, #64748b)",
              }}
            >
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
                    ? "bg-sunshine text-contrastGray underline underline-offset-4"
                    : "bg-sunshine text-contrastGray hover:bg-primary/90 hover:text-white focus:ring-primary/50"
                }
              `}
              style={{
                backgroundColor: "var(--sunshine, #facc15)",
                color: "var(--contrast-gray, #374151)",
              }}
            >
              Login
            </a>
            <a
              href="/register"
              className={`rounded px-3 py-2 font-semibold focus:outline-none focus:ring-2 transition
                ${
                  isActive("/register")
                    ? "bg-muted text-primary underline underline-offset-4"
                    : "bg-white text-contrastGray hover:bg-muted focus:ring-sunshine/40"
                }
              `}
              style={{
                color: "var(--contrast-gray, #374151)",
                backgroundColor: "#fff",
              }}
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
