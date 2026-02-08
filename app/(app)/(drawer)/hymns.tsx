import {
  fetchHymnFilters,
  fetchHymns,
  type Hymn,
  type HymnCategory,
} from "@/services/api";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import {
  Card,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme
} from "react-native-paper";
import { styles } from "../../../styles/songs.styles";
import { createThemedStyles } from "../../../styles/songs.themedStyles";
import { htmlToPlainText } from "../../../utils/html";

// Available categories for filtering - will be loaded from API
const HYMN_CATEGORIES_DEFAULT: HymnCategory[] = [];

const HymnsPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const themedStyles = createThemedStyles(theme);

  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [hymnCategories, setHymnCategories] = useState<HymnCategory[]>(
    HYMN_CATEGORIES_DEFAULT,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [debouncedCategory, setDebouncedCategory] = useState<
    string | undefined
  >();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Load hymn categories/filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filters = await fetchHymnFilters();
        setHymnCategories(filters.hymn_categories);
      } catch (error) {
        console.error("Error loading hymn filters:", error);
      }
    };
    loadFilters();
  }, []);

  // Load hymns
  const loadHymns = useCallback(
    async (page = 1, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: Record<string, string | number> = {
          limit: 20,
          page,
        };

        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery;
        }

        if (debouncedCategory) {
          params.hymn_category_id = debouncedCategory;
        }

        const response = await fetchHymns(params);

        if (page === 1) {
          setHymns(response.data);
        } else {
          setHymns((prev) => [...prev, ...response.data]);
        }

        setCurrentPage(response.current_page);
        setLastPage(response.last_page);
      } catch (error) {
        console.error("Error loading hymns:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearchQuery, debouncedCategory],
  );

  // Initial load
  useEffect(() => {
    loadHymns(1);
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (currentPage === 1 && !loading) {
      loadHymns(1);
    } else {
      setCurrentPage(1);
      setHymns([]);
      loadHymns(1);
    }
  }, [debouncedSearchQuery, debouncedCategory]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategory(selectedCategory);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory((prev) =>
      prev === categoryId ? undefined : categoryId,
    );
    setFiltersExpanded(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    await loadHymns(1, true);
  }, [loadHymns]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && currentPage < lastPage) {
      loadHymns(currentPage + 1);
    }
  }, [currentPage, lastPage, loadingMore, loadHymns]);

  const handleHymnPress = useCallback(
    (hymn: Hymn) => {
      router.push({
        pathname: "/hymn/[number]",
        params: {
          number: hymn.id.toString(),
          hymn: JSON.stringify(hymn),
        },
      });
    },
    [router],
  );

  const renderHymnItem = useCallback(
    ({ item }: { item: Hymn }) => (
      <View style={themedStyles.songItem}>
        <Card
          style={themedStyles.card}
          accessibilityLabel="Hymn"
          onPress={() => handleHymnPress(item)}
        >
          <Card.Content style={themedStyles.cardContent}>
            <View style={themedStyles.songHeader}>
              <View style={themedStyles.titleContainer}>
                <View style={themedStyles.titleRow}>
                  <Text
                    variant="titleMedium"
                    style={themedStyles.songTitle}
                    numberOfLines={2}
                  >
                    {item.song?.title}
                  </Text>
                </View>
                <Text style={themedStyles.songId} numberOfLines={1}>
                  No. {item.no}
                </Text>
              </View>
            </View>

            {item.song?.song_writer && (
              <View style={{ marginTop: 8 }}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  by {item.song.song_writer}
                </Text>
              </View>
            )}

            {item.hymn_category && (
              <View style={themedStyles.categoriesContainer}>
                <Chip
                  key={`${item.id}-category`}
                  mode="outlined"
                  compact
                  style={themedStyles.categoryChip}
                  textStyle={themedStyles.categoryChipText}
                >
                  {item.hymn_category.name}
                </Chip>
              </View>
            )}

            {item.song?.lyrics && (
              <View style={themedStyles.songFooter}>
                <Text style={themedStyles.description} numberOfLines={3}>
                  {(() => {
                    const plain = htmlToPlainText(item.song.lyrics);
                    const words = plain.split(/\s+/).filter(Boolean);
                    const sample = words.slice(0, 30).join(' ');
                    return words.length > 30 ? sample + '…' : sample;
                  })()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    ),
    [handleHymnPress, themedStyles, theme],
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: HymnCategory }) => (
      <Chip
        mode={selectedCategory === item.id ? "flat" : "outlined"}
        selected={selectedCategory === item.id}
        onPress={() => handleCategoryPress(item.id)}
        style={[
          themedStyles.categoryChip,
          selectedCategory === item.id && {
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
        textStyle={[
          themedStyles.categoryChipText,
          selectedCategory === item.id && {
            color: theme.colors.onPrimaryContainer,
          },
        ]}
        showSelectedOverlay={true}
      >
        {item.name}
      </Chip>
    ),
    [selectedCategory, handleCategoryPress, themedStyles, theme],
  );

  const keyExtractor = useCallback(
    (item: Hymn | HymnCategory) => String(item.id),
    [],
  );

  const categoryKeyExtractor = useCallback((item: HymnCategory) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [loadingMore]);

  const EmptyComponent = useMemo(
    () => (
      <View style={themedStyles.emptyState}>
        <Text style={themedStyles.emptyText}>
          {debouncedSearchQuery || debouncedCategory
            ? "No hymns found"
            : "No hymns available"}
        </Text>
        <Text style={themedStyles.emptySubtext}>
          {loading
            ? "Loading..."
            : debouncedSearchQuery || debouncedCategory
              ? "Try different filters"
              : "Pull to refresh"}
        </Text>
      </View>
    ),
    [themedStyles, debouncedSearchQuery, debouncedCategory, loading],
  );

  const hasActiveFilters = !!selectedCategory;

  const filterPanelStyles = useMemo(
    () =>
      StyleSheet.create({
        filterPanel: {
          backgroundColor: theme.colors.surfaceVariant,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        },
        filterPanelHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        },
        filterPanelTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.onSurface,
        },
        categoriesList: {
          paddingRight: 8,
        },
      }),
    [theme],
  );

  return (
    <View style={themedStyles.container}>
      {/* Search Bar with Filter Toggle */}
      <View style={themedStyles.searchContainer}>
        <View style={themedStyles.searchRow}>
          <Searchbar
            placeholder="Search by title or number..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={themedStyles.searchBar}
            inputStyle={themedStyles.searchInput}
            iconColor={theme.colors.primary}
            clearIcon={searchQuery ? "close" : undefined}
            onClearIconPress={handleClearSearch}
          />
          <IconButton
            icon="tune"
            size={24}
            onPress={() => setFiltersExpanded((prev) => !prev)}
            style={{
              margin: 0,
              borderRadius: 8,
              backgroundColor: hasActiveFilters
                ? theme.colors.primaryContainer
                : undefined,
            }}
            iconColor={
              hasActiveFilters
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
          />
        </View>
      </View>

      {/* Filter Panel */}
      {filtersExpanded && (
        <View style={filterPanelStyles.filterPanel}>
          <View style={filterPanelStyles.filterPanelHeader}>
            <Text style={filterPanelStyles.filterPanelTitle}>Categories</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setFiltersExpanded(false)}
              iconColor={theme.colors.onSurfaceVariant}
            />
          </View>
          <FlatList
            horizontal
            data={hymnCategories}
            renderItem={renderCategoryItem}
            keyExtractor={categoryKeyExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={filterPanelStyles.categoriesList}
            removeClippedSubviews={true}
          />
        </View>
      )}

      {/* Active Filters */}
      {hasActiveFilters && !filtersExpanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: theme.colors.surfaceVariant,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Text
              variant="labelMedium"
              style={{ fontWeight: "600", color: theme.colors.onSurface }}
            >
              Filter:
            </Text>
            {selectedCategory && (
              <Chip mode="flat" onClose={() => setSelectedCategory(undefined)}>
                {hymnCategories.find((c) => c.id === selectedCategory)?.name ||
                  "Category"}
              </Chip>
            )}
          </View>
        </View>
      )}

      {/* Hymns List */}
      <FlatList
        data={hymns}
        renderItem={renderHymnItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          themedStyles.listContainer,
          hymns.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={EmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
};

export default HymnsPage;
