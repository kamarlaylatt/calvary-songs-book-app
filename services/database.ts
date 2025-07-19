import * as SQLite from 'expo-sqlite';
import { Song } from './api';

const db = SQLite.openDatabaseSync('songs.db');

export const initDatabase = () => {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL,
            youtube TEXT,
            description TEXT,
            song_writer TEXT,
            style TEXT NOT NULL,
            lyrics TEXT,
            music_notes TEXT
        );
    `);
};

export const storeSongs = (songs: Song[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            db.withTransactionSync(() => {
                db.execSync('DELETE FROM songs;');

                songs.forEach(song => {
                    db.runSync(
                        `INSERT INTO songs
                        (id, title, slug, youtube, description, song_writer, style, lyrics, music_notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            song.id,
                            song.title,
                            song.slug,
                            song.youtube || null,
                            song.description || null,
                            song.song_writer || null,
                            song.style,
                            song.lyrics || null,
                            song.music_notes || null
                        ]
                    );
                });
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const getSongBySlug = (slug: string): Promise<Song | null> => {
    return new Promise((resolve, reject) => {
        try {
            const result = db.getAllSync<Song>(
                'SELECT * FROM songs WHERE slug = ? LIMIT 1;',
                [slug]
            );
            resolve(result.length > 0 ? result[0] : null);
        } catch (error) {
            reject(error);
        }
    });
};

export const getAllSongs = (): Promise<Song[]> => {
    return new Promise((resolve, reject) => {
        try {
            const result = db.getAllSync<Song>('SELECT * FROM songs;');
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};