"use client";

import React, { useState } from "react";
import { useAuth } from "../auth";
import { useRouter } from "next/navigation";

/**
 * Login Page
 * Route: /login
 * PUBLIC_INTERFACE
 * A simple login form with email and password, styled using Tailwind CSS.
 * Auth API integration.
 */
export default function LoginPage() {
  const { login, loading, error, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setSubmitting(true);
    const didLogin = await login(form.email, form.password);
    setSubmitting(false);
    if (didLogin) {
      router.replace("/dashboard");
    } else {
      setFieldError(error || "Login failed.");
    }
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
              disabled={submitting || loading}
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
              disabled={submitting || loading}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="mt-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded p-2 transition-colors disabled:opacity-70"
            disabled={submitting || loading}
          >
            {(submitting || loading) ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between text-xs mt-2">
            <a
              className="text-primary hover:underline"
              href="/register"
            >
              Need an account?
            </a>
          </div>
          {(fieldError || error) && (
            <div className="text-red-600 bg-red-50 p-2 rounded text-sm text-center border border-red-200">
              {fieldError || error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
