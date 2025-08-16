import * as SQLite from 'expo-sqlite';

// Favorite song interface
export interface FavoriteSong {
    id: string;
    slug: string;
    title: string;
    song_writer?: string;
    style_name?: string;
    description?: string;
    categories: string; // JSON string of categories
    lyrics?: string; // HTML lyrics
    added_at: string; // ISO date string
}

// Database instance
let db: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<void> | null = null;

// Initialize database
export const initializeFavoritesDatabase = async (): Promise<void> => {
    // If already initialized, return immediately
    if (db) {
        return;
    }

    // If initialization is in progress, wait for it
    if (initializationPromise) {
        return initializationPromise;
    }

    // Start initialization
    initializationPromise = (async () => {
        try {
            db = await SQLite.openDatabaseAsync('favorites.db');

            // Create favorites table if it doesn't exist
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS favorites (
                    id TEXT PRIMARY KEY,
                    slug TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    song_writer TEXT,
                    style_name TEXT,
                    description TEXT,
                    categories TEXT,
                    lyrics TEXT,
                    added_at TEXT NOT NULL
                );
            `);

            // Create index for better performance
            await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_added_at ON favorites(added_at DESC);
            `);

            console.log('Favorites database initialized successfully');
        } catch (error) {
            console.error('Error initializing favorites database:', error);
            db = null; // Reset db on error
            initializationPromise = null; // Reset promise on error
            throw error;
        }
    })();

    return initializationPromise;
};

// Add song to favorites
export const addSongToFavorites = async (song: {
    id: string;
    slug: string;
    title: string;
    song_writer?: string;
    style?: { name: string };
    description?: string;
    categories: Array<{ id: string; name: string }>;
    lyrics?: string;
}): Promise<void> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const categoriesJson = JSON.stringify(song.categories);
        const addedAt = new Date().toISOString();

        // Check if song already exists in favorites
        const existingRecord = await db.getFirstAsync<{ id: string }>(
            'SELECT id FROM favorites WHERE slug = ?',
            [song.slug]
        );

        if (!existingRecord) {
            // Insert new record only if it doesn't exist
            await db.runAsync(`
                INSERT INTO favorites (id, slug, title, song_writer, style_name, description, categories, lyrics, added_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                song.id,
                song.slug,
                song.title,
                song.song_writer || null,
                song.style?.name || null,
                song.description || null,
                categoriesJson,
                song.lyrics || null,
                addedAt
            ]);

            console.log(`Song "${song.title}" added to favorites`);
        }
    } catch (error) {
        console.error('Error adding song to favorites:', error);
        throw error;
    }
};

// Remove song from favorites
export const removeSongFromFavorites = async (slug: string): Promise<void> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        await db.runAsync('DELETE FROM favorites WHERE slug = ?', [slug]);
        console.log(`Song with slug "${slug}" removed from favorites`);
    } catch (error) {
        console.error('Error removing song from favorites:', error);
        throw error;
    }
};

// Get all favorite songs
export const getFavoriteSongs = async (): Promise<FavoriteSong[]> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const results = await db.getAllAsync<FavoriteSong>(
            'SELECT * FROM favorites ORDER BY added_at DESC'
        );

        return results;
    } catch (error) {
        console.error('Error fetching favorite songs:', error);
        return [];
    }
};

// Check if song is in favorites
export const isSongInFavorites = async (slug: string): Promise<boolean> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const result = await db.getFirstAsync<{ id: string }>(
            'SELECT id FROM favorites WHERE slug = ?',
            [slug]
        );
        return !!result;
    } catch (error) {
        console.error('Error checking if song is in favorites:', error);
        return false;
    }
};

// Get favorites count
export const getFavoritesCount = async (): Promise<number> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM favorites'
        );
        return result?.count || 0;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
};

// Clear all favorites
export const clearFavorites = async (): Promise<void> => {
    // Ensure database is initialized
    await initializeFavoritesDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        await db.runAsync('DELETE FROM favorites');
        console.log('All favorites cleared');
    } catch (error) {
        console.error('Error clearing favorites:', error);
        throw error;
    }
};