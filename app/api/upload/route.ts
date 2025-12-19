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

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP allowed." }, { status: 400 });
            }
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            // Resize and compress
            const processedBuffer = await sharp(buffer)
                .resize(1200, 675, { fit: "cover", position: "center" })
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

            const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
            uploadedUrls.push(publicUrl);
        }

        return NextResponse.json({ urls: uploadedUrls });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[UPLOAD ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
