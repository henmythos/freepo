"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { generateSlug } from "@/lib/slugUtils";
import { MapPin } from "lucide-react";

interface GridPostCardProps {
    post: Post;
}

export default function GridPostCard({ post }: GridPostCardProps) {
    const slug = generateSlug(post.title, post.city, post.category);

    return (
        <Link href={`/item/${slug}-iid-${post.id}`} className="block h-full">
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col bg-white">
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {post.image1 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={post.image1}
                            alt={post.image1_alt || post.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-xs uppercase font-bold tracking-widest">
                            No Photo
                        </div>
                    )}
                    {post.price && (
                        <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-sm font-bold shadow-sm">
                            {post.price}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col flex-grow justify-between">
                    <div>
                        <h2 className="font-serif text-base font-bold text-ink leading-tight mb-1 line-clamp-2">
                            {post.title}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <MapPin size={12} />
                            <span className="truncate">{post.city}</span>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider pt-2 border-t border-gray-100 mt-2">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                </div>
            </article>
        </Link>
    );
}
