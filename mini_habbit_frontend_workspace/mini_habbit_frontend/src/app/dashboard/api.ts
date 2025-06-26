import type { Habit, DailyStatus } from "./HabitList";

// API base URL, always read via runtime env for deployment flexibility
const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_BACKEND_URL ||
        (window as any).NEXT_PUBLIC_BACKEND_URL ||
        "http://localhost:3000")
    : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * PUBLIC_INTERFACE
 * Edit a habit's name (PATCH /api/habits/:id).
 * @param id: number (habitId)
 * @param name: string (new habit name)
 * Returns: Promise<{ id: number; name: string }>
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
 * Delete a habit by ID (DELETE /api/habits/:id).
 * @param id: Habit ID to delete.
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
}

/**
 * PUBLIC_INTERFACE
 * Fetch all habits with weekly logs for the current user (GET /api/habits and GET /api/logs).
 * Returns: Array of Habit objects, each with a week: DailyStatus[] of this Sun-Sat.
 */
export async function fetchHabitsWithLogs(): Promise<Habit[]> {
  // Fetch all habits for the current user
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

  // For each habit, fetch logs for the current week (Sun-Sat)
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  let logsRes: Response, logs: { id: number; habitId: number; day: string; done: boolean }[];
  try {
    logsRes = await fetch(
      `${API_BASE}/api/logs?from=${startOfWeek.toISOString().slice(0, 10)}&to=${endOfWeek.toISOString().slice(0, 10)}`,
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

  // Map each habit to its week array (Sun-Sat)
  return habits.map((habit: { id: number; name: string }) => {
    const week: DailyStatus[] = Array(7).fill(0).map((_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      const dateStr = date.toISOString().slice(0, 10);
      const log = logs.find(
        (l) => l.habitId === habit.id && (l.day || "").slice(0, 10) === dateStr
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

/**
 * PUBLIC_INTERFACE
 * Mark/unmark a habit as done for a date using logs API (PATCH or POST).
 * @param habitId number
 * @param dateStr string (yyyy-mm-dd)
 * @param checked boolean (done state)
 */
export async function markHabitCheckmark(
  habitId: number,
  dateStr: string,
  checked: boolean
): Promise<void> {
  // See if a log already exists for the habit/day
  let logsRes: Response, logs: any[] = [];
  try {
    logsRes = await fetch(
      `${API_BASE}/api/logs?habitId=${habitId}&day=${dateStr}`,
      { credentials: "include" }
    );
    logs = logsRes.ok ? await logsRes.json() : [];
  } catch (err: any) {
    throw new Error("Network error (mark check): " + (err?.message || err));
  }

  if (Array.isArray(logs) && logs.length > 0) {
    // Update log (PATCH /api/logs/:logId)
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/logs/${logs[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ done: checked }),
      });
    } catch (err: any) {
      throw new Error("Network error (update checkmark): " + (err?.message || err));
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
    // No log: create (POST /api/logs)
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
 * Create a new habit for the current user (POST /api/habits).
 * @param name: string (habit name)
 * Returns: { id, name }
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

/**
 * PUBLIC_INTERFACE
 * Fetch logs for the given habit (optional), time range, or for all habits.
 * @param params (habitId?: number, from?: string, to?: string, day?: string)
 * Returns: Array<{ id, habitId, day, done }>
 */
export async function fetchLogs(params: {
  habitId?: number;
  from?: string;
  to?: string;
  day?: string;
}): Promise<{ id: number; habitId: number; day: string; done: boolean }[]> {
  // Construct query string from params
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/logs${q ? "?" + q : ""}`, {
      credentials: "include",
    });
  } catch (err: any) {
    throw new Error("Network error (fetch logs): " + (err?.message || err));
  }
  if (!res.ok) {
    let errString = "Failed to fetch logs";
    try {
      const data = await res.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
  }
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Upsert a log entry for a habit and day (POST /api/logs).
 * @param habitId number
 * @param day string (yyyy-mm-dd)
 * @param done boolean
 * Returns: log object { id, habitId, day, done }
 */
export async function upsertLog(habitId: number, day: string, done: boolean): Promise<{ id: number; habitId: number; day: string; done: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ habitId, day, done }),
    });
  } catch (err: any) {
    throw new Error("Network error (upsert log): " + (err?.message || err));
  }
  if (!res.ok) {
    let errString = "Failed to upsert log";
    try {
      const data = await res.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
  }
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Patch a log entry by its ID (PATCH /api/logs/:logId).
 * @param logId number
 * @param done boolean
 * Returns: log object { id, habitId, day, done }
 */
export async function patchLogById(logId: number, done: boolean): Promise<{ id: number; habitId: number; day: string; done: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/logs/${logId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ done }),
    });
  } catch (err: any) {
    throw new Error("Network error (patch log): " + (err?.message || err));
  }
  if (!res.ok) {
    let errString = "Failed to update log";
    try {
      const data = await res.json();
      errString = data?.error || errString;
    } catch {}
    throw new Error(errString);
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
