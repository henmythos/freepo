import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 Client
const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

async function deleteImage(url: string | null) {
    if (!url) return;
    try {
        const filename = url.split("/").pop();
        if (!filename) return;
        await R2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: filename }));
    } catch (e) {
        // Idempotent: Ignore errors if file is already gone or permission issue
        // We log but don't stop the process
        console.error(`[CLEANUP] Failed to delete image ${url}:`, e);
    }
}

export async function GET(request: NextRequest) {
    // 1. Security Check
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getDB();

        // 2. Find Expired Posts
        // We limit to 50 at a time to prevent timeout/memory issues. 
        // Cron can run frequently (e.g. hourly) to catch up if needed.
        const { rows } = await db.execute({
            sql: "SELECT * FROM posts WHERE expires_at < datetime('now') LIMIT 50",
            args: []
        });

        if (rows.length === 0) {
            return NextResponse.json({ success: true, deleted_count: 0, message: "No expired posts found." });
        }

        let deletedCount = 0;

        // 3. Process Deletion
        for (const row of rows) {
            const post = row as any;

            // Delete Images
            await deleteImage(post.image1);
            await deleteImage(post.image2);
            await deleteImage(post.image3);
            await deleteImage(post.image4);
            await deleteImage(post.image5);

            // Delete from DB
            await db.execute({
                sql: "DELETE FROM posts WHERE id = ?",
                args: [post.id]
            });

            deletedCount++;
        }

        return NextResponse.json({
            success: true,
            deleted_count: deletedCount,
            message: `Successfully cleaned up ${deletedCount} posts.`
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[CRON ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
