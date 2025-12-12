"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
        {post.image1 && (
          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 border border-gray-200 rounded-md overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image1}
              alt={post.image1_alt || post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex justify-between items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
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
            <h2 className="font-serif text-lg font-bold text-ink leading-tight mb-1 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-1">
              {post.description}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            {post.price && (
              <div className="font-bold text-sm text-ink">{post.price}</div>
            )}
            {post.salary && (
              <div className="font-bold text-sm text-ink">{post.salary}</div>
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