"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { AuthProvider } from "./auth";
import { NavBar } from "./NavBar";

/**
 * PUBLIC_INTERFACE
 * Providers component wraps the app in all necessary client-side context providers.
 * This must be a client component to enable use of hooks/context.
 * Includes AuthProvider, QueryClientProvider, and ReactQueryDevtools.
 * Layout.tsx should delegate to <Providers> for all client context.
 */
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
