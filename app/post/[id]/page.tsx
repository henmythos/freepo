import { notFound, permanentRedirect } from "next/navigation";
import { getDB } from "@/lib/db";
import { Post } from "@/lib/types";
import { generateSlug } from "@/lib/slugUtils";
import type { Metadata } from "next";

interface PageProps {
    params: { id: string };
}

async function getPost(id: string): Promise<Post | null> {
    try {
        const db = getDB();
        const result = await db.execute({
            sql: "SELECT * FROM posts WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0] as unknown as Post;
    } catch (e) {
        console.error("[GET POST ERROR]", e);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPost(params.id);
    if (!post) {
        return { title: "Post Not Found | Freepo.in" };
    }
    // Metadata is not strictly needed for a redirecting page, but good for bots that might crawl it before redirect
    return {
        title: `${post.title} - ${post.city} | Freepo.in`,
    };
}

export default async function PostDetailPage({ params }: PageProps) {
    const post = await getPost(params.id);

    if (!post) {
        notFound();
    }

    const slug = generateSlug(post.title, post.city, post.category);
    permanentRedirect(`/item/${slug}-iid-${post.id}`);
}
