import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

export default function AboutScreen() {
    const theme = useTheme();

    return (
        <ScrollView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium" style={styles.title}>
                            About Calvary Songs Book
                        </Text>

                        <Text variant="bodyMedium" style={styles.description}>
                            This application is designed to help worship teams and congregations
                            access songs easily during services and personal devotion times.
                        </Text>

                        <Text variant="bodyMedium" style={styles.description}>
                            Features include:
                        </Text>

                        <View style={styles.featureList}>
                            <Text style={styles.featureItem}>• Complete song lyrics</Text>
                            <Text style={styles.featureItem}>• Chord charts and music notation</Text>
                            <Text style={styles.featureItem}>• YouTube links for song references</Text>
                            <Text style={styles.featureItem}>• Categorized by style and theme</Text>
                        </View>

                        <Text variant="bodyMedium" style={styles.description}>
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