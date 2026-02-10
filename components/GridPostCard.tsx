"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { generateSlug } from "@/lib/slugUtils";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/priceUtils";
import { useState, useEffect } from "react";

interface GridPostCardProps {
    post: Post;
    priority?: boolean;
}

// Helper to check if favorite
function checkIsFavorite(id: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        const stored = localStorage.getItem("freepo_favorites");
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) && parsed.some((f: { id: string }) => f.id === id);
        }
    } catch (e) {
        console.error("Failed to check favorite:", e);
    }
    return false;
}

// Helper to toggle favorite
function toggleFavorite(post: Post, slug: string): boolean {
    if (typeof window === "undefined") return false;
    try {
        const stored = localStorage.getItem("freepo_favorites");
        let favorites = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(favorites)) favorites = [];

        const exists = favorites.some((f: { id: string }) => f.id === post.id);
        if (exists) {
            favorites = favorites.filter((f: { id: string }) => f.id !== post.id);
        } else {
            favorites.unshift({
                id: post.id,
                title: post.title,
                slug: slug,
                image: post.image1,
                price: post.price || post.salary,
                city: post.city,
                addedAt: Date.now()
            });
            favorites = favorites.slice(0, 50); // Max 50 favorites
        }
        localStorage.setItem("freepo_favorites", JSON.stringify(favorites));
        return !exists; // Return new state
    } catch (e) {
        console.error("Failed to toggle favorite:", e);
        return false;
    }
}

export default function GridPostCard({ post, priority = false }: GridPostCardProps) {
    const slug = generateSlug(post.title, post.city, post.category);
    const [isFavorite, setIsFavorite] = useState(false);

    // Check favorite status on mount
    useEffect(() => {
        setIsFavorite(checkIsFavorite(post.id));
    }, [post.id]);

    // Check if post is less than 24 hours old
    const isNew = Date.now() - new Date(post.created_at).getTime() < 24 * 60 * 60 * 1000;

    // Handle favorite click
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = toggleFavorite(post, slug);
        setIsFavorite(newState);
    };

    // Handle WhatsApp click
    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const phone = post.whatsapp || post.contact_phone;
        const message = encodeURIComponent(`Hi, I'm interested in your listing "${post.title}" on Freepo.in`);
        window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
    };

    // Show WhatsApp button only if contact preference allows it
    const showWhatsApp = post.contact_preference === "whatsapp" || post.contact_preference === "both" || !post.contact_preference;

    return (
        <article className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col relative group
            ${(post.category === "Jobs" || post.category === "Services") ? "bg-[#fffdf5]" : "bg-white"}
            ${post.listing_plan === "featured_plus_60" ? "border-2 border-yellow-400" : ""}
        `}>
            {/* Image Section - Square & Contained */}
            <Link href={`/item/${slug}-iid-${post.id}`} className="block">
                <div className="relative aspect-square bg-white overflow-hidden border-b border-gray-100">
                    {post.image1 ? (
                        <Image
                            src={post.image1}
                            alt={post.image1_alt || post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            priority={priority}
                            loading={priority ? "eager" : "lazy"}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-xs uppercase font-bold tracking-widest">
                            No Photo
                        </div>
                    )}
                    {isNew && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm">
                            Fresh
                        </div>
                    )}
                    {post.listing_plan === "featured_plus_60" && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-black border border-black text-[9px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm z-10">
                            ⭐ Featured
                        </div>
                    )}
                    {post.listing_plan === "verified_30" && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm z-10">
                            ✓ Verified
                        </div>
                    )}

                    {/* Price Badge */}
                    {post.price && post.price !== "0" && post.price !== "₹0" && (
                        <div className="absolute bottom-2 left-2 bg-green-700 text-white px-2 py-1 text-sm font-bold shadow-sm">
                            {formatPrice(post.price)}
                            {!!post.is_negotiable && (
                                <span className="ml-1 text-[9px] opacity-80">• Neg</span>
                            )}
                        </div>
                    )}

                    {/* Action Buttons - Top right corner */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                        {!isNew && (
                            <button
                                onClick={handleFavoriteClick}
                                className={`p-1.5 rounded-full shadow-md transition-all ${isFavorite
                                    ? "bg-red-500 text-white"
                                    : "bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white"
                                    }`}
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                            </button>
                        )}
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <Link href={`/item/${slug}-iid-${post.id}`} className="block flex-grow">
                <div className="p-3 flex flex-col h-full justify-between">
                    <div>
                        <h2 className="font-serif text-base font-bold text-ink leading-tight mb-1 line-clamp-2">
                            {post.title}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-mono tracking-tight">
                            <MapPin size={12} />
                            <span className="truncate">{post.locality ? `${post.city}, ${post.locality}` : post.city}</span>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2 border-t border-gray-100 mt-2 font-mono">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                </div>
            </Link>

            {/* WhatsApp Quick Button - Bottom of card */}
            {showWhatsApp && (
                <button
                    onClick={handleWhatsAppClick}
                    className="w-full py-2 bg-[#25D366] text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-[#128c7e] transition-colors"
                >
                    <MessageCircle size={14} /> WhatsApp
                </button>
            )}
        </article>
    );
}
