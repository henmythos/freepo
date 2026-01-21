/**
 * Generates a random public Ad ID.
 * Format: 3 Digits + 3 Uppercase Letters (e.g., 482KLM, 019QAZ)
 */
export function generatePublicAdId(): string {
    const digits = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let id = "";

    // Generate 3 digits
    for (let i = 0; i < 3; i++) {
        id += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    // Generate 3 letters
    for (let i = 0; i < 3; i++) {
        id += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return id;
}
