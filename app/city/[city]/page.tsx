import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, MapPin, Search, Plus } from "lucide-react";

import { getDB } from "@/lib/db";
import { Post } from "@/lib/types";
import { CITY_DATA } from "@/lib/cityData";
import { TOP_CITIES, CATEGORIES, CATEGORY_IMAGES } from "@/lib/constants";
import PostCard from "@/components/PostCard";

interface PageProps {
    params: {
        city: string;
    };
}

// 1. Validate Params & SEO
function getCityKey(city: string) {
    return city.toLowerCase();
}

function isValidCity(city: string) {
    // Check against our curated data OR our TOP_CITIES list
    const key = getCityKey(city);
    return !!CITY_DATA[key] || TOP_CITIES.map(c => c.toLowerCase()).includes(key);
}

// 2. Data Fetching
async function getCityPosts(city: string): Promise<Post[]> {
    try {
        const db = getDB();
        // Capitalize for DB query if stored as "Hyderabad"
        const dbCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

        const result = await db.execute({
            sql: `
                SELECT * FROM posts 
                WHERE city = ? COLLATE NOCASE
                ORDER BY created_at DESC 
                LIMIT 20
            `,
            args: [dbCity],
        });

        return result.rows as unknown as Post[];
    } catch (e) {
        console.error("[GET CITY POSTS ERROR]", e);
        return [];
    }
}

// 3. Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { city } = params;
    if (!isValidCity(city)) {
        return { title: "City Not Found" };
    }

    const cityKey = getCityKey(city);
    const cityData = CITY_DATA[cityKey];
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    return {
        title: `Free Classifieds in ${displayCity} – Jobs, Cars, Rentals in ${displayCity} | Freepo.in`,
        description: cityData?.description.replace(/\*\*/g, "") || `Post and find free classified ads in ${displayCity}. Jobs, rentals, cars, bikes, and properties. No login required.`,
        alternates: {
            canonical: `https://freepo.in/city/${cityKey}`,
        },
    };
}

// 4. Page Component
export default async function CityPage({ params }: PageProps) {
    const { city } = params;
    const cityKey = getCityKey(city);

    // Redirect or 404 if invalid
    if (!isValidCity(city)) {
        notFound();
    }

    const displayCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const cityData = CITY_DATA[cityKey] || {
        name: displayCity,
        description: `Welcome to **Freepo.in ${displayCity}** – the best place to find **jobs**, **rentals**, **used cars**, and more in ${displayCity}. Post free ads today and connect with thousands of locals.`,
        neighborhoods: [],
        keywords: [`jobs in ${displayCity}`, `rentals in ${displayCity}`]
    };

    const posts = await getCityPosts(city);

    // Schema Markup
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Classifieds in ${displayCity}`,
        "description": cityData.description.replace(/\*\*/g, ""),
        "url": `https://freepo.in/city/${cityKey}`,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://freepo.in"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": displayCity,
                    "item": `https://freepo.in/city/${cityKey}`
                }
            ]
        },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": posts.map((post, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://freepo.in/post/${post.id}`, // Assuming this route exists
                "name": post.title
            }))
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-ink">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero / Header Section */}
            <div className="bg-white border-b border-gray-200 pt-8 pb-12 px-4 shadow-sm">
                <div className="max-w-4xl mx-auto text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6"
                    >
                        <ArrowLeft size={14} className="mr-1" /> Back to All India
                    </Link>

                    <h1 className="font-serif text-4xl md:text-5xl font-black text-black mb-4 leading-none">
                        Free Classifieds in {displayCity}
                    </h1>

                    <div className="flex justify-center flex-wrap gap-2 mb-6">
                        {cityData.keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] md:text-xs font-mono uppercase bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {kw}
                            </span>
                        ))}
                    </div>

                    <div
                        className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto prose prose-p:my-0 prose-strong:font-bold prose-strong:text-black"
                        dangerouslySetInnerHTML={{
                            __html: cityData.description // We render the markdown-like bold tags
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        }}
                    />

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/post-ad"
                            className="bg-black text-white px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Post Free Ad in {displayCity}
                        </Link>
                        <Link
                            href={`/?city=${displayCity}`}
                            className="bg-white text-black border-2 border-black px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            <Search size={18} /> Browse All Ads
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Categories Layout */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-black block"></span>
                    Browse by Category
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {CATEGORIES.slice(0, 6).map(cat => (
                        <Link
                            key={cat}
                            href={`/${cat.toLowerCase().replace(" ", "-")}/${cityKey}`} // Assumes existing route /[category]/[city]
                            className="block group"
                        >
                            <div className="bg-white border border-gray-200 p-4 rounded text-center hover:border-black hover:shadow-md transition">
                                <span className="block font-bold text-sm uppercase text-gray-700 group-hover:text-black">
                                    {cat} <br />
                                    <span className="text-[10px] font-normal text-gray-400">in {displayCity}</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Latest Listings */}
            <div className="max-w-5xl mx-auto px-4 pb-16">
                <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-black block"></span>
                    Latest in {displayCity}
                </h2>

                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            // Using standard PostCard.tsx logic. 
                            // Might wrap in a div if PostCard expects container context
                            <div key={post.id} className="bg-white border border-gray-200 rounded shadow-sm px-4">
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded">
                        <p className="text-gray-500 mb-4 font-serif italic text-lg">
                            No ads posted in {displayCity} recently.
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Be the first to post! It's free and takes 30 seconds.
                        </p>
                        <Link
                            href="/post-ad"
                            className="inline-block bg-black text-white px-6 py-2 rounded-full font-bold text-sm uppercase hover:bg-gray-800 transition"
                        >
                            Post first ad
                        </Link>
                    </div>
                )}

                {posts.length > 0 && (
                    <div className="text-center mt-8">
                        <Link
                            href={`/?city=${displayCity}`}
                            className="text-sm font-bold underline decoration-dotted hover:text-blue-600"
                        >
                            View All {displayCity} Ads &rarr;
                        </Link>
                    </div>
                )}
            </div>

            {/* Neighborhoods / Local Areas SEO Footer */}
            {cityData.neighborhoods.length > 0 && (
                <div className="bg-white border-t border-gray-200 py-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 text-center">
                            Popular Areas in {displayCity}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-gray-600">
                            {cityData.neighborhoods.map(area => (
                                <span key={area} className="flex items-center gap-1">
                                    <MapPin size={10} className="text-gray-300" />
                                    {area}
                                </span>
                            ))}
                        </div>
                        <div className="text-center mt-6 text-xs text-gray-400 max-w-2xl mx-auto">
                            Freepo.in facilitates trusted local trading in {displayCity}.
                            Whether you are in {cityData.neighborhoods.slice(0, 3).join(", ")}, or anywhere else,
                            use our platform to find what you need nearby.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
