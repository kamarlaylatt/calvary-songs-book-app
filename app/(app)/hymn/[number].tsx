import { fetchHymnById, type HymnDetail } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
    Card,
    Chip,
    Divider,
    IconButton,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import { useFavorites } from "../../../contexts/FavoritesContext";

function HymnDetailScreen() {
  const { favoriteStatus, toggleFavorite, checkFavoriteStatus } =
    useFavorites();
  const params = useLocalSearchParams<{ number: string }>();
  const router = useRouter();

  const hymnId = typeof params.number === "string" ? params.number : null;
  const [hymn, setHymn] = useState<HymnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  // Load hymn data from API
  useEffect(() => {
    const loadHymn = async () => {
      if (!hymnId) {
        setError("Invalid hymn ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchHymnById(hymnId);
        setHymn(data);
        // Check favorite status after loading hymn (use song slug for favorites)
        checkFavoriteStatus(data.song.slug);
      } catch (err) {
        console.error("Error loading hymn:", err);
        setError("Failed to load hymn. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadHymn();
  }, [hymnId]);

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerCard: {
      borderRadius: 16,
      margin: 16,
      marginBottom: 16,
      elevation: 3,
    },
    headerContent: {
      paddingVertical: 20,
    },
    titleSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      flex: 1,
      marginRight: 12,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    numberChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      alignSelf: "flex-start",
      elevation: 1,
    },
    numberText: {
      fontWeight: "600",
      color: theme.colors.onPrimaryContainer,
    },
    authorSection: {
      marginBottom: 16,
    },
    author: {
      fontStyle: "italic",
      fontWeight: "500",
      color: theme.colors.onSurfaceVariant,
    },
    metaInfo: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    metaChip: {
      height: 32,
      borderRadius: 16,
    },
    sectionCard: {
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    divider: {
      marginBottom: 16,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    categoryChip: {
      height: 36,
      borderRadius: 18,
    },
    lyricsContainer: {
      padding: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      marginTop: 4,
    },
    lyricsText: {
      fontSize: 16,
      lineHeight: 28,
      color: theme.colors.onSurface,
      textAlign: "center",
    },
    verse: {
      marginBottom: 24,
    },
    verseNumber: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    chorus: {
      marginTop: 16,
      fontStyle: "italic",
      color: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const formatLyrics = (lyrics: string) => {
    const lines = lyrics.split("\n").filter((line) => line.trim());
    const sections: Array<{ type: "verse" | "chorus"; content: string }> = [];
    let currentSection: string[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Detect chorus (often in parentheses or specific indicators)
      if (
        trimmedLine.includes("chorus") ||
        trimmedLine.includes("Chorus") ||
        trimmedLine.match(/^\[.*\]$/)
      ) {
        if (currentSection.length > 0) {
          sections.push({ type: "verse", content: currentSection.join("\n") });
          currentSection = [];
        }
      }

      currentSection.push(trimmedLine);
    });

    if (currentSection.length > 0) {
      sections.push({ type: "verse", content: currentSection.join("\n") });
    }

    return sections;
  };

  const handleRetry = useCallback(() => {
    if (hymnId) {
      setLoading(true);
      setError(null);
      fetchHymnById(hymnId)
        .then((data) => {
          setHymn(data);
          checkFavoriteStatus(data.song.slug);
        })
        .catch((err) => {
          console.error("Error loading hymn:", err);
          setError("Failed to load hymn. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hymnId, checkFavoriteStatus]);

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !hymn) {
    return (
      <View style={themedStyles.emptyContainer}>
        <Text style={themedStyles.emptyText}>{error || "Hymn not found"}</Text>
        {error && (
          <IconButton
            icon="refresh"
            size={24}
            onPress={handleRetry}
            iconColor={theme.colors.primary}
          />
        )}
      </View>
    );
  }

  const isFavorite = favoriteStatus[hymn.song.slug] || false;
  const lyricsSections = hymn.song?.lyrics
    ? formatLyrics(hymn.song.lyrics)
    : [];

  return (
    <ScrollView
      style={themedStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <Card style={themedStyles.headerCard}>
        <Card.Content style={themedStyles.headerContent}>
          <View style={themedStyles.titleSection}>
            <Text variant="headlineMedium" style={themedStyles.title}>
              {hymn.song.title}
            </Text>
            <View style={themedStyles.headerActions}>
              <IconButton
                icon={isFavorite ? "heart" : "heart-outline"}
                iconColor={
                  isFavorite ? theme.colors.error : theme.colors.onSurface
                }
                size={24}
                onPress={() =>
                  toggleFavorite({
                    id: String(hymn.song.id),
                    slug: hymn.song.slug,
                    title: hymn.song.title,
                    style: { id: "", name: "" },
                    categories: [],
                    song_languages: [],
                    lyrics: hymn.song.lyrics,
                    youtube: hymn.song.youtube,
                    description: hymn.song.description,
                    song_writer: hymn.song.song_writer,
                  })
                }
              />
              <Surface style={themedStyles.numberChip} elevation={1}>
                <Text variant="labelMedium" style={themedStyles.numberText}>
                  #{hymn.no}
                </Text>
              </Surface>
            </View>
          </View>

          {hymn.song?.song_writer && (
            <View style={themedStyles.authorSection}>
              <Text variant="titleMedium" style={themedStyles.author}>
                by {hymn.song.song_writer}
              </Text>
            </View>
          )}

          <View style={themedStyles.metaInfo}>
            {hymn.song?.youtube && (
              <Chip
                mode="flat"
                style={themedStyles.metaChip}
                icon="youtube"
                textStyle={{ color: theme.colors.primary }}
              >
                Video Available
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Category Card */}
      {hymn.hymn_category && (
        <Card style={themedStyles.sectionCard}>
          <Card.Content>
            <View style={themedStyles.sectionHeader}>
              <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                Category
              </Text>
            </View>
            <View style={themedStyles.chipContainer}>
              <Chip
                mode="outlined"
                style={themedStyles.categoryChip}
                icon="tag"
              >
                {hymn.hymn_category.name}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Description Card */}
      {hymn.song?.description && (
        <Card style={themedStyles.sectionCard}>
          <Card.Content>
            <View style={themedStyles.sectionHeader}>
              <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                Description
              </Text>
            </View>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface }}
            >
              {hymn.song.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Lyrics Card */}
      {hymn.song?.lyrics && (
        <Card style={themedStyles.sectionCard}>
          <Card.Content>
            <View style={themedStyles.sectionHeader}>
              <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                Lyrics
              </Text>
            </View>
            <Divider style={themedStyles.divider} />
            <View style={themedStyles.lyricsContainer}>
              {lyricsSections.map((section, index) => (
                <View key={index} style={themedStyles.verse}>
                  {section.type === "chorus" && (
                    <Text style={themedStyles.chorus}>{section.content}</Text>
                  )}
                  {section.type === "verse" && (
                    <Text style={themedStyles.lyricsText}>
                      {section.content}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* YouTube Link Card */}
      {hymn.song?.youtube && (
        <Card style={themedStyles.sectionCard}>
          <Card.Content>
            <View style={themedStyles.sectionHeader}>
              <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                Watch on YouTube
              </Text>
              <IconButton
                icon="youtube"
                size={24}
                iconColor={theme.colors.primary}
                onPress={() => {
                  // Could open the YouTube link here
                  console.log("Open YouTube:", hymn.song?.youtube);
                }}
              />
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {hymn.song.youtube}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default HymnDetailScreen;
