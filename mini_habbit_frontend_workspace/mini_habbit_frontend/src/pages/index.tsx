import { useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Home page: Fetches backend status from the root endpoint and displays a message.
 */
export default function HomeStatusFetch() {
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch status from backend (uses env var for backend base URL)
    const base =
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_BACKEND_URL ||
            (window as any).NEXT_PUBLIC_BACKEND_URL ||
            "http://localhost:3000")
        : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    fetch(`${base}/`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch backend status");
        // Try to parse JSON, fallback to plain text for legacy or custom responses
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await res.json();
          // Show 'message' field if available, else stringify the whole object
          setStatus(json.message ?? JSON.stringify(json));
        } else {
          setStatus(await res.text());
        }
      })
      .catch((err) => {
        setError("Could not reach backend: " + err.message);
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Backend Status</h1>
      <div
        className="rounded p-4 bg-blue-50 border border-blue-200 text-blue-900"
        data-testid="status-box"
      >
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          <span>{status}</span>
        )}
      </div>
    </main>
  );
}
