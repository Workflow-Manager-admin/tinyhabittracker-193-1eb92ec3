"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

/**
 * PUBLIC_INTERFACE
 * HomePage – Brand landing page for TinyHabitTracker.
 * Features: hero, primary CTA, preview, features list, testimonial, and footer.
 * Modern, accessible, minimal layout; removes unrelated/excess elements.
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <main className="flex flex-col min-h-screen bg-background dark:bg-dark-bg relative overflow-x-clip">
      {/* HERO SECTION */}
      <section className="w-full flex flex-col items-center justify-center flex-1 pt-16 pb-10 px-4 bg-gradient-to-b from-white via-amber-50 to-background dark:from-zinc-900 dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--contrast-gray,#374151)" }}
          >
            TinyHabitTracker
          </h1>
          <p
            className="mb-6 text-lg md:text-xl font-medium text-secondary"
            style={{ color: "var(--secondary,#64748b)" }}
          >
            Build better habits, one tiny check at a time. Stay accountable and see your progress, every single day.
          </p>
          <a
            href="/register"
            className="inline-block bg-primary text-white font-bold shadow rounded-full px-8 py-3 text-lg transition-colors duration-200 hover:bg-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/30"
            style={{
              backgroundColor: "var(--primary, #2563eb)",
              color: "#fff",
              border: "2px solid var(--primary, #2563eb)",
              letterSpacing: 0.02,
            }}
            aria-label="Sign Up - Create Account"
          >
            Sign up
          </a>
        </div>

        {/* VISUAL PREVIEW (MOCKUP/SNAPSHOT) */}
        <div className="mt-12 flex justify-center">
          <div
            className="rounded-xl shadow-xl overflow-hidden bg-surface border-4 border-muted flex items-center justify-center w-[350px] h-[240px] md:w-[440px] md:h-[320px] relative"
            style={{
              background: "linear-gradient(108deg, #f8fafc 78%, #fffbe6 100%)",
              borderColor: "#e5e7eb",
              boxShadow: "0 8px 32px 0 #eab30818",
            }}
            aria-label="App Preview"
          >
            {/* Placeholder SVG mockup */}
            <svg width="200" height="85" viewBox="0 0 220 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[80%] h-[80%] opacity-95">
              <rect x="10" y="10" width="200" height="65" rx="10" fill="#fffde7" stroke="#fde68a" strokeWidth="2"/>
              <rect x="24" y="22" width="162" height="8" rx="2.5" fill="#facc15" opacity="0.41"/>
              <rect x="24" y="41" width="48" height="8" rx="2.5" fill="#2563eb" opacity="0.22"/>
              <rect x="24" y="59" width="102" height="8" rx="2.5" fill="#22d3ee" opacity="0.16"/>
              {/* "habit rows" checkboxes */}
              <circle cx="32" cy="26" r="5" fill="#fff" stroke="#fde68a" strokeWidth="2"/>
              <circle cx="32" cy="45" r="5" fill="#fff" stroke="#fde68a" strokeWidth="2"/>
              <circle cx="32" cy="63" r="5" fill="#fff" stroke="#fde68a" strokeWidth="2"/>
              {/* checkmarks */}
              <polyline points="29,26 31.5,28.5 35,23" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="29,45 31,47 35,43" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity="0.65"/>
            </svg>
            <span className="absolute bottom-1 right-3 text-xs text-gray-400 select-none">Preview</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-4xl mx-auto mt-14 mb-10 px-4 w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Feature cards */}
          <FeatureCard
            icon={
              <span role="img" aria-label="Track">
                <svg width="36" height="36" fill="none" viewBox="0 0 36 36">
                  <rect x="5" y="5" width="26" height="26" rx="6" fill="#2563eb" fillOpacity="0.08" />
                  <path d="M12 20l4.5 4L25 15" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            }
            title="Track daily"
            description="Check off habits, every day. See your streaks build up!"
            color="primary"
          />
          <FeatureCard
            icon={
              <span role="img" aria-label="Progress">
                <svg width="36" height="36" fill="none" viewBox="0 0 36 36">
                  <rect x="5" y="5" width="26" height="26" rx="6" fill="#22d3ee" fillOpacity="0.08" />
                  <rect x="13" y="22" width="4" height="8" rx="1" fill="#2563eb"/>
                  <rect x="18" y="17" width="4" height="13" rx="1" fill="#facc15"/>
                  <rect x="23" y="12" width="4" height="18" rx="1" fill="#16a34a"/>
                </svg>
              </span>
            }
            title="See progress"
            description="Weekly summaries at a glance. Visualize your completion."
            color="accent"
          />
          <FeatureCard
            icon={
              <span role="img" aria-label="Accountable">
                <svg width="36" height="36" fill="none" viewBox="0 0 36 36">
                  <rect x="5" y="5" width="26" height="26" rx="6" fill="#facc15" fillOpacity="0.10" />
                  <ellipse cx="18" cy="16" rx="6" ry="5" fill="#fffbe6" stroke="#facc15" strokeWidth="1.5"/>
                  <path d="M12 29c0-3.3137 12-3.3137 12 0" stroke="#facc15" strokeWidth="2"/>
                  <circle cx="18" cy="16" r="2" fill="#2563eb"/>
                </svg>
              </span>
            }
            title="Stay accountable"
            description="Protected progress, always in sync. Your data, your journey."
            color="sunshine"
          />
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="max-w-xl mx-auto text-center mb-14 px-4">
        <figure className="bg-surface dark:bg-dark-surface rounded-xl p-6 border border-muted dark:border-dark-muted shadow-sm">
          <blockquote className="italic text-secondary mb-2" style={{ color: "#64748b" }}>
            “TinyHabitTracker helped me finally finish a 30-day meditation streak. Simple, beautiful, and just enough.”
          </blockquote>
          <figcaption className="text-sm text-gray-500">— Taylor, everyday user</figcaption>
        </figure>
      </section>

      {/* FOOTER */}
      <footer className="w-full mt-auto bg-surface dark:bg-dark-surface border-t border-muted dark:border-dark-muted py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm text-secondary">
          <div>
            <span className="font-bold text-primary mr-2" style={{ color: "var(--primary,#2563eb)" }}>TinyHabitTracker</span>
            A minimalist habit tracker for daily check-ins.
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:support@tinyhabittracker.dev" className="hover:underline" style={{ color: "#2563eb", fontWeight: 500 }}>Contact</a>
            <a href="https://github.com/your-github/tinyhabittracker" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#22d3ee" }}>
              <span className="sr-only">GitHub</span>
              <svg width="18" height="18" fill="currentColor" className="inline align-[-3px] mr-1" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.86.5 12.49c0 5.27 3.44 9.73 8.21 11.3.6.11.82-.26.82-.58 0-.29-.01-1.24-.02-2.25-3.34.75-4.04-1.66-4.04-1.66-.54-1.42-1.33-1.8-1.33-1.8-1.08-.78.08-.76.08-.76 1.2.09 1.84 1.24 1.84 1.24 1.06 1.87 2.79 1.33 3.47 1.01.11-.8.41-1.33.74-1.64-2.66-.31-5.47-1.39-5.47-6.15 0-1.36.46-2.48 1.21-3.36-.12-.31-.53-1.57.12-3.27 0 0 1-.34 3.29 1.26a11.32 11.32 0 013-.43c1.02 0 2.05.14 3.01.43 2.29-1.6 3.29-1.26 3.29-1.26.65 1.7.24 2.96.12 3.27.76.88 1.21 2 1.21 3.36 0 4.77-2.82 5.84-5.5 6.15.42.36.8 1.07.8 2.16 0 1.56-.01 2.82-.01 3.2 0 .32.22.7.82.58C20.06 22.22 23.5 17.76 23.5 12.49 23.5 5.86 18.27.5 12 .5z"/></svg>
              GitHub
            </a>
            <span className="text-muted ml-3">&copy; {new Date().getFullYear()} TinyHabitTracker</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/**
 * PUBLIC_INTERFACE
 * FeatureCard: Displays a feature with an icon, title, and description.
 */
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "accent" | "sunshine";
}) {
  // Map color key to brand value
  const brandColor =
    color === "primary"
      ? "#2563eb"
      : color === "accent"
      ? "#22d3ee"
      : "#facc15";
  return (
    <div
      className="flex flex-col items-center bg-surface dark:bg-dark-surface border border-muted dark:border-dark-muted rounded-xl px-6 py-7 w-full max-w-xs shadow-sm"
      style={{ minHeight: 220 }}
    >
      <span className="mb-4">{icon}</span>
      <h3 className="text-lg font-bold mb-2" style={{ color: brandColor }}>
        {title}
      </h3>
      <p className="text-secondary text-sm" style={{ color: "#64748b" }}>
        {description}
      </p>
    </div>
  );
}
