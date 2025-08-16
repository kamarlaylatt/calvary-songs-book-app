import axios from 'axios';

const API_BASE_URL = 'https://calvary-api.laravel.cloud/api';
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

export interface PaginatedResponse {
    current_page: number;
    data: Song[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface FetchSongsParams {
    search?: string;
    style_id?: string;
    category_id?: string;
    limit?: number;
    page?: number;
}

export const fetchSongs = async (params?: FetchSongsParams): Promise<PaginatedResponse | { data: Song[] }> => {
    try {
        console.log(`Making API call to: ${API_BASE_URL}/songs`, params);

        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.style_id) queryParams.append('style_id', params.style_id);
        if (params?.category_id) queryParams.append('category_id', params.category_id);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const url = `${API_BASE_URL}/songs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        console.log('Final URL:', url);

        const response = await axios.get(url);

        // Handle both paginated and simple array responses
        if (params?.limit) {
            // Paginated response
            return {
                current_page: response.data.current_page || 1,
                data: response.data.data.map((song: any) => ({
                    id: song.id.toString(),
                    title: song.title,
                    slug: song.slug || `song-${song.id}`,
                    youtube: song.youtube,
                    description: song.description,
                    song_writer: song.song_writer,
                    style: song.style || { id: '', name: '' },
                    categories: song.categories || [],
                    lyrics: song.lyrics,
                    music_notes: song.music_notes
                })),
                first_page_url: response.data.first_page_url || '',
                from: response.data.from || 1,
                last_page: response.data.last_page || 1,
                last_page_url: response.data.last_page_url || '',
                next_page_url: response.data.next_page_url || null,
                path: response.data.path || '',
                per_page: response.data.per_page || params.limit,
                prev_page_url: response.data.prev_page_url || null,
                to: response.data.to || response.data.data.length,
                total: response.data.total || response.data.data.length
            };
        } else {
            // Simple array response
            return {
                data: response.data.data.map((song: any) => ({
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
                }))
            };
        }
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

        // Log full response for debugging
        console.log('API Response:', response.data);

        if (!response.data) {
            throw new Error('Empty response from API');
        }

        // Handle both direct response and nested data response
        const songData = response.data.data || response.data;

        if (!songData) {
            throw new Error('No song data found in response');
        }

        if (!songData.id) {
            throw new Error('Invalid song data: missing id property');
        }

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

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Style {
    id: string;
    name: string;
}

export interface SearchFilters {
    categories: Category[];
    styles: Style[];
}

export const fetchSearchFilters = async (): Promise<SearchFilters> => {
    try {
        console.log(`Making API call to: ${API_BASE_URL}/search-filters`);
        const response = await axios.get(`${API_BASE_URL}/search-filters`);

        console.log('Search filters response:', response.data);

        return {
            categories: response.data.categories.map((category: any) => ({
                id: category.id.toString(),
                name: category.name,
                slug: category.slug
            })),
            styles: response.data.styles.map((style: any) => ({
                id: style.id.toString(),
                name: style.name
            }))
        };
    } catch (error) {
        console.error('Error fetching search filters:', error);
        throw error;
    }
};