import { Fredoka_600SemiBold, useFonts } from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Intro } from '@/kit/Intro';
import { prefsStore } from '@/kit/prefs';
import { KitRoot } from '@/kit/Root';
import { useTheme } from '@/kit/theme';
import { brand } from '@/brand';
import { Flame } from '@/components/Flame';

SplashScreen.preventAutoHideAsync().catch(() => {});
const usePrefs = prefsStore('loopday', 20);

function Shell() {
  const { c } = useTheme();
  const onboarded = usePrefs((s) => s.onboarded);
  const header = { headerShown: true, headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false } as const;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="habit/[id]" options={{ ...header, title: '' }} />
        <Stack.Screen name="habit/edit" options={{ ...header, title: 'Habit', presentation: 'modal' }} />
      </Stack>
      {!onboarded ? (
        <View style={StyleSheet.absoluteFill}>
          <Intro
            cta="Pick my first habit"
            onDone={() => usePrefs.getState().setOnboarded()}
            steps={[
              { title: 'One tap a day', body: 'Track 3 small habits. Tap once when you do them. That really is it.', art: <Flame streak={5} size={90} /> },
              { title: 'Streaks that forgive', body: "Miss a day? A freeze or repair mode keeps your streak. Rest days never count against you. No guilt, ever.", art: <Flame streak={12} size={90} frozen /> },
              { title: 'Read, move, anything', body: 'Count pages towards a yearly book goal, log walking minutes, or just tick it off.', art: <Text style={{ fontSize: 96 }}>📚</Text> },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Fredoka_600SemiBold });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <KitRoot brand={brand}>
      <Shell />
    </KitRoot>
  );
}
