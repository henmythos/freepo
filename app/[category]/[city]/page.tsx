import { notFound } from "next/navigation";
import Link from "next/link";
import { getDB } from "@/lib/db";
import { Post, Category } from "@/lib/types";
import { SEO_CATEGORIES, SEO_CITIES } from "@/lib/constants";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

interface PageProps {
    params: {
        category: string;
        city: string;
    };
}

// Validate params
function isValidParams(category: string, city: string) {
    return (
        SEO_CATEGORIES.includes(category.toLowerCase()) &&
        SEO_CITIES.includes(city.toLowerCase())
    );
}

// Helper to format title case
function titleCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function getPosts(category: string, city: string): Promise<Post[]> {
    try {
        const db = getDB();

        // Map SEO category to DB category if needed
        // For now we assume loose matching or we need to map "jobs" -> "Jobs"
        // The DB likely has "Jobs", "properties" etc. 
        // Let's try to find the matching Category enum from the string.
        // Simple capitalization might work for single words, but check Edge cases.
        // "buy-sell" -> "Buy/Sell", "lost-found" -> "Lost & Found"

        let dbCategory = titleCase(category);
        if (category === "buy-sell") dbCategory = "Buy/Sell";
        if (category === "lost-found") dbCategory = "Lost & Found";
        if (category === "jobs") dbCategory = "Jobs"; // Enhance for clarity

        // Adjust city casing if DB stores "Hyderabad" vs "hyderabad"
        // Usually DB is case sensitive or we use LIKE. 
        // Instructions said: "Use ONLY indexed fields... category = ? AND city = ?"
        // Assuming DB stores Title Case based on `lib/constants.ts` (e.g. "Hyderabad", "Jobs")

        const dbCity = titleCase(city);

        const result = await db.execute({
            sql: `
                SELECT * FROM posts 
                WHERE category = ? COLLATE NOCASE AND city = ? COLLATE NOCASE
                ORDER BY created_at DESC 
                LIMIT 30
            `,
            args: [dbCategory, dbCity],
        });

        return result.rows as unknown as Post[];
    } catch (e) {
        console.error("[GET SEO POSTS ERROR]", e);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, city } = params;

    if (!isValidParams(category, city)) {
        return { title: "Page Not Found" };
    }

    const cityTitle = titleCase(city);
    const categoryTitle = titleCase(category);

    return {
        title: `Free ${categoryTitle} in ${cityTitle} – Latest ${categoryTitle} | Freepo.in`,
        description: `Post and find free ${category} listings in ${cityTitle}. Browse the latest private, part-time and full-time ${category} across ${cityTitle} on Freepo.`,
        alternates: {
            canonical: `https://freepo.in/${category}/${city}`,
        },
    };
}

export default async function SEOCategoryPage({ params }: PageProps) {
    const { category, city } = params;

    if (!isValidParams(category, city)) {
        notFound();
    }

    const posts = await getPosts(category, city);
    const cityTitle = titleCase(city);
    const categoryTitle = titleCase(category);

    // Dynamic SEO Intro Text
    const introText = `Freepo allows free ${category} posting in ${cityTitle} for everyone. Find the latest ${category} in ${cityTitle} including private listings, verified options, and more across areas in ${cityTitle}.`;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="font-serif text-3xl font-bold text-ink mb-4">
                    {categoryTitle} in {cityTitle}
                </h1>

                <p className="text-gray-600 mb-8 text-sm leading-relaxed border-l-4 border-black pl-4 bg-white py-2 pr-2 shadow-sm">
                    {introText}
                </p>

                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 px-4">
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No {category} found in {cityTitle} yet.</p>
                        <Link
                            href="/post-ad"
                            className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm uppercase hover:bg-gray-800 transition-colors"
                        >
                            Post a Free Ad
                        </Link>
                    </div>
                )}

                {/* Internal Linking */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                        Other Cities
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {SEO_CITIES.filter(c => c !== city).map((c) => (
                            <Link
                                key={c}
                                href={`/${category}/${c}`}
                                className="text-sm text-blue-600 hover:underline bg-white px-3 py-1.5 rounded border border-gray-200"
                            >
                                {categoryTitle} in {titleCase(c)}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
