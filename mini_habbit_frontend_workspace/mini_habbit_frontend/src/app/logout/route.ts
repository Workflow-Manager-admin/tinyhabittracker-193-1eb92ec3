import { NextRequest, NextResponse } from "next/server";

/**
 * PUBLIC_INTERFACE
 * Handles POST /logout to log user out via backend API, clears auth cookies,
 * and redirects to login. Used for secure, SSR-compatible logout in protected pages.
 */
export async function POST(req: NextRequest) {
  // The backend URL for logout
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // Proxy the logout request to backend
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      credentials: "include" as any,
    });
  } catch (e) {
    // Ignore backend errors, proceed to clear cookies anyway
  }
  // Remove relevant cookies for session (actual cookie name depends on backend, e.g. "session", "token", etc.)
  const response = NextResponse.redirect(new URL("/login", req.nextUrl));
  // Optional: explicitly clear any known client set cookies here
  response.cookies.set("token", "", { path: "/", expires: new Date(0) });
  return response;
}
