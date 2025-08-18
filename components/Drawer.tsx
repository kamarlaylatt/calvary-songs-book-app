import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer, Text, useTheme } from 'react-native-paper';

export default function DrawerComponent() {
    const theme = useTheme();

    const styles = useMemo(
        () =>
            StyleSheet.create({
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
            }),
        [theme]
    );

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>
                Calvary Songs
            </Text>

            <Drawer.Item
                style={styles.drawerItem}
                icon="music"
                label="Songs"
                onPress={() => router.push('/(app)/(drawer)/songs')}
            />
            <Drawer.Item
                style={styles.drawerItem}
                icon="heart"
                label="Favorites"
                onPress={() => router.push('/(app)/(drawer)/favorites')}
            />
            <Drawer.Item
                style={styles.drawerItem}
                icon="information"
                label="About"
                onPress={() => router.push('/(app)/(drawer)/about')}
            />
            <Drawer.Item
                style={styles.drawerItem}
                icon="cog"
                label="Settings"
                onPress={() => router.push('/(app)/(drawer)/settings')}
            />
        </View>
    );
}