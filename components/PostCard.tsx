"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ImageIcon } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="flex items-start gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
        {/* Fixed size image container - always rendered for alignment */}
        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
          {post.image1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image1}
              alt={post.image1_alt || post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Content container */}
        <div className="flex flex-col flex-grow min-w-0">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-1">
            <span className="bg-gray-100 px-1.5 py-0.5 font-medium uppercase tracking-wide text-[10px]">
              {post.category}
            </span>
            <span>{post.city}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-base font-bold text-ink leading-snug mb-0.5 line-clamp-2">
            {post.title}
          </h2>

          {/* Price/Salary inline */}
          <div className="flex items-center gap-2 mt-auto">
            {post.price && (
              <span className="font-bold text-sm text-ink">{post.price}</span>
            )}
            {post.salary && (
              <span className="font-bold text-sm text-ink">{post.salary}</span>
            )}
            {post.job_type && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {post.job_type}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}