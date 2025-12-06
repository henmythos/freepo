import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const db = getDB();
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Get post and increment views
        const check = await db.execute({
            sql: "SELECT city FROM posts WHERE id = ?",
            args: [id],
        });

        if (check.rows.length === 0) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        await db.execute({
            sql: "UPDATE posts SET views = views + 1 WHERE id = ?",
            args: [id],
        });

        // Update city stats
        const city = (check.rows[0] as Record<string, unknown>).city as string;
        await db.execute({
            sql: "UPDATE city_stats SET views_count = views_count + 1 WHERE city = ?",
            args: [city],
        }).catch((e) => console.error("[VIEW STATS ERROR]", e.message));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[VIEW ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
