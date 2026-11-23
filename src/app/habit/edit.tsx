import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { track } from '@/kit/analytics';
import { useTheme } from '@/kit/theme';
import { Button, Chip, Field, Muted, Note, Row, Screen, Section, Segmented } from '@/kit/ui';
import { EVERY_DAY, KINDS, unitFor, validateHabit, type HabitKind } from '@/domain/habits';
import { useHabits } from '@/state/habits';

const EMOJIS = ['✅', '💧', '📚', '🚶', '🏃', '🧘', '💪', '🥗', '🍎', '😴', '📵', '✍️', '🎸', '🧠', '🌱', '🧹', '💊', '🦷', '🙏', '🎨', '🗣️', '💰', '🐶', '☀️'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useHabits((s) => s.habits.find((h) => h.id === id));
  const { c } = useTheme();
  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '✅');
  const [kind, setKind] = useState<HabitKind>(existing?.kind ?? 'simple');
  const [days, setDays] = useState<number[]>(existing?.days ?? EVERY_DAY);
  const [target, setTarget] = useState(existing?.target ? String(existing.target) : kind === 'reading' ? '10' : '20');
  const [goal, setGoal] = useState(existing?.bookGoal ? String(existing.bookGoal) : '12');
  const [error, setError] = useState<string | null>(null);
  const unit = unitFor(kind);

  const save = () => {
    const input = {
      name: name.trim(),
      emoji,
      kind,
      days: [...days].sort(),
      target: unit ? Number(target) : undefined,
      bookGoal: kind === 'reading' && goal ? Number(goal) : undefined,
    };
    const err = validateHabit(input);
    if (err) return setError(err);
    if (existing) useHabits.getState().update(existing.id, input);
    else {
      useHabits.getState().add(input);
      track('core_action_completed', { what: 'habit_created', kind });
    }
    router.back();
  };

  return (
    <Screen edges={['bottom']} testID="habit-edit-screen" footer={<Button title={existing ? 'Save changes' : 'Add habit'} onPress={save} testID="habit-save" />}>
      <Field label="Name" value={name} onChangeText={(t) => { setName(t); setError(null); }} placeholder="e.g. Stretch for 5 minutes" maxLength={40} testID="habit-name" />
      <Section title="Icon">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS.map((e) => (
            <Pressable key={e} accessibilityRole="radio" accessibilityState={{ checked: emoji === e }}
                aria-checked={emoji === e} accessibilityLabel={`Icon ${e}`} onPress={() => setEmoji(e)} style={{ width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: emoji === e ? c.primary : 'transparent', backgroundColor: c.surface }}>
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </Section>
      <Segmented label="Type" options={KINDS.map((k) => ({ value: k.value, label: k.label }))} value={kind} onChange={(k) => { setKind(k); setTarget(k === 'reading' ? '10' : '20'); }} testID="habit-kind" />
      {unit ? <Field label={`Daily ${unit} (a gentle target)`} value={target} onChangeText={setTarget} inputMode="numeric" keyboardType="number-pad" maxLength={4} testID="habit-target" /> : null}
      {kind === 'reading' ? <Field label="Books to finish this year" value={goal} onChangeText={setGoal} inputMode="numeric" keyboardType="number-pad" maxLength={3} testID="habit-book-goal" /> : null}
      <Section title="Which days?">
        <Row gap={6} style={{ justifyContent: 'space-between' }}>
          {WEEK.map((d) => {
            const on = days.includes(d);
            return (
              <Pressable key={d} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                aria-checked={on} accessibilityLabel={NAMES[d]} onPress={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : c.surface, borderWidth: 2, borderColor: on ? c.primary : c.border }}>
                <Text style={{ color: on ? c.primaryText : c.text, fontWeight: '700' }}>{LETTER[d]}</Text>
              </Pressable>
            );
          })}
        </Row>
        <Row wrap gap={8}>
          <Chip label="Every day" selected={days.length === 7} onPress={() => setDays(EVERY_DAY)} />
          <Chip label="Weekdays" selected={days.length === 5 && !days.includes(0) && !days.includes(6)} onPress={() => setDays([1, 2, 3, 4, 5])} />
        </Row>
        <Muted>Days you don't pick never count against your streak.</Muted>
      </Section>
      {error ? <Note tone="warning">{error}</Note> : null}
    </Screen>
  );
}
