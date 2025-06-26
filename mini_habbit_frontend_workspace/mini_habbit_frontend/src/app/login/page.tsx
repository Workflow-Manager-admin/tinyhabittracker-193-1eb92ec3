"use client";

import React, { useState } from "react";

/**
 * Login Page
 * Route: /login
 * PUBLIC_INTERFACE
 * A simple login form with email and password, styled using Tailwind CSS.
 * API integration will be connected later.
 */
export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder handler for demo purposes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // TODO: connect to real auth API
    setTimeout(() => {
      setSubmitting(false);
      setError("Login is not yet implemented.");
    }, 700);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-primary">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              type="email"
              className="rounded border border-gray-300 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:border-primary focus:outline-none transition"
              required
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              disabled={submitting}
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Password
            <input
              type="password"
              className="rounded border border-gray-300 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:border-primary focus:outline-none transition"
              required
              minLength={6}
              placeholder="********"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              disabled={submitting}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="mt-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded p-2 transition-colors disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between text-xs mt-2">
            <a
              className="text-primary hover:underline"
              href="/register"
            >
              Need an account?
            </a>
          </div>
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded text-sm text-center border border-red-200">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
