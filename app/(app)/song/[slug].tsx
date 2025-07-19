import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { getSongBySlug } from '../../../services/database';

interface SongDetail {
    id: string;
    title: string;
    slug: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: {
        id: string;
        name: string;
    };
    categories: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    lyrics?: string;
    music_notes?: string;
}

export default function SongDetailScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const theme = useTheme();
    const [song, setSong] = useState<SongDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSong = async () => {
            try {
                if (slug) {
                    const dbSong = await getSongBySlug(slug);
                    const songData = dbSong ? {
                        ...dbSong,
                        style: {
                            id: dbSong.style.toLowerCase(),
                            name: dbSong.style
                        },
                        categories: []
                    } : null;
                    setSong(songData);
                }
            } catch (error) {
                console.error('Error loading song:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSong();
    }, [slug]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!song) {
        return (
            <View style={styles.container}>
                <Text>Song not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <Text variant="headlineMedium" style={styles.title}>
                            {song.title}
                        </Text>
                        <Chip
                            mode="outlined"
                            style={[styles.styleChip, { backgroundColor: getStyleColor(song.style.name) }]}
                            textStyle={{ color: '#fff' }}
                        >
                            {song.style.name}
                        </Chip>
                    </View>

                    {song.song_writer && (
                        <Text variant="titleSmall" style={styles.songWriter}>
                            By {song.song_writer}
                        </Text>
                    )}

                    {song.description && (
                        <Text variant="bodyMedium" style={styles.description}>
                            {song.description}
                        </Text>
                    )}

                    {song.youtube && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                YouTube Link
                            </Text>
                            <Text variant="bodyMedium" style={styles.link}>
                                {song.youtube}
                            </Text>
                        </View>
                    )}

                    {song.categories.length > 0 && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Categories
                            </Text>
                            <View style={styles.chipContainer}>
                                {song.categories.map(category => (
                                    <Chip
                                        key={category.id}
                                        mode="outlined"
                                        style={styles.categoryChip}
                                    >
                                        {category.name}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {song.lyrics && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Lyrics
                            </Text>
                            <Text variant="bodyMedium" style={styles.lyrics}>
                                {song.lyrics}
                            </Text>
                        </View>
                    )}

                    {song.music_notes && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Music Notes
                            </Text>
                            <Text variant="bodyMedium" style={styles.musicNotes}>
                                {song.music_notes}
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
        'Hymn': '#8B4513',
        'Worship': '#4169E1',
        'Gospel': '#228B22',
        'Contemporary': '#FF6347',
        'Traditional': '#8B008B',
    };
    return colors[style] || '#6c757d';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        elevation: 2,
        borderRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        flex: 1,
        marginRight: 8,
    },
    styleChip: {
        height: 32,
        borderRadius: 16,
    },
    songWriter: {
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    description: {
        color: '#666',
        marginBottom: 16,
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
        color: '#333',
    },
    link: {
        color: '#4169E1',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        height: 32,
    },
    lyrics: {
        color: '#666',
        lineHeight: 24,
    },
    musicNotes: {
        color: '#666',
        lineHeight: 24,
    },
});