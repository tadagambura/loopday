// Logging a habit: store it, offer undo, and celebrate milestones (never anything sad).
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { todayKey, type DayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { milestone, streakFor, unitFor, type Habit } from '@/domain/habits';
import { useHabits } from '@/state/habits';

const MOMENTS = {
  7: { emoji: '😎', title: '7 days!', body: 'The flame puts on its sunglasses.' },
  30: { emoji: '🐉', title: '30 days!', body: 'Your flame is now a tiny dragon. It sneezes confetti.' },
  100: { emoji: '🏆', title: '100 days!', body: 'A hundred. Honestly, wow.' },
  365: { emoji: '🎂', title: 'One whole year!', body: 'Every loop counted.' },
} as const;

export function useLog() {
  const { toast } = useFeedback();
  const celebrate = useCelebrate();
  return (h: Habit, amount: number | null, day: DayKey = todayKey()) => {
    const st = useHabits.getState();
    const before = st.logs[h.id]?.[day];
    st.log(h.id, day, amount);
    if (amount == null) {
      toast(`${h.name}: unticked.`, { actionLabel: 'Undo', onAction: () => useHabits.getState().log(h.id, day, before ?? 1) });
      return;
    }
    track('core_action_completed', { kind: h.kind, backfill: day !== todayKey() });
    const s = useHabits.getState();
    const streak = streakFor(h, s.logs, s.rests, todayKey());
    const m = day === todayKey() ? milestone(streak.current) : null;
    if (m) {
      track('milestone_reached', { streak: m });
      celebrate({ scene: `streak-${m}`, ...MOMENTS[m] });
    } else {
      const unit = unitFor(h.kind);
      toast(unit && amount > 1 ? `${h.name}: ${amount} ${unit}. Nice.` : `${h.name}: done. Nice.`, {
        actionLabel: 'Undo',
        onAction: () => useHabits.getState().log(h.id, day, before ?? null),
      });
    }
  };
}
