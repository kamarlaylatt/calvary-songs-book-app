import type {
    FetchSongsParams,
    PaginatedResponse,
    SearchFilters,
    Song,
    SongDetail,
    SuggestSongRequest,
    SuggestSongResponse,
} from '@/types/models';
import type {
    VersionCheckRequest,
    VersionCheckResponse,
} from '@/types/version';
import http from './http';

export type {
    FetchSongsParams,
    PaginatedResponse, SearchFilters, Song,
    SongDetail,
    SuggestSongRequest,
    SuggestSongResponse,
} from '@/types/models';

export type {
    VersionCheckRequest,
    VersionCheckResponse
} from '@/types/version';

const mapSong = (song: any): Song => ({
    id: String(song.id),
    title: song.title,
    slug: song.slug ?? `song-${song.id}`,
    youtube: song.youtube,
    description: song.description,
    song_writer: song.song_writer,
    style: song.style ?? { id: '', name: '' },
    categories: (song.categories ?? []).map((c: any) => ({
        id: String(c.id),
        name: c.name,
    })),
    song_languages: (song.song_languages ?? []).map((l: any) => ({
        id: String(l.id),
        name: l.name,
    })),
    lyrics: song.lyrics,
    music_notes: song.music_notes,
});

export const fetchSongs = async (
    params?: FetchSongsParams
): Promise<PaginatedResponse | { data: Song[] }> => {
    try {
        const resp = await http.get('/songs', { params });
        const payload = resp.data;

        // API may return { data: [...] } with pagination fields, or sometimes just { data: [...] }
        const dataArray = (payload?.data ?? payload) as any[];

        if (params?.limit) {
            return {
                current_page: payload.current_page ?? 1,
                data: dataArray.map(mapSong),
                first_page_url: payload.first_page_url ?? '',
                from: payload.from ?? 1,
                last_page: payload.last_page ?? 1,
                last_page_url: payload.last_page_url ?? '',
                next_page_url: payload.next_page_url ?? null,
                path: payload.path ?? '',
                per_page: payload.per_page ?? params.limit,
                prev_page_url: payload.prev_page_url ?? null,
                to: payload.to ?? dataArray.length,
                total: payload.total ?? dataArray.length,
            };
        }

        return {
            data: dataArray.map(mapSong),
        };
    } catch (error) {
        console.error('Error fetching songs:', error);
        throw error;
    }
};

export const fetchSongBySlug = async (slug: string): Promise<SongDetail> => {
    try {
        const resp = await http.get(`/songs/${slug}`);
        const payload = resp.data?.data ?? resp.data;

        if (!payload) {
            throw new Error('No song data found in response');
        }
        if (!payload.id) {
            throw new Error('Invalid song data: missing id property');
        }

        const base = mapSong(payload);

        return {
            ...base,
            code: payload.code ?? 0,
            created_at: payload.created_at ?? new Date().toISOString(),
            updated_at: payload.updated_at ?? new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching song by slug:', error);
        throw error;
    }
};

export const fetchSearchFilters = async (): Promise<SearchFilters> => {
    try {
        const resp = await http.get('/search-filters');
        const payload = resp.data;

        return {
            categories: (payload.categories ?? []).map((category: any) => ({
                id: String(category.id),
                name: category.name,
                slug: category.slug,
            })),
            styles: (payload.styles ?? []).map((style: any) => ({
                id: String(style.id),
                name: style.name,
            })),
            song_languages: (payload.song_languages ?? []).map((language: any) => ({
                id: String(language.id),
                name: language.name,
            })),
        };
    } catch (error) {
        console.error('Error fetching search filters:', error);
        throw error;
    }
};

export const checkAppVersion = async (
    request: VersionCheckRequest
): Promise<VersionCheckResponse> => {
    try {
        console.log('Version check request:', request);
        const resp = await http.post('/check-version', request);
        console.log('Version check response:', resp.data);
        return resp.data;
    } catch (error) {
        console.error('Error checking app version:', error);
        throw error;
    }
};

export const submitSongSuggestion = async (
    request: SuggestSongRequest
): Promise<SuggestSongResponse> => {
    try {
        const resp = await http.post('/suggest-songs', request);
        return resp.data;
    } catch (error) {
        console.error('Error submitting song suggestion:', error);
        throw error;
    }
};