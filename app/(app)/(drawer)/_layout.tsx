import DrawerComponent from "@/components/Drawer";
import { Drawer } from 'expo-router/drawer';
import { View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from "react-native-paper";

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
    const theme = useTheme();
    return (
        <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            {children}
        </View>
    )
}

export default function Layout() {
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
                screenLayout={CustomLayout}
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
                    name="favorites"
                    options={{
                        title: "Favorites",
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
