import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { addDays, formatDay, todayKey } from '@/kit/dates';
import { usePremium } from '@/kit/premium';
import { PaywallSheet } from '@/kit/Paywall';
import { streakMessage } from '@/kit/streak';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, Chip, Field, H1, Muted, Row, Screen, Section, Sheet, Stack, Strong } from '@/kit/ui';
import { EVERY_DAY, isDone, isScheduled, streakFor, unitFor, weekStrip, type Habit } from '@/domain/habits';
import { FREE_HABITS } from '@/brand';
import { Flame } from '@/components/Flame';
import { useLog } from '@/components/useLog';
import { useHabits } from '@/state/habits';

const STARTERS: Omit<Habit, 'id' | 'created'>[] = [
  { name: 'Drink water', emoji: '💧', kind: 'simple', days: EVERY_DAY },
  { name: 'Read', emoji: '📚', kind: 'reading', days: EVERY_DAY, target: 10, bookGoal: 12 },
  { name: 'Walk', emoji: '🚶', kind: 'moving', days: EVERY_DAY, target: 20 },
  { name: 'Stretch', emoji: '🧘', kind: 'simple', days: EVERY_DAY },
  { name: 'No phone in bed', emoji: '📵', kind: 'simple', days: EVERY_DAY },
  { name: 'Journal', emoji: '✍️', kind: 'simple', days: EVERY_DAY },
];

function WeekStrip() {
  const { c, font } = useTheme();
  const { habits, logs } = useHabits();
  const strip = weekStrip(habits, logs, todayKey());
  return (
    <Row style={{ justifyContent: 'space-between' }} gap={4}>
      {strip.map((d) => {
        const full = d.due > 0 && d.done >= d.due;
        const some = d.done > 0 && !full;
        return (
          <View key={d.day} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessible accessibilityLabel={`${formatDay(d.day, 'long')}: ${d.done} of ${d.due} done`}>
            <Text style={{ color: d.isToday ? c.primary : c.textMuted, fontWeight: '700', fontSize: 12 }}>{formatDay(d.day, 'weekday').slice(0, 2)}</Text>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: full ? c.primary : some ? c.surfaceAlt : 'transparent',
                borderWidth: 2,
                borderColor: d.isToday ? c.primary : full ? c.primary : c.border,
                opacity: d.future ? 0.4 : 1,
              }}
            >
              <Text style={{ fontFamily: font.display, color: full ? c.primaryText : c.text, fontSize: 15 }}>{d.day.slice(8).replace(/^0/, '')}</Text>
            </View>
          </View>
        );
      })}
    </Row>
  );
}

