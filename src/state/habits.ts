import { todayKey, type DayKey } from '@/kit/dates';
import { persisted, uid } from '@/kit/store';
import type { Books, Habit, Logs, Rests } from '@/domain/habits';

type HabitsState = {
  habits: Habit[];
  logs: Logs;
  rests: Rests;
  books: Books;
  add: (h: Omit<Habit, 'id' | 'created'>) => string;
  update: (id: string, patch: Partial<Omit<Habit, 'id' | 'created'>>) => void;
  remove: (id: string) => { habit: Habit; logs: Logs[string]; rests: DayKey[]; books: DayKey[] } | null;
  restore: (snap: { habit: Habit; logs: Logs[string]; rests: DayKey[]; books: DayKey[] }) => void;
  /** Mark done (amount defaults to 1), or clear if `amount` is null. */
  log: (id: string, day: DayKey, amount: number | null) => void;
  toggleRest: (id: string, day: DayKey) => void;
  finishBook: (id: string) => void;
  undoBook: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
};

export const useHabits = persisted<HabitsState>('loopday.habits', 1, (set, get) => ({
  habits: [],
  logs: {},
  rests: {},
  books: {},
  add: (h) => {
    const id = uid('h');
    set((s) => ({ habits: [...s.habits, { ...h, id, created: todayKey() }] }));
    return id;
  },
  update: (id, patch) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
  remove: (id) => {
    const s = get();
    const habit = s.habits.find((h) => h.id === id);
    if (!habit) return null;
    const snap = { habit, logs: s.logs[id] ?? {}, rests: s.rests[id] ?? [], books: s.books[id] ?? [] };
    const { [id]: _l, ...logs } = s.logs;
    const { [id]: _r, ...rests } = s.rests;
    const { [id]: _b, ...books } = s.books;
    set({ habits: s.habits.filter((h) => h.id !== id), logs, rests, books });
    return snap;
  },
  restore: (snap) =>
    set((s) => ({
      habits: [...s.habits, snap.habit],
      logs: { ...s.logs, [snap.habit.id]: snap.logs },
      rests: { ...s.rests, [snap.habit.id]: snap.rests },
      books: { ...s.books, [snap.habit.id]: snap.books },
    })),
  log: (id, day, amount) =>
    set((s) => {
      const mine = { ...(s.logs[id] ?? {}) };
      if (amount == null) delete mine[day];
      else mine[day] = amount;
      // Logging a day clears a rest mark on it.
      const rests = (s.rests[id] ?? []).filter((d) => d !== day);
      return { logs: { ...s.logs, [id]: mine }, rests: { ...s.rests, [id]: rests } };
    }),
  toggleRest: (id, day) =>
    set((s) => {
      const cur = s.rests[id] ?? [];
      return { rests: { ...s.rests, [id]: cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day] } };
    }),
  finishBook: (id) => set((s) => ({ books: { ...s.books, [id]: [...(s.books[id] ?? []), todayKey()] } })),
  undoBook: (id) => set((s) => ({ books: { ...s.books, [id]: (s.books[id] ?? []).slice(0, -1) } })),
  move: (id, dir) =>
    set((s) => {
      const i = s.habits.findIndex((h) => h.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.habits.length) return {};
      const habits = [...s.habits];
      [habits[i], habits[j]] = [habits[j], habits[i]];
      return { habits };
    }),
}));
