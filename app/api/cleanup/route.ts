import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { notifyGoogleIndexing } from "@/lib/googleIndexing";
import { generateSlug } from "@/lib/slugUtils";

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
        // Extract filename from URL (e.g. https://domain.com/filename.webp)
        const filename = url.split("/").pop();
        if (!filename) return;

        await R2.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: filename
        }));
        console.log(`[R2 DELETE] ${filename}`);
    } catch (e) {
        console.error(`[R2 DELETE ERROR] ${url}`, e);
    }
}

export async function GET() {
    try {
        const db = getDB();

        // 1. Get expired posts to find images and generate URLs for de-indexing
        const { rows } = await db.execute(
            "SELECT id, title, city, category, image1, image2 FROM posts WHERE expires_at < datetime('now')"
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, deleted: 0 });
        }

        // 2. Notify Google to de-index these URLs (before we delete them)
        const baseUrl = "https://freepo.in";
        for (const row of rows) {
            try {
                const slug = generateSlug(
                    row.title as string,
                    row.city as string,
                    row.category as string
                );
                const url = `${baseUrl}/item/${slug}-iid-${row.id}`;
                await notifyGoogleIndexing(url, 'URL_DELETED');
            } catch (e) {
                console.error(`[DEINDEX ERROR] Post ${row.id}:`, e);
                // Continue even if de-indexing fails
            }
        }

        // 3. Delete images from R2
        for (const row of rows) {
            await deleteImage(row.image1 as string);
            await deleteImage(row.image2 as string);
        }

        // 3. Delete from DB



        // Let's use the safe object syntax
        const placeholders = rows.map(() => "?").join(",");
        const deleteResult = await db.execute({
            sql: `DELETE FROM posts WHERE id IN (${placeholders})`,
            args: rows.map(r => r.id) as (string | number)[]
        });

        console.log(`[CLEANUP] Deleted ${deleteResult.rowsAffected} expired posts`);
        return NextResponse.json({ success: true, deleted: deleteResult.rowsAffected });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[CLEANUP ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
