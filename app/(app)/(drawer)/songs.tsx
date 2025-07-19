import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { fetchSongs } from '../../../services/api';
import { getAllSongs, initDatabase, storeSongs } from '../../../services/database';

// Song interface based on required fields
interface Song {
    id: string;
    title: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: string;
    lyrics?: string;
    music_notes?: string;
}


export default function SongsList() {
    const router = useRouter();
    const theme = useTheme();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initDatabase();
        loadSongsFromDB();
    }, []);

    const loadSongsFromDB = async () => {
        try {
            console.log('Loading songs from database...');
            const dbSongs = await getAllSongs();
            console.log('Retrieved songs from DB:', dbSongs);

            if (dbSongs.length > 0) {
                console.log('Updating state with', dbSongs.length, 'songs');
                setSongs(dbSongs);
            } else {
                console.log('No songs found in database');
            }
        } catch (error) {
            console.error('Error loading songs from DB:', error);
        }
    };

    const handleFetchSongs = async () => {
        setLoading(true);
        try {
            console.log('Starting API fetch...');
            const apiSongs = await fetchSongs();
            console.log('API fetch successful, received:', apiSongs.length, 'songs');

            console.log('Storing songs in database...');
            await storeSongs(apiSongs);
            console.log('Songs stored successfully');

            // Reload songs from the database to update the list
            await loadSongsFromDB();
        } catch (error) {
            console.error('Error in fetch process:', error);
            // Optionally, handle the error in the UI, e.g., show a toast message
        } finally {
            setLoading(false);
            console.log('Fetch process completed');
        }
    };

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => console.log(`Selected song: ${item.title}`)}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.songHeader}>
                        <Text variant="titleLarge" style={styles.songTitle}>
                            {item.title}
                        </Text>
                        <Chip
                            mode="outlined"
                            style={[styles.styleChip, { backgroundColor: getStyleColor(item.style) }]}
                            textStyle={{ color: '#fff' }}
                        >
                            {item.style}
                        </Chip>
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

    return (
        <View style={styles.container} >
            <TouchableOpacity
                style={[styles.fetchButton, loading && styles.fetchButtonDisabled]}
                onPress={handleFetchSongs}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <Text style={styles.fetchButtonText}>Fetch Songs</Text>
                )}
            </TouchableOpacity>

            {songs.length > 0 ? (
                <FlatList
                    data={songs}
                    renderItem={renderSongItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No songs available</Text>
                    <Text style={styles.emptySubtext}>
                        {loading ? 'Loading...' : 'Press "Fetch Songs" to load'}
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
});