import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import crypto from "crypto";

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
      views INTEGER DEFAULT 0
    );
  `);

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
        await ensureTable();
        const db = getDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const city = searchParams.get("city");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
        const offset = (page - 1) * limit;

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
        if (search) {
            sql += " AND (title LIKE ? OR description LIKE ?)";
            const term = `%${search}%`;
            args.push(term, term);
        }

        sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        args.push(limit, offset);

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
            salary = null,
            price = null,
            job_type = null,
            experience = null,
            education = null,
            company_name = null,
        } = body;

        // Insert post
        await db.execute({
            sql: `
        INSERT INTO posts (id, title, category, city, description, contact_name, contact_phone, whatsapp, form_link, salary, price, job_type, experience, education, company_name, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+30 days'));
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
