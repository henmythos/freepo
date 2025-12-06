import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
    try {
        const db = getDB();

        // Get posts
        const postsResult = await db.execute(
            "SELECT id, created_at FROM posts ORDER BY created_at DESC LIMIT 1000"
        );

        // Get cities
        let citiesResult: { rows: Record<string, unknown>[] } = { rows: [] };
        try {
            const result = await db.execute(
                "SELECT city FROM city_stats ORDER BY posts_count DESC LIMIT 50"
            );
            citiesResult = { rows: result.rows as Record<string, unknown>[] };
        } catch (e) {
            // Table might not exist yet
        }

        const baseUrl = "https://freepo.online";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/post-ad</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/privacy</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/terms</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/safety</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/contact</loc><priority>0.3</priority></url>`;

        citiesResult.rows.forEach((row) => {
            const cityName = row.city as string;
            xml += `
  <url><loc>${baseUrl}/city/${encodeURIComponent(cityName)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;
        });

        postsResult.rows.forEach((row) => {
            const r = row as Record<string, unknown>;
            xml += `
  <url><loc>${baseUrl}/post/${r.id}</loc><lastmod>${new Date(r.created_at as string).toISOString()}</lastmod><changefreq>never</changefreq><priority>0.7</priority></url>`;
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
