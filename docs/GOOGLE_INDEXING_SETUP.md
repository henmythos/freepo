# Google Indexing API Setup Guide

Jobs posted on Freepo.in will now be instantly indexed in Google for Jobs.

## Setup Steps

### 1. Create Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create new project or select existing

### 2. Enable Indexing API
- Go to **APIs & Services** → **Library**
- Search "Indexing API" → **Enable**

### 3. Create Service Account
- Go to **APIs & Services** → **Credentials**
- Create **Service Account** → Give it a name
- Create **Key** → JSON format → Download

### 4. Add to Search Console
- Go to [Search Console](https://search.google.com/search-console)
- Select freepo.in property
- **Settings** → **Users and permissions** → Add user
- Add service account email (from JSON) as **Owner**

### 5. Add Environment Variables
Add to your `.env.local` or Vercel:

```env
GOOGLE_INDEXING_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

> **Note:** Replace `\n` with actual newlines or keep escaped in quotes.

### 6. Deploy
- Deploy to Vercel
- Jobs category posts will now notify Google automatically

## Files Created

- `lib/googleIndexing.ts` - API utility
- `app/api/posts/route.ts` - Integration point

## Limits

- **100 notifications/day** on free tier
- Only Jobs category triggers notifications
- Non-blocking (failures don't affect posting)
