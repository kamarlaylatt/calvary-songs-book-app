import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { useFavorites } from '../../../contexts/FavoritesContext';

interface Hymn {
    id: string;
    number: number;
    title: string;
    author?: string;
    key?: string;
    categories: string[];
    lyrics: string;
    meter?: string;
}

function HymnDetailScreen() {
    const { favoriteStatus, toggleFavorite, checkFavoriteStatus } = useFavorites();
    const params = useLocalSearchParams<{ number: string; hymn?: string }>();
    const router = useRouter();

    const hymnNumber = typeof params.number === 'string' ? params.number : null;
    const passedHymn = params.hymn ? JSON.parse(params.hymn) : null;

    const theme = useTheme();
    const [hymn] = useState<Hymn | null>(passedHymn);

    // Create theme-aware styles
    const themedStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        headerCard: {
            borderRadius: 16,
            margin: 16,
            marginBottom: 16,
            elevation: 3,
        },
        headerContent: {
            paddingVertical: 20,
        },
        titleSection: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        title: {
            flex: 1,
            marginRight: 12,
            fontWeight: '700',
            color: theme.colors.onSurface,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        numberChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: theme.colors.primaryContainer,
            alignSelf: 'flex-start',
            elevation: 1,
        },
        numberText: {
            fontWeight: '600',
            color: theme.colors.onPrimaryContainer,
        },
        authorSection: {
            marginBottom: 16,
        },
        author: {
            fontStyle: 'italic',
            fontWeight: '500',
            color: theme.colors.onSurfaceVariant,
        },
        metaInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
        },
        metaChip: {
            height: 32,
            borderRadius: 16,
        },
        sectionCard: {
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            elevation: 2,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        sectionTitle: {
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        divider: {
            marginBottom: 16,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 4,
        },
        categoryChip: {
            height: 36,
            borderRadius: 18,
        },
        lyricsContainer: {
            padding: 20,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
            marginTop: 4,
        },
        lyricsText: {
            fontSize: 16,
            lineHeight: 28,
            color: theme.colors.onSurface,
            textAlign: 'center',
        },
        verse: {
            marginBottom: 24,
        },
        verseNumber: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.primary,
            marginBottom: 8,
            textAlign: 'center',
        },
        chorus: {
            marginTop: 16,
            fontStyle: 'italic',
            color: theme.colors.primary,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        emptyText: {
            fontSize: 18,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
        },
        backButton: {
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
        },
    });

    const formatLyrics = (lyrics: string) => {
        const lines = lyrics.split('\n').filter(line => line.trim());
        const sections: Array<{ type: 'verse' | 'chorus'; content: string }> = [];
        let currentSection: string[] = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();

            // Detect chorus (often in parentheses or specific indicators)
            if (trimmedLine.includes('chorus') || trimmedLine.includes('Chorus') || trimmedLine.match(/^\[.*\]$/)) {
                if (currentSection.length > 0) {
                    sections.push({ type: 'verse', content: currentSection.join('\n') });
                    currentSection = [];
                }
            }

            currentSection.push(trimmedLine);
        });

        if (currentSection.length > 0) {
            sections.push({ type: 'verse', content: currentSection.join('\n') });
        }

        return sections;
    };

    // Check favorite status on mount
    React.useEffect(() => {
        if (hymn) {
            checkFavoriteStatus(`hymn-${hymn.number}`);
        }
    }, [hymn]);

    if (!hymn) {
        return (
            <View style={themedStyles.emptyContainer}>
                <Text style={themedStyles.emptyText}>Hymn not found</Text>
            </View>
        );
    }

    const isFavorite = favoriteStatus[`hymn-${hymn.number}`] || false;
    const lyricsSections = formatLyrics(hymn.lyrics);

    return (
        <ScrollView
            style={themedStyles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Card */}
            <Card style={themedStyles.headerCard}>
                <Card.Content style={themedStyles.headerContent}>
                    <View style={themedStyles.titleSection}>
                        <Text variant="headlineMedium" style={themedStyles.title}>
                            {hymn.title}
                        </Text>
                        <View style={themedStyles.headerActions}>
                            <IconButton
                                icon={isFavorite ? "heart" : "heart-outline"}
                                iconColor={isFavorite ? theme.colors.error : theme.colors.onSurface}
                                size={24}
                                onPress={() => toggleFavorite({ id: `hymn-${hymn.number}`, slug: `hymn-${hymn.number}`, title: hymn.title })}
                            />
                            <Surface style={themedStyles.numberChip} elevation={1}>
                                <Text variant="labelMedium" style={themedStyles.numberText}>
                                    #{hymn.number}
                                </Text>
                            </Surface>
                        </View>
                    </View>

                    {hymn.author && (
                        <View style={themedStyles.authorSection}>
                            <Text variant="titleMedium" style={themedStyles.author}>
                                by {hymn.author}
                            </Text>
                        </View>
                    )}

                    <View style={themedStyles.metaInfo}>
                        {hymn.key && (
                            <Chip
                                mode="flat"
                                style={themedStyles.metaChip}
                                icon="music"
                                textStyle={{ color: theme.colors.primary }}
                            >
                                Key: {hymn.key}
                            </Chip>
                        )}
                        {hymn.meter && (
                            <Chip
                                mode="outlined"
                                style={themedStyles.metaChip}
                                icon="texture"
                            >
                                {hymn.meter}
                            </Chip>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* Categories Card */}
            {hymn.categories && hymn.categories.length > 0 && (
                <Card style={themedStyles.sectionCard}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Categories
                            </Text>
                        </View>
                        <View style={themedStyles.chipContainer}>
                            {hymn.categories.map((category, index) => (
                                <Chip
                                    key={`${hymn.id}-${index}`}
                                    mode="outlined"
                                    style={themedStyles.categoryChip}
                                    icon="tag"
                                >
                                    {category}
                                </Chip>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Lyrics Card */}
            {hymn.lyrics && (
                <Card style={themedStyles.sectionCard}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Lyrics
                            </Text>
                        </View>
                        <Divider style={themedStyles.divider} />
                        <View style={themedStyles.lyricsContainer}>
                            {lyricsSections.map((section, index) => (
                                <View key={index} style={themedStyles.verse}>
                                    {section.type === 'chorus' && (
                                        <Text style={themedStyles.chorus}>
                                            {section.content}
                                        </Text>
                                    )}
                                    {section.type === 'verse' && (
                                        <Text style={themedStyles.lyricsText}>
                                            {section.content}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

export default HymnDetailScreen;
