// LoopDay's companion: a little flame that grows with the streak, wears sunglasses at 7 days,
// becomes a tiny dragon at 30, and sits under an ice cube when a freeze saved the day.
import { Text, View } from 'react-native';
import { useTheme } from '@/kit/theme';

export function Flame({ streak, size = 28, frozen, label }: { streak: number; size?: number; frozen?: boolean; label?: string }) {
  const { c, font } = useTheme();
  const face = streak >= 30 ? '🐉' : '🔥';
  const scale = streak <= 0 ? 0.7 : Math.min(1.25, 0.8 + streak / 40);
  return (
    <View style={{ alignItems: 'center', minWidth: size * 1.4 }} accessible accessibilityLabel={label ?? `${streak} day streak${frozen ? ', protected by a freeze' : ''}`}>
      <View>
        <Text style={{ fontSize: size * scale, opacity: streak <= 0 ? 0.35 : 1 }}>{face}</Text>
        {streak >= 7 && streak < 30 ? <Text style={{ position: 'absolute', top: size * 0.28, left: size * 0.12, fontSize: size * 0.42 }}>🕶️</Text> : null}
        {frozen ? <Text style={{ position: 'absolute', right: -size * 0.25, top: -size * 0.1, fontSize: size * 0.5 }}>🧊</Text> : null}
      </View>
      <Text style={{ fontFamily: font.display, color: streak > 0 ? c.primary : c.textMuted, fontSize: size * 0.55 }}>{streak}</Text>
    </View>
  );
}
