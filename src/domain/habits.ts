// LoopDay habits: pure functions over plain data. The streak itself comes from the shared
// forgiving streak engine (freezes, repair mode, rest days).
import { addDays, diffDays, range, startOfWeek, weekday, type DayKey } from '@/kit/dates';
import { computeStreak, type StreakResult } from '@/kit/streak';

export type HabitKind = 'simple' | 'reading' | 'moving';

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  kind: HabitKind;
  /** Scheduled weekdays, 0 = Sunday … 6 = Saturday. All seven = every day. */
  days: number[];
  /** reading: pages a day; moving: minutes a day. Optional. */
  target?: number;
  /** reading: books to finish this year. */
  bookGoal?: number;
  created: DayKey;
};

/** Per habit: day → amount (1 for a plain tick, or pages/minutes). Presence means "done". */
export type Logs = Record<string, Record<DayKey, number>>;
export type Rests = Record<string, DayKey[]>;
export type Books = Record<string, DayKey[]>;

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export const KINDS: { value: HabitKind; label: string; unit: string | null }[] = [
  { value: 'simple', label: 'Tick it off', unit: null },
  { value: 'reading', label: 'Reading', unit: 'pages' },
  { value: 'moving', label: 'Moving', unit: 'minutes' },
];

export const unitFor = (k: HabitKind) => KINDS.find((x) => x.value === k)!.unit;

export const isScheduled = (h: Habit, k: DayKey) => h.days.includes(weekday(k));

/** A habit's history starts when it was created, or earlier if days were filled in afterwards. */
export function startOf(h: Habit, logs: Logs): DayKey {
  let start = h.created;
  for (const d of Object.keys(logs[h.id] ?? {})) if (diffDays(d, start) > 0) start = d;
  return start;
}

export function streakFor(h: Habit, logs: Logs, rests: Rests, today: DayKey): StreakResult {
  return computeStreak({
    done: Object.keys(logs[h.id] ?? {}),
    rest: rests[h.id] ?? [],
    start: startOf(h, logs),
    today,
    isScheduled: (k) => isScheduled(h, k),
  });
}

export function isDone(h: Habit, logs: Logs, k: DayKey) {
  return logs[h.id]?.[k] != null;
}

/** Monday-to-Sunday strip for the current week: how many of the scheduled habits were done each day. */
export function weekStrip(habits: Habit[], logs: Logs, today: DayKey) {
  const mon = startOfWeek(today);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(mon, i);
    const due = habits.filter((h) => isScheduled(h, day) && diffDays(startOf(h, logs), day) >= 0);
    const done = due.filter((h) => isDone(h, logs, day)).length;
    return { day, due: due.length, done, future: diffDays(today, day) > 0, isToday: day === today };
  });
}

/** Last `weeks` weeks as columns of 7 days (Mon→Sun), oldest first, for a heatmap. */
export function heatmap(h: Habit, logs: Logs, rests: Rests, today: DayKey, weeks = 12) {
  const start = addDays(startOfWeek(today), -(weeks - 1) * 7);
  const rest = new Set(rests[h.id] ?? []);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = addDays(start, w * 7 + d);
      const before = diffDays(startOf(h, logs), day) < 0;
      const future = diffDays(today, day) > 0;
      const state: 'done' | 'rest' | 'missed' | 'off' | 'none' = future || before ? 'none' : isDone(h, logs, day) ? 'done' : rest.has(day) ? 'rest' : isScheduled(h, day) ? (day === today ? 'none' : 'missed') : 'off';
      return { day, state };
    }),
  );
}

/** Share of scheduled days done between from and to (inclusive). Rest days don't count against you. */
export function completion(h: Habit, logs: Logs, rests: Rests, from: DayKey, to: DayKey): { done: number; due: number; rate: number } {
  const rest = new Set(rests[h.id] ?? []);
  const first = startOf(h, logs);
  const start = diffDays(first, from) >= 0 ? from : first;
  if (diffDays(start, to) < 0) return { done: 0, due: 0, rate: 0 };
  let due = 0;
  let done = 0;
  for (const d of range(start, to)) {
    if (isDone(h, logs, d)) {
      done++;
      due++;
    } else if (isScheduled(h, d) && !rest.has(d)) due++;
  }
  return { done, due, rate: due ? done / due : 0 };
}

/** Totals for reading and moving habits. */
export function amountTotal(h: Habit, logs: Logs, from: DayKey, to: DayKey) {
  let total = 0;
  for (const [d, v] of Object.entries(logs[h.id] ?? {})) if (diffDays(from, d) >= 0 && diffDays(d, to) >= 0) total += v;
  return total;
}

export function booksThisYear(h: Habit, books: Books, today: DayKey) {
  const y = today.slice(0, 4);
  return (books[h.id] ?? []).filter((d) => d.startsWith(y)).length;
}

/** Where a reader should be by today to hit the yearly book goal. */
export function bookPace(h: Habit, books: Books, today: DayKey) {
  if (!h.bookGoal) return null;
  const y = Number(today.slice(0, 4));
  const dayOfYear = diffDays(`${y}-01-01`, today) + 1;
  const daysInYear = diffDays(`${y}-01-01`, `${y + 1}-01-01`);
  const expected = (h.bookGoal * dayOfYear) / daysInYear;
  const read = booksThisYear(h, books, today);
  return { read, goal: h.bookGoal, aheadBy: Math.round((read - expected) * 10) / 10 };
}

/** The milestone a streak just reached, if any (for the flame's costume changes). */
export function milestone(streak: number): 7 | 30 | 100 | 365 | null {
  return ([365, 100, 30, 7] as const).find((m) => streak === m) ?? null;
}

export function validateHabit(input: { name: string; days: number[]; target?: number; bookGoal?: number }): string | null {
  if (!input.name.trim()) return 'Give your habit a name.';
  if (input.name.trim().length > 40) return 'Keep the name under 40 characters.';
  if (!input.days.length) return 'Pick at least one day.';
  if (input.target != null && (!Number.isInteger(input.target) || input.target < 1 || input.target > 1000)) return 'The daily amount should be a whole number from 1 to 1000.';
  if (input.bookGoal != null && (!Number.isInteger(input.bookGoal) || input.bookGoal < 1 || input.bookGoal > 365)) return 'Book goal should be from 1 to 365.';
  return null;
}
