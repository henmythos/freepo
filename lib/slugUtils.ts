export function generateSlug(title: string, city: string, category: string) {
    return `${title} ${category} ${city}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

export function extractIdFromSlug(slug: string): string | null {
    const parts = slug.split("-iid-");
    return parts.length > 1 ? parts.pop() || null : null;
}
