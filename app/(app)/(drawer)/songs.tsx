import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { fetchSongs, FetchSongsParams, PaginatedResponse } from '../../../services/api';

// Song interface based on required fields
interface Song {
    id: string;
    slug: string;
    title: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: { id: string; name: string };
    lyrics?: string;
    music_notes?: string;
}

const ITEMS_PER_PAGE = 15;

export default function SongsList() {
    const router = useRouter();
    const theme = useTheme();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    useEffect(() => {
        loadSongs();
        // Load initial data with a small delay to allow screen transition
        // const timer = setTimeout(() => {
        //     loadSongs();
        // }, 100);

        return () => {
            // clearTimeout(timer);
            // setSongs([]); // Clear songs on unmount
        };
    }, []);

    const loadSongs = async (page: number = 1, refresh: boolean = false) => {
        if (page === 1 && !refresh) {
            setLoading(true);
        } else if (refresh) {
            setRefreshing(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params: FetchSongsParams = {
                limit: ITEMS_PER_PAGE,
                page: page
            };

            const response = await fetchSongs(params) as PaginatedResponse;

            if (page === 1 || refresh) {
                setSongs(response.data);
            } else {
                setSongs(prevSongs => [...prevSongs, ...response.data]);
            }

            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                total: response.total
            });

        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadSongs(1, true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (pagination.current_page < pagination.last_page && !loadingMore) {
            loadSongs(pagination.current_page + 1);
        }
    }, [pagination, loadingMore]);

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => router.push(`/song/${item.slug}`)}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.songHeader}>
                        <Text variant="titleLarge" style={styles.songTitle}>
                            {item.title}
                        </Text>
                        {item.style?.name && (
                            <Chip
                                mode="outlined"
                                style={[styles.styleChip, { backgroundColor: getStyleColor(item.style.name) }]}
                                textStyle={{ color: '#fff' }}
                            >
                                {item.style.name}
                            </Chip>
                        )}
                    </View>

                    {item.description && (
                        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    {item.song_writer && (
                        <Text variant="bodySmall" style={styles.songWriter}>
                            By {item.song_writer}
                        </Text>
                    )}

                    <View style={styles.songFooter}>
                        {item.youtube && (
                            <Chip
                                mode="outlined"
                                icon="youtube"
                                style={styles.youtubeChip}
                            >
                                Video
                            </Chip>
                        )}
                        {item.lyrics && (
                            <Chip
                                mode="outlined"
                                icon="text"
                                style={styles.lyricsChip}
                            >
                                Lyrics
                            </Chip>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

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

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {songs.length > 0 ? (
                <FlatList
                    data={songs}
                    renderItem={renderSongItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No songs available</Text>
                    <Text style={styles.emptySubtext}>
                        {loading ? 'Loading...' : 'Pull to refresh'}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fetchButton: {
        margin: 16,
        padding: 12,
        backgroundColor: '#4169E1',
        borderRadius: 8,
        alignItems: 'center',
    },
    fetchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        paddingVertical: 8,
    },
    songItem: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    card: {
        elevation: 2,
        borderRadius: 12,
    },
    songHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    songTitle: {
        flex: 1,
        marginRight: 8,
    },
    styleChip: {
        height: 28,
        borderRadius: 14,
    },
    description: {
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    songWriter: {
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    songFooter: {
        flexDirection: 'row',
        gap: 8,
    },
    youtubeChip: {
        height: 28
    },
    lyricsChip: {
        height: 28,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    fetchButtonDisabled: {
        backgroundColor: '#9cb3e0',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});