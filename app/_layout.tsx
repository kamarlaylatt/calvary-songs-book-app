import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
