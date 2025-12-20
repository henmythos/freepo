"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X } from "lucide-react";

interface RecentItem {
    id: string;
    title: string;
    slug: string;
    timestamp: number;
}

export default function RecentlyViewed() {
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("freepo_recent");
            if (stored) {
                const items: RecentItem[] = JSON.parse(stored);
                // Only show items from last 7 days
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const filtered = items.filter(i => i.timestamp > weekAgo).slice(0, 5);
                setRecentItems(filtered);
            }
        } catch (e) {
            // Ignore localStorage errors
        }
    }, []);

    if (recentItems.length === 0) return null;

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-600"
            >
                <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Recently Viewed ({recentItems.length})
                </span>
                <span className="text-gray-400">{isExpanded ? "−" : "+"}</span>
            </button>

            {isExpanded && (
                <ul className="mt-3 space-y-2">
                    {recentItems.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={`/item/${item.slug}`}
                                className="block text-sm text-gray-700 hover:text-black hover:underline truncate"
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => {
                                localStorage.removeItem("freepo_recent");
                                setRecentItems([]);
                            }}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-2"
                        >
                            <X size={12} /> Clear History
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
}

// Utility function to add an item to recently viewed
export function addToRecentlyViewed(id: string, title: string, slug: string) {
    try {
        const stored = localStorage.getItem("freepo_recent");
        let items: RecentItem[] = stored ? JSON.parse(stored) : [];

        // Remove if already exists
        items = items.filter(i => i.id !== id);

        // Add to front
        items.unshift({ id, title, slug, timestamp: Date.now() });

        // Keep only last 10
        items = items.slice(0, 10);

        localStorage.setItem("freepo_recent", JSON.stringify(items));
    } catch (e) {
        // Ignore localStorage errors
    }
}
