import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { createThemedStyles } from "../../../styles/songs.themedStyles";
import { styles } from "../../../styles/songs.styles";

// Hymn interface
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

// Category filter
interface HymnCategory {
  id: string;
  name: string;
}

// Sample hymn data
const SAMPLE_HYMNS: Hymn[] = [
  {
    id: "1",
    number: 1,
    title: "Amazing Grace",
    author: "John Newton",
    key: "G",
    categories: ["Traditional", "Grace", "Salvation"],
    meter: "8.6.8.6",
    lyrics: `Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.`,
  },
  {
    id: "2",
    number: 2,
    title: "How Great Thou Art",
    author: "Carl Boberg",
    key: "Ab",
    categories: ["Praise", "Traditional", "Worship"],
    meter: "Common Meter",
    lyrics: `O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made.`,
  },
  {
    id: "3",
    number: 3,
    title: "It Is Well with My Soul",
    author: "Horatio Spafford",
    key: "Db",
    categories: ["Peace", "Trust", "Traditional"],
    meter: "11.10.11.10",
    lyrics: `When peace, like a river, attendeth my way.`,
  },
  {
    id: "4",
    number: 4,
    title: "Blessed Assurance",
    author: "Fanny Crosby",
    key: "G",
    categories: ["Assurance", "Traditional", "Testimony"],
    meter: "9.10.9.9",
    lyrics: `Blessed assurance, Jesus is mine!`,
  },
  {
    id: "5",
    number: 5,
    title: "Come Thou Fount",
    author: "Robert Robinson",
    key: "F",
    categories: ["Traditional", "Redemption", "Worship"],
    meter: "8.7.8.7.D",
    lyrics: `Come, Thou Fount of every blessing.`,
  },
  {
    id: "6",
    number: 6,
    title: "Holy, Holy, Holy",
    author: "Reginald Heber",
    key: "C",
    categories: ["Trinity", "Traditional", "Worship"],
    meter: "11.12.11.10",
    lyrics: `Holy, holy, holy! Lord God Almighty!`,
  },
  {
    id: "7",
    number: 7,
    title: "Be Thou My Vision",
    author: "Irish Traditional",
    key: "D",
    categories: ["Devotion", "Traditional", "Guidance"],
    meter: "10.11.11.11",
    lyrics: `Be Thou my Vision, O Lord of my heart.`,
  },
  {
    id: "8",
    number: 8,
    title: "Crown Him with Many Crowns",
    author: "Matthew Bridges",
    key: "G",
    categories: ["Coronation", "Traditional", "Praise"],
    meter: "10.10.10.10",
    lyrics: `Crown Him with many crowns.`,
  },
  {
    id: "9",
    number: 9,
    title: "A Mighty Fortress Is Our God",
    author: "Martin Luther",
    key: "Bb",
    categories: ["Protection", "Traditional", "Battle"],
    meter: "8.7.8.7.6.6.6.6",
    lyrics: `A mighty fortress is our God.`,
  },
  {
    id: "10",
    number: 10,
    title: "Great Is Thy Faithfulness",
    author: "Thomas Chisholm",
    key: "G",
    categories: ["Faithfulness", "Contemporary", "Praise"],
    meter: "11.11.11.11",
    lyrics: `Great is Thy faithfulness, O God my Father.`,
  },
  {
    id: "11",
    number: 11,
    title: "When I Survey the Wondrous Cross",
    author: "Isaac Watts",
    key: "E",
    categories: ["Cross", "Traditional", "Lent"],
    meter: "Long Meter",
    lyrics: `When I survey the wondrous cross.`,
  },
  {
    id: "12",
    number: 12,
    title: "Rock of Ages",
    author: "Augustus Toplady",
    key: "D",
    categories: ["Refuge", "Traditional", "Salvation"],
    meter: "7.7.7.7.7.7",
    lyrics: `Rock of Ages, cleft for me.`,
  },
  {
    id: "13",
    number: 13,
    title: "Just As I Am",
    author: "Charlotte Elliott",
    key: "C",
    categories: ["Invitation", "Traditional", "Salvation"],
    meter: "8.8.8.8",
    lyrics: `Just as I am, without one plea.`,
  },
  {
    id: "14",
    number: 14,
    title: "To God Be the Glory",
    author: "Fanny Crosby",
    key: "F",
    categories: ["Praise", "Traditional", "Victory"],
    meter: "11.11.11.11",
    lyrics: `To God be the glory, great things He hath done!`,
  },
  {
    id: "15",
    number: 15,
    title: "Standing on the Promises",
    author: "R. Kelso Carter",
    key: "Eb",
    categories: ["Faith", "Traditional", "Trust"],
    meter: "12.11.12.11",
    lyrics: `Standing on the promises of Christ my King.`,
  },
];

