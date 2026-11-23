import { router } from 'expo-router';
import { Text } from 'react-native';
import { addDays, todayKey } from '@/kit/dates';
import { Card, EmptyState, H1, Muted, ProgressBar, Row, Screen, Section, Stack, Stat, Strong } from '@/kit/ui';
import { completion, heatmap, streakFor } from '@/domain/habits';
import { Heatmap } from '@/components/Heatmap';
import { useHabits } from '@/state/habits';

export default function Stats() {
  const s = useHabits();
  const today = todayKey();
  const from = addDays(today, -29);
  if (!s.habits.length) return <Screen><H1>Stats</H1><EmptyState icon="bar-chart-outline" title="Nothing to show yet" body="Tick off a habit and your stats start here." /></Screen>;
  const per = s.habits.map((h) => ({ h, c: completion(h, s.logs, s.rests, from, today), st: streakFor(h, s.logs, s.rests, today) }));
  const due = per.reduce((a, x) => a + x.c.due, 0);
  const done = per.reduce((a, x) => a + x.c.done, 0);
  const ticks = Object.values(s.logs).reduce((a, l) => a + Object.keys(l).length, 0);
  return (
    <Screen testID="stats">
      <H1>Stats</H1>
      <Card tone="alt">
        <Row>
          <Stat label="Last 30 days" value={`${due ? Math.round((done / due) * 100) : 0}%`} testID="stats-rate" />
          <Stat label="Best streak" value={String(Math.max(0, ...per.map((x) => x.st.best)))} />
          <Stat label="All-time ticks" value={String(ticks)} />
        </Row>
        <Muted>Rest days and unscheduled days never count against you.</Muted>
      </Card>
      {per.map(({ h, c, st }) => (
        <Card key={h.id} onPress={() => router.push(`/habit/${h.id}`)} accessibilityLabel={`${h.name}: ${Math.round(c.rate * 100)} percent in the last 30 days`}>
          <Row gap={10}>
            <Text style={{ fontSize: 24 }}>{h.emoji}</Text>
            <Stack gap={2} style={{ flex: 1 }}>
              <Strong>{h.name}</Strong>
              <Muted>{`${Math.round(c.rate * 100)}% · streak ${st.current} · best ${st.best}`}</Muted>
            </Stack>
          </Row>
          <ProgressBar value={c.rate} label={`${h.name} completion`} />
          <Heatmap grid={heatmap(h, s.logs, s.rests, today, 8)} cell={12} />
        </Card>
      ))}
      <Section title="What the colours mean">
        <Muted>Filled: done. Yellow: rest day. Faint: missed (no big deal). Outline: not scheduled.</Muted>
      </Section>
    </Screen>
  );
}
