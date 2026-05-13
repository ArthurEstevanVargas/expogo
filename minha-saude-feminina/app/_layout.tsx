import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="categoria/[id]" options={{ title: 'Categoria' }} />
        <Stack.Screen name="artigo/[id]" options={{ title: 'Artigo' }} />
        <Stack.Screen name="gerenciar-categorias" options={{ title: 'Gerenciar categorias' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
