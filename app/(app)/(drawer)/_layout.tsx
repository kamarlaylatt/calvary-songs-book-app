import DrawerComponent from "@/components/Drawer";
import { Drawer } from 'expo-router/drawer';
import { View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from "react-native-paper";

export default function Layout() {

    const customLayout = ({ children }: { children: React.ReactNode }) => {
        const theme = useTheme();
        return (
            <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
                {children}
            </View>
        )
    }

    const theme = useTheme();
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={DrawerComponent}
                screenOptions={{
                    headerStyle: { backgroundColor: theme.colors.onPrimary, borderBottomColor: theme.colors.onPrimary },
                    headerTintColor: theme.colors.onBackground,
                }}
                screenLayout={customLayout}
            >
                <Drawer.Screen
                    name="index"
                    options={{
                        title: "Home",
                    }}
                />
                <Drawer.Screen
                    name="songs"
                    options={{
                        title: "Song",
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
