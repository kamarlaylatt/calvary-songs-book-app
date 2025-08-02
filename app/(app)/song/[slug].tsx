import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
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
        lyricsContainer: {
            ...styles.lyricsContainer,
            // backgroundColor: theme.colors.surfaceVariant,
        },
        notesContainer: {
            ...styles.notesContainer,
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
        codeChip: {
            ...styles.codeChip,
            backgroundColor: theme.colors.primaryContainer,
        },
        codeText: {
            ...styles.codeText,
            color: theme.colors.onPrimaryContainer,
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

    const handleYouTubePress = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open YouTube link');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open YouTube link');
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
            showsVerticalScrollIndicator={false}
        >
            {/* Header Card */}
            <Card style={themedStyles.headerCard} elevation={3}>
                <Card.Content style={themedStyles.headerContent}>
                    <View style={themedStyles.titleSection}>
                        <Text variant="headlineMedium" style={themedStyles.title}>
                            {song.title}
                        </Text>
                        {song.code && (
                            <Surface style={themedStyles.codeChip} elevation={1}>
                                <Text variant="labelMedium" style={themedStyles.codeText}>
                                    #{song.code}
                                </Text>
                            </Surface>
                        )}
                    </View>

                    {song.song_writer && (
                        <View style={themedStyles.writerSection}>
                            <Text variant="titleMedium" style={themedStyles.songWriter}>
                                {song.song_writer}
                            </Text>
                        </View>
                    )}

                    {song.description && (
                        <Text variant="bodyLarge" style={themedStyles.description}>
                            {song.description}
                        </Text>
                    )}



                    <View style={themedStyles.metaSection}>
                        {song.style?.name && (
                            <Chip
                                mode="flat"
                                style={[themedStyles.styleChip]}
                                textStyle={themedStyles.styleChipText}
                                icon="music"
                            >
                                <Text>{song.style.name}</Text>
                            </Chip>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* Categories Card */}
            {song.categories.length > 0 && (
                <Card style={themedStyles.sectionCard} elevation={2}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Categories
                            </Text>
                        </View>
                        <View style={themedStyles.chipContainer}>
                            {song.categories.map(category => (
                                <Chip
                                    key={category.id}
                                    mode="outlined"
                                    style={themedStyles.categoryChip}
                                    icon="tag"
                                >
                                    {category.name}
                                </Chip>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* YouTube Card */}
            {song.youtube && (
                <Card style={themedStyles.sectionCard} elevation={2}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Watch on YouTube
                            </Text>
                            <IconButton
                                icon="play-circle"
                                iconColor={theme.colors.primary}
                                size={24}
                                onPress={() => handleYouTubePress(song.youtube!)}
                            />
                        </View>
                        <Button
                            mode="contained-tonal"
                            onPress={() => handleYouTubePress(song.youtube!)}
                            icon="youtube"
                            style={themedStyles.youtubeButton}
                            contentStyle={themedStyles.youtubeButtonContent}
                        >
                            Open in YouTube
                        </Button>
                    </Card.Content>
                </Card>
            )}

            {/* Lyrics Card */}
            {song.lyrics && (
                <Card style={themedStyles.sectionCard} elevation={2}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Lyrics
                            </Text>
                        </View>
                        <Divider style={themedStyles.divider} />
                        {/* <Surface style={themedStyles.lyricsContainer} elevation={1}> */}
                        <RenderHtml
                            contentWidth={width - 80} // Account for card padding and container padding
                            source={{ html: song.lyrics }}
                            tagsStyles={tagsStyles}
                            systemFonts={systemFonts}
                            enableExperimentalMarginCollapsing={true}
                            renderersProps={{
                                img: {
                                    enableExperimentalPercentWidth: true,
                                },
                            }}
                        />
                        {/* </Surface> */}
                    </Card.Content>
                </Card>
            )}

            {/* Music Notes Card */}
            {song.music_notes && (
                <Card style={themedStyles.sectionCard} elevation={2}>
                    <Card.Content>
                        <View style={themedStyles.sectionHeader}>
                            <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                                Music Notes
                            </Text>
                        </View>
                        <Divider style={themedStyles.divider} />
                        <Surface style={themedStyles.notesContainer} elevation={1}>
                            <Text variant="bodyLarge" style={themedStyles.musicNotes}>
                                {song.music_notes}
                            </Text>
                        </Surface>
                    </Card.Content>
                </Card>
            )}

            {/* Bottom spacing */}
            <View style={themedStyles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        borderRadius: 16,
        marginBottom: 16,
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
    },
    codeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    codeText: {
        fontWeight: '600',
    },
    writerSection: {
        marginBottom: 16,
    },
    songWriter: {
        fontStyle: 'italic',
        fontWeight: '500',
    },
    description: {
        marginBottom: 20,
        lineHeight: 26,
    },
    metaSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    styleChip: {
        height: 36,
        borderRadius: 18,
    },
    styleChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionCard: {
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontWeight: '600',
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
    youtubeButton: {
        marginTop: 8,
    },
    youtubeButtonContent: {
        paddingVertical: 8,
    },
    lyricsContainer: {
        padding: 20,
        borderRadius: 12,
        marginTop: 4,
    },
    notesContainer: {
        padding: 20,
        borderRadius: 12,
        marginTop: 4,
    },
    musicNotes: {
        lineHeight: 28,
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
    bottomSpacing: {
        height: 20,
    },
});

export default SongDetailScreen;