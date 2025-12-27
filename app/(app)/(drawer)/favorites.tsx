import { FavoriteSong, getFavoriteSongs, removeSongFromFavorites } from '@/services/favorites';
import { addSongToHistory } from '@/services/songHistory';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

export default function FavoritesScreen() {
    const theme = useTheme();
    const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const favoriteSongs = await getFavoriteSongs();
            setFavorites(favoriteSongs);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const removeFromFavorites = async (slug: string, title: string) => {
        try {
            await removeSongFromFavorites(slug);
            // Update local state
            setFavorites(prev => prev.filter(song => song.slug !== slug));
            console.log(`Removed "${title}" from favorites`);
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    // Load favorites when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            loadFavorites();
        }, [])
    );

    const handleFavoritePress = async (song: FavoriteSong) => {
        try {
            // Convert FavoriteSong to format expected by addSongToHistory
            await addSongToHistory({
                id: song.id,
                slug: song.slug,
                title: song.title,
                song_writer: song.song_writer,
                categories: [], // Favorites don't store categories, but history requires it
            });
            // Don't pass song data from favorites - it has incomplete structure
            // Let the detail page fetch complete data from API
            router.push({
                pathname: '/song/[slug]',
                params: { slug: song.slug }
            });
        } catch (error) {
            console.error('Error adding favorite to history:', error);
            // Navigate anyway even if history fails
            router.push({
                pathname: '/song/[slug]',
                params: { slug: song.slug }
            });
        }
    };

    const renderFavoriteItem = ({ item }: { item: FavoriteSong }) => (
        <Card
            style={styles.card}
            onPress={() => handleFavoritePress(item)}
        >
            <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text variant="titleMedium" style={styles.songTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <IconButton
                        icon="heart"
                        iconColor={theme.colors.error}
                        size={20}
                        onPress={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(item.slug, item.title);
                        }}
                    />
                </View>
                <Text variant="bodySmall" style={styles.songId}>
                    ID: {item.id}
                </Text>
                {item.song_writer && (
                    <Text variant="bodyMedium" style={styles.songWriter} numberOfLines={1}>
                        by {item.song_writer}
                    </Text>
                )}
                <Text variant="bodySmall" style={styles.addedDate}>
                    Added: {new Date(item.added_at).toLocaleDateString()}
                </Text>
            </Card.Content>
        </Card>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="headlineSmall" style={styles.emptyText}>
                        No favorites yet
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptySubtext}>
                        Tap the heart icon on any song to add it to your favorites
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.slug}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtext: {
        textAlign: 'center',
        opacity: 0.7,
    },
    listContent: {
        padding: 16,
        paddingBottom: 30, // Match padding with songs list
    },
    card: {
        marginBottom: 12,
        elevation: 2,
    },
    cardContent: {
        paddingVertical: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    songTitle: {
        flex: 1,
        marginRight: 8,
    },
    songId: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    songWriter: {
        fontStyle: 'italic',
        opacity: 0.8,
        marginTop: 4,
    },
    addedDate: {
        marginTop: 8,
        fontSize: 12,
        opacity: 0.6,
    },
});