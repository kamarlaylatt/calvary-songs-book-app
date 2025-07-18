import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

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

// Mock song data
const mockSongs: Song[] = [
    {
        id: '1',
        title: 'Amazing Grace',
        youtube: 'https://youtube.com/watch?v=example1',
        description: 'A timeless hymn of redemption and grace',
        song_writer: 'John Newton',
        style: 'Hymn',
        lyrics: 'Amazing grace, how sweet the sound...\nThat saved a wretch like me...\nI once was lost, but now am found...\nWas blind, but now I see...',
        music_notes: 'Key: G Major\nTempo: 80 BPM\nTime Signature: 3/4'
    },
    {
        id: '2',
        title: 'How Great Thou Art',
        youtube: 'https://youtube.com/watch?v=example2',
        description: 'A powerful worship song celebrating God\'s majesty',
        song_writer: 'Carl Boberg',
        style: 'Worship',
        lyrics: 'O Lord my God, when I in awesome wonder...\nConsider all the worlds Thy hands have made...',
        music_notes: 'Key: A♭ Major\nTempo: 72 BPM\nTime Signature: 4/4'
    },
    {
        id: '3',
        title: 'Great Is Thy Faithfulness',
        description: 'A declaration of God\'s unchanging faithfulness',
        song_writer: 'Thomas Chisholm',
        style: 'Hymn',
        lyrics: 'Great is Thy faithfulness, O God my Father...\nThere is no shadow of turning with Thee...',
        music_notes: 'Key: B♭ Major\nTempo: 88 BPM\nTime Signature: 4/4'
    },
    {
        id: '4',
        title: 'Blessed Assurance',
        youtube: 'https://youtube.com/watch?v=example4',
        description: 'A joyful song of salvation and assurance',
        song_writer: 'Fanny Crosby',
        style: 'Gospel',
        lyrics: 'Blessed assurance, Jesus is mine...\nO what a foretaste of glory divine...',
        music_notes: 'Key: D Major\nTempo: 120 BPM\nTime Signature: 6/8'
    },
    {
        id: '5',
        title: 'It Is Well',
        description: 'A song of peace and trust in God\'s sovereignty',
        song_writer: 'Horatio Spafford',
        style: 'Hymn',
        lyrics: 'When peace like a river, attendeth my way...\nWhen sorrows like sea billows roll...',
        music_notes: 'Key: G Major\nTempo: 70 BPM\nTime Signature: 4/4'
    },
    {
        id: '6',
        title: 'Holy Holy Holy',
        youtube: 'https://youtube.com/watch?v=example6',
        description: 'A majestic hymn of praise to the Holy Trinity',
        song_writer: 'Reginald Heber',
        style: 'Hymn',
        lyrics: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee...',
        music_notes: 'Key: E♭ Major\nTempo: 92 BPM\nTime Signature: 4/4'
    }
];

export default function SongsList() {
    const router = useRouter();
    const theme = useTheme();

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
            <FlatList
                data={mockSongs}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
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
});