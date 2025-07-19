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
    style: string;
    lyrics?: string;
    music_notes?: string;
}

export const fetchSongs = async (): Promise<Song[]> => {
    try {
        // Fetch without limit parameter to get all songs
        console.log(`Making API call to: ${API_BASE_URL}/songs`);
        const response = await axios.get(`${API_BASE_URL}/songs`);
        return response.data.data.map((song: any) => ({
            id: song.id.toString(),
            title: song.title,
            youtube: song.youtube,
            description: song.description,
            song_writer: song.song_writer,
            style: song.style?.name || 'Unknown',
            lyrics: song.lyrics,
            music_notes: song.music_notes
        }));
    } catch (error) {
        console.error('Error fetching songs:', error);
        throw error;
    }
};

export interface SongDetail {
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
        slug: string;
    }>;
    lyrics?: string;
    music_notes?: string;
}

export const fetchSongBySlug = async (slug: string): Promise<SongDetail> => {
    try {
        console.log(`Making API call to: ${API_BASE_URL}/songs/${slug}`);
        const response = await axios.get(`${API_BASE_URL}/songs/${slug}`);
        return {
            id: response.data.id.toString(),
            title: response.data.title,
            slug: response.data.slug,
            youtube: response.data.youtube,
            description: response.data.description,
            song_writer: response.data.song_writer,
            style: response.data.style,
            categories: response.data.categories,
            lyrics: response.data.lyrics,
            music_notes: response.data.music_notes
        };
    } catch (error) {
        console.error('Error fetching song by slug:', error);
        throw error;
    }
};