"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHabitsWithLogs,
  markHabitCheckmark,
  createHabit,
  editHabitName,
  deleteHabit,
} from "./api";

/**
 * PUBLIC_INTERFACE
 * HabitList Component
 * Displays a list of habits and, for each habit, renders daily checkboxes for a week (Sun-Sat) to mark completion.
 * Handles create, update, and delete operations for habits.
 * Uses React Query for state and optimistic updates.
 * Requires authentication (run under an auth-guarded page).
 * Styled with Tailwind CSS.
 */

export type DailyStatus = {
  date: string; // yyyy-mm-dd
  done: boolean;
  logId?: number;
};

export type Habit = {
  id: number;
  name: string;
  week: DailyStatus[]; // This week's statuses (Sun-Sat)
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// PUBLIC_INTERFACE
export default function HabitList({ habits }: { habits?: Habit[] }) {
  const queryClient = useQueryClient();

  // --- New Habit creation form state ---
  const [showNewForm, setShowNewForm] = React.useState(false);
  const [newHabitName, setNewHabitName] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // --- Edit habit state ---
  const [editingHabitId, setEditingHabitId] = React.useState<number | null>(null);
  const [editInputValue, setEditInputValue] = React.useState("");
  const editInputRef = React.useRef<HTMLInputElement>(null);

  // React Query: fetching habits
  const {
    data: habitsData = [],
    isLoading,
    isError,
    error,
  } = useQuery<Habit[]>({
    queryKey: ["habits-with-logs"],
    queryFn: fetchHabitsWithLogs,
    enabled: !habits,
  });

  // Mutation for marking check (optimistic update)
  const mutation = useMutation({
    mutationFn: ({
      habitId,
      dateStr,
      checked,
    }: {
      habitId: number;
      dateStr: string;
      checked: boolean;
    }) => markHabitCheckmark(habitId, dateStr, checked),
    // Optimistic UI
    onMutate: async ({ habitId, dateStr, checked }) => {
      await queryClient.cancelQueries({ queryKey: ["habits-with-logs"] });
      const previous = queryClient.getQueryData<Habit[]>(["habits-with-logs"]);
      if (previous) {
        queryClient.setQueryData<Habit[]>(["habits-with-logs"], (old) =>
          old
            ? old.map((habit) =>
                habit.id === habitId
                  ? {
                      ...habit,
                      week: habit.week.map((d) =>
                        d.date === dateStr ? { ...d, done: checked } : d
                      ),
                    }
                  : habit
              )
            : old
        );
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["habits-with-logs"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-with-logs"] });
    },
  });

  // --- Edit Habit Name mutation (optimistic) ---
  const editMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => editHabitName(id, name),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: ["habits-with-logs"] });
      const previous = queryClient.getQueryData<Habit[]>(["habits-with-logs"]);
      if (previous) {
        queryClient.setQueryData<Habit[]>(["habits-with-logs"], (old) =>
          old
            ? old.map((habit) =>
                habit.id === id
                  ? { ...habit, name }
                  : habit
              )
            : old
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["habits-with-logs"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-with-logs"] });
    },
  });

  // --- Mutation for creating new habit with optimistic update ---
  const createHabitMutation = useMutation({
    mutationFn: async (name: string) => createHabit(name),
    onMutate: async (name: string) => {
      setFormError(null);
      setShowNewForm(false);
      setNewHabitName("");
      await queryClient.cancelQueries({ queryKey: ["habits-with-logs"] });
      const previous = queryClient.getQueryData<Habit[]>(["habits-with-logs"]);
      // Optimistically add a new habit
      const fakeId = Date.now() * -1; // Unique negative id to avoid collision
      const startOfWeek = getStartOfWeek(new Date());
      const week: DailyStatus[] = Array(7)
        .fill(0)
        .map((_, idx) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + idx);
          return { date: date.toISOString().slice(0, 10), done: false };
        });
      queryClient.setQueryData<Habit[]>(["habits-with-logs"], (old) =>
        old ? [{ id: fakeId, name, week }, ...old] : [{ id: fakeId, name, week }]
      );
      return { previous, fakeId };
    },
    onError: (err: any, _vars, context) => {
      setFormError(err?.message || "Could not create habit.");
      if (context?.previous) {
        queryClient.setQueryData(["habits-with-logs"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-with-logs"] });
    },
  });

  // --- Mutation for deleting a habit (optimistic update) ---
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => deleteHabit(habitId),
    onMutate: async (habitId: number) => {
      await queryClient.cancelQueries({ queryKey: ["habits-with-logs"] });
      const previous = queryClient.getQueryData<Habit[]>(["habits-with-logs"]);
      queryClient.setQueryData<Habit[]>(["habits-with-logs"], (old) =>
        old ? old.filter((h) => h.id !== habitId) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["habits-with-logs"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits-with-logs"] });
    },
  });

  const habitsToRender = habits ?? habitsData;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-zinc-400">
        Loading habits...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading habits: {(error as Error)?.message || ""}
      </div>
    );
  }

  // --- UI (with new habit form) ---
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* --- New Habit Form section --- */}
      {showNewForm ? (
        <form
          className="flex flex-col xs:flex-row gap-2 mb-2 items-center w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newHabitName.trim()) {
              setFormError("Please enter a habit name.");
              return;
            }
            createHabitMutation.mutate(newHabitName.trim());
          }}
        >
          <input
            className="rounded border border-amber-200 dark:border-yellow-700 p-2 bg-white dark:bg-zinc-900 text-contrastGray focus:border-sunshine focus:outline-none transition w-full max-w-xs"
            placeholder="Habit name..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            disabled={createHabitMutation.isPending}
            autoFocus
            maxLength={40}
            style={{
              backgroundColor: "var(--surface, #fff)",
              color: "var(--contrast-gray, #374151)",
              borderColor: "#fde68a",
            }}
          />
          <button
            type="submit"
            className="bg-sunshine hover:bg-amber-300 text-contrastGray rounded px-4 py-2 font-semibold transition disabled:opacity-70 border border-goldenrod-300"
            disabled={createHabitMutation.isPending}
            style={{
              backgroundColor: "var(--sunshine, #facc15)",
              color: "var(--contrast-gray, #374151)",
              borderColor: "#ffb700"
            }}
          >
            Add
          </button>
          <button
            type="button"
            className="ml-1 px-3 py-2 rounded text-xs text-contrastGray bg-amber-50 dark:bg-zinc-700 hover:bg-amber-100 dark:hover:bg-yellow-700 transition border border-amber-200"
            disabled={createHabitMutation.isPending}
            style={{
              color: "var(--contrast-gray, #374151)",
              backgroundColor: "#fef3c7",
              borderColor: "#fde68a"
            }}
            onClick={() => {
              setShowNewForm(false);
              setFormError(null);
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex justify-end mb-2">
          <button
            className="bg-sunshine hover:bg-amber-300 text-contrastGray px-4 py-2 rounded font-semibold transition"
            style={{
              backgroundColor: "var(--sunshine, #facc15)",
              color: "var(--contrast-gray, #374151)",
              boxShadow: "0 1px 8px 0 #ffe06618"
            }}
            onClick={() => setShowNewForm(true)}
          >
            + Add Habit
          </button>
        </div>
      )}

      {formError && (
        <div className="text-red-600 bg-red-50 p-2 rounded text-sm text-center border border-red-200 mb-2">
          {formError}
        </div>
      )}

      {/* --- Empty state info message --- */}
      {habitsToRender.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-zinc-400">
          No habits yet! Click <span className="font-semibold">Add</span> to create your first habit.
        </div>
      )}
      {habitsToRender.map((habit) => (
        <div
          key={habit.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl shadow border px-2 sm:px-4 py-3 sm:py-4 transition w-full max-w-full"
          style={{
            background: "var(--surface, #fff)",
            borderColor: "#fde68a",
            boxShadow: "0 2px 14px 0 #fde04722"
          }}
        >
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
            {editingHabitId === habit.id ? (
              <form
                className="flex gap-2 items-center w-full"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const trimmed = editInputValue.trim();
                  if (trimmed && trimmed !== habit.name) {
                    editMutation.mutate({ id: habit.id, name: trimmed });
                  }
                  setEditingHabitId(null);
                  setEditInputValue("");
                }}
              >
                <input
                  ref={editInputRef}
                  className="rounded border border-amber-200 dark:border-yellow-700 p-2 bg-white dark:bg-zinc-900 text-contrastGray focus:border-sunshine focus:outline-none transition min-w-0 flex-1"
                  placeholder="Edit habit name..."
                  value={editInputValue}
                  onChange={e => setEditInputValue(e.target.value)}
                  onBlur={() => {
                    setEditingHabitId(null);
                    setEditInputValue("");
                  }}
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      setEditingHabitId(null);
                      setEditInputValue("");
                    }
                  }}
                  maxLength={40}
                  disabled={editMutation.isPending}
                  autoFocus
                  style={{
                    backgroundColor: "var(--surface, #fff)",
                    color: "var(--contrast-gray, #374151)",
                    borderColor: "#fde68a"
                  }}
                />
                <button
                  type="submit"
                  className="bg-sunshine hover:bg-amber-300 text-contrastGray rounded px-3 py-2 ml-1 font-semibold transition border border-goldenrod-300 disabled:opacity-70"
                  disabled={
                    editMutation.isPending ||
                    !editInputValue.trim() ||
                    editInputValue.trim() === habit.name
                  }
                  title="Save"
                  style={{
                    backgroundColor: "var(--sunshine, #facc15)",
                    color: "var(--contrast-gray, #374151)",
                    borderColor: "#ffb700"
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ml-1 px-2 py-2 rounded text-xs text-contrastGray bg-amber-50 dark:bg-zinc-700 hover:bg-amber-100 dark:hover:bg-yellow-700 transition border border-amber-200"
                  onClick={() => {
                    setEditingHabitId(null);
                    setEditInputValue("");
                  }}
                  disabled={editMutation.isPending}
                  title="Cancel"
                  style={{
                    color: "var(--contrast-gray, #374151)",
                    backgroundColor: "#fef3c7",
                    borderColor: "#fde68a"
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="text-base font-semibold truncate"
                  style={{color:"var(--contrast-gray,#374151)"}}
                >
                  {habit.name}
                </span>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded text-xs text-contrastGray bg-amber-100 hover:bg-sunshine border border-amber-200 dark:text-zinc-200 dark:bg-yellow-900 dark:border-yellow-700 dark:hover:bg-yellow-700 transition"
                  onClick={() => {
                    setEditingHabitId(habit.id);
                    setEditInputValue(habit.name);
                    setTimeout(() => {
                      editInputRef.current?.focus();
                    }, 0);
                  }}
                  disabled={editMutation.isPending}
                  title="Edit habit name"
                  style={{
                    color: "var(--contrast-gray, #374151)",
                    backgroundColor: "#fef3c7",
                    borderColor: "#fde68a"
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ml-1 px-2 py-1 rounded text-xs text-amber-900 border border-amber-300 hover:bg-amber-200 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900 transition"
                  onClick={() => {
                    if (window.confirm("Delete this habit? This cannot be undone.")) {
                      deleteHabitMutation.mutate(habit.id);
                    }
                  }}
                  disabled={deleteHabitMutation.isPending}
                  title="Delete habit"
                  style={{
                    color: "#78350f", // dark amber/dark yellow
                    borderColor: "#f59e0b",
                    backgroundColor: "transparent"
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full pb-2 sm:pb-0">
            {habit.week.map((day, idx) => {
              // Show explicit status badge (✅/❌) next to checkbox for clarity.
              // Click on badge toggles done, checkbox is still available and accessible.
              const checkedBg = "bg-sunshine border-goldenrod-400 text-contrastGray";
              const checkedDarkBg = "dark:bg-yellow-700 dark:border-yellow-500 dark:text-yellow-50";
              const uncheckedBg = "bg-muted text-contrastGray border-amber-200";
              const uncheckedDarkBg = "dark:bg-zinc-700 dark:border-zinc-700 dark:text-yellow-100";
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center mx-0 sm:mx-1 w-10 min-w-[2.5rem] max-w-[2.7rem]"
                  title={day.date}
                >
                  <span className="text-[11px] sm:text-xs mb-1"
                    style={{color:"#a16207"}}
                  >
                    {weekdays[idx]}
                  </span>
                  <button
                    type="button"
                    aria-label={
                      day.done
                        ? `Mark ${weekdays[idx]} (${day.date}) undone`
                        : `Mark ${weekdays[idx]} (${day.date}) done`
                    }
                    className={`
                      transition rounded-full text-xl sm:text-2xl leading-none w-8 h-8 shadow-sm border
                      ${
                        day.done
                          ? `${checkedBg} ${checkedDarkBg}`
                          : `${uncheckedBg} ${uncheckedDarkBg}`
                      }
                      hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-sunshine/80 select-none
                    `}
                    style={
                      day.done
                        ? {
                            backgroundColor: "var(--sunshine, #facc15)",
                            color: "var(--contrast-gray, #374151)",
                            borderColor: "#ffb700"
                          }
                        : {
                            backgroundColor: "#fef3c7",
                            color: "#735506",
                            borderColor: "#fde68a"
                          }
                    }
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        habitId: habit.id,
                        dateStr: day.date,
                        checked: !day.done,
                      })
                    }
                  >
                    {day.done ? (
                      <span style={{fontWeight: "bold"}}>✔</span>
                    ) : (
                      <span style={{fontWeight: "bold", opacity: 0.38}}>–</span>
                    )}
                  </button>
                  <input
                    type="checkbox"
                    checked={day.done}
                    disabled={mutation.isPending}
                    tabIndex={-1}
                    className="accent-sunshine h-4 w-4 rounded-md border border-amber-200 bg-white dark:bg-zinc-900 transition mt-1"
                    aria-hidden="true"
                    onChange={e =>
                      mutation.mutate({
                        habitId: habit.id,
                        dateStr: day.date,
                        checked: e.target.checked,
                      })
                    }
                    style={{
                      accentColor: "#facc15",
                      borderColor: "#fde68a",
                      backgroundColor: "#fff"
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper for start of week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