// Available categories for filtering
const HYMN_CATEGORIES: HymnCategory[] = [
  { id: "traditional", name: "Traditional" },
  { id: "contemporary", name: "Contemporary" },
  { id: "praise", name: "Praise" },
  { id: "worship", name: "Worship" },
  { id: "grace", name: "Grace" },
  { id: "peace", name: "Peace" },
  { id: "trust", name: "Trust" },
  { id: "salvation", name: "Salvation" },
  { id: "protection", name: "Protection" },
  { id: "devotion", name: "Devotion" },
  { id: "cross", name: "Cross" },
  { id: "testimony", name: "Testimony" },
  { id: "guidance", name: "Guidance" },
  { id: "invitation", name: "Invitation" },
  { id: "victory", name: "Victory" },
  { id: "faith", name: "Faith" },
  { id: "redemption", name: "Redemption" },
  { id: "trinity", name: "Trinity" },
  { id: "coronation", name: "Coronation" },
  { id: "refuge", name: "Refuge" },
  { id: "assurance", name: "Assurance" },
  { id: "battle", name: "Battle" },
  { id: "faithfulness", name: "Faithfulness" },
  { id: "lent", name: "Lent" },
];

const HymnsPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const themedStyles = createThemedStyles(theme);

  const [hymns, setHymns] = useState<Hymn[]>(SAMPLE_HYMNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [debouncedCategory, setDebouncedCategory] = useState<
    string | undefined
  >();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Filter hymns based on search and category
  const filteredHymns = useMemo(() => {
    return hymns.filter((hymn) => {
      const matchesSearch =
        !debouncedSearchQuery.trim() ||
        hymn.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        hymn.author
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        hymn.number.toString().includes(debouncedSearchQuery);

      const matchesCategory =
        !debouncedCategory ||
        hymn.categories.some(
          (cat) =>
            cat.toLowerCase() ===
            HYMN_CATEGORIES.find(
              (c) => c.id === debouncedCategory,
            )?.name.toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    });
  }, [hymns, debouncedSearchQuery, debouncedCategory]);

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

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(undefined);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleHymnPress = useCallback(
    (hymn: Hymn) => {
      router.push({
        pathname: "/hymn/[number]",
        params: { number: hymn.number.toString(), hymn: JSON.stringify(hymn) },
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
                    {item.title}
                  </Text>
                </View>
                <Text style={themedStyles.songId} numberOfLines={1}>
                  No. {item.number}
                </Text>
              </View>
              <View style={themedStyles.headerActions}>
                <View style={themedStyles.contentIndicators}>
                  {item.key && (
                    <Chip
                      mode="outlined"
                      compact
                      icon="music"
                      style={themedStyles.contentChip}
                      textStyle={themedStyles.contentChipText}
                    >
                      {item.key}
                    </Chip>
                  )}
                  {item.meter && (
                    <Chip
                      mode="outlined"
                      compact
                      icon="texture"
                      style={themedStyles.contentChip}
                      textStyle={themedStyles.contentChipText}
                    >
                      {item.meter}
                    </Chip>
                  )}
                </View>
              </View>
            </View>

            {item.author && (
              <View style={{ marginTop: 8 }}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  by {item.author}
                </Text>
              </View>
            )}

            {item.categories && item.categories.length > 0 && (
              <View style={themedStyles.categoriesContainer}>
                {item.categories.slice(0, 3).map((category, index) => (
                  <Chip
                    key={`${item.id}-${index}`}
                    mode="outlined"
                    compact
                    style={themedStyles.categoryChip}
                    textStyle={themedStyles.categoryChipText}
                  >
                    {category}
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
              <Text style={themedStyles.description} numberOfLines={3}>
                {item.lyrics}
              </Text>
            </View>
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

  const keyExtractor = useCallback((item: Hymn | HymnCategory) => item.id, []);

  const categoryKeyExtractor = useCallback((item: HymnCategory) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [loading]);

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
            <Chip
              mode="outlined"
              onPress={handleClearFilters}
              icon="close"
              compact
              disabled={!hasActiveFilters}
            >
              Clear
            </Chip>
          </View>
          <FlatList
            horizontal
            data={HYMN_CATEGORIES}
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
                {HYMN_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
                  "Category"}
              </Chip>
            )}
          </View>
        </View>
      )}

      {/* Hymns List */}
      <FlatList
        data={filteredHymns}
        renderItem={renderHymnItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          themedStyles.listContainer,
          filteredHymns.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
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
