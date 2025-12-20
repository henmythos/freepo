import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDB } from "@/lib/db";

export async function GET() {
    try {
        const db = getDB();

        const result = await db.execute(`
      SELECT city, posts_count, views_count, (posts_count + (views_count * 0.5)) as score 
      FROM city_stats 
      ORDER BY score DESC 
      LIMIT 20
    `);
        return NextResponse.json(result.rows, {
            headers: {
                // Cache for 1 hour, reuse stale for 30 mins
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[STATS ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
