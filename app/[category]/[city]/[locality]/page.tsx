import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, MapPin, Search, Plus, Info } from "lucide-react";

import { getDB } from "@/lib/db";
import { Post } from "@/lib/types";
import { TOP_CITIES, CATEGORIES } from "@/lib/constants";
import PostCard from "@/components/PostCard";
import GridPostCard from "@/components/GridPostCard";

interface PageProps {
    params: {
        category: string;
        city: string;
        locality: string;
    };
}

// Helper to format text (e.g., "andheri-east" -> "Andheri East")
function formatSlug(slug: string) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// 1. Data Fetching
async function getLocalityPosts(category: string, city: string, localitySlug: string): Promise<{ exact: Post[], nearby: Post[] }> {
    try {
        const db = getDB();

        // Normalize inputs
        const dbCategory = formatSlug(category); // "used-cars" -> "Used Cars" (rough approx, handled by collation usually or exact match if slug matches DB)
        // Better: We should map slug to exact Category Enum if possible, or use LIKE
        // For simplicity and robustness with SQLite's loose typing, we'll try standard formatting
        // Actually, let's treat category strictly if it matches known ones, else loosely
        const isAllCategory = category.toLowerCase() === "all" || category.toLowerCase() === "classifieds";

        const knownCat = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase());
        const targetCat = knownCat || category; // Fallback

        const dbCity = city; // handled by COLLATE NOCASE in query
        const localityName = formatSlug(localitySlug); // "andheri-east" -> "Andheri East"

        // 1. Get Exact Matches (Locality + City + Category)
        const sqlExact = isAllCategory
            ? `SELECT * FROM posts WHERE city = ? COLLATE NOCASE AND locality LIKE ? ORDER BY created_at DESC LIMIT 20`
            : `SELECT * FROM posts WHERE category = ? COLLATE NOCASE AND city = ? COLLATE NOCASE AND locality LIKE ? ORDER BY created_at DESC LIMIT 20`;

        const argsExact = isAllCategory
            ? [dbCity, `%${localityName}%`]
            : [targetCat, dbCity, `%${localityName}%`];

        const exactResult = await db.execute({
            sql: sqlExact,
            args: argsExact,
        });

        // 2. Get Nearby/City Matches (City + Category, EXCLUDING exact matches already found)
        // We fetch these ONLY if we have few exact results, to fill the page
        let nearbyResult: any[] = [];
        if (exactResult.rows.length < 10) {
            const exactIds = exactResult.rows.map((r: any) => r.id);
            // SQLite doesn't support array params easily in node-libsql standard execute without spread
            // Simple workaround: Fetch top 20 city posts and filter in JS if needed, or simple query
            const sqlNearby = isAllCategory
                ? `SELECT * FROM posts WHERE city = ? COLLATE NOCASE AND (locality NOT LIKE ? OR locality IS NULL) ORDER BY created_at DESC LIMIT 20`
                : `SELECT * FROM posts WHERE category = ? COLLATE NOCASE AND city = ? COLLATE NOCASE AND (locality NOT LIKE ? OR locality IS NULL) ORDER BY created_at DESC LIMIT 20`;

            const argsNearby = isAllCategory
                ? [dbCity, `%${localityName}%`]
                : [targetCat, dbCity, `%${localityName}%`];

            const nearbyRes = await db.execute({
                sql: sqlNearby,
                args: argsNearby
            });
            nearbyResult = nearbyRes.rows;
        }

        return {
            exact: exactResult.rows as unknown as Post[],
            nearby: nearbyResult as unknown as Post[]
        };

    } catch (e) {
        console.error("[GET LOCALITY POSTS ERROR]", e);
        return { exact: [], nearby: [] };
    }
}

// 2. Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, city, locality } = params;

    // Quick Validation
    const isSpecialCategory = category.toLowerCase() === "all" || category.toLowerCase() === "classifieds";
    if (!isSpecialCategory && !CATEGORIES.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
        return { title: "Category Not Found" };
    }

    const displayLocality = formatSlug(locality);
    const displayCity = formatSlug(city);
    const displayCategory = formatSlug(category);

    return {
        title: `${displayCategory} in ${displayLocality}, ${displayCity} - Free Classifieds | Freepo.in`,
        description: `Find ${displayCategory} in ${displayLocality}, ${displayCity}. Buy, sell, rent, and find jobs in ${displayLocality}. Best free alternative to OLX & Quikr in ${displayCity}.`,
        alternates: {
            canonical: `https://freepo.in/${category.toLowerCase()}/${city.toLowerCase()}/${locality.toLowerCase()}`,
        },
        openGraph: {
            title: `${displayCategory} in ${displayLocality} | Freepo.in`,
            description: `Browse 100% free listings for ${displayCategory} in ${displayLocality}, ${displayCity}. No middleman, direct contact.`,
        },
    };
}

