import { View } from 'react-native';
import { useTheme } from '@/kit/theme';
import type { heatmap } from '@/domain/habits';

export function Heatmap({ grid, cell = 16 }: { grid: ReturnType<typeof heatmap>; cell?: number }) {
  const { c } = useTheme();
  const done = grid.flat().filter((x) => x.state === 'done').length;
  const colour = { done: c.primary, rest: c.accent, missed: c.surfaceAlt, off: 'transparent', none: 'transparent' } as const;
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessible accessibilityLabel={`Last ${grid.length} weeks: ${done} days done`}>
      {grid.map((week, i) => (
        <View key={i} style={{ gap: 3 }}>
          {week.map((d) => (
            <View key={d.day} style={{ width: cell, height: cell, borderRadius: 4, backgroundColor: colour[d.state], borderWidth: d.state === 'off' || d.state === 'none' ? 1 : 0, borderColor: c.border }} />
          ))}
        </View>
      ))}
    </View>
  );
}
