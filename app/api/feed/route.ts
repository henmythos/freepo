import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDB } from "@/lib/db";
import { generateSlug } from "@/lib/slugUtils";

// Helper to escape XML special characters for attributes
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function GET() {
    try {
        const db = getDB();

        // Optimized query: Select only necessary columns
        const result = await db.execute(
            "SELECT id, title, description, city, category, created_at FROM posts ORDER BY created_at DESC LIMIT 50"
        );

        const baseUrl = "https://freepo.in";

        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
 <title>Freepo.in - Latest Classifieds</title>
 <description>India's fastest free newspaper-style classifieds.</description>
 <link>${baseUrl}</link>
 <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml" />
 <language>en-in</language>
 <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

        result.rows.forEach((row) => {
            const r = row as Record<string, unknown>;
            const title = r.title as string;
            const city = r.city as string;
            const category = r.category as string;
            const desc = (r.description as string) || "";
            const id = r.id as number;

            // Generate canonical slug
            const slug = generateSlug(title, city, category);
            const link = `${baseUrl}/item/${slug}-iid-${id}`;

            rss += `
 <item>
  <title><![CDATA[${title} - ${city}]]></title>
  <description><![CDATA[${desc.substring(0, 300)}...]]></description>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <pubDate>${new Date(r.created_at as string).toUTCString()}</pubDate>
  <category><![CDATA[${category}]]></category>
 </item>`;
        });

        rss += `
</channel>
</rss>`;

        return new NextResponse(rss, {
            headers: {
                "Content-Type": "text/xml",
                // CACHE STRATEGY:
                // s-maxage=3600 (1 hour): Vercel Edge/CDN will serve cached version for 1 hour.
                // stale-while-revalidate=59: Allow serving stale content for 1 extra minute while re-fetching.
                // This significantly reduces DB reads to at most 1 per hour per edge region.
                "Cache-Control": "s-maxage=3600, stale-while-revalidate=59",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[FEED ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
