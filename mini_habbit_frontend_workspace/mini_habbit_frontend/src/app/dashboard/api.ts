import type { Habit, DailyStatus } from "./HabitList";

// Adjust backend URL as needed depending on deployment/proxy. If Next.js API routes proxy, use "/api/..." instead.
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"; // fallback to 3000 for local nextjs, else set env

// PUBLIC_INTERFACE
export async function fetchHabitsWithLogs(): Promise<Habit[]> {
  // Habits: GET /api/habits
  // Each habit has id, name
  // For each habit, fetch this week's log per day (ideally batch logs, e.g. GET /api/logs?habitId=X)
  // Here: get /api/habits, then fetch logs per habit for the week

  const habitsRes = await fetch(`${API_BASE}/api/habits`, { credentials: "include" });
  if (!habitsRes.ok) throw new Error("Failed to fetch habits");

  const habits = await habitsRes.json();

  // For each habit, fetch logs for this week (Sun-Sat)
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // We batch logs: GET /api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
  const logsRes = await fetch(
    `${API_BASE}/api/logs?from=${startOfWeek
      .toISOString()
      .slice(0, 10)}&to=${endOfWeek.toISOString().slice(0, 10)}`,
    { credentials: "include" }
  );
  if (!logsRes.ok) throw new Error("Failed to fetch logs");

  const logs: {
    id: number;
    habitId: number;
    day: string;
    done: boolean;
  }[] = await logsRes.json();

  // Return habits with their week daily status
  return habits.map((habit: { id: number; name: string }) => {
    const week: DailyStatus[] = Array(7)
      .fill(0)
      .map((_, idx) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + idx);
        const dateStr = date.toISOString().slice(0, 10);
        const log = logs.find(
          (l) => l.habitId === habit.id && l.day.slice(0, 10) === dateStr
        );
        return {
          date: dateStr,
          done: !!log && log.done,
          logId: log?.id,
        };
      });

    return { ...habit, week };
  });
}

// PUBLIC_INTERFACE
export async function markHabitCheckmark(
  habitId: number,
  dateStr: string,
  checked: boolean
): Promise<void> {
  // POST or PATCH to /api/logs to set status for a day
  // First, try PATCH /api/logs (if log exists), else POST
  const existingLogRes = await fetch(
    `${API_BASE}/api/logs?habitId=${habitId}&day=${dateStr}`,
    { credentials: "include" }
  );
  const logs = existingLogRes.ok ? await existingLogRes.json() : [];
  if (logs.length > 0) {
    await fetch(`${API_BASE}/api/logs/${logs[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ done: checked }),
    });
  } else {
    await fetch(`${API_BASE}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ habitId, day: dateStr, done: checked }),
    });
  }
}

// Helper for start of week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
