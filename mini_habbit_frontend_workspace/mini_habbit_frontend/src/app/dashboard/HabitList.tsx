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
          style={{
            background: "linear-gradient(92deg,#fffbe6 45%,#fffde7 100%)",
            borderRadius: "0.65rem",
            boxShadow: "0 2px 10px 0 #ffe06618",
            border: "1.5px solid #fde68a",
            padding: "0.5rem 1rem"
          }}
        >
          <input
            className="rounded border border-yellow-200 dark:border-yellow-700 p-2 bg-white dark:bg-zinc-900 text-contrastGray focus:border-sunshine focus:outline-none transition w-full max-w-xs shadow-sm"
            placeholder="Habit name…"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            disabled={createHabitMutation.isPending}
            autoFocus
            maxLength={40}
            style={{
              backgroundColor: "#fffbe6",
              color: "#9a6c0b",
              borderColor: "#fde68a",
              fontWeight: 600,
            }}
          />
          <button
            type="submit"
            className="rounded px-4 py-2 font-semibold transition border"
            disabled={createHabitMutation.isPending}
            style={{
              background: "linear-gradient(90deg,#ffe066 70%,#ffb700 100%)",
              color: "#374151",
              borderColor: "#eab308",
              boxShadow: "0 1px 7px 0 #ffe06618",
            }}
          >
            Add
          </button>
          <button
            type="button"
            className="ml-1 px-3 py-2 rounded text-xs font-semibold transition border"
            disabled={createHabitMutation.isPending}
            style={{
              color: "#bfa100",
              backgroundColor: "#fffbe6",
              borderColor: "#fde68a",
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
            className="rounded font-semibold transition px-4 py-2"
            style={{
              background: "linear-gradient(90deg,#ffe066 70%,#facc15 100%)",
              color: "#374151",
              fontWeight: 800,
              boxShadow: "0 2px 8px 0 #ffe06621"
            }}
            onClick={() => setShowNewForm(true)}
          >
            + Add Habit
          </button>
        </div>
      )}

      {formError && (
        <div
          className="rounded text-sm text-center border mb-2"
          style={{
            color: "#a16207",
            background: "#fffbe6",
            borderColor: "#ffc600",
            fontWeight: 600
          }}
        >
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
            background: "linear-gradient(91deg,#fffbe6 76%,#fef3c7 100%)",
            borderColor: "#ffea92",
            boxShadow: "0 2px 15px 0 #fde04722",
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
                style={{
                  background: "#fffcf0",
                  borderRadius: "0.5rem",
                  padding: "0.3rem 0.7rem",
                  border: "1px solid #fde68a",
                  boxShadow: "0 1px 8px #ffe06622",
                }}
              >
                <input
                  ref={editInputRef}
                  className="rounded border border-yellow-200 dark:border-yellow-700 p-2 bg-white dark:bg-zinc-900 text-contrastGray focus:border-sunshine focus:outline-none transition min-w-0 flex-1 shadow"
                  placeholder="Edit habit name…"
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
                    backgroundColor: "#fffde7",
                    color: "#a16207",
                    borderColor: "#fde68a",
                    fontWeight: 600,
                  }}
                />
                <button
                  type="submit"
                  className="ml-1 px-3 py-2 rounded text-xs font-semibold transition border"
                  disabled={
                    editMutation.isPending ||
                    !editInputValue.trim() ||
                    editInputValue.trim() === habit.name
                  }
                  title="Save"
                  style={{
                    background: "linear-gradient(90deg,#fde047 60%,#facc15 100%)",
                    color: "#374151",
                    borderColor: "#ffc300",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="ml-1 px-2 py-2 rounded text-xs font-semibold transition border"
                  onClick={() => {
                    setEditingHabitId(null);
                    setEditInputValue("");
                  }}
                  disabled={editMutation.isPending}
                  title="Cancel"
                  style={{
                    color: "#bfa100",
                    backgroundColor: "#fffbeb",
                    borderColor: "#fde68a",
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span
                  className="text-base font-semibold truncate"
                  style={{ color: "#bfa100" }}
                >
                  {habit.name}
                </span>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded text-xs font-semibold transition border"
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
                    color: "#9a8411",
                    backgroundColor: "#fffbe6",
                    borderColor: "#ffecb0",
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="ml-1 px-2 py-1 rounded text-xs font-semibold transition border"
                  onClick={() => {
                    if (window.confirm("Delete this habit? This cannot be undone.")) {
                      deleteHabitMutation.mutate(habit.id);
                    }
                  }}
                  disabled={deleteHabitMutation.isPending}
                  title="Delete habit"
                  style={{
                    color: "#b17600",
                    backgroundColor: "#ffe9b2",
                    borderColor: "#ffbd4a",
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full pb-2 sm:pb-0">
            {habit.week.map((day, idx) => {
              // Brand color logic: checked are rich yellow/goldenrod badge, unchecked are pale/contrast gray
              const checkedStyle = {
                background: "linear-gradient(91deg,#fde047 78%,#ffb700 100%)",
                color: "#484116",
                borderColor: "#ffb700",
                fontWeight: 700,
                boxShadow: "0 2px 5px #facc1516"
              };
              const uncheckedStyle = {
                background: "#fffbe6",
                color: "#bfa100",
                borderColor: "#fde68a",
                fontWeight: 600,
                opacity: 0.73,
                boxShadow: "0 1px 2px #fde04713"
              };
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center mx-0 sm:mx-1 w-10 min-w-[2.5rem] max-w-[2.7rem]"
                  title={day.date}
                >
                  <span className="text-[11px] sm:text-xs mb-1"
                    style={{ color: "#ebb800", fontWeight: 800, opacity: 0.93 }}
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
                    className="transition rounded-full text-xl sm:text-2xl leading-none w-8 h-8 shadow-sm border focus:outline-none focus:ring-2 select-none"
                    style={day.done ? checkedStyle : uncheckedStyle}
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
                      // highlight color for check
                      <span style={{ fontWeight: "bold", color: "#16a34a" }}>✔</span>
                    ) : (
                      <span style={{ fontWeight: "bold", color: "#cdbe70", opacity: 0.52 }}>–</span>
                    )}
                  </button>
                  <input
                    type="checkbox"
                    checked={day.done}
                    disabled={mutation.isPending}
                    tabIndex={-1}
                    className="accent-sunshine h-4 w-4 rounded-md border transition mt-1"
                    aria-hidden="true"
                    onChange={e =>
                      mutation.mutate({
                        habitId: habit.id,
                        dateStr: day.date,
                        checked: e.target.checked,
                      })
                    }
                    style={
                      day.done
                        ? {
                            accentColor: "#fde047",
                            borderColor: "#ffb700",
                            background: "#fffde7"
                          }
                        : {
                            accentColor: "#fde68a",
                            borderColor: "#fde68a",
                            background: "#fffbe6"
                          }
                    }
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
