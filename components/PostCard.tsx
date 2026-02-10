"use client";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

import { generateSlug } from "@/lib/slugUtils";
import { formatPrice } from "@/lib/priceUtils";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PostCardProps {
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

export default function PostCard({ post, priority = false }: PostCardProps) {
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
    <article className={`border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group relative
      ${(post.category === "Jobs" || post.category === "Services") ? "bg-[#fffdf5] px-2 -mx-2" : ""}
      ${post.listing_plan === "featured_plus_60" ? "border-2 border-transparent bg-yellow-50/70 relative overflow-hidden [background-clip:padding-box] before:absolute before:inset-0 before:-z-10 before:rounded-sm before:bg-gradient-to-r before:from-[#FFD700] before:via-[#FDB931] before:to-[#FFD700] before:m-[-2px] before:content-['']" : ""}
    `}>
      <Link href={`/item/${slug}-iid-${post.id}`} className="flex gap-3 flex-1 min-w-0">
        {post.image1 && (
          <div className="relative w-24 h-24 flex-shrink-0 bg-[#f2f2f2] border border-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={post.image1}
              alt={post.image1_alt || post.title}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
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

              {/* Badges */}
              {(post.listing_plan === "featured_plus_60") && (
                <span className="bg-yellow-400 text-black border border-yellow-600 px-1.5 py-0.5 font-bold uppercase tracking-wide text-[8px]">FEATURED PLUS</span>
              )}
              {((post.listing_plan === "verified_30") || (post.listing_plan === "featured_plus_60")) && (
                <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 font-bold uppercase tracking-wide text-[8px]">VERIFIED</span>
              )}

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
            {post.price && post.price !== "0" && post.price !== "₹0" && (
              <div className="font-bold text-sm text-green-700">{formatPrice(post.price)}</div>
            )}
            {post.salary && post.salary !== "0" && post.salary !== "₹0" && (
              <div className="font-bold text-sm text-green-700">{formatPrice(post.salary)}</div>
            )}
            {/* Price Negotiable Badge */}
            {!!post.is_negotiable && (post.price || post.salary) && (
              <div className="text-[9px] text-orange-600 font-bold uppercase mt-0.5">Negotiable</div>
            )}
            {post.job_type && (
              <div className="text-xs text-gray-500 mt-1">{post.job_type}</div>
            )}
          </div>
        </div>
      </Link>


    </article>
  );
}