import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

export default function AboutScreen() {
    const theme = useTheme();

    const themedStyles = StyleSheet.create({
        ...styles,
        scrollView: {
            backgroundColor: theme.colors.background,
            flex: 1,
        },
        title: {
            ...styles.title,
            color: theme.colors.onSurface,
        },
        description: {
            ...styles.description,
            color: theme.colors.onSurfaceVariant,
        },
        featureItem: {
            ...styles.featureItem,
            color: theme.colors.onSurface,
        },
    });

    return (
        <ScrollView style={themedStyles.scrollView}>
            <View style={themedStyles.container}>
                <Card style={themedStyles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium" style={themedStyles.title}>
                            About Calvary Songs Book
                        </Text>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            This application is designed to help worship teams and congregations
                            access songs easily during services and personal devotion times.
                        </Text>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            Features include:
                        </Text>

                        <View style={themedStyles.featureList}>
                            <Text style={themedStyles.featureItem}>• Complete song lyrics</Text>
                            <Text style={themedStyles.featureItem}>• Chord charts and music notation</Text>
                            <Text style={themedStyles.featureItem}>• YouTube links for song references</Text>
                            <Text style={themedStyles.featureItem}>• Categorized by style and theme</Text>
                        </View>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            Version: 1.0.0
                        </Text>
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    description: {
        marginBottom: 12,
        lineHeight: 24,
    },
    featureList: {
        marginLeft: 16,
        marginBottom: 16,
    },
    featureItem: {
        marginBottom: 8,
    },
});