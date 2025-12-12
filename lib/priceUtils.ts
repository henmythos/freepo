/**
 * Price Formatter Utility
 * Converts text-based prices to Indian number format with ₹ symbol
 */

// Word to number mapping
const wordToNumber: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
    'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
    'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
    'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
    'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000,
    'lakh': 100000, 'lakhs': 100000, 'lac': 100000, 'lacs': 100000,
    'crore': 10000000, 'crores': 10000000, 'cr': 10000000,
    'k': 1000, 'l': 100000, 'm': 1000000
};

/**
 * Format a number in Indian numbering system (with commas)
 * e.g., 100000 -> 1,00,000
 */
export function formatIndianNumber(num: number): string {
    const numStr = Math.round(num).toString();

    if (numStr.length <= 3) return numStr;

    // Last 3 digits
    let result = numStr.slice(-3);
    let remaining = numStr.slice(0, -3);

    // Add commas every 2 digits for Indian format
    while (remaining.length > 0) {
        const chunk = remaining.slice(-2);
        remaining = remaining.slice(0, -2);
        result = chunk + ',' + result;
    }

    return result;
}

/**
 * Parse and format price string to Indian format with ₹ symbol
 * Handles: "10", "1.2 lakhs", "45000", "5k", "2L", "ten thousand", etc.
 */
export function formatPrice(input: string): string {
    if (!input || input.trim() === '') return '';

    let text = input.trim().toLowerCase();

    // Already has ₹ symbol and looks formatted? Return as-is but ensure proper format
    if (text.includes('₹') || text.includes('rs')) {
        text = text.replace(/₹|rs\.?/gi, '').trim();
    }

    // Handle range format (e.g., "25000 - 35000" or "25k - 35k")
    if (text.includes('-') || text.includes('to')) {
        const separator = text.includes('-') ? '-' : 'to';
        const parts = text.split(separator).map(p => p.trim());
        if (parts.length === 2) {
            const formatted1 = formatPrice(parts[0]);
            const formatted2 = formatPrice(parts[1]);
            if (formatted1 && formatted2) {
                // Remove ₹ from second part if both have it
                return `${formatted1} - ${formatted2.replace('₹', '').trim()}`;
            }
        }
    }

    // Handle suffix like "/month", "/year", "per month"
    let suffix = '';
    const suffixMatch = text.match(/(\/month|\/year|\/day|per\s*(month|year|day)|p\.?m\.?|p\.?a\.?)$/i);
    if (suffixMatch) {
        suffix = suffixMatch[0].replace(/p\.?m\.?/i, '/month').replace(/p\.?a\.?/i, '/year');
        text = text.replace(suffixMatch[0], '').trim();
    }

    // Try to extract number
    let value = 0;

    // Pattern: "1.2 lakhs", "2.5 lakh", "1.5 crore"
    const decimalLakhMatch = text.match(/^(\d+\.?\d*)\s*(lakhs?|lacs?|crores?|cr|k|l|m)/i);
    if (decimalLakhMatch) {
        const num = parseFloat(decimalLakhMatch[1]);
        const multiplier = wordToNumber[decimalLakhMatch[2].toLowerCase()] || 1;
        value = num * multiplier;
    }
    // Pattern: "45000", "1,20,000"
    else if (/^[\d,]+$/.test(text)) {
        value = parseInt(text.replace(/,/g, ''), 10);
    }
    // Pattern: "45k", "2L"
    else if (/^\d+\.?\d*\s*[klm]$/i.test(text)) {
        const match = text.match(/^(\d+\.?\d*)\s*([klm])$/i);
        if (match) {
            value = parseFloat(match[1]) * (wordToNumber[match[2].toLowerCase()] || 1);
        }
    }
    // Pattern: "ten", "twenty thousand", "five hundred"
    else {
        // Try to parse word numbers
        const words = text.split(/\s+/);
        let currentNum = 0;
        let multiplier = 1;

        for (const word of words) {
            const num = wordToNumber[word];
            if (num !== undefined) {
                if (num >= 100) {
                    if (currentNum === 0) currentNum = 1;
                    if (num >= 1000) {
                        currentNum *= num;
                        multiplier = 1;
                    } else {
                        currentNum *= num;
                    }
                } else {
                    currentNum += num;
                }
            }
        }
        value = currentNum;
    }

    // If we couldn't parse a valid number, return original with ₹
    if (value <= 0 || isNaN(value)) {
        // Just add ₹ if not already there
        return `₹${input.replace(/^₹|^rs\.?\s*/i, '').trim()}`;
    }

    return `₹${formatIndianNumber(value)}${suffix}`;
}

/**
 * Check if description contains phone numbers (10 continuous digits)
 * Returns true if phone number is found (invalid)
 */
export function containsPhoneNumber(text: string): boolean {
    if (!text) return false;

    // Remove all non-digit characters and check for 10+ continuous digits
    // Also check for patterns like "98765 43210" or "9876-543-210"
    const digitsOnly = text.replace(/[\s\-\.\(\)]/g, '');

    // Check for 10 continuous digits
    if (/\d{10,}/.test(digitsOnly)) {
        return true;
    }

    // Check for phone patterns like "9876543210", "98765-43210", "98765 43210"
    const phonePatterns = [
        /\d{5}\s*\d{5}/,           // 98765 43210
        /\d{3}\s*\d{3}\s*\d{4}/,   // 987 654 3210
        /\d{4}\s*\d{3}\s*\d{3}/,   // 9876 543 210
        /\d{5}-\d{5}/,             // 98765-43210
        /\d{3}-\d{3}-\d{4}/,       // 987-654-3210
    ];

    for (const pattern of phonePatterns) {
        if (pattern.test(text)) {
            return true;
        }
    }

    return false;
}
