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
                // initialRouteName="songs"
                drawerContent={DrawerComponent}
                screenOptions={{
                    headerStyle: { backgroundColor: theme.colors.primary, borderBottomColor: theme.colors.outline },
                    headerTintColor: theme.colors.onPrimary,
                }}
                screenLayout={customLayout}
            >
                {/* <Drawer.Screen
                    name="index"
                    options={{
                        title: "Home",
                    }}
                /> */}
                <Drawer.Screen
                    name="songs"
                    options={{
                        title: "Songs",
                    }}
                />
                <Drawer.Screen
                    name="about"
                    options={{
                        title: "About",
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
