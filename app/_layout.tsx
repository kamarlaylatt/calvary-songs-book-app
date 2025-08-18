import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

function AppContent() {
    const { theme } = useThemeContext();

    return (
        <PaperProvider theme={theme}>
            <FavoritesProvider>
                <Slot />
            </FavoritesProvider>
        </PaperProvider>
    );
}

export default function Root() {
    // Create a stable QueryClient for the lifetime of the app
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
