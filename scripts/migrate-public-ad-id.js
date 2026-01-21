const { createClient } = require("@libsql/client");
const path = require("path");

// Env vars loaded via --env-file flag


async function migrate() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("Missing TURSO credentials in .env.local");
        process.exit(1);
    }

    const db = createClient({ url, authToken });

    console.log("Starting Migration: Add public_ad_id...");

    try {
        // 1. Add Column
        console.log("Adding column public_ad_id...");
        try {
            await db.execute("ALTER TABLE posts ADD COLUMN public_ad_id TEXT");
            console.log("Column added.");
        } catch (e) {
            if (e.message.includes("duplicate column")) {
                console.log("Column already exists. Skipping.");
            } else {
                throw e;
            }
        }

        // 2. Create Unique Index
        console.log("Creating index idx_posts_public_ad_id...");
        await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_public_ad_id ON posts(public_ad_id)");
        console.log("Index created.");

        // 3. Verify
        console.log("Verifying schema...");
        const result = await db.execute("PRAGMA table_info(posts)");
        const hasColumn = result.rows.some(r => r.name === 'public_ad_id');

        if (hasColumn) {
            console.log("SUCCESS: public_ad_id column exists.");
        } else {
            console.error("FAILURE: public_ad_id column NOT found after migration.");
            process.exit(1);
        }

        console.log("Migration Complete.");
    } catch (e) {
        console.error("Migration Failed:", e);
        process.exit(1);
    }
}

migrate();
