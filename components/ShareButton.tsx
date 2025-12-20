"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;

        // Try Native Share
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                return;
            } catch (error) {
                console.error("Error sharing:", error);
            }
        }

        // Fallback to Clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex-1 bg-gray-100 text-gray-800 text-center py-3 font-bold uppercase text-sm hover:bg-gray-200 flex justify-center items-center gap-2 transition-colors"
            aria-label="Share this post"
        >
            {copied ? (
                <>
                    <Check size={18} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                </>
            ) : (
                <>
                    <Share2 size={18} />
                    <span>Share</span>
                </>
            )}
        </button>
    );
}
