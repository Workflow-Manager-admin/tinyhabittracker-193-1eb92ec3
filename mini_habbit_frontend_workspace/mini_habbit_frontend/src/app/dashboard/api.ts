import type { Habit, DailyStatus } from "./HabitList";

// Adjust backend URL as needed depending on deployment/proxy. If Next.js API routes proxy, use "/api/..." instead.
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"; // fallback to 3000 for local nextjs, else set env

/**
 * PUBLIC_INTERFACE
 * Edit a habit's name (PATCH /api/habits/:id).
 * @param id: number
 * @param name: string
 * Returns: the updated habit object.
 */
export async function editHabitName(id: number, name: string): Promise<{ id: number; name: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
  } catch (err: any) {
    throw new Error("Network error (failed to update habit): " + (err?.message || err));
  }
  if (!res.ok) {
    let reason = "Failed to update habit name";
    try {
      const data = await res.json();
      reason = data?.error || reason;
    } catch {}
    throw new Error(reason);
  }
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Delete a habit (DELETE /api/habits/:id).
 * @param id number - Habit ID to delete.
 * Returns: nothing if successful, throws error on failure.
 */
export async function deleteHabit(id: number): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/habits/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch (err: any) {
    throw new Error("Network error (failed to delete habit): " + (err?.message || err));
  }
  if (!res.ok) {
    let errString = "Failed to delete habit";
    try {
      const data = await res.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
  }
  // nothing returned on success
}

// PUBLIC_INTERFACE
export async function fetchHabitsWithLogs(): Promise<Habit[]> {
  let habitsRes: Response, habits: any[];
  try {
    habitsRes = await fetch(`${API_BASE}/api/habits`, { credentials: "include" });  
  } catch (err: any) {
    throw new Error("Network error while fetching habits: " + (err?.message || err));
  }
  if (!habitsRes.ok) {
    let errString = "Failed to fetch habits";
    try {
      const data = await habitsRes.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
  }
  habits = await habitsRes.json();

  // For each habit, fetch logs for this week (Sun-Sat)
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  let logsRes: Response, logs: { id: number; habitId: number; day: string; done: boolean }[];
  try {
    // We batch logs: GET /api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
    logsRes = await fetch(
      `${API_BASE}/api/logs?from=${startOfWeek
        .toISOString()
        .slice(0, 10)}&to=${endOfWeek.toISOString().slice(0, 10)}`,
      { credentials: "include" }
    );
  } catch (err: any) {
    throw new Error("Network error while fetching logs: " + (err?.message || err));
  }
  if (!logsRes.ok) {
    let errString = "Failed to fetch logs";
    try {
      const data = await logsRes.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
  }

  logs = await logsRes.json();

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
  let existingLogRes: Response, logs: any[] = [];
  try {
    existingLogRes = await fetch(
      `${API_BASE}/api/logs?habitId=${habitId}&day=${dateStr}`,
      { credentials: "include" }
    );
    logs = existingLogRes.ok ? await existingLogRes.json() : [];
  } catch (err: any) {
    throw new Error("Network error while checking mark: " + (err?.message || err));
  }

  if (logs.length > 0) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/logs/${logs[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ done: checked }),
      });
    } catch (err: any) {
      throw new Error("Network error (mark check): " + (err?.message || err));
    }
    if (!res.ok) {
      let errString = "Failed to update habit checkmark";
      try {
        const data = await res.json();
        errString = data?.error || errString;
      } catch {}
      throw new Error(errString);
    }
  } else {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ habitId, day: dateStr, done: checked }),
      });
    } catch (err: any) {
      throw new Error("Network error (create log): " + (err?.message || err));
    }
    if (!res.ok) {
      let errString = "Failed to check-off habit";
      try {
        const data = await res.json();
        errString = data?.error || errString;
      } catch {}
      throw new Error(errString);
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Create a new habit (POST /api/habits).
 * @param name: string
 * Returns: the created habit.
 */
export async function createHabit(name: string): Promise<{ id: number; name: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
  } catch (err: any) {
    throw new Error("Network error (create habit): " + (err?.message || err));
  }
  if (!res.ok) {
    let reason = "Failed to create habit";
    try {
      const data = await res.json();
      reason = data?.error || reason;
    } catch {}
    throw new Error(reason);
  }
  return res.json();
}

// Helper for start of week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
