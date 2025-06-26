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
    <main
      className="min-h-screen flex items-center justify-center px-2 sm:px-0"
      style={{
        background: "linear-gradient(87deg,#fffbe6 70%,#fff9da 100%)",
      }}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm p-4 sm:p-8 rounded-lg shadow-md border"
        style={{
          background: "linear-gradient(95deg,#fffbe6 80%,#fff 100%)",
          borderColor: "#fde68a",
          boxShadow: "0 4px 32px #ffe06636",
        }}
      >
        <h1
          className="text-2xl font-bold mb-4"
          style={{
            color: "var(--contrast-gray,#374151)",
            textShadow: "0 1px 6px #fffde722",
            letterSpacing: 0.1,
          }}
        >
          Login
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium" style={{ color: "var(--contrast-gray,#374151)" }}>
            Email
            <input
              type="email"
              className="rounded border p-2 bg-white text-gray-900 focus:border-yellow-400 focus:outline-none transition shadow-sm"
              required
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              disabled={submitting || loading}
              autoComplete="email"
              style={{
                background: "#fffde7",
                color: "#374151",
                borderColor: "#fde68a",
                fontWeight: 600,
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium" style={{ color: "var(--contrast-gray,#374151)" }}>
            Password
            <input
              type="password"
              className="rounded border p-2 bg-white text-gray-900 focus:border-yellow-400 focus:outline-none transition shadow-sm"
              required
              minLength={6}
              placeholder="********"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              disabled={submitting || loading}
              autoComplete="current-password"
              style={{
                background: "#fffde7",
                color: "#374151",
                borderColor: "#fde68a",
                fontWeight: 600,
              }}
            />
          </label>
          <button
            type="submit"
            className="mt-2 font-semibold rounded p-2 transition-colors border"
            disabled={submitting || loading}
            style={{
              background: "linear-gradient(90deg,#ffe066 80%,#ffc107 100%)",
              color: "#374151",
              borderColor: "#eab308",
              fontWeight: 700,
              boxShadow: "0 2px 12px 0 #ffe06622",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "linear-gradient(90deg,#ffd300 50%,#ffb700 100%)"
            }}
            onFocus={e => {
              e.currentTarget.style.background = "linear-gradient(90deg,#ffd600 60%,#f59e0b 100%)"
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "linear-gradient(90deg,#ffe066 80%,#ffc107 100%)"
            }}
          >
            {(submitting || loading) ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between text-xs mt-2">
            <a
              className="hover:underline"
              href="/register"
              style={{
                color: "#996c00",
                fontWeight: 600,
              }}
            >
              Need an account?
            </a>
          </div>
          {(fieldError || error) && (
            <div className="text-red-600 bg-yellow-100 p-2 rounded text-sm text-center border border-yellow-200" style={{ fontWeight: 600 }}>
              {fieldError || error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
