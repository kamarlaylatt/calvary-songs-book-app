import { UpdateDialog } from '@/components/UpdateDialog';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { Slot } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

function AppContent() {
    const { theme } = useThemeContext();
    const { needsUpdate, versionData, isChecking } = useVersionCheck();
    const [updateDialogVisible, setUpdateDialogVisible] = useState(false);

    useEffect(() => {
        if (needsUpdate && versionData && !isChecking) {
            setUpdateDialogVisible(true);
        }
    }, [needsUpdate, versionData, isChecking]);

    const handleUpdate = () => {
        if (versionData?.update_url) {
            Linking.openURL(versionData.update_url);
        }
        setUpdateDialogVisible(false);
    };

    const handleDismiss = () => {
        setUpdateDialogVisible(false);
    };

    return (
        <PaperProvider theme={theme}>
            <FavoritesProvider>
                <Slot />
                <UpdateDialog
                    visible={updateDialogVisible}
                    versionData={versionData}
                    onUpdate={handleUpdate}
                    onDismiss={handleDismiss}
                />
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
