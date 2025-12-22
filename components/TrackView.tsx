"use client";

import { useEffect } from "react";
import { addToRecentlyViewed } from "./RecentlyViewed";

interface TrackViewProps {
    id: string;
    title: string;
    slug: string;
}

export default function TrackView({ id, title, slug }: TrackViewProps) {
    useEffect(() => {
        addToRecentlyViewed(id, title, slug);

        // Track view count only ONCE per session per post
        const viewKey = `viewed_post_${id}`;
        if (typeof window !== "undefined" && !sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, "1");
            // Fire and forget - no need to wait
            fetch("/api/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            }).catch(() => { }); // Silently ignore errors
        }
    }, [id, title, slug]);

    return null; // This component renders nothing
}
