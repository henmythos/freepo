import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import crypto from "crypto";
import { formatPrice, containsPhoneNumber } from "@/lib/priceUtils";

// Ensure table exists
async function ensureTable() {
    const db = getDB();
    await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      city TEXT NOT NULL,
      description TEXT NOT NULL,
      contact_name TEXT,
      contact_phone TEXT NOT NULL,
      whatsapp TEXT,
      form_link TEXT,
      salary TEXT,
      price TEXT,
      job_type TEXT,
      experience TEXT,
      education TEXT,
      company_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      views INTEGER DEFAULT 0,
      image1 TEXT,
      image2 TEXT,
      image1_alt TEXT,
      image2_alt TEXT
    );
  `);

    // Migration for existing tables
    const columnsToAdd = [
        "image1 TEXT",
        "image2 TEXT",
        "image1_alt TEXT",
        "image2_alt TEXT"
    ];

    for (const col of columnsToAdd) {
        try {
            await db.execute(`ALTER TABLE posts ADD COLUMN ${col}`);
        } catch (e) {
            // Ignore if column exists
        }
    }

    // Also create city_stats table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS city_stats (
      city TEXT PRIMARY KEY,
      posts_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0
    );
  `);

    console.log("FREEPO DB TABLES READY");
}

export async function GET(request: NextRequest) {
    try {
        const db = getDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const city = searchParams.get("city");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const cursor = searchParams.get("cursor"); // TIMESTAMP for pagination
        const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50); // Default 12 for grid

        // Single post fetch
        if (id) {
            const result = await db.execute({
                sql: "SELECT * FROM posts WHERE id = ?",
                args: [id],
            });
            if (result.rows.length === 0) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            return NextResponse.json(result.rows[0]);
        }

        // Build query
        let sql = "SELECT * FROM posts WHERE 1=1";
        const args: (string | number)[] = [];

        if (city) {
            sql += " AND city = ?";
            args.push(city);
        }
        if (category && category !== "All") {
            sql += " AND category = ?";
            args.push(category);
        }
        const phone = searchParams.get("phone");
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, "").substring(0, 15);
            sql += " AND contact_phone = ?";
            args.push(cleanPhone);
        }
        if (search) {
            sql += " AND (title LIKE ? OR description LIKE ?)";
            const term = `%${search}%`;
            args.push(term, term);
        }

        // Cursor-based pagination (get items created BEFORE the cursor)
        if (cursor) {
            sql += " AND created_at < ?";
            args.push(cursor);
        }

        sql += " ORDER BY created_at DESC LIMIT ?";
        args.push(limit);

        const result = await db.execute({ sql, args });
        return NextResponse.json(result.rows);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[GET ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await ensureTable();
        const db = getDB();

        const body = await request.json();

        // Honeypot check
        if (body._honey) {
            return NextResponse.json({ success: true });
        }

        // Validate required fields
        const { title, category, city, contact_phone, description } = body;
        if (!title || !category || !city || !contact_phone || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Block phone numbers in description (prevent misuse)
        if (containsPhoneNumber(description)) {
            return NextResponse.json(
                { error: "Phone numbers are not allowed in description. Please use the Contact Phone field instead." },
                { status: 400 }
            );
        }

        // Also check title for phone numbers
        if (containsPhoneNumber(title)) {
            return NextResponse.json(
                { error: "Phone numbers are not allowed in title." },
                { status: 400 }
            );
        }

        // Clean phone number
        const cleanPhone = contact_phone.replace(/\D/g, "").substring(0, 15);

        // Check 30-day duplicate rule
        const { rows } = await db.execute({
            sql: "SELECT created_at FROM posts WHERE contact_phone = ? ORDER BY created_at DESC LIMIT 1",
            args: [cleanPhone],
        });

        if (rows.length > 0) {
            const lastPost = new Date((rows[0] as Record<string, unknown>).created_at as string);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastPost.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 30) {
                const remaining = 30 - diffDays;
                return NextResponse.json(
                    { error: `This number already posted. Try again after ${remaining} days.` },
                    { status: 429 }
                );
            }
        }

        // Generate ID
        const id = crypto.randomUUID();

        // Extract optional fields
        const {
            contact_name = null,
            whatsapp = null,
            form_link = null,
            salary: rawSalary = null,
            price: rawPrice = null,
            job_type = null,
            experience = null,
            education = null,
            company_name = null,
            image1 = null,
            image2 = null,
        } = body;

        // Format price and salary to Indian format with ₹ symbol
        const salary = rawSalary ? formatPrice(rawSalary) : null;
        const price = rawPrice ? formatPrice(rawPrice) : null;

        // Generate ALT text
        let image1_alt = null;
        let image2_alt = null;
        if (image1) image1_alt = `${title} - ${category} in ${city} (Image 1)`;
        if (image2) image2_alt = `${title} - ${category} in ${city} (Image 2)`;

        // Insert post
        await db.execute({
            sql: `
        INSERT INTO posts (
          id, title, category, city, description, 
          contact_name, contact_phone, whatsapp, form_link, 
          salary, price, job_type, experience, education, company_name, 
          expires_at, image1, image2, image1_alt, image2_alt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+30 days'), ?, ?, ?, ?);
      `,
            args: [
                id,
                title,
                category,
                city,
                description,
                contact_name,
                cleanPhone,
                whatsapp,
                form_link,
                salary,
                price,
                job_type,
                experience,
                education,
                company_name,
                image1,
                image2,
                image1_alt,
                image2_alt
            ],
        });

        // Update city stats (fire & forget)
        db.execute({
            sql: "INSERT INTO city_stats (city, posts_count) VALUES (?, 1) ON CONFLICT(city) DO UPDATE SET posts_count = posts_count + 1",
            args: [city],
        }).catch((e) => console.error("[STATS ERROR]", e.message));

        console.log(`[POST SUCCESS] ID: ${id}, City: ${city}, Category: ${category}`);
        return NextResponse.json({ success: true, id });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[POST ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// S3 Client for Deletion
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
        const filename = url.split("/").pop();
        if (!filename) return;
        await R2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: filename }));
    } catch (e) { console.error("R2 Delete Error", e); }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const phone = searchParams.get("phone");

        if (!id || !phone) {
            return NextResponse.json({ error: "Missing id or phone" }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, "");
        const db = getDB();

        // Verify ownership
        const { rows } = await db.execute({
            sql: "SELECT * FROM posts WHERE id = ? AND contact_phone = ?",
            args: [id, cleanPhone]
        });

        if (rows.length === 0) {
            return NextResponse.json({ error: "Post not found or phone mismatch" }, { status: 404 });
        }

        const post = rows[0] as any;

        // Delete Images
        await deleteImage(post.image1);
        await deleteImage(post.image2);

        // Delete Post
        await db.execute({
            sql: "DELETE FROM posts WHERE id = ?",
            args: [id]
        });

        return NextResponse.json({ success: true });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("[DELETE ERROR]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
