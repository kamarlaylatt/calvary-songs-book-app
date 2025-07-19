import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('songs.db');

export const initDatabase = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            code INTEGER DEFAULT 0,
            title TEXT NOT NULL,
            slug TEXT NOT NULL,
            style_id TEXT,
            youtube TEXT,
            description TEXT,
            song_writer TEXT,
            lyrics TEXT,
            music_notes TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (style_id) REFERENCES styles(id)
        );
        
        CREATE TABLE IF NOT EXISTS styles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        );
        
        CREATE TABLE IF NOT EXISTS song_categories (
            song_id TEXT NOT NULL,
            category_id TEXT NOT NULL,
            PRIMARY KEY (song_id, category_id),
            FOREIGN KEY (song_id) REFERENCES songs(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);

    // Migration to add style_id to songs table if it doesn't exist
    const columns = db.getAllSync<any>("PRAGMA table_info(songs);");
    const hasStyleId = columns.some(c => c.name === 'style_id');
    if (!hasStyleId) {
        db.execSync('ALTER TABLE songs ADD COLUMN style_id TEXT;');
    }
};

export const storeSongs = (songs: import('./api').Song[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            db.withTransactionSync(() => {
                // Clear all related tables
                db.execSync('DELETE FROM songs;');
                db.execSync('DELETE FROM styles;');
                db.execSync('DELETE FROM categories;');
                db.execSync('DELETE FROM song_categories;');

                songs.forEach(song => {
                    // Insert song
                    db.runSync(
                        `INSERT INTO songs
                        (id, code, title, slug, style_id, youtube, description, song_writer, lyrics, music_notes, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            song.id,
                            0, // Default value for code
                            song.title,
                            song.slug || `song-${song.id}`,
                            song.style?.id || null,
                            song.youtube || null,
                            song.description || null,
                            song.song_writer || null,
                            song.lyrics || null,
                            song.music_notes || null,
                            new Date().toISOString(), // Current timestamp
                            new Date().toISOString()  // Current timestamp
                        ]
                    );

                    // Insert style if it exists
                    if (song.style) {
                        db.runSync(
                            `INSERT OR REPLACE INTO styles
                            (id, name, created_at, updated_at)
                            VALUES (?, ?, ?, ?)`,
                            [
                                song.style.id,
                                song.style.name,
                                new Date().toISOString(), // Current timestamp
                                new Date().toISOString()  // Current timestamp
                            ]
                        );
                    }

                    // Insert categories
                    song.categories?.forEach(category => {
                        db.runSync(
                            `INSERT OR REPLACE INTO categories
                            (id, name, slug, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?)`,
                            [
                                category.id,
                                category.name,
                                category.name.toLowerCase().replace(/ /g, '-'), // Generate slug
                                new Date().toISOString(), // Current timestamp
                                new Date().toISOString()  // Current timestamp
                            ]
                        );

                        // Link song to category
                        db.runSync(
                            `INSERT OR IGNORE INTO song_categories
                            (song_id, category_id)
                            VALUES (?, ?)`,
                            [song.id, category.id]
                        );
                    });
                });
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const getSongBySlug = (slug: string): Promise<import('./api').SongDetail | null> => {
    return new Promise((resolve, reject) => {
        try {
            const song = db.getAllSync<any>(
                'SELECT * FROM songs WHERE slug = ? LIMIT 1;',
                [slug]
            )[0];

            if (!song) {
                resolve(null);
                return;
            }

            const style = db.getAllSync<any>(
                'SELECT * FROM styles WHERE id = ? LIMIT 1;',
                [song.style_id]
            )[0];

            const categories = db.getAllSync<any>(
                `SELECT c.* FROM categories c
                JOIN song_categories sc ON c.id = sc.category_id
                WHERE sc.song_id = ?`,
                [song.id]
            );

            resolve({
                ...song,
                style,
                categories
            });
        } catch (error) {
            reject(error);
        }
    });
};

export const getAllSongs = (): Promise<import('./api').SongDetail[]> => {
    return new Promise((resolve, reject) => {
        try {
            const songs = db.getAllSync<any>('SELECT * FROM songs;');
            const songsWithRelations = songs.map(song => {
                const style = db.getAllSync<any>(
                    'SELECT * FROM styles WHERE id = ? LIMIT 1;',
                    [song.style_id]
                )[0];

                const categories = db.getAllSync<any>(
                    `SELECT c.* FROM categories c
                    JOIN song_categories sc ON c.id = sc.category_id
                    WHERE sc.song_id = ?`,
                    [song.id]
                );

                return {
                    ...song,
                    style: {
                        id: style.id,
                        name: style.name
                    },
                    categories
                };
            });
            resolve(songsWithRelations);
        } catch (error) {
            reject(error);
        }
    });
};