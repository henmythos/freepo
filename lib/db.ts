import { createClient } from "@libsql/client";

const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof createClient> | undefined;
};

export function getDB() {
    if (!globalForDb.conn) {
        globalForDb.conn = createClient({
            url: process.env.TURSO_DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN!,
        });
        console.log("TURSO DB CLIENT READY");
    }
    return globalForDb.conn;
}
