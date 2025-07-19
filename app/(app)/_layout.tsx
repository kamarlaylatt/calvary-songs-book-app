import theme from '@/theme';
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack
    screenOptions={{
      headerShown: true,
      headerTitleStyle: { color: theme.colors.onBackground },
      headerTintColor: theme.colors.onBackground,
      headerStyle: { backgroundColor: theme.colors.onPrimary },
      contentStyle: { backgroundColor: theme.colors.background }
    }}
  >
    <Stack.Screen redirect={true} name="index" />
    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    <Stack.Screen name="song/[slug]" options={{ title: "Song Detail" }} />
  </Stack>;
}
