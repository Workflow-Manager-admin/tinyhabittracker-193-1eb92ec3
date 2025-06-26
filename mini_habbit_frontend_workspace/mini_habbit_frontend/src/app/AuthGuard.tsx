"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

/**
 * PUBLIC_INTERFACE
 * AuthGuard component.
 * Blocks rendering of children and redirects to /login if the user is not authenticated.
 * Use in client components/pages for client-side route protection to supplement SSR protection.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Wait until loading complete before rendering children
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-2">
        <span className="text-gray-500 dark:text-zinc-400">Checking authentication…</span>
      </div>
    );
  }
  // Block rendering until user is known
  if (!user) return null; // Already redirecting

  return <>{children}</>;
}