// 3. Page Component
export default async function LocalityPage({ params }: PageProps) {
    const { category, city, locality } = params;

    // Normalize
    const displayLocality = formatSlug(locality);
    const displayCity = formatSlug(city);
    const displayCategory = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase()) || formatSlug(category);

    // Fetch Data
    const { exact, nearby } = await getLocalityPosts(category, city, locality);

    // Schema Markup (Breadcrumb + Collection)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${displayCategory} in ${displayLocality}`,
        "description": `Free classifieds for ${displayCategory} in ${displayLocality}, ${displayCity}.`,
        "url": `https://freepo.in/${category}/${city}/${locality}`,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://freepo.in" },
                { "@type": "ListItem", "position": 2, "name": displayCity, "item": `https://freepo.in/city/${city}` },
                { "@type": "ListItem", "position": 3, "name": displayCategory, "item": `https://freepo.in/?category=${displayCategory}&city=${displayCity}` },
                { "@type": "ListItem", "position": 4, "name": displayLocality, "item": `https://freepo.in/${category}/${city}/${locality}` }
            ]
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-ink">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 pt-6 pb-8 px-4 shadow-sm">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-black hover:underline">Home</Link>
                        <span>/</span>
                        <Link href={`/city/${city}`} className="hover:text-black hover:underline">{displayCity}</Link>
                        <span>/</span>
                        <span className="text-black">{displayLocality}</span>
                    </nav>

                    <h1 className="font-serif text-3xl md:text-4xl font-black text-black mb-3 leading-tight">
                        {displayCategory} in {displayLocality}, {displayCity}
                    </h1>

                    <p className="text-sm md:text-base text-gray-600 max-w-3xl leading-relaxed">
                        Looking for <strong>{displayCategory}</strong> in <strong>{displayLocality}</strong>?
                        Freepo.in is {displayCity}&apos;s fastest growing free market.
                        No hidden fees, no login required to browse.
                        Directly contact sellers in {displayLocality}.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* EXACT MATCHES */}
                {exact.length > 0 ? (
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                                <MapPin size={20} className="text-red-500" />
                                Listings in {displayLocality}
                            </h2>
                            <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">
                                {exact.length} Results
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {exact.map(post => (
                                <GridPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE - NO EXACT MATCHES */
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-6 mb-12 text-center md:text-left md:flex items-center justify-between gap-6">
                        <div>
                            <h2 className="font-bold text-lg text-yellow-900 mb-1 flex items-center gap-2">
                                <Info size={20} />
                                No active listings in {displayLocality} yet
                            </h2>
                            <p className="text-sm text-yellow-800">
                                Be the first to post a {displayCategory} ad in {displayLocality}! It's free and takes 30 seconds.
                            </p>
                        </div>
                        <Link
                            href="/post-ad"
                            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded font-bold uppercase text-xs tracking-wider hover:bg-gray-800 transition"
                        >
                            <Plus size={16} /> Post Free Ad
                        </Link>
                    </div>
                )}

                {/* NEARBY / CITY WIDE */}
                {nearby.length > 0 && (
                    <div className="pt-8 border-t border-gray-200">
                        <h2 className="font-serif text-xl font-bold mb-2 text-gray-500 uppercase tracking-widest text-xs">
                            Nearby in {displayCity}
                        </h2>
                        <p className="text-gray-600 italic mb-6 text-sm">
                            Since we found limited results in {displayLocality}, here are some options from the rest of {displayCity}.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {nearby.map(post => (
                                <GridPostCard key={post.id} post={post} />
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <Link
                                href={`/city/${city}`}
                                className="inline-block border border-black px-6 py-2 rounded-full font-bold text-sm uppercase hover:bg-black hover:text-white transition"
                            >
                                View All Ads in {displayCity}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* SEO Footer Text */}
            <div className="bg-white border-t border-gray-200 py-10 px-4 mt-8">
                <div className="max-w-4xl mx-auto text-center text-xs text-gray-400 leading-relaxed">
                    <p className="mb-2">
                        <strong>Why Freepo {displayCity}?</strong> We are building a hyperlocal marketplace to challenge paid platforms.
                        Our mission is to keep classifieds free forever.
                    </p>
                    <p>
                        Popular localities in {displayCity}: {displayLocality} is one of the top requested areas for {displayCategory}.
                        If you are selling, post here for maximum visibility among local buyers.
                    </p>
                </div>
            </div>
        </div>
    );
}
