// Centralized domain models for Calvary Songs app
// Keep these types framework-agnostic and focused on API/domain data.

export interface Style {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    slug?: string;
}

export interface SongLanguage {
    id: string;
    name: string;
}

export interface Song {
    id: string;
    title: string;
    slug: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style: Style;
    categories: Array<{
        id: string;
        name: string;
    }>;
    song_languages: SongLanguage[];
    lyrics?: string;
    music_notes?: string;
}

export interface SongDetail extends Song {
    code?: number;
    created_at?: string;
    updated_at?: string;
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
    song_language_id?: string;
    limit?: number;
    page?: number;
}

export interface SearchFilters {
    categories: Category[];
    styles: Style[];
    song_languages: SongLanguage[];
}

// A lightweight utility type for API list responses that wrap data in { data: T[] }
export interface ListResponse<T> {
    data: T[];
}

// Suggest Song types
export interface SuggestSongRequest {
    title: string;
    lyrics: string;
    youtube?: string;
    description?: string;
    song_writer?: string;
    style_id?: number;
    key?: string;
    music_notes?: string;
    popular_rating?: number;
    email?: string;
    category_ids?: number[];
    song_language_ids?: number[];
}

export interface SuggestSongResponse {
    message: string;
    data: {
        id: number;
        title: string;
        youtube?: string;
        description?: string;
        song_writer?: string;
        style_id?: number;
        key?: string;
        lyrics: string;
        music_notes?: string;
        popular_rating?: number;
        status: number;
        categories?: Array<{
            id: number;
            name: string;
            pivot: {
                suggest_song_id: number;
                category_id: number;
            };
        }>;
        created_at: string;
        updated_at: string;
    };
}

export interface ValidationError {
    message: string;
    errors: {
        [field: string]: string[];
    };
}