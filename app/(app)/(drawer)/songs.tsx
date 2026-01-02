import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Card, Chip, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import AdvancedSearchFilters from '../../../components/AdvancedSearchFilters';
import { fetchSongs, FetchSongsParams, PaginatedResponse } from '../../../services/api';
import { addSongToHistory, clearSongHistory, getSongHistory, initializeDatabase, removeSongFromHistory, SongHistoryItem } from '../../../services/songHistory';
import { styles } from '../../../styles/songs.styles';
import { createThemedStyles } from '../../../styles/songs.themedStyles';

import { htmlToPlainText } from '../../../utils/html';
// Song interface based on required fields
interface Song {
    id: string;
    code?: number | string;
    slug: string;
    title: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: { id: string; name: string };
    categories: Array<{ id: string; name: string }>;
    song_languages: Array<{ id: string; name: string }>;
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
    const themedStyles = createThemedStyles(theme);
    const [songs, setSongs] = useState<Song[]>([]);
    const [historySongs, setHistorySongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [selectedStyleId, setSelectedStyleId] = useState<string | undefined>();
    const [selectedLanguageId, setSelectedLanguageId] = useState<string | undefined>();
    const [debouncedCategoryId, setDebouncedCategoryId] = useState<string | undefined>();
    const [debouncedStyleId, setDebouncedStyleId] = useState<string | undefined>();
    const [debouncedLanguageId, setDebouncedLanguageId] = useState<string | undefined>();
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [activeTab, setActiveTab] = useState('all');

    const showHistoryHeader = useMemo(() => {
        return !debouncedSearchQuery && !debouncedCategoryId && !debouncedStyleId && !debouncedLanguageId && historySongs.length > 0;
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId, historySongs.length]);

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
            setDebouncedLanguageId(selectedLanguageId);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategoryId, selectedStyleId, selectedLanguageId]);

    // Load songs when debounced search query or filters change
    useEffect(() => {
        loadSongs(1, false, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId);
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId]);

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
        styleId?: string,
        languageId?: string
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

            if (languageId !== undefined) {
                if (languageId) {
                    params.song_language_id = languageId;
                }
            } else if (debouncedLanguageId) {
                params.song_language_id = debouncedLanguageId;
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
                song_languages: [], // Not stored in history
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

    // Refresh history when screen gains focus (regardless of which tab is active)
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const handleRefresh = useCallback(async () => {
        await loadHistory(); // Refresh history as well
        loadSongs(1, true, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId);
    }, [debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId]);

    const handleLoadMore = useCallback(() => {
        if (pagination.current_page < pagination.last_page && !loadingMore) {
            loadSongs(pagination.current_page + 1, false, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId);
        }
    }, [pagination, loadingMore, debouncedSearchQuery, debouncedCategoryId, debouncedStyleId, debouncedLanguageId]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const handleFiltersChange = useCallback((filters: { categoryId?: string; styleId?: string; languageId?: string }) => {
        setSelectedCategoryId(filters.categoryId);
        setSelectedStyleId(filters.styleId);
        setSelectedLanguageId(filters.languageId);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedCategoryId(undefined);
        setSelectedStyleId(undefined);
        setSelectedLanguageId(undefined);
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

    // Get songs for All Songs tab (show all songs, even if in recent)
    const allSongs = useMemo(() => {
        return songs;
    }, [songs]);

    // PagerView setup
    const pagerRef = useRef<PagerView>(null);
    const [index, setIndex] = useState(0);

    // Handle tab button press
    const handleTabPress = useCallback((tabIndex: number) => {
        setIndex(tabIndex);
        setActiveTab(tabIndex === 0 ? 'all' : 'recent');
        pagerRef.current?.setPage(tabIndex);
        if (tabIndex === 1) {
            loadHistory();
        }
    }, [loadHistory]);

    // Handle page change from swipe
    const handlePageSelected = useCallback((event: any) => {
        const newIndex = event.nativeEvent.position;
        setIndex(newIndex);
        setActiveTab(newIndex === 0 ? 'all' : 'recent');
        if (newIndex === 1) {
            loadHistory();
        }
    }, [loadHistory]);

    // Get the appropriate data based on tab index (more reliable than activeTab)
    const displayedSongs = useMemo(() => {
        return index === 1 ? historySongs : allSongs;
    }, [index, historySongs, allSongs]);

    const renderSongItem = useCallback(({ item, index: itemIndex }: { item: Song; index: number }) => {
        // Use activeTab for immediate response, fallback to index for consistency
        const isFromHistory = activeTab === 'recent' || index === 1;

        return (
            <View style={themedStyles.songItem}>
                <Card
                    style={[themedStyles.card, (isFromHistory ? styles.historyCard : null)]}
                    accessibilityLabel={isFromHistory ? 'Recently viewed song' : 'Song'}
                    onPress={() => router.push({
                        pathname: '/song/[slug]',
                        params: { slug: item.slug, song: JSON.stringify(item) }
                    })}
                >
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
                                    {item.code !== undefined && (
                                        <Text style={themedStyles.songId} numberOfLines={1}>
                                            Code: {item.code}
                                        </Text>
                                    )}
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
            </View>
        );
    }, [router, themedStyles, theme, handleDeleteFromHistory, index]);

    // Render custom tab bar
    const renderTabBar = useCallback(() => (
        <View style={themedStyles.customTabBar}>
            <TouchableOpacity
                style={[
                    themedStyles.tabButton,
                    index === 0 && themedStyles.activeTabButton
                ]}
                onPress={() => handleTabPress(0)}
            >
                <Text style={[
                    themedStyles.tabButtonText,
                    index === 0 && themedStyles.activeTabButtonText
                ]}>
                    All Songs
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    themedStyles.tabButton,
                    index === 1 && themedStyles.activeTabButton
                ]}
                onPress={() => handleTabPress(1)}
            >
                <Text style={[
                    themedStyles.tabButtonText,
                    index === 1 && themedStyles.activeTabButtonText
                ]}>
                    Recent ({historySongs.length})
                </Text>
            </TouchableOpacity>
        </View>
    ), [index, historySongs.length, themedStyles, handleTabPress]);

    // Clear history header for recent tab
    const renderRecentHeader = useCallback(() => (
        <View style={themedStyles.recentHeader}>
            <TouchableOpacity onPress={handleClearHistory} style={themedStyles.clearAllButton}>
                <Text style={themedStyles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>
        </View>
    ), [themedStyles, handleClearHistory]);

    const handleSongPress = useCallback(async (song: Song) => {
        try {
            await addSongToHistory(song);
            // Pass full song data to avoid API call in detail page
            router.push({
                pathname: '/song/[slug]',
                params: { 
                    slug: song.slug,
                    song: JSON.stringify(song)
                }
            });
        } catch (error) {
            console.error('Error adding song to history:', error);
            // Navigate anyway even if history fails
            router.push({
                pathname: '/song/[slug]',
                params: { 
                    slug: song.slug,
                    song: JSON.stringify(song)
                }
            });
        }
    }, [router]);

    // Render item for All Songs (no delete button)
    const renderAllSongsItem = useCallback(({ item }: { item: Song }) => (
        <View style={themedStyles.songItem}>
            <Card
                style={themedStyles.card}
                accessibilityLabel="Song"
                onPress={() => handleSongPress(item)}
            >
                <Card.Content style={themedStyles.cardContent}>
                    <View style={themedStyles.songHeader}>
                        <View style={themedStyles.titleContainer}>
                            <View style={themedStyles.titleRow}>
                                <Text variant="titleMedium" style={themedStyles.songTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                            </View>                
                                {item.code !== undefined && (
                                    <Text style={themedStyles.songId} numberOfLines={1}>
                                        Code: {item.code}
                                    </Text>
                                )}
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
                        </View>
                    </View>

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

                    <View style={themedStyles.songFooter}>
                        {item.lyrics && (
                            <Text style={themedStyles.description} numberOfLines={3}>
                                {(() => {
                                    const plain = htmlToPlainText(item.lyrics);
                                    const words = plain.split(/\s+/).filter(Boolean);
                                    const sample = words.slice(0, 30).join(' ');
                                    return words.length > 30 ? sample + '…' : sample;
                                })()}
                            </Text>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </View>
    ), [handleSongPress, themedStyles]);

    // Render item for Recent Songs (with delete button)
    const renderRecentSongsItem = useCallback(({ item }: { item: Song }) => (
        <View style={themedStyles.songItem}>
            <Card
                style={[themedStyles.card, styles.historyCard]}
                accessibilityLabel="Recently viewed song"
                onPress={() => handleSongPress(item)}
            >
                <Card.Content style={themedStyles.cardContent}>
                    <View style={themedStyles.songHeader}>
                        <View style={themedStyles.titleContainer}>
                            <View style={themedStyles.titleRow}>
                                <Text variant="titleMedium" style={themedStyles.songTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                            </View>
                                {item.code !== undefined && (
                                    <Text style={themedStyles.songId} numberOfLines={1}>
                                        Code: {item.code}
                                    </Text>
                                )}
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
                            <TouchableOpacity
                                style={themedStyles.deleteButton}
                                onPress={(event) => handleDeleteFromHistory(item.slug, event)}
                            >
                                <Text style={themedStyles.deleteButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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

                    <View style={themedStyles.songFooter}>
                        {item.lyrics && (
                            <Text style={themedStyles.description} numberOfLines={3}>
                                {(() => {
                                    const plain = htmlToPlainText(item.lyrics);
                                    const words = plain.split(/\s+/).filter(Boolean);
                                    const sample = words.slice(0, 30).join(' ');
                                    return words.length > 30 ? sample + '…' : sample;
                                })()}
                            </Text>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </View>
    ), [handleSongPress, themedStyles, handleDeleteFromHistory]);

    // Memoized empty components to prevent unnecessary re-renders
    const AllSongsEmptyComponent = useMemo(() => (
        <View style={themedStyles.emptyState}>
            <Text style={themedStyles.emptyText}>
                {debouncedSearchQuery ? 'No songs found' : 'No songs available'}
            </Text>
            <Text style={themedStyles.emptySubtext}>
                {loading ? 'Loading...' : debouncedSearchQuery ? 'Try a different search term' : 'Pull to refresh'}
            </Text>
        </View>
    ), [themedStyles, debouncedSearchQuery, loading]);

    const RecentSongsEmptyComponent = useMemo(() => (
        <View style={themedStyles.emptyState}>
            <Text style={themedStyles.emptyText}>No recently viewed songs</Text>
            <Text style={themedStyles.emptySubtext}>Songs you view will appear here</Text>
        </View>
    ), [themedStyles]);

    return (
        <View style={themedStyles.container}>
            <View style={themedStyles.searchContainer}>
                <View style={themedStyles.searchRow}>
                    <Searchbar
                        placeholder="Search by title, lyrics, or ID..."
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
                        selectedLanguageId={selectedLanguageId}
                        onClearFilters={handleClearFilters}
                        inline={true}
                    />
                </View>
            </View>

            {renderTabBar()}

            <PagerView
                ref={pagerRef}
                style={themedStyles.pagerView}
                initialPage={0}
                onPageSelected={handlePageSelected}
            >
                {/* All Songs Tab */}
                <View style={themedStyles.pageContainer}>
                    <FlatList
                        data={allSongs}
                        renderItem={renderAllSongsItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={themedStyles.listContainer}
                        showsVerticalScrollIndicator={false}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={10}
                        windowSize={10}
                        ListEmptyComponent={AllSongsEmptyComponent}
                    />
                </View>

                {/* Recent Songs Tab */}
                <View style={themedStyles.pageContainer}>
                    <FlatList
                        data={historySongs}
                        renderItem={renderRecentSongsItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={themedStyles.listContainer}
                        showsVerticalScrollIndicator={false}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        ListHeaderComponent={historySongs.length > 0 ? renderRecentHeader : undefined}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={10}
                        windowSize={10}
                        ListEmptyComponent={RecentSongsEmptyComponent}
                    />
                </View>
            </PagerView>

            <FAB
                icon="plus"
                color={theme.colors.onSecondary}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 30,
                    bottom: 40,
                    backgroundColor: theme.colors.primary,
                }}
                onPress={() => router.push('/suggest-song')}
                label=""
            />
        </View>
    );
});

SongsList.displayName = 'SongsList';

export default SongsList;
