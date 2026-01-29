/**
 * Google Indexing API Utility
 * 
 * Notifies Google when job listings are created/updated for faster indexing
 * in Google for Jobs.
 * 
 * Setup Required:
 * 1. Create a Google Cloud project
 * 2. Enable the Indexing API
 * 3. Create a Service Account with Indexing API permissions
 * 4. Download the JSON key and add to .env.local:
 *    - GOOGLE_INDEXING_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
 *    - GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 * 5. Add the service account email as an owner in Search Console
 */

interface GoogleAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

// Cache token to avoid re-generating JWT for every request
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generate a JWT and exchange it for an access token
 */
async function getAccessToken(): Promise<string | null> {
    const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        console.warn('[INDEXING] Google Indexing API credentials not configured');
        return null;
    }

    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
        return cachedToken.token;
    }

    try {
        // Create JWT header and payload
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: clientEmail,
            scope: 'https://www.googleapis.com/auth/indexing',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600 // 1 hour
        };

        // Sign JWT using Web Crypto API (Edge Runtime compatible)
        const jwt = await signJWT(header, payload, privateKey);

        // Exchange JWT for access token
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[INDEXING] Token exchange failed:', error);
            return null;
        }

        const data: GoogleAuthResponse = await response.json();

        // Cache the token
        cachedToken = {
            token: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000)
        };

        return data.access_token;
    } catch (error) {
        console.error('[INDEXING] Auth error:', error);
        return null;
    }
}

/**
 * Sign a JWT using RS256 (Web Crypto API - Edge compatible)
 */
async function signJWT(
    header: object,
    payload: object,
    privateKeyPem: string
): Promise<string> {
    // Base64URL encode header and payload
    const encoder = new TextEncoder();
    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${headerB64}.${payloadB64}`;

    // Import the private key
    const keyData = pemToArrayBuffer(privateKeyPem);
    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyData,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Sign
    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        encoder.encode(signatureInput)
    );

    const signatureB64 = base64UrlEncode(signature);
    return `${signatureInput}.${signatureB64}`;
}

function base64UrlEncode(input: string | ArrayBuffer): string {
    let base64: string;
    if (typeof input === 'string') {
        base64 = btoa(input);
    } else {
        const bytes = new Uint8Array(input);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s/g, '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Notify Google Indexing API about a URL
 * 
 * @param url - Full URL to notify (e.g., https://freepo.in/item/job-slug-iid-123)
 * @param type - 'URL_UPDATED' for new/updated or 'URL_DELETED' for removed
 */
export async function notifyGoogleIndexing(
    url: string,
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<boolean> {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            // Silently skip if not configured (non-blocking)
            return false;
        }

        const response = await fetch(
            'https://indexing.googleapis.com/v3/urlNotifications:publish',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, type })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('[INDEXING] API error:', error);
            return false;
        }

        console.log(`[INDEXING] Successfully notified Google: ${url}`);
        return true;
    } catch (error) {
        // Non-blocking - just log and continue
        console.error('[INDEXING] Failed to notify Google:', error);
        return false;
    }
}

/**
 * Batch notify multiple URLs (up to 100 per request)
 */
export async function notifyGoogleIndexingBatch(
    urls: string[],
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<number> {
    let successCount = 0;

    // Google Indexing API has rate limits, process sequentially with small delay
    for (const url of urls.slice(0, 100)) {
        const success = await notifyGoogleIndexing(url, type);
        if (success) successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return successCount;
}
