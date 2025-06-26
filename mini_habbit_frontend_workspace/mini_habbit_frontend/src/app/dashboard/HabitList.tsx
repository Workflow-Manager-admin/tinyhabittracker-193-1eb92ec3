"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHabitsWithLogs, markHabitCheckmark, createHabit, editHabitName } from "./api";

/**
 * PUBLIC_INTERFACE
 * HabitList Component
 * Displays a list of habits and, for each habit, renders daily checkboxes for a week (Sun-Sat) to mark completion.
 * Fetches real data using React Query. Optimistic UI updates when checking off a day.
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
    <div className="flex flex-col gap-6 w-full">
      {/* --- New Habit Form section --- */}
      {showNewForm ? (
        <form
          className="flex gap-2 mb-2 items-center"
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
            className="rounded border border-gray-300 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:border-primary focus:outline-none transition w-full max-w-xs"
            placeholder="Habit name..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            disabled={createHabitMutation.isPending}
            autoFocus
            maxLength={40}
          />
          <button
            type="submit"
            className="bg-primary hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition disabled:opacity-70"
            disabled={createHabitMutation.isPending}
          >
            Add
          </button>
          <button
            type="button"
            className="ml-1 px-3 py-2 rounded text-xs text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
            disabled={createHabitMutation.isPending}
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
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
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
          className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-800 rounded-xl shadow border border-gray-200 dark:border-zinc-700 px-4 py-4 transition"
        >
          <div className="flex-1 min-w-0 flex items-center gap-3 mb-4 sm:mb-0">
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
                  className="rounded border border-gray-300 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 focus:border-primary focus:outline-none transition min-w-0 flex-1"
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
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white rounded px-3 py-2 ml-1 font-semibold transition disabled:opacity-70"
                  disabled={
                    editMutation.isPending ||
                    !editInputValue.trim() ||
                    editInputValue.trim() === habit.name
                  }
                  title="Save"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ml-1 px-2 py-2 rounded text-xs text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
                  onClick={() => {
                    setEditingHabitId(null);
                    setEditInputValue("");
                  }}
                  disabled={editMutation.isPending}
                  title="Cancel"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="text-base font-semibold truncate text-gray-900 dark:text-zinc-100">
                  {habit.name}
                </span>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded text-xs text-gray-700 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
                  onClick={() => {
                    setEditingHabitId(habit.id);
                    setEditInputValue(habit.name);
                    // focus handled by autoFocus, but ref is for future/UX if needed
                    setTimeout(() => {
                      editInputRef.current?.focus();
                    }, 0);
                  }}
                  disabled={editMutation.isPending}
                  title="Edit habit name"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 overflow-x-auto">
            {habit.week.map((day, idx) => (
              <label
                key={day.date}
                className="flex flex-col items-center mx-1 w-10"
                title={day.date}
              >
                <span className="text-xs mb-1 text-gray-500 dark:text-zinc-400">
                  {weekdays[idx]}
                </span>
                <input
                  type="checkbox"
                  checked={day.done}
                  disabled={mutation.isPending}
                  tabIndex={-1}
                  className="accent-primary h-5 w-5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition"
                  onChange={(e) =>
                    mutation.mutate({
                      habitId: habit.id,
                      dateStr: day.date,
                      checked: e.target.checked,
                    })
                  }
                />
              </label>
            ))}
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
