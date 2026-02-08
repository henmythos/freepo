"use client";

import { useState, useEffect, useCallback } from "react";

export interface FavoriteItem {
    id: string;
    title: string;
    slug: string;
    image?: string;
    price?: string;
    city: string;
    addedAt: number;
}

const FAVORITES_KEY = "freepo_favorites";
const MAX_FAVORITES = 50;

/**
 * Hook for managing favorites in localStorage
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setFavorites(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load favorites:", e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            } catch (e) {
                console.error("Failed to save favorites:", e);
            }
        }
    }, [favorites, isLoaded]);

    const addFavorite = useCallback((item: FavoriteItem) => {
        setFavorites(prev => {
            // Check if already exists
            if (prev.some(f => f.id === item.id)) {
                return prev;
            }
            // Add new item, limit to MAX_FAVORITES
            const updated = [{ ...item, addedAt: Date.now() }, ...prev];
            return updated.slice(0, MAX_FAVORITES);
        });
    }, []);

    const removeFavorite = useCallback((id: string) => {
        setFavorites(prev => prev.filter(f => f.id !== id));
    }, []);

    const isFavorite = useCallback((id: string) => {
        return favorites.some(f => f.id === id);
    }, [favorites]);

    const toggleFavorite = useCallback((item: FavoriteItem) => {
        if (isFavorite(item.id)) {
            removeFavorite(item.id);
            return false;
        } else {
            addFavorite(item);
            return true;
        }
    }, [isFavorite, removeFavorite, addFavorite]);

    return {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        isLoaded
    };
}

/**
 * Standalone functions for components that can't use hooks
 */
export function getFavorites(): FavoriteItem[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error("Failed to get favorites:", e);
    }
    return [];
}

export function checkIsFavorite(id: string): boolean {
    const favorites = getFavorites();
    return favorites.some(f => f.id === id);
}
