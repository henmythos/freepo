import { notFound } from "next/navigation";
import Link from "next/link";
import { getDB } from "@/lib/db";
import { CATEGORY_IMAGES } from "@/lib/constants";
import { Post, Category } from "@/lib/types";
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    Briefcase,
} from "lucide-react";
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

        // Increment view count
        await db.execute({
            sql: "UPDATE posts SET views = views + 1 WHERE id = ?",
            args: [id],
        });

        return result.rows[0] as unknown as Post;
    } catch (e) {
        console.error("[GET POST ERROR]", e);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPost(params.id);
    if (!post) {
        return { title: "Post Not Found | Freepo.online" };
    }
    return {
        title: `${post.title} - ${post.city} | Freepo.online`,
        description: post.description?.substring(0, 160),
        openGraph: {
            title: `${post.title} - ${post.city}`,
            description: post.description?.substring(0, 160),
            images: [CATEGORY_IMAGES[post.category as Category] || CATEGORY_IMAGES.Community],
        },
    };
}

export default async function PostDetailPage({ params }: PageProps) {
    const post = await getPost(params.id);

    if (!post) {
        notFound();
    }

    const categoryImage = CATEGORY_IMAGES[post.category as Category] || CATEGORY_IMAGES.Community;

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link
                    href="/"
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline text-gray-500"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </Link>

                {/* Hero Images */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(post.image1 || post.image2) ? (
                        <>
                            {post.image1 && (
                                <div className="h-64 border border-gray-200 bg-gray-100 relative overflow-hidden group">
                                    <img
                                        src={post.image1}
                                        alt={post.image1_alt || post.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                            )}
                            {post.image2 && (
                                <div className="h-64 border border-gray-200 bg-gray-100 relative overflow-hidden group">
                                    <img
                                        src={post.image2}
                                        alt={post.image2_alt || post.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="md:col-span-2 h-48 md:h-64 overflow-hidden border border-gray-200 bg-gray-100 relative">
                            <img
                                src={categoryImage}
                                alt={post.category}
                                className="w-full h-full object-cover opacity-90"
                            />
                            <div className="absolute bottom-0 left-0 bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest">
                                {post.category}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-b-2 border-black pb-4 mb-6">
                    <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        <span>{post.city}</span> •{" "}
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    <h1 className="font-serif text-2xl md:text-4xl font-bold text-ink leading-tight mb-4 break-words">
                        {post.title}
                    </h1>

                    {post.category === "Jobs" && post.company_name && (
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-serif text-lg border-l-4 border-black pl-3">
                            <Briefcase size={20} />
                            <span className="font-bold">{post.company_name}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-lg font-sans font-medium">
                        {post.price && (
                            <span className="bg-gray-100 px-3 py-1">{post.price}</span>
                        )}
                        {post.salary && (
                            <span className="bg-gray-100 px-3 py-1">{post.salary}</span>
                        )}
                        {post.job_type && (
                            <span className="border border-gray-300 px-3 py-1 text-sm pt-1.5">
                                {post.job_type}
                            </span>
                        )}
                    </div>
                </div>

                <div className="prose prose-lg font-serif text-gray-800 mb-8 whitespace-pre-wrap break-words">
                    {post.description}
                </div>

                {post.experience && (
                    <div className="mb-4 text-sm text-gray-600">
                        <strong>Experience Required:</strong> {post.experience}
                    </div>
                )}
                {post.education && (
                    <div className="mb-8 text-sm text-gray-600">
                        <strong>Education Required:</strong> {post.education}
                    </div>
                )}

                <div className="bg-gray-50 border-t border-b border-gray-200 py-6 px-4 md:px-8">
                    <h3 className="font-sans font-bold uppercase text-sm mb-4 tracking-wider">
                        Contact Advertiser
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4">
                        <a
                            href={`tel:${post.contact_phone}`}
                            className="flex-1 bg-black text-white text-center py-3 font-bold uppercase text-sm hover:bg-gray-800 flex justify-center items-center gap-2"
                        >
                            <Phone size={16} /> Call Now
                        </a>

                        {post.whatsapp && (
                            <a
                                href={`https://wa.me/91${post.whatsapp}?text=${encodeURIComponent(`I am interested in your listing "${post.title}" from Freepo.online`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-[#25D366] text-white text-center py-3 font-bold uppercase text-sm hover:bg-[#128c7e] flex justify-center items-center gap-2"
                            >
                                <MessageCircle size={18} /> WhatsApp
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Mention &quot;Freepo&quot; when calling to get a better response.
                    </p>
                </div>

                {/* JSON-LD for Jobs */}
                {post.category === "Jobs" && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org/",
                                "@type": "JobPosting",
                                title: post.title,
                                description: post.description,
                                datePosted: post.created_at,
                                validThrough: post.expires_at,
                                employmentType: (post.job_type || "FULL_TIME")
                                    .toUpperCase()
                                    .replace(" ", "_"),
                                hiringOrganization: {
                                    "@type": "Organization",
                                    name: post.company_name || "Confidential",
                                },
                                jobLocation: {
                                    "@type": "Place",
                                    address: {
                                        "@type": "PostalAddress",
                                        addressLocality: post.city,
                                        addressCountry: "IN",
                                    },
                                },
                                baseSalary: post.salary
                                    ? {
                                        "@type": "MonetaryAmount",
                                        currency: "INR",
                                        value: {
                                            "@type": "QuantitativeValue",
                                            value: post.salary,
                                        },
                                    }
                                    : undefined,
                            }),
                        }}
                    />
                )}
            </div>
        </div>
    );
}
