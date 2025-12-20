import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDB } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city");

        if (!city) {
            return NextResponse.json({ error: "City is required" }, { status: 400 });
        }

        const db = getDB();

        // Get distinct localities for the city
        // Filter out null/empty localities
        const result = await db.execute({
            sql: `
                SELECT DISTINCT locality 
                FROM posts 
                WHERE city = ? AND locality IS NOT NULL AND locality != ''
                ORDER BY locality ASC
                LIMIT 100
            `,
            args: [city]
        });

        const localities = result.rows.map(r => r.locality);

        return NextResponse.json(localities, {
            headers: {
                // Cache for 1 hour to reduce DB load
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[LOCALITIES ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
