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
import ImageCarousel from "@/components/ImageCarousel";
import ShareButton from "@/components/ShareButton";
import { extractIdFromSlug } from "@/lib/slugUtils";

interface PageProps {
    params: { slug: string };
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
    const id = extractIdFromSlug(params.slug);
    if (!id) {
        return { title: "Post Not Found | Freepo.in" };
    }

    const post = await getPost(id);
    if (!post) {
        return { title: "Post Not Found | Freepo.in" };
    }
    return {
        title: `${post.title} - ${post.city} | Freepo.in`,
        description: post.description?.substring(0, 160),
        openGraph: {
            title: `${post.title} - ${post.city}`,
            description: post.description?.substring(0, 160),
            images: [CATEGORY_IMAGES[post.category as Category] || CATEGORY_IMAGES.Community],
        },
        alternates: {
            canonical: `https://freepo.in/item/${params.slug}`,
        },
    };
}

export default async function ItemDetailPage({ params }: PageProps) {
    const id = extractIdFromSlug(params.slug);

    if (!id) {
        notFound();
    }

    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    const categoryImage = CATEGORY_IMAGES[post.category as Category] || CATEGORY_IMAGES.Community;

    // Prepare images for carousel
    const images = [
        { src: post.image1 || "", alt: post.image1_alt || post.title },
        { src: post.image2 || "", alt: post.image2_alt || post.title },
        { src: post.image3 || "", alt: post.image3_alt || post.title },
        { src: post.image4 || "", alt: post.image4_alt || post.title },
        { src: post.image5 || "", alt: post.image5_alt || post.title },
    ];

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link
                    href={`/?city=${encodeURIComponent(post.city)}&category=${encodeURIComponent(post.category)}`}
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline text-gray-500"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </Link>

                {/* Canonical Link (Backup for head) */}
                <link rel="canonical" href={`https://freepo.in/item/${params.slug}`} />

                {/* Image Carousel */}
                <div className="mb-6">
                    <ImageCarousel
                        images={images}
                        fallback={{ src: categoryImage, alt: post.category }}
                    />
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
                    {post.contact_name && (
                        <div className="mb-4 text-gray-700 font-medium">
                            Posted by: <span className="font-bold text-ink">{post.contact_name}</span>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4">
                        {(post.contact_preference === "call" || !post.contact_preference || post.contact_preference === "both") && (
                            <a
                                href={`tel:${post.contact_phone}`}
                                className="flex-1 bg-black text-white text-center py-3 font-bold uppercase text-sm hover:bg-gray-800 flex justify-center items-center gap-2"
                            >
                                <Phone size={16} /> Call Now
                            </a>
                        )}

                        {(post.contact_preference === "whatsapp" || !post.contact_preference || post.contact_preference === "both") && (
                            <a
                                href={`https://wa.me/91${post.whatsapp || post.contact_phone}?text=${encodeURIComponent(`I am interested in your listing "${post.title}" from Freepo.in`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-[#25D366] text-white text-center py-3 font-bold uppercase text-sm hover:bg-[#128c7e] flex justify-center items-center gap-2"
                            >
                                <MessageCircle size={18} /> WhatsApp
                            </a>
                        )}

                        <div className="flex-1 md:flex-none md:w-32">
                            <ShareButton
                                title={`Check out this ${post.category} on Freepo.in: ${post.title}`}
                                text={post.description?.substring(0, 100) + "..."}
                            />
                        </div>
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
                                    logo: "https://freepo.in/logo.png"
                                },
                                jobLocation: {
                                    "@type": "Place",
                                    address: {
                                        "@type": "PostalAddress",
                                        addressLocality: post.city,
                                        addressRegion: post.city,
                                        addressCountry: "IN",
                                    },
                                },
                                applicantLocationRequirements: {
                                    "@type": "Country",
                                    name: "India"
                                },
                                baseSalary: post.salary
                                    ? {
                                        "@type": "MonetaryAmount",
                                        currency: "INR",
                                        value: {
                                            "@type": "QuantitativeValue",
                                            value: parseFloat(post.salary.replace(/[^0-9.]/g, '')) || 0,
                                            unitText: "MONTH"
                                        },
                                    }
                                    : undefined,
                                jobLocationType: "TELECOMMUTE",
                            }),
                        }}
                    />
                )}

                {/* Breadcrumb Schema for All Posts */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [{
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://freepo.in"
                            }, {
                                "@type": "ListItem",
                                "position": 2,
                                "name": post.city,
                                "item": `https://freepo.in/?city=${encodeURIComponent(post.city)}`
                            }, {
                                "@type": "ListItem",
                                "position": 3,
                                "name": post.category,
                                "item": `https://freepo.in/?city=${encodeURIComponent(post.city)}&category=${encodeURIComponent(post.category)}`
                            }, {
                                "@type": "ListItem",
                                "position": 4,
                                "name": post.title,
                                "item": `https://freepo.in/item/${params.slug}`
                            }]
                        })
                    }}
                />
            </div>
        </div>
    );
}
