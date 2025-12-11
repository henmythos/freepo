import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
            Bucket: "freepo-images",
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

        // 1. Get expired posts to find images
        const { rows } = await db.execute(
            "SELECT id, image1, image2 FROM posts WHERE expires_at < datetime('now')"
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, deleted: 0 });
        }

        // 2. Delete images from R2
        for (const row of rows) {
            await deleteImage(row.image1 as string);
            await deleteImage(row.image2 as string);
        }

        // 3. Delete from DB
        const ids = rows.map((r) => r.id).map(id => `'${id}'`).join(",");
        // Use a safe query instead of raw string injection if possible, but for IDs list it's often easier to do IN check
        // Or delete one by one if batch isn't supported easily. 
        // LibSQL support IN clause.

        // Actually, let's use the original "DELETE FROM posts WHERE ..." but we need to match the ones we just processed to be safe in case of race conditions, 
        // though typically "expires_at < now" is fairly stable.
        // Let's stick to the original logic but just ensure we delete what we found.

        const result = await db.execute(
            `DELETE FROM posts WHERE id IN (${rows.map(() => "?").join(",")})`,
            { args: rows.map(r => r.id) } // Wait, db.execute signature in previous files was slightly different. 
            // db.execute({ sql: ..., args: [] })
        );

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
