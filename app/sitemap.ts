import { MetadataRoute } from "next";
import { getDB } from "@/lib/db";
import { CATEGORIES, TOP_CITIES } from "@/lib/constants";
import { generateSlug } from "@/lib/slugUtils";
import { Post } from "@/lib/types";

const BASE_URL = "https://freepo.in";

// Convert category name to URL slug (matches Next.js routes)
function categoryToSlug(cat: string): string {
    return cat
        .toLowerCase()
        .replace(/\//, "-")
        .replace(/&/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    // 1. Static pages
    const staticPages = [
        { url: `${BASE_URL}/`, changeFrequency: "hourly" as const, priority: 1.0 },
        { url: `${BASE_URL}/post-ad`, changeFrequency: "monthly" as const, priority: 0.8 },
        { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.5 },
        { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.3 },
        { url: `${BASE_URL}/privacy`, changeFrequency: "monthly" as const, priority: 0.3 },
        { url: `${BASE_URL}/terms`, changeFrequency: "monthly" as const, priority: 0.3 },
        { url: `${BASE_URL}/safety`, changeFrequency: "monthly" as const, priority: 0.3 },
        { url: `${BASE_URL}/refund-policy`, changeFrequency: "monthly" as const, priority: 0.3 },
    ];
    entries.push(...staticPages);

    // 2. City hub pages (e.g. /city/mumbai)
    TOP_CITIES.forEach((city) => {
        entries.push({
            url: `${BASE_URL}/city/${city.toLowerCase()}`,
            changeFrequency: "daily",
            priority: 0.8,
        });
    });

    // 3. Category + City pages (e.g. /jobs/mumbai)
    CATEGORIES.forEach((cat) => {
        const catSlug = categoryToSlug(cat);
        TOP_CITIES.forEach((city) => {
            entries.push({
                url: `${BASE_URL}/${catSlug}/${city.toLowerCase()}`,
                changeFrequency: "daily",
                priority: 0.8,
            });
        });
    });

    // 4. Dynamic post item pages (active only)
    try {
        const db = getDB();
        const result = await db.execute(
            "SELECT id, created_at, title, city, category FROM posts WHERE expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 5000"
        );

        result.rows.forEach((row) => {
            const post = row as unknown as Post;
            const slug = generateSlug(post.title, post.city, post.category);
            entries.push({
                url: `${BASE_URL}/item/${slug}-iid-${post.id}`,
                lastModified: new Date(post.created_at),
                changeFrequency: "never",
                priority: 0.7,
            });
        });
    } catch (e) {
        console.error("[SITEMAP.TS ERROR]", e);
        // Return partial sitemap rather than failing entirely
    }

    return entries;
}
