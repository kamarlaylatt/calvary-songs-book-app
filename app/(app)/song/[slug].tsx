import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { SongDetail, fetchSongBySlug } from '../../../services/api';

function SongDetailScreen() {
    const params = useLocalSearchParams<{ slug: string }>();
    const slug = typeof params.slug === 'string' ? params.slug : null;
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [song, setSong] = useState<SongDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create theme-aware styles
    const themedStyles = StyleSheet.create({
        ...styles,
        container: {
            ...styles.container,
            backgroundColor: theme.colors.background,
        },
        songWriter: {
            ...styles.songWriter,
            color: theme.colors.onSurfaceVariant,
        },
        description: {
            ...styles.description,
            color: theme.colors.onSurfaceVariant,
        },
        sectionTitle: {
            ...styles.sectionTitle,
            color: theme.colors.onSurface,
        },
        link: {
            ...styles.link,
            color: theme.colors.primary,
        },
        lyricsContainer: {
            ...styles.lyricsContainer,
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surfaceVariant,
        },
        errorText: {
            ...styles.errorText,
            color: theme.colors.error,
        },
        musicNotes: {
            ...styles.musicNotes,
            color: theme.colors.onSurfaceVariant,
        },
    });

    const loadSong = async (isRefresh = false) => {
        if (!slug) return; // Early return if slug is null
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const songData = await fetchSongBySlug(slug);
            setSong(songData);
        } catch (error: any) {
            console.error('Failed to load song:', error);
            setError(error.message || 'Failed to load song details');
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const onRefresh = () => {
        loadSong(true);
    };

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }
        loadSong();
    }, [slug]);

    if (loading) {
        return (
            <View style={themedStyles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!song) {
        return (
            <View style={themedStyles.container}>
                {error ? (
                    <View style={themedStyles.errorContainer}>
                        <Text style={themedStyles.errorText}>{error}</Text>
                        <Button
                            mode="contained"
                            onPress={() => loadSong()}
                            style={themedStyles.retryButton}
                        >
                            Retry
                        </Button>
                    </View>
                ) : (
                    <Text style={{ color: theme.colors.onSurface }}>Song not found</Text>
                )}
            </View>
        );
    }

    // RenderHtml styles configuration using theme colors
    const tagsStyles = {
        body: {
            whiteSpace: 'normal' as const,
            color: theme.colors.onSurfaceVariant,
            fontSize: 16,
            lineHeight: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        },
        p: {
            marginBottom: 16,
            textAlign: 'left' as const,
        },
        br: {
            marginBottom: 8,
        },
        div: {
            marginBottom: 12,
        },
        span: {
            color: theme.colors.onSurfaceVariant,
        },
        strong: {
            fontWeight: 'bold' as const,
            color: theme.colors.onSurface,
        },
        em: {
            fontStyle: 'italic' as const,
        },
        h1: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            marginBottom: 12,
            color: theme.colors.onSurface,
        },
        h2: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            marginBottom: 10,
            color: theme.colors.onSurface,
        },
        h3: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            marginBottom: 8,
            color: theme.colors.onSurface,
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
        <ScrollView
            style={themedStyles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    tintColor={theme.colors.primary}
                />
            }
        >
            <Card style={themedStyles.card}>
                <Card.Content>
                    <View style={themedStyles.header}>
                        <Text variant="headlineMedium" style={themedStyles.title}>
                            {song.title}
                        </Text>
                        {song.style?.name && (
                            <Chip
                                mode="outlined"
                                style={[themedStyles.styleChip, { backgroundColor: getStyleColor(song.style.name, theme) }]}
                                textStyle={{ color: '#fff' }}
                            >
                                {song.style.name}
                            </Chip>
                        )}
                    </View>

                    {song.song_writer && (
                        <Text variant="titleSmall" style={themedStyles.songWriter}>
                            By {song.song_writer}
                        </Text>
                    )}

                    {song.description && (
                        <Text variant="bodyMedium" style={themedStyles.description}>
                            {song.description}
                        </Text>
                    )}

                    {song.youtube && (
                        <View style={themedStyles.section}>
                            <Text variant="titleMedium" style={themedStyles.sectionTitle}>
                                YouTube Link
                            </Text>
                            <Text variant="bodyMedium" style={themedStyles.link}>
                                {song.youtube}
                            </Text>
                        </View>
                    )}

                    {song.categories.length > 0 && (
                        <View style={themedStyles.section}>
                            <Text variant="titleMedium" style={themedStyles.sectionTitle}>
                                Categories
                            </Text>
                            <View style={themedStyles.chipContainer}>
                                {song.categories.map(category => (
                                    <Chip
                                        key={category.id}
                                        mode="outlined"
                                        style={themedStyles.categoryChip}
                                    >
                                        {category.name}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {song.lyrics && (
                        <View style={themedStyles.section}>
                            <View style={themedStyles.lyricsContainer}>
                                <RenderHtml
                                    contentWidth={width - 64} // Account for card padding and container padding
                                    source={{ html: song.lyrics }}
                                    tagsStyles={tagsStyles}
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
                        <View style={themedStyles.section}>
                            <Text variant="titleMedium" style={themedStyles.sectionTitle}>
                                Music Notes
                            </Text>
                            <Text variant="bodyMedium" style={themedStyles.musicNotes}>
                                {song.music_notes}
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const getStyleColor = (style: string, theme: any) => {
    const colors: { [key: string]: string } = {
        'Hymn': theme.colors.tertiary,
        'Worship': theme.colors.primary,
        'Gospel': theme.colors.secondary,
        'Contemporary': theme.colors.error,
        'Traditional': theme.colors.outline,
    };
    return colors[style] || theme.colors.onSurfaceVariant;
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
        fontStyle: 'italic',
        marginBottom: 12,
    },
    description: {
        marginBottom: 16,
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    link: {
        textDecorationLine: 'underline',
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
        borderWidth: 1,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
    },
    musicNotes: {
        lineHeight: 24,
    },
});

export default SongDetailScreen;