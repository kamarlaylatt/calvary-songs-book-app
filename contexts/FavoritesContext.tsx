import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSongInFavorites, addSongToFavorites, removeSongFromFavorites, getFavoriteSongs, initializeFavoritesDatabase } from '../services/favorites';
import { SongDetail } from '../services/api';

interface FavoritesContextType {
    favoriteStatus: Record<string, boolean>; // slug -> isFavorite
    toggleFavorite: (song: SongDetail) => Promise<void>;
    refreshFavorites: () => Promise<void>;
    initializeFavorites: () => Promise<void>;
    checkFavoriteStatus: (slug: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});

    const initializeFavorites = async () => {
        try {
            await initializeFavoritesDatabase();
            // Load all favorites to populate the status map
            await refreshFavorites();
        } catch (error) {
            console.error('Error initializing favorites:', error);
        }
    };

    const refreshFavorites = async () => {
        try {
            // Get all favorites and update the status map
            // This is useful when favorites are managed from other screens
        } catch (error) {
            console.error('Error refreshing favorites:', error);
        }
    };

    const checkFavoriteStatus = async (slug: string) => {
        try {
            const isFavorite = await isSongInFavorites(slug);
            setFavoriteStatus(prev => ({
                ...prev,
                [slug]: isFavorite
            }));
            return isFavorite;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    };

    const toggleFavorite = async (song: SongDetail) => {
        try {
            const currentStatus = favoriteStatus[song.slug] || false;
            
            if (currentStatus) {
                // Remove from favorites
                await removeSongFromFavorites(song.slug);
            } else {
                // Add to favorites
                await addSongToFavorites({
                    id: song.id,
                    slug: song.slug,
                    title: song.title,
                    song_writer: song.song_writer,
                    style: song.style,
                    description: song.description,
                    categories: song.categories,
                    lyrics: song.lyrics
                });
            }
            
            // Update local state
            setFavoriteStatus(prev => ({
                ...prev,
                [song.slug]: !currentStatus
            }));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    // Initialize favorites database on mount
    useEffect(() => {
        initializeFavorites();
    }, []);

    const contextValue: FavoritesContextType = {
        favoriteStatus,
        toggleFavorite,
        refreshFavorites,
        initializeFavorites,
        checkFavoriteStatus
    };

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
};