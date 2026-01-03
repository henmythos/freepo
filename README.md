# Freepo.in - Deployment & Maintenance Guide

## Overview
This is a Next.js 14 protected with basic spam prevention and optimized for performance. 

## Environment Variables
Ensure these are set in Vercel (or `.env.local` for dev):

```bash
# Database (Turso/LibSQL)
TURSO_DATABASE_URL=libsql://[your-db].turso.io
TURSO_AUTH_TOKEN=[your-token]

# Storage (Cloudflare R2)
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=[key-id]
R2_SECRET_ACCESS_KEY=[secret-key]
R2_BUCKET=[bucket-name]
R2_PUBLIC_URL=https://pub-[id].r2.dev

# Security
# No specific secrets needed for the basic build unless you add Auth later.
```

## Deployment (Vercel)
1.  Connect your GitHub repository to Vercel.
2.  Add the Environment Variables above.
3.  Deploy.
4.  **Build Command**: `next build` (default)
5.  **Output Directory**: `.next` (default)

## Maintenance (6-Month Freeze)
-   **Database**: The Turso database is serverless. Monitor usage on Turso dashboard to stay within free tier (writes are minimized).
-   **Spam**: A basic IP-based rate limiter (5 posts/min) is active in `/api/posts`.
-   **Storage**: R2 is cheap/free for high volume. Images are compressed to WebP (max 1200x1200px) before upload to save space.
-   **SEO**: SEO is fully automated. Sitemaps regenerate on request.

## Commands
-   `npm run dev`: Start local server
-   `npm run build`: Production build
-   `npm start`: Start production server
