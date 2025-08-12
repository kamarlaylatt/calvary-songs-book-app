import * as SQLite from 'expo-sqlite';

// Song history interface
export interface SongHistoryItem {
    id: string;
    slug: string;
    title: string;
    song_writer?: string;
    style_name?: string;
    description?: string;
    categories: string; // JSON string of categories
    visited_at: string; // ISO date string
    visit_count: number;
}

// Database instance
let db: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<void> | null = null;

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
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
            db = await SQLite.openDatabaseAsync('songHistory.db');

            // Create song_history table if it doesn't exist
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS song_history (
                    id TEXT PRIMARY KEY,
                    slug TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    song_writer TEXT,
                    style_name TEXT,
                    description TEXT,
                    categories TEXT,
                    visited_at TEXT NOT NULL,
                    visit_count INTEGER DEFAULT 1
                );
            `);

            // Create index for better performance
            await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_visited_at ON song_history(visited_at DESC);
            `);

            console.log('Song history database initialized successfully');
        } catch (error) {
            console.error('Error initializing song history database:', error);
            db = null; // Reset db on error
            initializationPromise = null; // Reset promise on error
            throw error;
        }
    })();

    return initializationPromise;
};

// Add or update song in history
export const addSongToHistory = async (song: {
    id: string;
    slug: string;
    title: string;
    song_writer?: string;
    style?: { name: string };
    description?: string;
    categories: Array<{ id: string; name: string }>;
}): Promise<void> => {
    // Ensure database is initialized
    await initializeDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const categoriesJson = JSON.stringify(song.categories);
        const visitedAt = new Date().toISOString();

        // Check if song already exists in history
        const existingRecord = await db!.getFirstAsync<{ visit_count: number }>(
            'SELECT visit_count FROM song_history WHERE slug = ?',
            [song.slug]
        );

        if (existingRecord) {
            // Update existing record
            await db!.runAsync(`
                UPDATE song_history
                SET title = ?,
                    song_writer = ?,
                    style_name = ?,
                    description = ?,
                    categories = ?,
                    visited_at = ?,
                    visit_count = visit_count + 1
                WHERE slug = ?
            `, [
                song.title,
                song.song_writer || null,
                song.style?.name || null,
                song.description || null,
                categoriesJson,
                visitedAt,
                song.slug
            ]);
        } else {
            // Insert new record
            await db!.runAsync(`
                INSERT INTO song_history (id, slug, title, song_writer, style_name, description, categories, visited_at, visit_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                song.id,
                song.slug,
                song.title,
                song.song_writer || null,
                song.style?.name || null,
                song.description || null,
                categoriesJson,
                visitedAt
            ]);

            // Keep only the 5 most recent entries
            await db!.runAsync(`
                DELETE FROM song_history
                WHERE id NOT IN (
                    SELECT id FROM song_history
                    ORDER BY visited_at DESC
                    LIMIT 5
                )
            `);
        }

        console.log(`Song "${song.title}" added to history`);
    } catch (error) {
        console.error('Error adding song to history:', error);
        throw error;
    }
};

// Get song history (most recent first)
export const getSongHistory = async (limit: number = 5): Promise<SongHistoryItem[]> => {
    // Ensure database is initialized
    await initializeDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const results = await db!.getAllAsync<SongHistoryItem>(
            'SELECT * FROM song_history ORDER BY visited_at DESC LIMIT ?',
            [limit]
        );

        return results;
    } catch (error) {
        console.error('Error fetching song history:', error);
        return [];
    }
};

// Clear song history
export const clearSongHistory = async (): Promise<void> => {
    // Ensure database is initialized
    await initializeDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        await db!.runAsync('DELETE FROM song_history');
        console.log('Song history cleared');
    } catch (error) {
        console.error('Error clearing song history:', error);
        throw error;
    }
};

// Remove specific song from history
export const removeSongFromHistory = async (slug: string): Promise<void> => {
    // Ensure database is initialized
    await initializeDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        await db!.runAsync('DELETE FROM song_history WHERE slug = ?', [slug]);
        console.log(`Song with slug "${slug}" removed from history`);
    } catch (error) {
        console.error('Error removing song from history:', error);
        throw error;
    }
};

// Get history count
export const getHistoryCount = async (): Promise<number> => {
    // Ensure database is initialized
    await initializeDatabase();

    if (!db) {
        throw new Error('Database initialization failed');
    }

    try {
        const result = await db!.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM song_history'
        );
        return result?.count || 0;
    } catch (error) {
        console.error('Error getting history count:', error);
        return 0;
    }
};