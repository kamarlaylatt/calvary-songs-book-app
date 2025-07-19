import axios from 'axios';

// Use 10.0.2.2 to connect to host machine's localhost from Android emulator
const API_BASE_URL = process.env.API_BASE_URL;

export interface Song {
    id: string;
    title: string;
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