import { addDays } from '@/kit/dates';
import { amountTotal, bookPace, completion, EVERY_DAY, heatmap, milestone, streakFor, validateHabit, weekStrip, type Habit, type Logs } from '../habits';

const h = (over: Partial<Habit> = {}): Habit => ({ id: 'h', name: 'Read', emoji: '📚', kind: 'simple', days: EVERY_DAY, created: '2026-11-01', ...over });
const logDays = (from: string, n: number, v = 1) => Object.fromEntries(Array.from({ length: n }, (_, i) => [addDays(from, i), v]));

test('streak uses the forgiving engine with the habit schedule', () => {
  const weekdays = h({ days: [1, 2, 3, 4, 5] }); // Mon–Fri
  // 2026-11-02 is a Monday. Two full work weeks done; weekends never break it.
  const logs: Logs = { h: { ...logDays('2026-11-02', 5), ...logDays('2026-11-09', 5) } };
  const s = streakFor(weekdays, logs, {}, '2026-11-15'); // Sunday
  expect(s.current).toBe(10);
  expect(s.status).toBe('rest');
});

test('a rest day keeps the streak safe', () => {
  const logs: Logs = { h: { ...logDays('2026-11-01', 3), '2026-11-05': 1 } };
  const s = streakFor(h(), logs, { h: ['2026-11-04'] }, '2026-11-05');
  expect(s.current).toBe(4);
  expect(s.status).toBe('done');
});

test('week strip counts scheduled habits per day', () => {
  const a = h({ id: 'a' });
  const b = h({ id: 'b', days: [1] }); // Mondays only
  const logs: Logs = { a: { '2026-11-23': 1 }, b: { '2026-11-23': 1 } };
  const strip = weekStrip([a, b], logs, '2026-11-24');
  expect(strip[0]).toMatchObject({ day: '2026-11-23', due: 2, done: 2 });
  expect(strip[1]).toMatchObject({ day: '2026-11-24', due: 1, done: 0, isToday: true });
  expect(strip[2].future).toBe(true);
});

test('completion ignores rest days and days before the habit existed', () => {
  const logs: Logs = { h: logDays('2026-11-20', 3) };
  const c = completion(h({ created: '2026-11-20' }), logs, { h: ['2026-11-23'] }, '2026-11-01', '2026-11-24');
  expect(c).toEqual({ done: 3, due: 4, rate: 0.75 });
});

test('heatmap marks done, rest, missed and off days', () => {
  const habit = h({ days: [1, 3, 5], created: '2026-11-16' });
  const logs: Logs = { h: { '2026-11-16': 1 } };
  const grid = heatmap(habit, logs, { h: ['2026-11-18'] }, '2026-11-23', 2);
  const flat = grid.flat();
  expect(flat.find((c) => c.day === '2026-11-16')?.state).toBe('done');
  expect(flat.find((c) => c.day === '2026-11-17')?.state).toBe('off');
  expect(flat.find((c) => c.day === '2026-11-18')?.state).toBe('rest');
  expect(flat.find((c) => c.day === '2026-11-20')?.state).toBe('missed');
  expect(flat.find((c) => c.day === '2026-11-23')?.state).toBe('none'); // today isn't missed yet
});

test('reading totals and book pace', () => {
  const r = h({ kind: 'reading', target: 10, bookGoal: 12 });
  const logs: Logs = { h: { '2026-11-20': 12, '2026-11-21': 30 } };
  expect(amountTotal(r, logs, '2026-11-01', '2026-11-30')).toBe(42);
  const pace = bookPace(r, { h: ['2026-02-01', '2026-06-01'] }, '2026-07-02');
  expect(pace?.read).toBe(2);
  expect(pace?.aheadBy).toBeCloseTo(-4, 0);
});

test('milestones and validation', () => {
  expect(milestone(7)).toBe(7);
  expect(milestone(8)).toBeNull();
  expect(validateHabit({ name: ' ', days: EVERY_DAY })).toMatch(/name/);
  expect(validateHabit({ name: 'Walk', days: [] })).toMatch(/day/);
  expect(validateHabit({ name: 'Walk', days: [1], target: 0 })).toMatch(/whole number/);
  expect(validateHabit({ name: 'Walk', days: [1], target: 20 })).toBeNull();
});

test('filling in days before the habit was created still counts', () => {
  const logs: Logs = { h: { '2026-11-21': 1, '2026-11-22': 1 } };
  const s = streakFor(h({ created: '2026-11-23' }), logs, { h: ['2026-11-23'] }, '2026-11-23');
  expect(s.current).toBe(2);
  expect(s.status).toBe('rest');
});
