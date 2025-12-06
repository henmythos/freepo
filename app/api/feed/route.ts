import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
    try {
        const db = getDB();

        const result = await db.execute(
            "SELECT id, title, description, city, category, created_at FROM posts ORDER BY created_at DESC LIMIT 50"
        );

        const baseUrl = "https://freepo.online";

        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>Freepo.online - Latest Classifieds</title>
 <description>India's fastest free newspaper-style classifieds.</description>
 <link>${baseUrl}</link>
 <language>en-in</language>
 <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

        result.rows.forEach((row) => {
            const r = row as Record<string, unknown>;
            const desc = (r.description as string) || "";
            rss += `
 <item>
  <title><![CDATA[${r.title} - ${r.city}]]></title>
  <description><![CDATA[${desc.substring(0, 300)}...]]></description>
  <link>${baseUrl}/post/${r.id}</link>
  <guid>${baseUrl}/post/${r.id}</guid>
  <pubDate>${new Date(r.created_at as string).toUTCString()}</pubDate>
  <category>${r.category}</category>
 </item>`;
        });

        rss += `
</channel>
</rss>`;

        return new NextResponse(rss, {
            headers: {
                "Content-Type": "text/xml",
                "Cache-Control": "s-maxage=1800, stale-while-revalidate",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[FEED ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
