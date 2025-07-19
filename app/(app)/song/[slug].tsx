import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { SongDetail, fetchSongBySlug } from '../../../services/api';
import { getSongBySlug } from '../../../services/database';

export default function SongDetailScreen() {
    const params = useLocalSearchParams<{ slug: string }>();
    const slug = typeof params.slug === 'string' ? params.slug : null;
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [song, setSong] = useState<SongDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const loadSong = async () => {
            try {
                setLoading(true);
                let songData = await getSongBySlug(slug);
                if (!songData) {
                    songData = await fetchSongBySlug(slug);
                }
                setSong(songData as SongDetail);
            } catch (error) {
                console.error('Failed to load song:', error);
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

    // RenderHtml styles configuration
    const tagsStyles = {
        body: {
            whiteSpace: 'normal',
            color: '#666',
            fontSize: 16,
            lineHeight: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        },
        p: {
            marginBottom: 16,
            textAlign: 'left',
        },
        br: {
            marginBottom: 8,
        },
        div: {
            marginBottom: 12,
        },
        span: {
            color: '#666',
        },
        strong: {
            fontWeight: 'bold',
            color: '#333',
        },
        em: {
            fontStyle: 'italic',
        },
        h1: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 12,
            color: '#333',
        },
        h2: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#333',
        },
        h3: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#333',
        },
    };

    const systemFonts = [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif'
    ];

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
                            <View style={styles.lyricsContainer}>
                                <RenderHtml
                                    contentWidth={width - 64} // Account for card padding and container padding
                                    source={{ html: song.lyrics }}
                                    tagsStyles={{
                                        body: {
                                            whiteSpace: 'normal',
                                            color: '#ffffff',
                                            fontSize: 16,
                                            lineHeight: 24,
                                            fontFamily: 'Roboto'
                                        },
                                        p: { marginBottom: 10, textAlign: 'left' },
                                        br: { marginBottom: 10 },
                                        div: { marginBottom: 10 },
                                        // Add other tag styles as needed
                                    }}
                                    systemFonts={['Roboto']}
                                    enableExperimentalMarginCollapsing={true}
                                    renderersProps={{
                                        img: {
                                            enableExperimentalPercentWidth: true,
                                        },
                                    }}
                                />
                            </View>
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
    lyricsContainer: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1
    },
    musicNotes: {
        color: '#666',
        lineHeight: 24,
    },
});