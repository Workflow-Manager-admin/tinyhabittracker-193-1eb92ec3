"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";

/**
 * Backend API base (uses .env NEXT_PUBLIC_BACKEND_URL for deployment compatibility,
 * fallback to localhost for dev).
 */
const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_BACKEND_URL ||
        (window as any).NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3000")
    : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * PUBLIC_INTERFACE
 * User object for authentication context.
 */
export type User = {
  email: string;
};

/**
 * Type returned by /auth/me endpoint (if logged in).
 */
type SessionResponse = {
  user: User;
};

/**
 * PUBLIC_INTERFACE
 * Auth context shape describing state and authentication methods.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Initialize AuthContext with undefined by default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PUBLIC_INTERFACE
 * AuthProvider React Context provider
 *
 * Maintains user session, login/register/logout logic,
 * persists state (in memory, but refreshes from backend on mount).
 * Handles robust error messaging.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the current session/user from backend (/auth/me).
   * Sets user and loading/error state appropriately.
   */
  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data: SessionResponse = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setUser(null);
      setError("Could not connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, try to fetch the session
  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Attempt login with given email and password.
   * On success, refreshes user state and returns true.
   * On failure, sets error message. Returns false.
   */
  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        await fetchSession();
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Login failed.");
      }
    } catch (e) {
      setError("Could not reach authentication server.");
    } finally {
      setLoading(false);
    }
    return false;
  }

  /**
   * PUBLIC_INTERFACE
   * Attempt registration.
   * On success, refreshes user state and returns true.
   * On failure, sets error and returns false.
   */
  async function register(email: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        await fetchSession();
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Registration failed.");
      }
    } catch (e) {
      setError("Could not reach authentication server.");
    } finally {
      setLoading(false);
    }
    return false;
  }

  /**
   * PUBLIC_INTERFACE
   * Logs the user out. This will always clear user state locally and set loading.
   * Errors from the backend are ignored (best effort).
   */
  async function logout(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_e) {
      // No-op: could not reach server, but clear local state anyway
    }
    setUser(null);
    setLoading(false);
  }

  /**
   * PUBLIC_INTERFACE
   * Force refreshes session state by calling fetchSession.
   */
  async function refresh(): Promise<void> {
    await fetchSession();
  }

  // Provide the context to all children (memoizing the object for consistency)
  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * Custom hook to access auth state and methods.
 * Must be used under <AuthProvider>.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
