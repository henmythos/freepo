"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FavoriteItem } from "@/lib/useFavorites";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import Image from "next/image";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("freepo_favorites");
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

    const removeFavorite = (id: string) => {
        const updated = favorites.filter(f => f.id !== id);
        setFavorites(updated);
        localStorage.setItem("freepo_favorites", JSON.stringify(updated));
    };

    const clearAll = () => {
        if (confirm("Are you sure you want to clear all favorites?")) {
            setFavorites([]);
            localStorage.removeItem("freepo_favorites");
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-sm font-bold uppercase hover:underline text-gray-500"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Link>
                        <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
                            <Heart className="text-red-500" fill="currentColor" />
                            My Favorites
                        </h1>
                    </div>
                    {favorites.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs font-bold uppercase text-red-500 hover:underline flex items-center gap-1"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>

                {/* Content */}
                {favorites.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart size={64} className="mx-auto text-gray-200 mb-4" />
                        <h2 className="font-serif text-xl text-gray-500 mb-2">No favorites yet</h2>
                        <p className="text-gray-400 mb-6">
                            Click the heart icon on any listing to save it here.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favorites.map((item) => (
                            <div
                                key={item.id}
                                className="border border-gray-200 bg-white p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
                            >
                                <Link href={`/item/${item.slug}-iid-${item.id}`} className="flex gap-4 flex-1 items-center min-w-0">
                                    {item.image ? (
                                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs font-bold">
                                            No Photo
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-serif font-bold text-lg line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.city}</p>
                                        {item.price && (
                                            <p className="text-green-700 font-bold text-sm mt-1">{item.price}</p>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={() => removeFavorite(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove from favorites"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer note */}
                {favorites.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-8">
                        Favorites are stored locally in your browser.
                    </p>
                )}
            </div>
        </div>
    );
}
