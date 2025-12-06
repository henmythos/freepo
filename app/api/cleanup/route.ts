import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
    try {
        const db = getDB();

        const result = await db.execute(
            "DELETE FROM posts WHERE expires_at < datetime('now')"
        );

        console.log(`[CLEANUP] Deleted ${result.rowsAffected} expired posts`);
        return NextResponse.json({ success: true, deleted: result.rowsAffected });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[CLEANUP ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
