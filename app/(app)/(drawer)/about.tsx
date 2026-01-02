import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
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
                        <Image source={require('../../../assets/images/calvary-logo.png')} style={themedStyles.logo} />

                        <Text variant="headlineMedium" style={themedStyles.title}>
                            About Calvary App
                        </Text>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            Calvary Songs Book is a curated collection of worship and gospel songs.
                            It’s designed to help you find songs quickly with easy search—perfect for
                            church services, small groups, and personal prayer times.
                        </Text>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            Features include:
                        </Text>

                        <View style={themedStyles.featureList}>
                            <Text style={themedStyles.featureItem}>• Fast, easy song search</Text>
                            <Text style={themedStyles.featureItem}>• Complete song lyrics</Text>
                            <Text style={themedStyles.featureItem}>• Organized by style and theme</Text>
                            <Text style={themedStyles.featureItem}>• Helpful links for song references</Text>
                        </View>

                        <Text variant="bodyMedium" style={themedStyles.description}>
                            We are actively developing this app—expect ongoing improvements and new features in future releases.
                        </Text>

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
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 16,
    },
});