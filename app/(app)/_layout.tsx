import { Stack } from "expo-router";
import { useTheme } from 'react-native-paper';

export default function RootLayout() {
  const theme = useTheme();

  return <Stack
    screenOptions={{
      headerShown: true,
      headerTitleStyle: { color: theme.colors.onSurface },
      headerTintColor: theme.colors.onSurface,
      headerStyle: { backgroundColor: theme.colors.surface },
      contentStyle: { backgroundColor: theme.colors.background }
    }}
  >
    <Stack.Screen redirect={true} name="index" />
    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    <Stack.Screen name="song/[slug]" options={{ title: "Song Detail" }} />
    <Stack.Screen name="suggest-song" options={{ title: "Suggest a Song" }} />
  </Stack>;
}
