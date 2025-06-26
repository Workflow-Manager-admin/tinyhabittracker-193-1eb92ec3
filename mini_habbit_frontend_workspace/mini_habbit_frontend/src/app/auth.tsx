"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Backend API base (update as needed for deployment)
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// PUBLIC_INTERFACE
export type User = {
  email: string;
};

// Type returned by /auth/me (if logged in)
type SessionResponse = {
  user: User;
};

// Auth context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session from backend on load
  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: SessionResponse = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e: any) {
      setUser(null);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  async function login(email: string, password: string) {
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
        await fetchSession(); // refresh user state
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Login failed.");
      }
    } catch (e) {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
    return false;
  }

  // PUBLIC_INTERFACE
  async function register(email: string, password: string) {
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
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
    return false;
  }

  // PUBLIC_INTERFACE
  async function logout() {
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_e) {}
    setUser(null);
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function refresh() {
    await fetchSession();
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
