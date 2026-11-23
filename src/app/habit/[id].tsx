import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { addDays, formatDay, startOfWeek, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { shareText } from '@/kit/share';
import { streakMessage } from '@/kit/streak';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, EmptyState, H2, Muted, ProgressBar, Row, Screen, Section, Stack, Stat, Strong } from '@/kit/ui';
import { amountTotal, bookPace, completion, heatmap, isDone, isScheduled, streakFor, unitFor } from '@/domain/habits';
import { Flame } from '@/components/Flame';
import { Heatmap } from '@/components/Heatmap';
import { useLog } from '@/components/useLog';
import { useHabits } from '@/state/habits';

export default function HabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useHabits();
  const h = s.habits.find((x) => x.id === id);
  const { c, radius } = useTheme();
  const log = useLog();
  const { confirm, toast } = useFeedback();
  const today = todayKey();

  if (!h) return <Screen edges={[]}><EmptyState title="This habit isn't here" body="It may have been deleted." action={<Button title="Back" onPress={() => router.replace('/')} />} /></Screen>;

  const st = streakFor(h, s.logs, s.rests, today);
  const resting = (s.rests[h.id] ?? []).includes(today);
  const unit = unitFor(h.kind);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const month = completion(h, s.logs, s.rests, addDays(today, -29), today);
  const weekTotal = unit ? amountTotal(h, s.logs, startOfWeek(today), today) : 0;
  const yearTotal = unit ? amountTotal(h, s.logs, `${today.slice(0, 4)}-01-01`, today) : 0;
  const books = h.kind === 'reading' ? bookPace(h, s.books, today) : null;

  return (
    <Screen edges={[]} testID="habit">
      <RouterStack.Screen options={{ title: `${h.emoji} ${h.name}` }} />
      <Card tone="alt">
        <Row gap={16}>
          <Flame streak={st.current} size={56} />
          <Stack gap={4} style={{ flex: 1 }}>
            <Strong testID="habit-streak-msg">{streakMessage(st)}</Strong>
            <Muted>{`Best: ${st.best} · Freezes held: ${st.freezes} 🧊`}</Muted>
            {st.repair ? <ProgressBar value={1 - st.repair.remaining / 3} label="Repair progress" /> : null}
          </Stack>
        </Row>
      </Card>

      {isScheduled(h, today) ? (
        <Button
          title={resting ? 'Undo rest day' : 'Take a rest day today'}
          variant="secondary"
          icon="bed-outline"
          testID="rest-today"
          onPress={() => {
            s.toggleRest(h.id, today);
            if (!resting) toast('Rest day. Your streak is safe.');
          }}
        />
      ) : null}

      <Section title="Last 7 days">
        <Muted>Forgot to tick a day? Tap it to fill it in.</Muted>
        <Row style={{ justifyContent: 'space-between' }}>
          {last7.map((d) => {
            const done = isDone(h, s.logs, d);
            const rest = (s.rests[h.id] ?? []).includes(d);
            const sched = isScheduled(h, d);
            return (
              <Pressable
                key={d}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                aria-checked={done}
                accessibilityLabel={`${formatDay(d, 'long')}${done ? ', done' : rest ? ', rest day' : sched ? '' : ', not scheduled'}`}
                onPress={() => log(h, done ? null : 1, d)}
                testID={`day-${d}`}
                style={{ alignItems: 'center', gap: 4 }}
              >
                <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '700' }}>{formatDay(d, 'weekday').slice(0, 2)}</Text>
                <View style={{ width: 40, height: 40, borderRadius: radius / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.primary : rest ? c.accent : c.surface, borderWidth: 2, borderColor: done ? c.primary : c.border, opacity: sched || done ? 1 : 0.45 }}>
                  <Text style={{ color: done ? c.primaryText : c.text, fontWeight: '700' }}>{done ? '✓' : rest ? 'z' : d.slice(8).replace(/^0/, '')}</Text>
                </View>
              </Pressable>
            );
          })}
        </Row>
      </Section>

      <Section title="12 weeks">
        <Heatmap grid={heatmap(h, s.logs, s.rests, today, 12)} />
        <Muted>{`Last 30 days: ${month.done} of ${month.due} scheduled days (${Math.round(month.rate * 100)}%).`}</Muted>
      </Section>

      {unit ? (
        <Card>
          <Row>
            <Stat label={`This week (${unit})`} value={String(weekTotal)} testID="habit-week-total" />
            <Stat label={`This year (${unit})`} value={String(yearTotal)} />
          </Row>
        </Card>
      ) : null}

      {books ? (
        <Card testID="books">
          <H2>{`${books.read} of ${books.goal} books this year`}</H2>
          <ProgressBar value={books.read / books.goal} label="Book goal progress" />
          <Muted>{books.aheadBy >= 0 ? "You're on pace or ahead. Lovely." : `About ${Math.ceil(-books.aheadBy)} behind the pace. Plenty of time.`}</Muted>
          <Row gap={8}>
            <Button small title="I finished a book 📕" onPress={() => { s.finishBook(h.id); toast('Book finished! 📕', { actionLabel: 'Undo', onAction: () => useHabits.getState().undoBook(h.id) }); }} testID="finish-book" />
          </Row>
        </Card>
      ) : null}

      <Row wrap gap={8}>
        <Button small variant="secondary" title="Share my streak" icon="share-outline" onPress={() => shareText(`${h.emoji} ${st.current}-day ${h.name} streak on LoopDay. Tiny habits that forgive you.`, 'streak')} />
        <Button small variant="secondary" title="Edit" icon="create-outline" onPress={() => router.push(`/habit/edit?id=${h.id}`)} testID="habit-edit" />
        <Button small variant="secondary" title="Move up" icon="arrow-up" onPress={() => s.move(h.id, -1)} />
      </Row>
      <Button
        title="Delete this habit"
        variant="danger"
        testID="habit-delete"
        onPress={async () => {
          const ok = await confirm({ title: `Delete ${h.name}?`, body: 'Its history will be removed from this device.', confirmLabel: 'Delete', destructive: true });
          if (!ok) return;
          const snap = s.remove(h.id);
          router.back();
          toast('Habit deleted.', { actionLabel: 'Undo', onAction: () => snap && useHabits.getState().restore(snap) });
        }}
      />
      <Body> </Body>
    </Screen>
  );
}
