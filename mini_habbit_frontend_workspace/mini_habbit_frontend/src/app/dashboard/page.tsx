/**
 * Dashboard Page
 * Route: /dashboard
 * PUBLIC_INTERFACE
 * Secured Dashboard page (SSR + client auth)
 *
 * - Server-Side Rendering: Checks authentication on the server using session cookies.
 *   Redirects to /login if not authenticated.
 * - Client-side: Uses <AuthGuard> to handle session-loss during client navigation,
 *   preventing unauthorized access or content flash after logout/expired session.
 * - Only renders for logged-in users. Unauthenticated users will always be redirected to /login.
 */

import HabitList from "./HabitList";
import { AuthGuard } from "../AuthGuard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * PUBLIC_INTERFACE
 * Helper for SSR: Checks backend for authenticated user using cookies.
 * Returns user object or null.
 */
async function getServerSession(): Promise<{ email: string } | null> {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        cookie: cookies().toString(),
      },
      credentials: "include" as any,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export default async function DashboardPage() {
  // SSR: If user not authenticated, redirect before rendering
  const user = await getServerSession();
  if (!user) {
    redirect("/login");
  }

  // Only render inner dashboard for authenticated users
  // The AuthGuard protects against session changes or logout in client navigation
  return (
    <AuthGuard>
      <div className="min-h-screen flex h-screen bg-gray-50 dark:bg-zinc-900">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 py-6 px-4 gap-6 h-full">
          <span className="text-lg font-bold text-primary mb-2 tracking-tight">
            TinyHabitTracker
          </span>
          <div className="text-xs mb-4 text-gray-500 dark:text-zinc-400 break-all">{user.email}</div>
          <nav className="flex flex-col gap-2 font-medium text-gray-700 dark:text-zinc-200">
            <a
              href="/dashboard"
              className="rounded px-3 py-2 bg-primary text-white"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Profile
            </a>
            <form
              action="/logout"
              method="POST"
            >
              <button
                type="submit"
                className="rounded px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition text-left"
              >
                Logout
              </button>
            </form>
          </nav>
          <div className="mt-auto text-xs text-gray-500 dark:text-zinc-500">
            © {new Date().getFullYear()} TinyHabitTracker
          </div>
        </aside>

        {/* Mobile Navbar */}
        <nav className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-b-gray-200 dark:border-b-zinc-700 z-20 px-4 py-2 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-primary">
            TinyHabit
          </span>
          <div className="flex gap-2">
            <a
              href="/dashboard"
              className="rounded px-2 py-1 bg-primary text-white text-sm"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
            >
              Profile
            </a>
            <form
              action="/logout"
              method="POST"
            >
              <button
                type="submit"
                className="rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
              >
                Logout
              </button>
            </form>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 py-20 md:py-10 md:px-12 overflow-auto">
          <h1 className="text-2xl font-bold mb-8 text-primary">
            My Habits
          </h1>
          <section className="w-full max-w-2xl">
            <HabitList />
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
