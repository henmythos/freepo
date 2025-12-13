import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDB } from "@/lib/db";
import { SEO_CATEGORIES, SEO_CITIES } from "@/lib/constants";
import { generateSlug } from "@/lib/slugUtils";
import { Post } from "@/lib/types"; // Import Post to cast properly

export async function GET() {
    try {
        const db = getDB();

        // Get posts with necessary fields for slug generation
        const postsResult = await db.execute(
            "SELECT id, created_at, title, city, category FROM posts ORDER BY created_at DESC LIMIT 1000"
        );

        const baseUrl = "https://freepo.in";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/post-ad</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/privacy</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/terms</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/safety</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/contact</loc><priority>0.3</priority></url>`;

        // Add SEO Category + City pages
        SEO_CATEGORIES.forEach((cat) => {
            SEO_CITIES.forEach((city) => {
                xml += `
  <url><loc>${baseUrl}/${encodeURIComponent(cat)}/${encodeURIComponent(city)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;
            });
        });

        // Add Item pages
        postsResult.rows.forEach((row) => {
            const post = row as unknown as Post;
            const slug = generateSlug(post.title, post.city, post.category);
            xml += `
  <url><loc>${baseUrl}/item/${slug}-iid-${post.id}</loc><lastmod>${new Date(post.created_at).toISOString()}</lastmod><changefreq>never</changefreq><priority>0.7</priority></url>`;
        });

        xml += `
</urlset>`;

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "s-maxage=3600, stale-while-revalidate",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[SITEMAP ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
