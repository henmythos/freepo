"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Post, CityStats, Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_IMAGES, TOP_CITIES } from "@/lib/constants";
import PostCard from "@/components/PostCard";
import GridPostCard from "@/components/GridPostCard";
import {
    Search,
    Plus,
    TrendingUp,
    Loader2,
    ChevronDown,
    Rss,
    Phone,
} from "lucide-react";

import useDebounce from "@/lib/useDebounce";
import RecentlyViewed from "@/components/RecentlyViewed";

export default function HomeClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState<CityStats[]>([]);

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);

    // Normalize category from URL or default to 'All'
    const validCategory = (param: string | null): Category | "All" => {
        if (!param) return "All";
        if (param === "All") return "All";
        return CATEGORIES.includes(param as Category) ? (param as Category) : "All";
    };

    const [activeCategory, setActiveCategory] = useState<Category | "All">(
        validCategory(searchParams.get("category"))
    );

    const [activeCity, setActiveCity] = useState<string>(searchParams.get("city") || "");

    // Sync State -> URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeCity) params.set("city", activeCity);
        if (activeCategory !== "All") params.set("category", activeCategory);
        if (debouncedSearch) params.set("search", debouncedSearch);

        // Update URL without reloading page
        const newUrl = params.toString() ? `?${params.toString()}` : "/";
        router.replace(newUrl, { scroll: false });
    }, [activeCity, activeCategory, debouncedSearch, router]);


    // Cursor-based pagination state
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Feature 1: Client-Side City Filter
    // We bind this to activeCity now for simpler UX, or keep separate?
    // The user's request implies "selecting city" maps to the main filter. 
    // In the original code, `selectedCity` (dropdown) and `activeCity` (sidebar) were slightly different but overlap.
    // The sidebar set `activeCity` which triggered API calls. 
    // The dropdown set `selectedCity` which did client-side filtering.
    // To solve the persistence issue properly, we should UNIFY these. 
    // If the user selects a city in dropdown, it should update URL and refetch/filter.
    // Let's alias `selectedCity` to `activeCity` to fix the confusion and ensure URL sync works for both.

    // So we remove distinct `selectedCity` state and just use `activeCity`.
    const [localityFilter, setLocalityFilter] = useState("");

    // Feature 2: Grid View Categories
    const GRID_CATEGORIES = ["cars", "bikes", "properties", "rentals", "buy/sell", "electronics"];
    const isGridView = GRID_CATEGORIES.includes(activeCategory.toLowerCase());

    // Derived filtered posts 
    // We already filter by API for `activeCity`. 
    // If the API returns city-specific posts, client-side filter is redundant unless for mixed results.
    // Original code: `activeCity` passed to API. `selectedCity` filtered client side.
    // We will use `activeCity` for EVERYTHING to ensure consistency.
    const filteredPosts = posts.filter(post => {
        // Locality Filter
        if (localityFilter) {
            const loc = post.locality?.toLowerCase() || "";
            if (!loc.includes(localityFilter.toLowerCase())) return false;
        }
        return true;
    });


    // Initial Data Fetch
    useEffect(() => {
        setHasMore(true);
        setNextCursor(null);
        setPosts([]);
        // Don't reset filters here as they drive the fetch

        const fetchInitial = async () => {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (activeCity) params.set("city", activeCity);
            if (activeCategory !== "All") params.set("category", activeCategory);
            if (debouncedSearch) params.set("search", debouncedSearch);

            try {
                const res = await fetch(`/api/posts?${params.toString()}`);
                const fetchedPosts = await res.json();

                if (Array.isArray(fetchedPosts)) {
                    setPosts(fetchedPosts);

                    if (fetchedPosts.length > 0) {
                        const lastPost = fetchedPosts[fetchedPosts.length - 1];
                        setNextCursor(lastPost.created_at);
                    }

                    if (fetchedPosts.length < 20) {
                        setHasMore(false);
                    }
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
                setPosts([]);
            }
            setIsLoading(false);
        };

        fetchInitial();
    }, [activeCategory, activeCity, debouncedSearch]);

    // Load more function
    const loadMore = async () => {
        if (isLoadingMore || !hasMore || !nextCursor) return;

        setIsLoadingMore(true);
        const params = new URLSearchParams();
        if (activeCity) params.set("city", activeCity);
        if (activeCategory !== "All") params.set("category", activeCategory);
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("cursor", nextCursor);

        try {
            const res = await fetch(`/api/posts?${params.toString()}`);
            const newPosts: Post[] = await res.json();

            if (newPosts.length > 0) {
                setPosts(prev => [...prev, ...newPosts]);
                const lastPost = newPosts[newPosts.length - 1];
                setNextCursor(lastPost.created_at);
            }

            if (newPosts.length < 20) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more posts:", error);
        }
        setIsLoadingMore(false);
    };

    // Locality State & Fetching
    const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);

    useEffect(() => {
        if (!activeCity || activeCity === "All") {
            setAvailableLocalities([]);
            setLocalityFilter("");
            return;
        }

        const fetchLocalities = async () => {
            try {
                const res = await fetch(`/api/localities?city=${encodeURIComponent(activeCity)}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAvailableLocalities(data);
                }
            } catch (err) {
                console.error("Failed to fetch localities", err);
            }
        };

        fetchLocalities();
    }, [activeCity]);

    // SEO Dynamic Title Logic
    // MODIFIED: Homepage (/) always stays "Freepo.in" even if filtered.
    // Dynamic titles only apply if we were on a specific route (e.g. /city/...) or 
    // if the user specifically requested dynamic behavior. Current prompt asks to RESTORE homepage layout.

    // We can use usePathname() to detect if we are on root or sub-page
    const pathname = usePathname();
    const isCityPage = pathname?.startsWith("/city/");

    const getDynamicTitle = () => {
        if (isCityPage && activeCity) {
            if (activeCategory && activeCategory !== "All") {
                return `${activeCategory} in ${activeCity}`;
            }
            return `Classifieds in ${activeCity}`;
        }
        return "Freepo.in";
    };

    const getDynamicSubTitle = () => {
        if (isCityPage && activeCity) {
            return `Buy & Sell Used Cars, Mobiles, Bikes in ${activeCity}`;
        }
        return "India's #1 Newspaper Style Classifieds - Buy, Sell, Rent, Jobs";
    };

    return (
        <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-0 md:px-6 lg:px-8 md:border-x border-gray-200 md:shadow-2xl bg-paper overflow-x-hidden">
            {/* Header */}
            <header className="border-b-4 border-black py-2 md:py-6 text-center relative px-4">
                <Link href="/" className="block">
                    <h1 className="font-serif text-3xl md:text-6xl font-black tracking-tighter uppercase mb-1 md:mb-2 leading-none break-words">
                        {getDynamicTitle()}
                    </h1>
                </Link>
                <div className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 md:mb-4">
                    {getDynamicSubTitle()}
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>

                {/* Responsive Ticker */}
                <div className="flex flex-wrap justify-center items-center gap-1 md:gap-4 text-[9px] md:text-sm font-bold uppercase tracking-wider md:tracking-widest border-t border-b border-black py-1.5 md:py-2 mt-1 md:mt-2 px-1">
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
            <main className="flex-grow py-2 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-0">
                {/* Left Sidebar */}
                <aside className="hidden lg:block lg:col-span-3 space-y-6 border-r border-gray-200 pr-6">
                    {/* Recently Viewed */}
                    <RecentlyViewed />

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

                    <div className="bg-[#fffdf5] p-4 border-2 border-dashed border-gray-400 text-xs text-justify font-serif relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fffdf5] px-2 font-bold uppercase tracking-widest text-red-600">
                            Public Notice
                        </div>
                        <strong className="text-red-600">SAFETY WARNING:</strong> Never transfer money online before
                        seeing the item. Meet in public places.
                        <Link
                            href="/safety"
                            className="block mt-2 font-bold underline decoration-dotted hover:text-red-600"
                        >
                            Read Official Safety Guidelines
                        </Link>
                    </div>
                </aside>

                {/* Center */}
                <div className="col-span-1 lg:col-span-6">
                    {/* Mobile Actions */}
                    <div className="lg:hidden mb-2 flex gap-2">
                        <Link
                            href="/post-ad"
                            className="flex-1 bg-black text-white text-center py-3 font-bold uppercase text-sm"
                        >
                            Post Ad
                        </Link>
                    </div>

                    {/* Mobile Trending Cities Scroll */}
                    <div className="lg:hidden mb-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                        <div className="flex gap-2">
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
                    <div className="mb-4 space-y-3">
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

                        <div className="flex items-center gap-2">
                            <div className="relative inline-block text-left">
                                <select
                                    value={activeCity || "All"}
                                    onChange={(e) => setActiveCity(e.target.value === "All" ? "" : e.target.value)}
                                    className="appearance-none bg-white font-bold text-xs uppercase tracking-wider pl-3 pr-8 py-1.5 border border-gray-300 rounded hover:border-black focus:outline-none cursor-pointer"
                                >
                                    <option value="All">All Cities</option>
                                    {TOP_CITIES.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Locality Filter Dropdown */}
                            {activeCity ? (
                                <div className="relative inline-block text-left flex-1 max-w-[200px]">
                                    <select
                                        value={localityFilter}
                                        onChange={(e) => setLocalityFilter(e.target.value)}
                                        className="w-full appearance-none bg-white text-xs pl-3 pr-8 py-1.5 border border-gray-300 rounded hover:border-black focus:outline-none cursor-pointer"
                                    >
                                        <option value="">All Localities in {activeCity}</option>
                                        {availableLocalities.length > 0 ? (
                                            availableLocalities.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Loading localities...</option>
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Select city first..."
                                    disabled
                                    className="px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs w-[140px] cursor-not-allowed text-gray-400"
                                />
                            )}
                        </div>

                        {activeCity && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold">Server Filter:</span>
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
                        ) : (
                            <>
                                {localityFilter && filteredPosts.length === 0 && posts.length > 0 && (
                                    <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 rounded">
                                        <strong>Note:</strong> We couldn&apos;t find ads in <strong>{localityFilter}</strong> yet.
                                        Showing all ads in <strong>{activeCity}</strong>.
                                    </div>
                                )}

                                {(filteredPosts.length > 0 ? filteredPosts : posts).length > 0 ? (
                                    <>
                                        {isGridView ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {(filteredPosts.length > 0 ? filteredPosts : posts).map((post) => (
                                                    <GridPostCard key={post.id} post={post} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-0">
                                                {(filteredPosts.length > 0 ? filteredPosts : posts).map((post) => (
                                                    <PostCard key={post.id} post={post} />
                                                ))}
                                            </div>
                                        )}

                                        {hasMore && (
                                            <div className="py-6 text-center">
                                                <button
                                                    onClick={loadMore}
                                                    disabled={isLoadingMore}
                                                    className="bg-black text-white px-8 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition disabled:opacity-50 inline-flex items-center gap-2"
                                                >
                                                    {isLoadingMore ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        "Load More"
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-20 text-gray-400 font-serif italic">
                                        No ads found.
                                    </div>
                                )}
                            </>
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

            {/* SEO Content Section */}
            <section className="border-t-2 border-gray-200 py-10 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-serif text-2xl font-bold mb-6 text-center">
                        Free Classifieds India - Post Free Ads
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-700 leading-relaxed">
                        <article>
                            <h3 className="font-bold text-black mb-2">Jobs Near Me India</h3>
                            <p className="mb-4">
                                Find the best jobs near you in India. Whether you&apos;re looking for full-time jobs, part-time work,
                                remote opportunities, or internships - Freepo.in connects job seekers with employers across
                                Mumbai, Delhi, Bangalore, Hyderabad, Chennai, and 500+ cities. Post job vacancies for free!
                            </p>

                            <h3 className="font-bold text-black mb-2">Rentals & Properties India</h3>
                            <p>
                                Discover flats for rent, PG accommodations, houses, and commercial properties across India.
                                List your rental property for free on Freepo.in - India&apos;s fastest-growing classifieds platform.
                            </p>
                        </article>

                        <article>
                            <h3 className="font-bold text-black mb-2">Buy & Sell Locally</h3>
                            <p className="mb-4">
                                Buy and sell used cars, bikes, electronics, furniture, and more. Freepo.in is your local
                                classifieds marketplace - 100% free, no login required. Perfect OLX alternative for Indians!
                            </p>

                            <h3 className="font-bold text-black mb-2">City Classifieds</h3>
                            <p>
                                Browse classifieds by city: Hyderabad, Mumbai, Delhi, Bangalore, Chennai, Kolkata, Pune,
                                Ahmedabad, Jaipur, and more. Find local listings near you instantly.
                            </p>
                        </article>
                    </div>

                    {/* City Links for SEO */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Popular Cities</h4>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna"].map((city) => (
                                <button
                                    key={city}
                                    onClick={() => setActiveCity(city)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                                >
                                    {city} Classifieds
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Links for SEO */}
                    <div className="mt-6">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Browse Categories</h4>
                        <div className="flex flex-wrap gap-3 text-xs">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition"
                                >
                                    {cat} India
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-black py-6 md:py-10 bg-gray-50 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 text-sm">
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
                        {/* Platform Stats */}
                        {stats.length > 0 && (
                            <div className="flex justify-center gap-6 mb-4 text-xs font-mono text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {stats.reduce((sum, s) => sum + s.posts_count, 0).toLocaleString()}+ Listings
                                </span>
                                <span>{stats.length}+ Cities</span>
                            </div>
                        )}
                        <div className="font-serif text-xl font-bold mb-2">
                            Freepo.in
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Made in India 🇮🇳</p>
                        <p className="text-xs font-mono text-gray-400">
                            © 2024 freepo.in
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
