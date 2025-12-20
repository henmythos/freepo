"use client";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

import { generateSlug } from "@/lib/slugUtils";
import { formatPrice } from "@/lib/priceUtils";
import { Eye } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const slug = generateSlug(post.title, post.city, post.category);

  // Check if post is less than 24 hours old
  const isNew = Date.now() - new Date(post.created_at).getTime() < 24 * 60 * 60 * 1000;

  return (
    <Link href={`/item/${slug}-iid-${post.id}`} className="block">
      <article className={`border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${(post.category === "Jobs" || post.category === "Services") ? "bg-[#fffdf5] px-2 -mx-2" : ""
        }`}>
        {post.image1 && (
          <div className="relative w-24 h-24 flex-shrink-0 bg-[#f2f2f2] border border-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={post.image1}
              alt={post.image1_alt || post.title}
              width={96}
              height={96}
              className="max-w-full max-h-full w-auto h-auto object-contain block"
              loading="lazy"
            />
            {isNew && (
              <div className="absolute top-1 left-1 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                Fresh
              </div>
            )}
            {/* Image count indicator */}
            {(post.image2 || post.image3 || post.image4 || post.image5) && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                +{[post.image1, post.image2, post.image3, post.image4, post.image5].filter(Boolean).length - 1}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-1 font-mono tracking-tight">
              <span className="bg-gray-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-[10px] font-sans">
                {post.category}
              </span>
              {isNew && !post.image1 && (
                <span className="bg-green-600 text-white px-1.5 py-0.5 font-bold uppercase tracking-wide text-[8px]">Fresh</span>
              )}
              <span>{post.locality ? `${post.city}, ${post.locality}` : post.city}</span>
              <span>|</span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </span>
              {post.views > 0 && (
                <span className="text-gray-400 flex items-center gap-0.5">• <Eye size={12} /> {post.views}</span>
              )}
            </div>
            <h2 className="font-serif text-lg font-bold text-ink leading-tight mb-1 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-1">
              {post.description}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            {post.price && (
              <div className="font-bold text-sm text-ink">{formatPrice(post.price)}</div>
            )}
            {post.salary && (
              <div className="font-bold text-sm text-ink">{formatPrice(post.salary)}</div>
            )}
            {post.job_type && (
              <div className="text-xs text-gray-500 mt-1">{post.job_type}</div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}