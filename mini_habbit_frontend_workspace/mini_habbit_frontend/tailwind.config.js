/*
 * Brand Color Palette for TinyHabitTracker
 * --------------------------------------------------
 * | Name           | Hex      | Use Case                                 |
 * | -------------- | -------- | ---------------------------------------- |
 * | primary        | #2563eb  | Main brand and call-to-action buttons    |
 * | secondary      | #64748b  | Secondary UI, hints, subtext, links      |
 * | accent         | #22d3ee  | Checked habit, success, progress, focus  |
 * | danger         | #dc2626  | Errors, destructive, delete buttons      |
 * | warning        | #eab308  | Warnings, alerts, attention needed       |
 * | success        | #16a34a  | Success, confirmations, positive badges  |
 * | info           | #3b82f6  | Informational, highlight, onboarding     |
 * | background     | #f8fafc  | App/page background, cards, sidebars     |
 * | surface        | #ffffff  | UI surface: cards, sheets, overlays      |
 * | muted          | #e5e7eb  | Muted backgrounds, dividers, inputs      |
 * | dark-bg        | #0a0a0a  | Background (dark mode)                   |
 * | dark-surface   | #171717  | Card/surface (dark mode)                 |
 * | dark-muted     | #27272a  | Muted (dark mode)                        |
 * --------------------------------------------------
 */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",         // main brand, buttons, highlights
        secondary: "#64748b",       // subtext, secondary UI, links
        accent: "#22d3ee",          // checked, focus, positive accents
        danger: "#dc2626",          // errors, destructive actions
        warning: "#eab308",         // warnings, alerts
        success: "#16a34a",         // success, badges
        info: "#3b82f6",            // info, emphasis
        background: "#f8fafc",      // app/page background, cards
        surface: "#ffffff",         // UI surface: cards, overlays
        muted: "#e5e7eb",           // muted backgrounds, borders
        "dark-bg": "#0a0a0a",       // dark mode background
        "dark-surface": "#171717",  // dark mode surface (cards)
        "dark-muted": "#27272a",    // dark muted, borders in dark
      },
    },
  },
  plugins: [],
};
