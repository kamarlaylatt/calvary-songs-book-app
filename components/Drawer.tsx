import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Drawer, Text, useTheme } from 'react-native-paper';

export default function DrawerComponent() {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            flex: 1,
            paddingTop: 20,
        },
        title: {
            marginVertical: 20,
            marginHorizontal: 16,
            color: theme.colors.onSurface,
            fontWeight: 'bold',
        },
        drawerItem: {
            marginBottom: 8,
            marginHorizontal: 12,
            borderRadius: 8,
        },
    });

    return (
        <View style={themedStyles.container}>
            <Text variant="headlineMedium" style={themedStyles.title}>
                Calvary Songs
            </Text>
            {/* <Drawer.Item
                style={themedStyles.drawerItem}
                icon="home"
                label="Home"
                onPress={() => router.push('/(app)/(drawer)')}
            /> */}
            <Drawer.Item
                style={themedStyles.drawerItem}
                icon="music"
                label="Songs"
                onPress={() => router.push('/(app)/(drawer)/songs')}
            />
            <Drawer.Item
                style={themedStyles.drawerItem}
                icon="heart"
                label="Favorites"
                onPress={() => router.push('/(app)/(drawer)/favorites')}
            />
            <Drawer.Item
                style={themedStyles.drawerItem}
                icon="information"
                label="About"
                onPress={() => router.push('/(app)/(drawer)/about')}
            />
            <Drawer.Item
                style={themedStyles.drawerItem}
                icon="cog"
                label="Settings"
                onPress={() => router.push('/(app)/(drawer)/settings')}
            />
        </View>
    )
}