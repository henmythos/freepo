"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Post, CityStats, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_IMAGES } from "@/lib/constants";
import PostCard from "@/components/PostCard";
import {
    Search,
    Plus,
    TrendingUp,
    Loader2,
    ChevronDown,
    Rss,
    Phone,
} from "lucide-react";

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function HomePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState<CityStats[]>([]);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
    const [activeCity, setActiveCity] = useState<string>("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        fetch("/api/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(console.error);
    }, []);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setPosts([]);
    }, [activeCategory, activeCity, debouncedSearch]);

    useEffect(() => {
        const fetchPosts = async () => {
            const isFirstPage = page === 1;
            if (isFirstPage) setIsLoading(true);
            else setIsLoadingMore(true);

            const params = new URLSearchParams();
            if (activeCity) params.set("city", activeCity);
            if (activeCategory !== "All") params.set("category", activeCategory);
            if (debouncedSearch) params.set("search", debouncedSearch);
            params.set("page", page.toString());

            try {
                const res = await fetch(`/api/posts?${params.toString()}`);
                const fetchedPosts = await res.json();

                if (isFirstPage) {
                    setPosts(fetchedPosts);
                } else {
                    setPosts((prev) => [...prev, ...fetchedPosts]);
                }

                if (fetchedPosts.length < 20) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }

            setIsLoading(false);
            setIsLoadingMore(false);
        };

        fetchPosts();
    }, [activeCategory, activeCity, debouncedSearch, page]);

    return (
        <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-0 md:px-6 lg:px-8 md:border-x border-gray-200 md:shadow-2xl bg-paper overflow-x-hidden">
            {/* Header */}
            <header className="border-b-4 border-black py-4 md:py-8 text-center relative px-4">
                <Link href="/" className="block">
                    <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2 leading-none break-words">
                        Freepo.online
                    </h1>
                </Link>
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

                {/* Responsive Ticker */}
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-[9px] sm:text-[10px] md:text-sm font-bold uppercase tracking-wider md:tracking-widest border-t border-b border-black py-2 mt-2 md:mt-4 px-2">
                    <span className="flex-shrink-0">India&apos;s Classifieds</span>
                    <span className="w-1 h-1 bg-black rounded-full flex-shrink-0 hidden sm:block"></span>
                    <span className="flex-shrink-0">
                        {new Date().toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                    <span className="w-1 h-1 bg-black rounded-full flex-shrink-0 hidden sm:block"></span>
                    <span className="flex-shrink-0">Free Forever</span>
                </div>

                <div className="absolute right-0 top-8 hidden md:block pr-4">
                    <Link
                        href="/post-ad"
                        className="bg-black text-white px-6 py-2 font-bold uppercase tracking-wider hover:bg-gray-800 transition"
                    >
                        <Plus className="inline mb-1 mr-1" size={16} /> Post Ad
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="flex-grow py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0">
                {/* Left Sidebar */}
                <aside className="hidden lg:block lg:col-span-3 space-y-8 border-r border-gray-200 pr-6">
                    <div>
                        <h3 className="font-bold border-b-2 border-black pb-1 mb-3 flex items-center gap-2 uppercase">
                            <TrendingUp size={16} /> Trending Cities
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {stats.length > 0 ? (
                                stats.slice(0, 10).map((s, i) => (
                                    <li
                                        key={s.city}
                                        onClick={() =>
                                            setActiveCity(activeCity === s.city ? "" : s.city)
                                        }
                                        className={`flex justify-between cursor-pointer hover:underline ${activeCity === s.city ? "font-bold" : ""}`}
                                    >
                                        <span>
                                            {i + 1}. {s.city}
                                        </span>
                                        <span className="text-gray-500">{s.posts_count}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 italic">No trend data yet</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-gray-100 p-4 border border-gray-300 text-xs text-justify font-serif">
                        <strong>SAFETY NOTICE:</strong> Never transfer money online before
                        seeing the item.
                        <Link
                            href="/safety"
                            className="block mt-2 font-bold underline"
                        >
                            Read Safety Tips
                        </Link>
                    </div>
                </aside>

                {/* Center */}
                <div className="col-span-1 lg:col-span-6">
                    {/* Mobile Actions */}
                    <div className="lg:hidden mb-6 flex gap-2">
                        <Link
                            href="/post-ad"
                            className="flex-1 bg-black text-white text-center py-3 font-bold uppercase text-sm"
                        >
                            Post Ad
                        </Link>
                    </div>

                    {/* Mobile Trending Cities Scroll */}
                    <div className="lg:hidden mb-6 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                        <div className="flex gap-3">
                            {stats.slice(0, 8).map((s) => (
                                <button
                                    key={s.city}
                                    onClick={() =>
                                        setActiveCity(activeCity === s.city ? "" : s.city)
                                    }
                                    className={`whitespace-nowrap px-3 py-1 border border-gray-400 rounded-full text-xs font-bold ${activeCity === s.city ? "bg-black text-white border-black" : "bg-white"}`}
                                >
                                    {s.city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-3 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search jobs, cars..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none bg-transparent font-serif text-lg placeholder:font-sans rounded-none"
                            />
                        </div>

                        {/* Categories Tab */}
                        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                            <button
                                onClick={() => setActiveCategory("All")}
                                className={`whitespace-nowrap px-4 py-1 border border-black text-sm uppercase font-bold transition-all
                ${activeCategory === "All" ? "bg-black text-white" : "bg-transparent hover:bg-gray-100"}`}
                            >
                                All
                            </button>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCategory(c)}
                                    className={`whitespace-nowrap px-4 py-1 border border-black text-sm uppercase font-bold transition-all
                  ${activeCategory === c ? "bg-black text-white" : "bg-transparent hover:bg-gray-100"}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {activeCity && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold">Filtering by:</span>
                                <span className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                                    {activeCity}
                                    <button
                                        onClick={() => setActiveCity("")}
                                        className="font-bold ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Listings */}
                    <div className="space-y-0 min-h-[400px]">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin" size={30} />
                            </div>
                        ) : posts.length > 0 ? (
                            <>
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}

                                {hasMore && (
                                    <div className="py-8 text-center">
                                        <button
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={isLoadingMore}
                                            className="bg-gray-100 hover:bg-black hover:text-white border-2 border-black px-6 py-2 font-bold uppercase text-sm tracking-widest transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                                        >
                                            {isLoadingMore ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 text-gray-400 font-serif italic">
                                No ads found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="hidden lg:block lg:col-span-3 border-l border-gray-200 pl-6">
                    <div className="sticky top-6">
                        <div className="border border-black p-4 text-center mb-8">
                            <h4 className="font-serif text-xl font-bold mb-2">Quick Post</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Sell your old phone, find a flatmate, or hire staff in seconds.
                            </p>
                            <Link
                                href="/post-ad"
                                className="block w-full bg-black text-white py-2 font-bold uppercase text-sm hover:bg-gray-800"
                            >
                                Start Now
                            </Link>
                        </div>

                        <h3 className="font-bold border-b-2 border-black pb-1 mb-3 uppercase">
                            Categories
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li
                                onClick={() => setActiveCategory("All")}
                                className={`cursor-pointer hover:underline ${activeCategory === "All" ? "font-bold" : ""}`}
                            >
                                All Categories
                            </li>
                            {CATEGORIES.map((c) => (
                                <li
                                    key={c}
                                    onClick={() =>
                                        setActiveCategory(activeCategory === c ? "All" : c)
                                    }
                                    className={`cursor-pointer hover:underline ${activeCategory === c ? "font-bold" : ""}`}
                                >
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Mobile Sticky FAB */}
                <Link
                    href="/post-ad"
                    className="lg:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center"
                >
                    <Plus size={24} />
                </Link>
            </main>

            {/* Footer */}
            <footer className="border-t-4 border-black py-10 bg-gray-50 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
                        <div className="text-left">
                            <h5 className="font-bold uppercase mb-2">Company</h5>
                            <ul className="space-y-1 text-gray-600">
                                <li>
                                    <Link href="/about" className="hover:text-black hover:underline">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="hover:text-black hover:underline">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/post-ad" className="hover:text-black hover:underline">
                                        Post Ad
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/my-ads" className="hover:text-black hover:underline">
                                        Manage My Ads
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/api/feed"
                                        target="_blank"
                                        className="hover:text-black hover:underline flex items-center gap-1"
                                    >
                                        <Rss size={12} /> RSS Feed
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="text-left">
                            <h5 className="font-bold uppercase mb-2">Legal</h5>
                            <ul className="space-y-1 text-gray-600">
                                <li>
                                    <Link href="/privacy" className="hover:text-black hover:underline">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="hover:text-black hover:underline">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/safety" className="hover:text-black hover:underline">
                                        Safety Tips
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="/api/sitemap"
                                        target="_blank"
                                        className="hover:text-black hover:underline"
                                    >
                                        Sitemap
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-span-2 text-left bg-red-50 p-4 border border-red-100 rounded">
                            <h5 className="font-bold uppercase mb-2 text-red-700 flex items-center gap-1">
                                <Phone size={14} /> India Emergency Numbers
                            </h5>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-gray-700">
                                <li>
                                    Police: <strong>100</strong> / <strong>112</strong>
                                </li>
                                <li>
                                    Fire: <strong>101</strong>
                                </li>
                                <li>
                                    Ambulance: <strong>102</strong>
                                </li>
                                <li>
                                    Women Help: <strong>1091</strong>
                                </li>
                                <li>
                                    Cyber Crime: <strong>1930</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-300 pt-6">
                        <div className="font-serif text-xl font-bold mb-2">
                            Freepo.online
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Made in India 🇮🇳</p>
                        <p className="text-xs font-mono text-gray-400">
                            © 2024 freepo.online
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
