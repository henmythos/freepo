import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files: File[] = [];

        for (const [key, value] of Array.from(formData.entries())) {
            if (value instanceof File) {
                files.push(value);
            }
        }

        if (files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }
        if (files.length > 5) {
            return NextResponse.json({ error: "Max 5 images allowed" }, { status: 400 });
        }

        // Parallelize processing and uploading
        const uploadPromises = files.map(async (file) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`Invalid file type: ${file.name}`);
            }
            if (file.size > MAX_SIZE) {
                throw new Error(`File too large: ${file.name}`);
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            // Optimize/Normalize on Server (Security + Consistency)
            // Even if client sends WebP, we re-process to strip metadata and ensure strict dimensions
            const processedBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                    fit: "inside",
                    withoutEnlargement: true
                })
                .toFormat("webp", { quality: 80 })
                .toBuffer();

            const filename = `${crypto.randomUUID()}.webp`;

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: filename,
                Body: processedBuffer,
                ContentType: "image/webp",
            });

            await R2.send(command);

            return `${process.env.R2_PUBLIC_URL}/${filename}`;
        });

        const uploadedUrls = await Promise.all(uploadPromises);

        return NextResponse.json({ urls: uploadedUrls });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[UPLOAD ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
