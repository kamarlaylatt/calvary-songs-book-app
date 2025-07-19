import axios from 'axios';
import Constants from 'expo-constants';

// Use 10.0.2.2 to connect to host machine's localhost from Android emulator
console.log('Loaded Constants:', Constants.expoConfig?.extra);
// const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
console.log('Using API_BASE_URL:', API_BASE_URL);

export interface Song {
    id: string;
    title: string;
    slug: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: {
        id: string;
        name: string;
    };
    categories: Array<{
        id: string;
        name: string;
    }>;
    lyrics?: string;
    music_notes?: string;
}

export const fetchSongs = async (): Promise<Song[]> => {
    try {
        console.log(`Making API call to: ${API_BASE_URL}/songs`);
        const response = await axios.get(`${API_BASE_URL}/songs`);
        return response.data.data.map((song: any) => ({
            id: song.id.toString(),
            title: song.title,
            slug: song.slug || `song-${song.id}`,
            youtube: song.youtube,
            description: song.description,
            song_writer: song.song_writer,
            style: song.style || { id: '', name: 'Unknown' },
            categories: song.categories || [],
            lyrics: song.lyrics,
            music_notes: song.music_notes
        }));
    } catch (error) {
        console.error('Error fetching songs:', error);
        throw error;
    }
};

export interface SongDetail extends Song {
    code?: number;
    created_at?: string;
    updated_at?: string;
}

export const fetchSongBySlug = async (slug: string): Promise<SongDetail> => {
    try {
        console.log(`Making API call to: ${API_BASE_URL}/songs/${slug}`);
        const response = await axios.get(`${API_BASE_URL}/songs/${slug}`);
        const songData = response.data.data;
        return {
            id: songData.id.toString(),
            code: songData.code || 0,
            title: songData.title,
            slug: songData.slug || `song-${songData.id}`,
            youtube: songData.youtube,
            description: songData.description,
            song_writer: songData.song_writer,
            style: songData.style || { id: '', name: 'Unknown' },
            categories: songData.categories || [],
            lyrics: songData.lyrics,
            music_notes: songData.music_notes,
            created_at: songData.created_at || new Date().toISOString(),
            updated_at: songData.updated_at || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching song by slug:', error);
        throw error;
    }
};