"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { generateSlug } from "@/lib/slugUtils";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/priceUtils";

interface GridPostCardProps {
    post: Post;
    priority?: boolean;
}

export default function GridPostCard({ post, priority = false }: GridPostCardProps) {
    const slug = generateSlug(post.title, post.city, post.category);

    // Check if post is less than 24 hours old
    const isNew = Date.now() - new Date(post.created_at).getTime() < 24 * 60 * 60 * 1000;

    return (
        <Link href={`/item/${slug}-iid-${post.id}`} className="block h-full">
            <article className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col ${(post.category === "Jobs" || post.category === "Services") ? "bg-[#fffdf5]" : "bg-white"
                }`}>
                {/* Image Section - Square & Contained */}
                <div className="relative aspect-square bg-white overflow-hidden border-b border-gray-100">
                    {post.image1 ? (
                        <Image
                            src={post.image1}
                            alt={post.image1_alt || post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            priority={priority}
                            unoptimized
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
                    {post.price && (
                        <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-sm font-bold shadow-sm">
                            {formatPrice(post.price)}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col flex-grow justify-between">
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
            </article>
        </Link>
    );
}
