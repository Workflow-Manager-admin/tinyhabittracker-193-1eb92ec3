"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHabitsWithLogs, markHabitCheckmark } from "./api";

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

  // use data from props (custom dashboard page) or else fetch
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
    // Optimistic UI: update cache
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
      // revert
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

  return (
    <div className="flex flex-col gap-6 w-full">
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
            <span className="text-base font-semibold truncate text-gray-900 dark:text-zinc-100">{habit.name}</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto">
            {habit.week.map((day, idx) => (
              <label
                key={day.date}
                className="flex flex-col items-center mx-1 w-10"
                title={day.date}
              >
                <span className="text-xs mb-1 text-gray-500 dark:text-zinc-400">{weekdays[idx]}</span>
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
