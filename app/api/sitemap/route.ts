import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDB } from "@/lib/db";
import { CATEGORIES, TOP_CITIES } from "@/lib/constants";
import { generateSlug } from "@/lib/slugUtils";
import { Post } from "@/lib/types"; // Import Post to cast properly

export async function GET() {
    try {
        const db = getDB();

        // Get posts with necessary fields for slug generation and image sitemap
        const postsResult = await db.execute(
            "SELECT id, created_at, title, city, category, image1, image1_alt FROM posts ORDER BY created_at DESC LIMIT 5000"
        );

        const baseUrl = "https://freepo.in";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/post-ad</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/privacy</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/terms</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/safety</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/refund-policy</loc><priority>0.3</priority></url>
  <url><loc>${baseUrl}/contact</loc><priority>0.3</priority></url>`;

        // Add All Category + City pages (Full Coverage)
        // Note: We use the full list now for maximum SEO coverage
        CATEGORIES.forEach((cat) => {
            TOP_CITIES.forEach((city) => {
                // simple loop over all combinations
                xml += `
  <url>
    <loc>${baseUrl}/${encodeURIComponent(cat)}/${encodeURIComponent(city)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
        });

        // Add Item pages with Image Sitemap support
        postsResult.rows.forEach((row) => {
            const post = row as unknown as Post;
            const slug = generateSlug(post.title, post.city, post.category);
            const loc = `${baseUrl}/item/${slug}-iid-${post.id}`;

            xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(post.created_at).toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>`;

            // Add Image metadata if present
            if (post.image1) {
                // Escape special chars in image title/url if necessary, though CDATA is safer or entity escape
                // For simplicity in XML attribute/text we use simple escaping.
                const imgLoc = post.image1.replace(/&/g, '&amp;');
                const imgTitle = (post.image1_alt || post.title).replace(/[<>&'"]/g, ''); // Strip bad chars for safety

                xml += `
    <image:image>
      <image:loc>${imgLoc}</image:loc>
      <image:title>${imgTitle}</image:title>
    </image:image>`;
            }

            xml += `
  </url>`;
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
