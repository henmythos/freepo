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
      expires_at DATETIME NOT NULL,
      views INTEGER DEFAULT 0,
      image1 TEXT,
      image2 TEXT,
      image3 TEXT,
      image4 TEXT,
      image5 TEXT,
      image1_alt TEXT,
      image2_alt TEXT,
      image3_alt TEXT,
      image4_alt TEXT,
      image5_alt TEXT,
      locality TEXT,
      contact_preference TEXT DEFAULT 'both',
      latitude REAL,
      longitude REAL,
      listing_plan TEXT DEFAULT 'free',
      is_featured BOOLEAN DEFAULT 0
    );
  `);

    // Migration for existing tables
    const columnsToAdd = [
        "image1 TEXT",
        "image2 TEXT",
        "image3 TEXT",
        "image4 TEXT",
        "image5 TEXT",
        "image1_alt TEXT",
        "image2_alt TEXT",
        "image3_alt TEXT",
        "image4_alt TEXT",
        "image5_alt TEXT",
        "contact_preference TEXT DEFAULT 'both'",
        "locality TEXT",
        "latitude REAL",
        "longitude REAL",
        "listing_plan TEXT DEFAULT 'free'",
        "is_featured BOOLEAN DEFAULT 0"
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


    // Create Indexes for Performance & Cost Optimization
    // These indexes prevent full table scans, significantly reducing "rows read" and billing costs.
    try {
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_city ON posts(city)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(latitude, longitude)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(created_at)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_phone ON posts(contact_phone)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_expires ON posts(expires_at)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_plan ON posts(listing_plan)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured)`);
    } catch (e) {
        console.error("Index creation failed (non-fatal):", e);
    }

}

import { rateLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    try {
        const db = getDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const city = searchParams.get("city");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const cursor = searchParams.get("cursor"); // TIMESTAMP for pagination
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Default 20 posts

        // Geolocation params
        const lat = parseFloat(searchParams.get("lat") || "");
        const lng = parseFloat(searchParams.get("lng") || "");

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

        // Geolocation Logic (Bounding Box)
        // Optimization: If lat/lng provided, use bounding box to filter aggressively
        if (!isNaN(lat) && !isNaN(lng)) {
            // Approx 50km radius box (1 deg lat ~ 111km)
            // 0.5 deg ~ 55km
            const minLat = lat - 0.5;
            const maxLat = lat + 0.5;
            const minLng = lng - 0.5;
            const maxLng = lng + 0.5;

            if (city) {
                // Feature: "Nearby" + City Fallback
                // Show posts within range OR in the city (even if no coords or far)
                sql += " AND ((latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?) OR LOWER(city) = LOWER(?))";
                args.push(minLat, maxLat, minLng, maxLng, city);
            } else {
                // Only "Nearby" (no specific city selected)
                sql += " AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?";
                args.push(minLat, maxLat, minLng, maxLng);
            }

        } else if (city) {
            // Fallback to city filter only if no Geo
            sql += " AND LOWER(city) = LOWER(?)";
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

        // Ordering
        // Global feed, stick to created_at DESC for freshness
        sql += " ORDER BY created_at DESC LIMIT ?";
        args.push(limit);

        const result = await db.execute({ sql, args });

        let rows = result.rows;

        // Fallback Logic: If no results found with location filters, try Nearest City logic
        // Only on first page (no cursor)
        if (rows.length === 0 && !cursor) {

            // 1. Try finding 'Nearest City' if logic was Geo-based
            if (!isNaN(lat) && !isNaN(lng)) {
                try {
                    console.log("No partial matches. Attempting Nearest City Fallback...");
                    // Find the single closest post with a city
                    const cityQuery = `
                        SELECT city, ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) as distSq
                        FROM posts
                        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                        ORDER BY distSq ASC
                        LIMIT 1
                    `;
                    const cityRes = await db.execute({ sql: cityQuery, args: [lat, lat, lng, lng] });

                    if (cityRes.rows.length > 0) {
                        const nearestCity = cityRes.rows[0].city as string;
                        console.log("Found Nearest City:", nearestCity);

                        let fallbackSql = "SELECT * FROM posts WHERE LOWER(city) = LOWER(?)";
                        const fallbackArgs: (string | number)[] = [nearestCity];

                        if (category && category !== "All") {
                            fallbackSql += " AND category = ?";
                            fallbackArgs.push(category);
                        }
                        // Reuse search but ignore lat/lng here
                        if (search) {
                            fallbackSql += " AND (title LIKE ? OR description LIKE ?)";
                            const term = `%${search}%`;
                            fallbackArgs.push(term, term);
                        }

                        fallbackSql += " ORDER BY created_at DESC LIMIT ?";
                        fallbackArgs.push(limit);

                        const fallbackResult = await db.execute({ sql: fallbackSql, args: fallbackArgs });
                        rows = fallbackResult.rows;
                    }
                } catch (err) {
                    console.error("Nearest City Fallback Error", err);
                }
            }

            // 2. Global Fallback (only if Nearest City failed or wasn't applicable)
            if (rows.length === 0 && (city || (!isNaN(lat) && !isNaN(lng)))) {
                console.log("No results for location. Falling back to global search.");

                let fallbackSql = "SELECT * FROM posts WHERE 1=1";
                const fallbackArgs: (string | number)[] = [];

                if (category && category !== "All") {
                    fallbackSql += " AND category = ?";
                    fallbackArgs.push(category);
                }
                if (phone) {
                    const cleanPhone = phone.replace(/\D/g, "").substring(0, 15);
                    fallbackSql += " AND contact_phone = ?";
                    fallbackArgs.push(cleanPhone);
                }
                if (search) {
                    fallbackSql += " AND (title LIKE ? OR description LIKE ?)";
                    const term = `%${search}%`;
                    fallbackArgs.push(term, term);
                }

                // We exclude cursor logic here as this is strictly for initial load fallback
                // We do NOT include city or lat/lng constraints

                fallbackSql += " ORDER BY created_at DESC LIMIT ?";
                fallbackArgs.push(limit);

                const fallbackResult = await db.execute({ sql: fallbackSql, args: fallbackArgs });
                rows = fallbackResult.rows;
            }
        }

        // Post-processing: Calculate distance if lat/lng available and sort
        if (!isNaN(lat) && !isNaN(lng)) {
            rows = rows.map(row => {
                const r = row as any;
                if (r.latitude && r.longitude) {
                    // Euclidian distance approximation is sufficient for local sorting
                    const dLat = r.latitude - lat;
                    const dLng = r.longitude - lng;
                    const distSq = (dLat * dLat) + (dLng * dLng);
                    return { ...r, distSq };
                }
                return { ...r, distSq: 99999 }; // Far away if no coords
            }).sort((a: any, b: any) => {
                const diff = a.distSq - b.distSq;
                if (Math.abs(diff) > 0.0001) return diff;
                // Fallback to Created At (Newest first)
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }

        return NextResponse.json(rows, {
            headers: {
                // Cache for 15s public (balance between DB load & freshness)
                "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
            },
        });
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
        const {
            title,
            category,
            city,
            contact_phone,
            description,
            locality: rawLocality = null,
            latitude = null,
            longitude = null,
            listing_plan = "free",
            paid_verified = false // Internal boolean from frontend context
        } = body;

        const locality = rawLocality ? rawLocality.trim() : null;

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

        // --- PLAN & LIMIT LOGIC ---
        let isFeatured = 0; // Use 0/1 for SQLite boolean safety
        let expiresAtSql = "datetime('now', '+30 days')"; // Default 30 days
        let finalListingPlan = listing_plan;

        // Verify Plan Context
        if (!paid_verified) {
            finalListingPlan = "free";
        }

        if (finalListingPlan === "featured_30") {
            isFeatured = 1;
            expiresAtSql = "datetime('now', '+30 days')";
        } else if (finalListingPlan === "featured_60") {
            isFeatured = 1;
            expiresAtSql = "datetime('now', '+60 days')";
        } else {
            // Default Free
            finalListingPlan = "free";
            isFeatured = 0;
            expiresAtSql = "datetime('now', '+30 days')";
        }

        // Check 30-day Limit Rule (ONLY for FREE plans)
        // Rule: 1 free listing per user per 30 days
        if (finalListingPlan === "free") {
            const { rows } = await db.execute({
                sql: `
                    SELECT created_at FROM posts 
                    WHERE contact_phone = ? 
                    AND listing_plan = 'free' 
                    AND created_at > datetime('now', '-30 days')
                    LIMIT 1
                `,
                args: [cleanPhone],
            });

            if (rows.length > 0) {
                // Found a free post in last 30 days
                const lastPost = new Date((rows[0] as Record<string, unknown>).created_at as string);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastPost.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const remaining = 30 - diffDays;

                return NextResponse.json(
                    { error: `Free listing limit reached (1 per 30 days). Please wait ${remaining} days or upgrade to a Premium Plan to post immediately.` },
                    { status: 429 }
                );
            }
        }
        // If Paid plan, we SKIP this check.

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
            image3 = null,
            image4 = null,
            image5 = null,
            contact_preference = "both"
        } = body;

        // Format price and salary to Indian format with ₹ symbol
        const salary = rawSalary ? formatPrice(rawSalary) : null;
        const price = rawPrice ? formatPrice(rawPrice) : null;

        // Generate ALT text
        let image1_alt_final = null;
        let image2_alt_final = null;
        let image3_alt_final = null;
        let image4_alt_final = null;
        let image5_alt_final = null;

        if (image1) image1_alt_final = `${title} - ${category} in ${city} (Image 1)`;
        if (image2) image2_alt_final = `${title} - ${category} in ${city} (Image 2)`;
        if (image3) image3_alt_final = `${title} - ${category} in ${city} (Image 3)`;
        if (image4) image4_alt_final = `${title} - ${category} in ${city} (Image 4)`;
        if (image5) image5_alt_final = `${title} - ${category} in ${city} (Image 5)`;

        // Insert post
        await db.execute({
            sql: `
        INSERT INTO posts (
          id, title, category, city, description, 
          contact_name, contact_phone, whatsapp, form_link, 
          salary, price, job_type, experience, education, company_name, 
          expires_at, image1, image2, image3, image4, image5, 
          image1_alt, image2_alt, image3_alt, image4_alt, image5_alt, 
          contact_preference, locality, latitude, longitude,
          listing_plan, is_featured
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          ${expiresAtSql}, 
          ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, 
          ?, ?, ?, ?,
          ?, ?
        );
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
                image3,
                image4,
                image5,
                image1_alt_final,
                image2_alt_final,
                image3_alt_final,
                image4_alt_final,
                image5_alt_final,
                contact_preference,
                locality,
                latitude,
                longitude,
                finalListingPlan,
                isFeatured
            ],
        });

        // Update city stats (fire & forget)
        db.execute({
            sql: "INSERT INTO city_stats (city, posts_count) VALUES (?, 1) ON CONFLICT(city) DO UPDATE SET posts_count = posts_count + 1",
            args: [city],
        }).catch((e) => console.error("[STATS ERROR]", e.message));

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
    } catch (e) {
        console.error("R2 Delete Error", e);
        // We do NOT rethrow here, making cleanup idempotent/tolerant
    }
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
        await deleteImage(post.image3);
        await deleteImage(post.image4);
        await deleteImage(post.image5);

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
