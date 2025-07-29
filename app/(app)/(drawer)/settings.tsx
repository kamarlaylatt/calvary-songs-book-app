import { useThemeContext } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const theme = useTheme();
    const { isDarkMode, toggleTheme } = useThemeContext();

    const themedStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 16,
        },
        title: {
            marginBottom: 24,
            color: theme.colors.onBackground,
        },
        section: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            marginBottom: 16,
            overflow: 'hidden',
        },
        listItem: {
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        description: {
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
            marginTop: 4,
        },
    });

    return (
        <View style={themedStyles.container}>
            <Text variant="headlineMedium" style={themedStyles.title}>
                Settings
            </Text>

            <View style={themedStyles.section}>
                <List.Item
                    title="Dark Mode"
                    description="Switch between light and dark theme"
                    left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => (
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            color={theme.colors.primary}
                        />
                    )}
                    style={themedStyles.listItem}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={themedStyles.description}
                />
            </View>

            <View style={themedStyles.section}>
                <List.Item
                    title="About"
                    description="App version and information"
                    left={(props) => <List.Icon {...props} icon="information" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    style={themedStyles.listItem}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={themedStyles.description}
                    onPress={() => {
                        // Navigate to about page or show info
                        console.log('Navigate to about');
                    }}
                />
            </View>

            <View style={themedStyles.section}>
                <List.Item
                    title="App Version"
                    description="1.0.0"
                    left={(props) => <List.Icon {...props} icon="information-outline" />}
                    style={themedStyles.listItem}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={themedStyles.description}
                />
            </View>
        </View>
    );
}