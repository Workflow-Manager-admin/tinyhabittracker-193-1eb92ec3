"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * HabitList Component
 * Displays a list of habits and, for each habit, renders daily checkboxes for a week (Sun-Sat) to mark completion.
 * Accepts optional prop 'habits' for data (for now uses built-in mock data).
 * Styled with Tailwind CSS.
 */

type DailyStatus = {
  date: string; // yyyy-mm-dd
  done: boolean;
};

type Habit = {
  id: number;
  name: string;
  week: DailyStatus[]; // This week's statuses (Sun-Sat)
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock data for demonstration
const mockHabits: Habit[] = [
  {
    id: 1,
    name: "Read 10 pages",
    week: [
      { date: "2024-06-09", done: true },
      { date: "2024-06-10", done: true },
      { date: "2024-06-11", done: true },
      { date: "2024-06-12", done: false },
      { date: "2024-06-13", done: false },
      { date: "2024-06-14", done: false },
      { date: "2024-06-15", done: false },
    ],
  },
  {
    id: 2,
    name: "Exercise 20 min",
    week: [
      { date: "2024-06-09", done: false },
      { date: "2024-06-10", done: true },
      { date: "2024-06-11", done: false },
      { date: "2024-06-12", done: false },
      { date: "2024-06-13", done: true },
      { date: "2024-06-14", done: true },
      { date: "2024-06-15", done: false },
    ],
  },
  {
    id: 3,
    name: "Meditate 5 min",
    week: [
      { date: "2024-06-09", done: false },
      { date: "2024-06-10", done: false },
      { date: "2024-06-11", done: true },
      { date: "2024-06-12", done: true },
      { date: "2024-06-13", done: false },
      { date: "2024-06-14", done: true },
      { date: "2024-06-15", done: false },
    ],
  },
];

// PUBLIC_INTERFACE
export default function HabitList({ habits }: { habits?: Habit[] }) {
  const habitsData = habits ?? mockHabits;

  return (
    <div className="flex flex-col gap-6 w-full">
      {habitsData.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-zinc-400">
          No habits yet! Click <span className="font-semibold">Add</span> to create your first habit.
        </div>
      )}
      {habitsData.map((habit) => (
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
                  readOnly
                  tabIndex={-1}
                  className="accent-primary h-5 w-5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
