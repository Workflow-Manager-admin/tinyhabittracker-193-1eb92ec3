"use client";

import React from "react";
import { useAuth } from "./auth";
import { useRouter } from "next/navigation";

/**
 * PUBLIC_INTERFACE
 * NavBar component
 * Shows navigation links and auth-aware options (login/register or user email/logout).
 * Use in layout or pages for consistent navigation.
 */
export function NavBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
      <a href="/" className="text-lg font-bold tracking-tight text-primary">
        TinyHabit
      </a>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-xs text-gray-500 dark:text-zinc-300">{user.email}</span>
            <a
              href="/dashboard"
              className="rounded px-3 py-2 bg-primary text-white text-sm"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
            >
              Profile
            </a>
            {/* 
              Logout button triggers logout logic: 
              - Calls useAuth().logout() (calls backend API, clears state)
              - Then client-side redirect to /login.
              For full session-clear (especially with SSR routes) use server-side POST /logout instead (see dashboard page and /logout/route.ts).
            */}
            <button
              type="button"
              onClick={() => logout().then(() => router.replace("/login"))}
              className="rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
              disabled={loading}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              className="rounded px-3 py-2 bg-primary text-white text-sm"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
