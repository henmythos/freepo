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
    }, [id, title, slug]);

    return null; // This component renders nothing
}
