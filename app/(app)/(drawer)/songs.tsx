import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import AdvancedSearchFilters from '../../../components/AdvancedSearchFilters';
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
    categories: Array<{ id: string; name: string }>;
    lyrics?: string;
    music_notes?: string;
}

const ITEMS_PER_PAGE = 15;

// Move getStyleColor outside component to avoid recreation on every render
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

const SongsList = React.memo(() => {
    const router = useRouter();
    const theme = useTheme();

    // Create theme-aware styles
    const themedStyles = StyleSheet.create({
        ...styles,
        description: {
            ...styles.description,
            color: theme.colors.onSurfaceVariant,
        },
        songWriter: {
            ...styles.songWriter,
            color: theme.colors.onSurfaceVariant,
        },
        indicatorText: {
            ...styles.indicatorText,
            color: theme.colors.onSurfaceVariant,
        },
        indicator: {
            ...styles.indicator,
            backgroundColor: theme.colors.surfaceVariant,
        },
        emptyText: {
            ...styles.emptyText,
            color: theme.colors.onSurfaceVariant,
        },
        emptySubtext: {
            ...styles.emptySubtext,
            color: theme.colors.onSurfaceVariant,
        },
    });
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [selectedStyleId, setSelectedStyleId] = useState<string | undefined>();
    const [debouncedCategoryId, setDebouncedCategoryId] = useState<string | undefined>();
    const [debouncedStyleId, setDebouncedStyleId] = useState<string | undefined>();
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCategoryId(selectedCategoryId);
            setDebouncedStyleId(selectedStyleId);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategoryId, selectedStyleId]);

    // Load songs when debounced search query or filters change
    useEffect(() => {
        loadSongs(1, false, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId);
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId]);

    useEffect(() => {
        // Defer initial load to improve screen transition performance
        const timer = setTimeout(() => {
            loadSongs();
        }, 50);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const loadSongs = async (
        page: number = 1,
        refresh: boolean = false,
        search?: string,
        categoryId?: string,
        styleId?: string
    ) => {
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

            // Add search parameter if provided
            if (search !== undefined) {
                if (search.trim()) {
                    params.search = search.trim();
                }
            } else if (debouncedSearchQuery.trim()) {
                params.search = debouncedSearchQuery.trim();
            }

            // Add filter parameters
            if (categoryId !== undefined) {
                if (categoryId) {
                    params.category_id = categoryId;
                }
            } else if (debouncedCategoryId) {
                params.category_id = debouncedCategoryId;
            }

            if (styleId !== undefined) {
                if (styleId) {
                    params.style_id = styleId;
                }
            } else if (debouncedStyleId) {
                params.style_id = debouncedStyleId;
            }

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
        loadSongs(1, true, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId);
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId]);

    const handleLoadMore = useCallback(() => {
        if (pagination.current_page < pagination.last_page && !loadingMore) {
            loadSongs(pagination.current_page + 1, false, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId);
        }
    }, [pagination, loadingMore, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const handleFiltersChange = useCallback((filters: { categoryId?: string; styleId?: string }) => {
        setSelectedCategoryId(filters.categoryId);
        setSelectedStyleId(filters.styleId);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedCategoryId(undefined);
        setSelectedStyleId(undefined);
        setFiltersExpanded(false);
    }, []);

    const handleToggleFiltersExpanded = useCallback(() => {
        setFiltersExpanded(prev => !prev);
    }, []);

    const renderSongItem = useCallback(({ item }: { item: Song }) => (
        <TouchableOpacity
            style={themedStyles.songItem}
            onPress={() => router.push(`/song/${item.slug}`)}
        >
            <Card style={themedStyles.card}>
                <Card.Content style={themedStyles.cardContent}>
                    {/* Header with title and style */}
                    <View style={themedStyles.songHeader}>
                        <View style={themedStyles.titleContainer}>
                            <Text variant="titleMedium" style={themedStyles.songTitle} numberOfLines={2}>
                                {item.title}
                            </Text>
                            {item.song_writer && (
                                <Text variant="bodySmall" style={themedStyles.songWriter}>
                                    {item.song_writer}
                                </Text>
                            )}
                        </View>
                        {item.style?.name && (
                            <Chip
                                mode="outlined"
                                compact
                                style={[themedStyles.styleChip, { backgroundColor: getStyleColor(item.style.name, theme) }]}
                                textStyle={themedStyles.chipText}
                            >
                                {item.style.name}
                            </Chip>
                        )}
                    </View>

                    {/* Description */}
                    {item.description && (
                        <Text variant="bodySmall" style={themedStyles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    {/* Categories - Show max 3, then +N more */}
                    {item.categories && item.categories.length > 0 && (
                        <View style={themedStyles.categoriesContainer}>
                            {item.categories.slice(0, 3).map((category) => (
                                <Chip
                                    key={`${item.id}-${category.id}`}
                                    mode="outlined"
                                    compact
                                    style={themedStyles.categoryChip}
                                    textStyle={themedStyles.categoryChipText}
                                >
                                    {category.name}
                                </Chip>
                            ))}
                            {item.categories.length > 3 && (
                                <Chip
                                    mode="outlined"
                                    compact
                                    style={themedStyles.categoryChip}
                                    textStyle={themedStyles.categoryChipText}
                                >
                                    +{item.categories.length - 3} more
                                </Chip>
                            )}
                        </View>
                    )}

                    {/* Footer with content indicators */}
                    <View style={themedStyles.songFooter}>
                        <View style={themedStyles.contentIndicators}>
                            {item.lyrics && (
                                <Chip
                                    mode="outlined"
                                    compact
                                    icon="text"
                                    style={themedStyles.contentChip}
                                    textStyle={themedStyles.contentChipText}
                                >
                                    Lyrics
                                </Chip>
                            )}
                            {item.music_notes && (
                                <Chip
                                    mode="outlined"
                                    compact
                                    icon="music-note"
                                    style={themedStyles.contentChip}
                                    textStyle={themedStyles.contentChipText}
                                >
                                    Notes
                                </Chip>
                            )}
                            {item.youtube && (
                                <Chip
                                    mode="outlined"
                                    compact
                                    icon="youtube"
                                    style={themedStyles.contentChip}
                                    textStyle={themedStyles.contentChipText}
                                >
                                    Video
                                </Chip>
                            )}
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    ), [router, themedStyles, theme]);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" />
            </View>
        );
    }, [loadingMore]);

    // Memoize the key extractor function
    const keyExtractor = useCallback((item: Song) => item.id, []);

    // Memoize FlatList props for better performance
    const flatListProps = useMemo(() => ({
        data: songs,
        renderItem: renderSongItem,
        keyExtractor,
        contentContainerStyle: themedStyles.listContainer,
        showsVerticalScrollIndicator: false,
        onRefresh: handleRefresh,
        refreshing: refreshing,
        onEndReached: handleLoadMore,
        onEndReachedThreshold: 0.5,
        ListFooterComponent: renderFooter,
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 50,
        initialNumToRender: 10,
        windowSize: 10,
    }), [songs, renderSongItem, keyExtractor, handleRefresh, refreshing, handleLoadMore, renderFooter, themedStyles]);

    return (
        <View style={themedStyles.container}>
            <View style={themedStyles.searchContainer}>
                <View style={themedStyles.searchRow}>
                    <Searchbar
                        placeholder="Search songs by title or lyrics..."
                        onChangeText={handleSearchChange}
                        value={searchQuery}
                        style={themedStyles.searchBar}
                        inputStyle={themedStyles.searchInput}
                        iconColor={theme.colors.primary}
                        clearIcon={searchQuery ? 'close' : undefined}
                        onClearIconPress={handleClearSearch}
                    />
                    <AdvancedSearchFilters
                        onFiltersChange={handleFiltersChange}
                        isExpanded={filtersExpanded}
                        onToggleExpanded={handleToggleFiltersExpanded}
                        selectedCategoryId={selectedCategoryId}
                        selectedStyleId={selectedStyleId}
                        onClearFilters={handleClearFilters}
                        inline={true}
                    />
                </View>
            </View>
            {songs.length > 0 ? (
                <FlatList {...flatListProps} />
            ) : (
                <View style={themedStyles.emptyState}>
                    <Text style={themedStyles.emptyText}>
                        {debouncedSearchQuery ? 'No songs found' : 'No songs available'}
                    </Text>
                    <Text style={themedStyles.emptySubtext}>
                        {loading ? 'Loading...' : debouncedSearchQuery ? 'Try a different search term' : 'Pull to refresh'}
                    </Text>
                </View>
            )}
        </View>
    );
});

SongsList.displayName = 'SongsList';

export default SongsList;

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
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        // backgroundColor: '#fff',
        borderBottomWidth: 1,
        // borderBottomColor: '#e0e0e0',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchBar: {
        flex: 1,
        elevation: 2,
        borderRadius: 8,
    },
    searchInput: {
        fontSize: 16,
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
        marginVertical: 6,
    },
    card: {
        elevation: 2,
        borderRadius: 12,
    },
    cardContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    songHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    songTitle: {
        fontWeight: '600',
        marginBottom: 2,
    },
    styleChip: {
        height: 32,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    description: {
        marginBottom: 8,
        lineHeight: 18,
        opacity: 0.8,
    },
    songWriter: {
        fontStyle: 'italic',
        fontSize: 12,
        opacity: 0.7,
    },
    songFooter: {
        marginTop: 8,
    },
    contentIndicators: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    indicator: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    indicatorText: {
        fontSize: 11,
        fontWeight: '500',
        opacity: 0.8,
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
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    fetchButtonDisabled: {
        backgroundColor: '#9cb3e0',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    chipText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 8,
    },
    categoryChip: {
        height: 28,
        borderRadius: 14,
        marginBottom: 2,
    },
    categoryChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    contentChip: {
        height: 30,
        borderRadius: 15,
        marginRight: 4,
    },
    contentChipText: {
        fontSize: 10,
        fontWeight: '500',
    },
});