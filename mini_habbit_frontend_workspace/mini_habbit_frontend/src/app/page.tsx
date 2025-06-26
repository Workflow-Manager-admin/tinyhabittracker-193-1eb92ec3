"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

/**
 * PUBLIC_INTERFACE
 * Home Page ("/").
 * ONLY shows two buttons: 'Login' and 'Sign Up'—absolutely no extra content, text, description, logo, or links.
 * Uses full brand accessibility: high-contrast color palette as per BRAND_COLORS.md.
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

  if (loading) {
    // Show nothing while loading auth state to prevent layout flash
    return null;
  }

  // Unauthenticated view: STRICTLY two buttons only
  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-background dark:bg-dark-bg">
      <div
        className="flex flex-col gap-6 w-full max-w-xs p-0 m-0"
        aria-label="Welcome actions"
      >
        <a
          href="/login"
          className="w-full rounded-lg text-lg font-bold py-3 px-6 bg-primary text-white shadow focus:outline-none focus:ring-4 focus:ring-primary/30 hover:bg-primary/90 transition"
          style={{
            backgroundColor: "var(--primary, #2563eb)",
            color: "#fff",
            border: "2px solid var(--primary, #2563eb)",
            letterSpacing: 0.02,
          }}
          role="button"
          aria-label="Login"
        >
          Login
        </a>
        <a
          href="/register"
          className="w-full rounded-lg text-lg font-bold py-3 px-6 bg-sunshine text-contrastGray shadow focus:outline-none focus:ring-4 focus:ring-sunshine/30 hover:bg-sunshine/90 hover:text-primary transition"
          style={{
            backgroundColor: "var(--sunshine, #facc15)",
            color: "var(--contrast-gray, #374151)",
            border: "2px solid var(--sunshine, #facc15)",
            letterSpacing: 0.02,
          }}
          role="button"
          aria-label="Sign Up"
        >
          Sign Up
        </a>
      </div>
    </main>
  );
}
