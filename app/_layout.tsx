import theme from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from 'react-native-paper';

export default function Root() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
                <PaperProvider theme={theme}>
                    <Slot />
                </PaperProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
