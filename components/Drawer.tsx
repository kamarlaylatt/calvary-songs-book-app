import { router } from "expo-router";
import { View } from "react-native";
import { Drawer, Text, useTheme } from 'react-native-paper';

export default function DrawerComponent() {
    const theme = useTheme();
    return (
        <View style={{ backgroundColor: theme.colors.surface, flex: 1 }}>
            <Text variant="headlineMedium" style={{ marginVertical: 20 }}> Calvary Songs </Text>
            <Drawer.Item
                style={{ marginBottom: 20 }}
                icon="home"
                label="Home"
                onPress={() => router.push('/(app)/(drawer)')}
            />
            <Drawer.Item
                style={{ marginBottom: 20 }}
                icon="music"
                label="Songs"
                onPress={() => router.push('/(app)/(drawer)/songs')}
            />
            <Drawer.Item
                style={{ marginBottom: 20 }}
                icon="information"
                label="About"
                onPress={() => router.push('/(app)/(drawer)/about')}
            />
        </View>
    )
}