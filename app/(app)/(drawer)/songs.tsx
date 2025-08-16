import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Divider, Searchbar, Text, useTheme } from 'react-native-paper';
import AdvancedSearchFilters from '../../../components/AdvancedSearchFilters';
import { fetchSongs, FetchSongsParams, PaginatedResponse } from '../../../services/api';
import { clearSongHistory, getSongHistory, initializeDatabase, removeSongFromHistory, SongHistoryItem } from '../../../services/songHistory';

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
    visited_at?: string;
    visit_count?: number;
}

const ITEMS_PER_PAGE = 15;

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
        titleRow: {
            ...styles.titleRow,
        },
        recentBadge: {
            ...styles.recentBadge,
            color: theme.colors.primary,
        },
        headerActions: {
            ...styles.headerActions,
        },
        deleteButton: {
            ...styles.deleteButton,
            backgroundColor: theme.colors.errorContainer,
        },
        deleteButtonText: {
            ...styles.deleteButtonText,
            color: theme.colors.onErrorContainer,
        },
        listHeaderTitle: {
            ...styles.listHeaderTitle,
            color: theme.colors.onSurfaceVariant,
        },
        clearHistoryButton: {
            ...styles.clearHistoryButton,
            backgroundColor: theme.colors.surfaceVariant,
        },
        clearHistoryButtonText: {
            ...styles.clearHistoryButtonText,
            color: theme.colors.primary,
        },
        recentMetaChip: {
            ...styles.recentMetaChip,
            backgroundColor: theme.colors.surfaceVariant,
        },
        recentMetaChipText: {
            ...styles.recentMetaChipText,
            color: theme.colors.onSurfaceVariant,
        },
        sectionDivider: {
            ...styles.sectionDivider,
            borderBottomColor: theme.colors.surfaceVariant,
        },
    });
    const [songs, setSongs] = useState<Song[]>([]);
    const [historySongs, setHistorySongs] = useState<Song[]>([]);
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

    const showHistoryHeader = useMemo(() => {
        return !debouncedSearchQuery && !debouncedCategoryId && !debouncedStyleId && historySongs.length > 0;
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, historySongs.length]);

    const formatRelativeTime = useCallback((isoDate?: string) => {
        if (!isoDate) return '';
        const now = Date.now();
        const then = new Date(isoDate).getTime();
        const seconds = Math.max(1, Math.floor((now - then) / 1000));
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 45) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'yesterday';
        return `${days}d ago`;
    }, []);

    // Convert simple HTML lyrics into plain text for preview
    const htmlToPlainText = useCallback((html?: string) => {
        if (!html) return '';
        try {
            const withLineBreaks = html
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<\/p>/gi, ' ')
                .replace(/<p[^>]*>/gi, ' ')
                .replace(/<\/li>/gi, ' ')
                .replace(/<li[^>]*>/gi, ' ');
            const withoutTags = withLineBreaks.replace(/<[^>]+>/g, ' ');
            const withoutEntities = withoutTags
                .replace(/&nbsp;/gi, ' ')
                .replace(/&/gi, '&')
                .replace(/"/gi, '"')
                .replace(/'/gi, "'")
                .replace(/</gi, '<')
                .replace(/>/gi, '>');
            return withoutEntities.replace(/\s+/g, ' ').trim();
        } catch {
            return (html || '').replace(/\s+/g, ' ').trim();
        }
    }, []);

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
        // Initialize database and load data
        const initializeAndLoad = async () => {
            try {
                await initializeDatabase();
                await loadHistory();
                // Defer initial load to improve screen transition performance
                setTimeout(() => {
                    loadSongs();
                }, 50);
            } catch (error) {
                console.error('Failed to initialize:', error);
                // Still load songs even if history fails
                setTimeout(() => {
                    loadSongs();
                }, 50);
            }
        };

        initializeAndLoad();
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

    const loadHistory = async () => {
        try {
            const historyItems = await getSongHistory(5); // Get last 5 viewed songs

            // Convert history items to Song format
            const historySongsData: Song[] = historyItems.map((item: SongHistoryItem) => ({
                id: item.id,
                slug: item.slug,
                title: item.title,
                song_writer: item.song_writer,
                description: item.description,
                style: { id: '', name: item.style_name || '' },
                categories: item.categories ? JSON.parse(item.categories) : [],
                lyrics: item.lyrics, // Stored in history
                music_notes: undefined, // Not stored in history
                youtube: undefined, // Not stored in history
                visited_at: item.visited_at,
                visit_count: item.visit_count,
            }));

            setHistorySongs(historySongsData);
        } catch (error) {
            console.error('Error loading song history:', error);
            setHistorySongs([]);
        }
    };

    const handleRefresh = useCallback(async () => {
        await loadHistory(); // Refresh history as well
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

    const handleDeleteFromHistory = useCallback(async (slug: string, event: any) => {
        event.stopPropagation(); // Prevent navigation when delete is pressed
        try {
            await removeSongFromHistory(slug);
            await loadHistory(); // Refresh history list
        } catch (error) {
            console.error('Error deleting song from history:', error);
        }
    }, []);

    const handleClearHistory = useCallback(async () => {
        try {
            await clearSongHistory();
            await loadHistory();
        } catch (error) {
            console.error('Error clearing song history:', error);
        }
    }, []);

    const renderSongItem = useCallback(({ item, index }: { item: Song; index: number }) => {
        const isFromHistory = index < historySongs.length && !debouncedSearchQuery && !debouncedCategoryId && !debouncedStyleId;

        return (
            <TouchableOpacity
                style={themedStyles.songItem}
                onPress={() => router.push(`/song/${item.slug}`)}
            >
                <Card style={[themedStyles.card, (isFromHistory ? styles.historyCard : null)]}
                    accessibilityLabel={isFromHistory ? 'Recently viewed song' : 'Song'}>
                    <Card.Content style={themedStyles.cardContent}>
                        {/* Header with title, style, and delete button for history items */}
                        <View style={themedStyles.songHeader}>
                            <View style={themedStyles.titleContainer}>
                                <View style={themedStyles.titleRow}>
                                    <Text variant="titleMedium" style={themedStyles.songTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    {/* Recent label replaced by meta chips below */}
                                </View>
                            </View>
                            <View style={themedStyles.headerActions}>
                                <View style={themedStyles.contentIndicators}>
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
                                {isFromHistory && (
                                    <TouchableOpacity
                                        style={themedStyles.deleteButton}
                                        onPress={(event) => handleDeleteFromHistory(item.slug, event)}
                                    >
                                        <Text style={themedStyles.deleteButtonText}>×</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

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
                            {item.lyrics || isFromHistory ? (
                                <Text style={themedStyles.description} numberOfLines={3}>
                                    {(() => {
                                        const plain = htmlToPlainText(item.lyrics);
                                        const words = plain.split(/\s+/).filter(Boolean);
                                        const sample = words.slice(0, 30).join(' ');
                                        return words.length > 30 ? sample + '…' : sample;
                                    })()}
                                </Text>
                            ) : null}
                        </View>


                    </Card.Content>
                </Card>
                {isFromHistory && index === historySongs.length - 1 && (
                    <View style={themedStyles.sectionDivider}>
                        <Divider />
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [router, themedStyles, theme, historySongs.length, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, handleDeleteFromHistory]);

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

    // Combine history and regular songs, removing duplicates
    const combinedSongs = useMemo(() => {
        if (debouncedSearchQuery || debouncedCategoryId || debouncedStyleId) {
            // If filtering, show only regular songs
            return songs;
        }

        // Create a Set of slugs from history to avoid duplicates
        const historyIds = new Set(historySongs.map(song => song.id));
        const filteredSongs = songs.filter(song => !historyIds.has(song.id));

        // Return history first, then regular songs
        return [...historySongs, ...filteredSongs];
    }, [songs, historySongs, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId]);

    const renderHistoryHeader = useCallback(() => (
        <View style={themedStyles.listHeader}>
            <View style={themedStyles.listHeaderRow}>
                <Text style={themedStyles.listHeaderTitle}>Recently viewed</Text>
                <TouchableOpacity onPress={handleClearHistory} style={themedStyles.clearHistoryButton}>
                    <Text style={themedStyles.clearHistoryButtonText}>Clear</Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [themedStyles, handleClearHistory]);

    // Memoize FlatList props for better performance
    const flatListProps = useMemo(() => ({
        data: combinedSongs,
        renderItem: renderSongItem,
        keyExtractor,
        contentContainerStyle: themedStyles.listContainer,
        showsVerticalScrollIndicator: false,
        onRefresh: handleRefresh,
        refreshing: refreshing,
        onEndReached: handleLoadMore,
        onEndReachedThreshold: 0.5,
        ListFooterComponent: renderFooter,
        ListHeaderComponent: showHistoryHeader ? renderHistoryHeader : undefined,
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 50,
        initialNumToRender: 10,
        windowSize: 10,
    }), [combinedSongs, renderSongItem, keyExtractor, handleRefresh, refreshing, handleLoadMore, renderFooter, themedStyles, showHistoryHeader, renderHistoryHeader]);

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
            {combinedSongs.length > 0 ? (
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
    listHeader: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
    },
    listHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    listHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearHistoryButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },
    clearHistoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
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
    recentMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    recentMetaChip: {
        height: 30,
        borderRadius: 12,
    },
    recentMetaChipText: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.9,
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    recentBadge: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    sectionDivider: {
        marginTop: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    historyCard: {
        // subtle elevation difference for recents
    },
});