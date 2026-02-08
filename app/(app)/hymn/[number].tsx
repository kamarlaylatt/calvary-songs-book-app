import { fetchHymnById, type HymnDetail } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import {
    Button,
    Card,
    Chip,
    Divider,
    IconButton,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import RenderHtml from "react-native-render-html";
import YoutubePlayer from "react-native-youtube-iframe";
import { useFavorites } from "../../../contexts/FavoritesContext";

function HymnDetailScreen() {
  const { favoriteStatus, toggleFavorite, checkFavoriteStatus } =
    useFavorites();
  const params = useLocalSearchParams<{ number: string; hymn?: string }>();
  const router = useRouter();

  const hymnId = typeof params.number === "string" ? params.number : null;
  const passedHymn = params.hymn ? JSON.parse(params.hymn) : null;
  const [hymn, setHymn] = useState<HymnDetail | null>(passedHymn);
  const [loading, setLoading] = useState(!passedHymn);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPlayer, setShowPlayer] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const theme = useTheme();

  // Load hymn data from API
  const loadHymn = async (isRefresh = false) => {
    if (!hymnId) {
      setError("Invalid hymn ID");
      setLoading(false);
      return;
    }

    // If we have passed hymn data and it's not a refresh, use it directly
    if (passedHymn && !isRefresh) {
      setHymn(passedHymn);
      await checkFavoriteStatus(passedHymn.song.slug);
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!hymnId) {
      setLoading(false);
      return;
    }

    // Only fetch from API if we don't have passed data
    if (!passedHymn) {
      loadHymn();
    } else {
      checkFavoriteStatus(passedHymn.song.slug);
      setLoading(false);
    }
  }, [hymnId, passedHymn]);

  const onRefresh = useCallback(() => {
    loadHymn(true);
  }, []);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const togglePlayer = () => {
    setShowPlayer(!showPlayer);
    setPlayerError(null);
  };

  const openInYouTube = async () => {
    try {
      const url = hymn?.song?.youtube;
      if (!url) return;
      const videoId = getYouTubeVideoId(url);
      const appUrl = videoId ? `vnd.youtube://${videoId}` : url;
      const webUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
      const canOpenApp = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpenApp ? appUrl : webUrl);
    } catch (e) {
      if (hymn?.song?.youtube) {
        await Linking.openURL(hymn.song.youtube);
      }
    }
  };

  const { width } = useWindowDimensions();

  // Memoized HTML rendering configs placed before any conditional returns to keep hooks order stable
  const tagsStyles = useMemo(() => ({
    body: {
      whiteSpace: 'normal' as const,
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    },
    p: {
      marginBottom: 16,
      textAlign: 'center' as const,
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
      color: theme.colors.primary,
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
  }), [theme.colors]);

  const systemFonts = useMemo(() => [
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
  ], []);

  const renderersProps = useMemo(() => ({
    img: {
      enableExperimentalPercentWidth: true,
    },
  }), []);

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
      marginTop: 4,
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
    youtubeControls: {
      flexDirection: "row",
      alignItems: "center",
    },
    playerContainer: {
      marginTop: 12,
      borderRadius: 12,
      overflow: "hidden",
    },
    youtubePlayer: {
      borderRadius: 12,
    },
    errorText: {
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.error,
    },
  });

  const handleRetry = useCallback(() => {
    loadHymn();
  }, [loadHymn]);

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

  return (
    <ScrollView
      style={themedStyles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header Card */}
      <Card style={themedStyles.headerCard}>
        <Card.Content style={themedStyles.headerContent}>
          <View style={themedStyles.titleSection}>
            <View style={{ flex: 1 }}>
              <Text variant="headlineMedium" style={themedStyles.title}>
                {hymn.no}. {hymn.song.title}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                }}
              >
                {hymn.english_title}
              </Text>
            </View>
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
                  #{hymn.song.id}
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
            <RenderHtml
              contentWidth={width - 64}
              source={{
                html: hymn.song.description.includes('<')
                  ? hymn.song.description
                  : hymn.song.description.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')
              }}
              tagsStyles={tagsStyles}
              systemFonts={systemFonts}
              enableExperimentalMarginCollapsing={true}
              renderersProps={renderersProps}
            />
          </Card.Content>
        </Card>
      )}

      {/* YouTube Card */}
      {hymn.song?.youtube && (
        <Card style={themedStyles.sectionCard}>
          <Card.Content>
            <View style={themedStyles.sectionHeader}>
              <Text variant="titleLarge" style={themedStyles.sectionTitle}>
                {showPlayer ? 'Player' : 'Listen Song'}
              </Text>
              <View style={themedStyles.youtubeControls}>
                <IconButton
                  icon={showPlayer ? 'close' : 'play-circle'}
                  iconColor={theme.colors.primary}
                  size={24}
                  onPress={togglePlayer}
                />
                {hymn.song.youtube && (
                  <IconButton
                    icon="open-in-new"
                    iconColor={theme.colors.primary}
                    size={24}
                    onPress={openInYouTube}
                  />
                )}
              </View>
            </View>

            {showPlayer && getYouTubeVideoId(hymn.song.youtube) && (
              <View style={themedStyles.playerContainer}>
                <YoutubePlayer
                  height={200}
                  videoId={getYouTubeVideoId(hymn.song.youtube)!}
                  webViewStyle={themedStyles.youtubePlayer}
                  initialPlayerParams={{
                    cc_lang_pref: 'en',
                    showClosedCaptions: false,
                    modestbranding: true,
                    rel: false,
                    iv_load_policy: 3,
                  }}
                  onError={() => setPlayerError('Playback may require sign-in. Open in YouTube instead.')}
                  onReady={() => setPlayerError(null)}
                />
                {playerError && (
                  <View style={{ marginTop: 8, gap: 8 }}>
                    <Text style={themedStyles.errorText}>{playerError}</Text>
                    <Button mode="outlined" onPress={openInYouTube}>
                      Open in YouTube
                    </Button>
                  </View>
                )}
              </View>
            )}
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
              <RenderHtml
                contentWidth={width - 80}
                source={{
                  html: hymn.song.lyrics.includes('<')
                    ? hymn.song.lyrics
                    : hymn.song.lyrics.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')
                }}
                tagsStyles={tagsStyles}
                systemFonts={systemFonts}
                enableExperimentalMarginCollapsing={true}
                renderersProps={renderersProps}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default HymnDetailScreen;