function HabitRow({ h, onAmount }: { h: Habit; onAmount: (h: Habit) => void }) {
  const { c, radius } = useTheme();
  const s = useHabits();
  const log = useLog();
  const today = todayKey();
  const done = isDone(h, s.logs, today);
  const streak = streakFor(h, s.logs, s.rests, today);
  const resting = (s.rests[h.id] ?? []).includes(today);
  const savedByFreeze = streak.frozenDays.includes(addDays(today, -1));
  const unit = unitFor(h.kind);
  const amount = s.logs[h.id]?.[today];
  return (
    <Card testID={`habit-${h.name}`}>
      <Row gap={12}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${h.name} details`} onPress={() => router.push(`/habit/${h.id}`)} style={{ flex: 1 }}>
          <Row gap={12}>
            <Text style={{ fontSize: 30 }}>{h.emoji}</Text>
            <Stack gap={2} style={{ flex: 1 }}>
              <Strong>{h.name}</Strong>
              <Muted numberOfLines={2}>{resting ? 'Rest day. Streak safe.' : savedByFreeze && !done ? 'A freeze kept your streak yesterday 🧊' : unit && amount ? `${amount} ${unit} today` : streakMessage(streak)}</Muted>
            </Stack>
          </Row>
        </Pressable>
        <Flame streak={streak.current} frozen={savedByFreeze} />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
                aria-checked={done}
          accessibilityLabel={`${h.name}, ${done ? 'done today' : 'not done yet'}`}
          testID={`check-${h.name}`}
          onPress={() => (done ? log(h, null) : unit && h.target ? onAmount(h) : log(h, 1))}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: radius,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? c.primary : c.surface,
            borderWidth: 2.5,
            borderColor: done ? c.primary : c.border,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Ionicons name="checkmark" size={30} color={done ? c.primaryText : c.border} />
        </Pressable>
      </Row>
    </Card>
  );
}

function AmountSheet({ h, onClose }: { h: Habit | null; onClose: () => void }) {
  const log = useLog();
  const [text, setText] = useState('');
  if (!h) return null;
  const unit = unitFor(h.kind)!;
  const target = h.target ?? 10;
  const n = Number(text);
  const ok = text.trim() !== '' && Number.isInteger(n) && n > 0 && n <= 1000;
  const save = (v: number) => {
    log(h, v);
    setText('');
    onClose();
  };
  return (
    <Sheet visible onClose={onClose} title={`${h.emoji} ${h.name}`}>
      <Stack>
        <Body>{`How many ${unit} today?`}</Body>
        <Row wrap gap={8}>
          {[Math.max(1, Math.round(target / 2)), target, target * 2].map((v) => (
            <Chip key={v} label={`${v} ${unit}`} onPress={() => save(v)} testID={`amount-${v}`} />
          ))}
        </Row>
        <Field label={`Or type the ${unit}`} value={text} onChangeText={setText} inputMode="numeric" keyboardType="number-pad" maxLength={4} testID="amount-input" error={text && !ok ? 'A whole number from 1 to 1000' : null} />
        <Button title="Log it" disabled={!ok} onPress={() => save(n)} testID="amount-save" />
        <Button title="Just tick it off" variant="ghost" onPress={() => save(1)} />
      </Stack>
    </Sheet>
  );
}

export default function Today() {
  const { habits, logs } = useHabits();
  const { isPremium } = usePremium();
  const [amountFor, setAmountFor] = useState<Habit | null>(null);
  const [paywall, setPaywall] = useState(false);
  const today = todayKey();
  const due = habits.filter((h) => isScheduled(h, today));
  const notToday = habits.filter((h) => !isScheduled(h, today));
  const doneCount = due.filter((h) => isDone(h, logs, today)).length;

  const addStarter = (s: (typeof STARTERS)[number]) => {
    if (!isPremium && habits.length >= FREE_HABITS) return setPaywall(true);
    useHabits.getState().add(s);
  };
  const addNew = () => (!isPremium && habits.length >= FREE_HABITS ? setPaywall(true) : router.push('/habit/edit'));

  return (
    <Screen testID="today">
      <Stack gap={2}>
        <Muted>{formatDay(today, 'long')}</Muted>
        <H1>{habits.length ? (doneCount === due.length && due.length ? 'All done today 🎉' : `${doneCount} of ${due.length} done`) : 'Hello!'}</H1>
      </Stack>
      {habits.length ? <WeekStrip /> : null}

      {habits.length === 0 ? (
        <Card>
          <Strong>Pick a tiny habit to start</Strong>
          <Muted>Start small: one or two is plenty. You can change everything later.</Muted>
          <Row wrap gap={8}>
            {STARTERS.map((s) => (
              <Chip key={s.name} label={`${s.emoji} ${s.name}`} onPress={() => addStarter(s)} testID={`starter-${s.name}`} />
            ))}
          </Row>
          <Button title="Create my own" variant="secondary" icon="add" onPress={addNew} testID="habit-new" />
        </Card>
      ) : (
        <>
          <Stack gap={10}>
            {due.map((h) => (
              <HabitRow key={h.id} h={h} onAmount={setAmountFor} />
            ))}
          </Stack>
          {notToday.length ? (
            <Section title="Not scheduled today">
              {notToday.map((h) => (
                <Card key={h.id} onPress={() => router.push(`/habit/${h.id}`)}>
                  <Row gap={10}>
                    <Text style={{ fontSize: 22, opacity: 0.6 }}>{h.emoji}</Text>
                    <Muted>{h.name}</Muted>
                  </Row>
                </Card>
              ))}
            </Section>
          ) : null}
          {habits.length < FREE_HABITS ? (
            <Section title="Add another?">
              <Row wrap gap={8}>
                {STARTERS.filter((x) => !habits.some((h) => h.name === x.name)).map((x) => (
                  <Chip key={x.name} label={`${x.emoji} ${x.name}`} onPress={() => addStarter(x)} testID={`starter-${x.name}`} />
                ))}
              </Row>
            </Section>
          ) : null}
          <Button title={habits.length >= FREE_HABITS && !isPremium ? 'Add a habit (Premium)' : 'Add a habit'} icon="add" variant="secondary" onPress={addNew} testID="habit-new" />
        </>
      )}
      <AmountSheet h={amountFor} onClose={() => setAmountFor(null)} />
      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason={`Free LoopDay tracks ${FREE_HABITS} habits. Premium goes up to 10.`} />
    </Screen>
  );
}
