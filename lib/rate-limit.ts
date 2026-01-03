export class RateLimiter {
    private tokens: Map<string, { count: number; lastReset: number }>;
    private limit: number;
    private window: number;

    constructor(limit: number = 10, windowSeconds: number = 60) {
        this.tokens = new Map();
        this.limit = limit;
        this.window = windowSeconds * 1000;
    }

    check(identifier: string): boolean {
        const now = Date.now();
        const token = this.tokens.get(identifier);

        if (!token) {
            this.tokens.set(identifier, { count: 1, lastReset: now });
            return true;
        }

        if (now - token.lastReset > this.window) {
            this.tokens.set(identifier, { count: 1, lastReset: now });
            return true;
        }

        if (token.count < this.limit) {
            token.count++;
            return true;
        }

        return false;
    }

    // Basic cleanup to prevent memory leaks
    cleanup() {
        const now = Date.now();
        this.tokens.forEach((value, key) => {
            if (now - value.lastReset > this.window) {
                this.tokens.delete(key);
            }
        });
    }
}

// Global instance (serverless safe-ish for small scale, but really needs Redis for production-production. 
// For Vercel lambda, this resets often which is actually GOOD for simple spam prevention without getting stuck.)
export const rateLimiter = new RateLimiter(5, 60); // 5 posts per minute per IP
