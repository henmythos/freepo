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
    Eye,
    MapPin,
} from "lucide-react";
import { formatPrice } from "@/lib/priceUtils";
import type { Metadata } from "next";
import ImageCarousel from "@/components/ImageCarousel";
import ShareButton from "@/components/ShareButton";
import TrackView from "@/components/TrackView";
import GridPostCard from "@/components/GridPostCard";
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

        return result.rows[0] as unknown as Post;
    } catch (e) {
        console.error("[GET POST ERROR]", e);
        return null;
    }
}

async function getRelatedPosts(category: string, city: string, excludeId: number | string): Promise<Post[]> {
    try {
        const db = getDB();
        const result = await db.execute({
            sql: `
                SELECT * FROM posts 
                WHERE category = ? AND city = ? AND id != ? 
                ORDER BY created_at DESC 
                LIMIT 4
            `,
            args: [category, city, excludeId],
        });
        return result.rows as unknown as Post[];
    } catch (e) {
        console.error("[GET RELATED POSTS ERROR]", e);
        return [];
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
            images: post.image1
                ? [{ url: post.image1, alt: post.title }]
                : [CATEGORY_IMAGES[post.category as Category] || CATEGORY_IMAGES.Community],
            type: 'article',
            locale: 'en_IN',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${post.title} - ${post.city}`,
            description: post.description?.substring(0, 100),
            images: post.image1 ? [post.image1] : undefined,
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

    const relatedPosts = await getRelatedPosts(post.category, post.city, post.id);

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
            {/* Track this view in localStorage for Recently Viewed */}
            <TrackView id={post.id} title={post.title} slug={params.slug} />

            {/* Scrolling Marquee Banner */}
            <div className="bg-black text-white overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block py-2 text-xs md:text-sm font-bold uppercase tracking-widest">
                    <span className="mx-8">🇮🇳 India&apos;s #1 Newspaper Style Classifieds</span>
                    <span className="mx-8">•</span>
                    <span className="mx-8">Buy, Sell, Rent, Jobs - 100% Free</span>
                    <span className="mx-8">•</span>
                    <span className="mx-8">Post Your Ad Now at Freepo.in</span>
                    <span className="mx-8">•</span>
                    <span className="mx-8">🇮🇳 India&apos;s #1 Newspaper Style Classifieds</span>
                    <span className="mx-8">•</span>
                    <span className="mx-8">Buy, Sell, Rent, Jobs - 100% Free</span>
                    <span className="mx-8">•</span>
                    <span className="mx-8">Post Your Ad Now at Freepo.in</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link
                    href={`/?city=${encodeURIComponent(post.city)}&category=${encodeURIComponent(post.category)}`}
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline text-gray-500"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </Link>



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
                        {post.views > 0 && (
                            <span className="flex items-center gap-1">• <Eye size={12} /> {post.views} views</span>
                        )}
                        {post.public_ad_id && (
                            <span className="flex items-center gap-1">• Ad ID: {post.public_ad_id}</span>
                        )}
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
                        {post.price && post.price !== "0" && post.price !== "₹0" && (
                            <span className="bg-gray-100 px-3 py-1">{formatPrice(post.price)}</span>
                        )}
                        {post.salary && post.salary !== "0" && post.salary !== "₹0" && (
                            <span className="bg-gray-100 px-3 py-1">{formatPrice(post.salary)}</span>
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

                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check this out on Freepo.in: ${post.title} - https://freepo.in/item/${params.slug}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 md:flex-none border border-[#25D366] text-[#25D366] text-center py-3 font-bold uppercase text-sm hover:bg-[#25D366] hover:text-white flex justify-center items-center gap-2 transition-colors"
                        >
                            <MessageCircle size={16} /> Share
                        </a>

                        <div className="flex-1 md:flex-none md:w-32">
                            <ShareButton
                                title={`Check out this ${post.category} on Freepo.in: ${post.title}`}
                                text={post.description?.substring(0, 100) + "..."}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Mention &quot;Freepo&quot; when calling for better response.
                        </p>
                        <a
                            href={`mailto:freepo.in@gmail.com?subject=Report Spam: ${encodeURIComponent(post.title)}&body=I want to report this listing as spam/scam:%0A%0APost: ${encodeURIComponent(post.title)}%0ALink: https://freepo.in/item/${params.slug}%0A%0AReason: `}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                        >
                            Report Spam
                        </a>
                    </div>
                </div>

                {/* Safety Disclaimer for specific categories */}
                {(post.category === "Jobs" || post.category === "Services" || post.category === "Buy/Sell") && (
                    <div className="bg-yellow-50 border border-yellow-200 mt-6 p-4 rounded text-sm text-yellow-800">
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <span className="text-xl">⚠️</span> Safety Alert
                        </h4>
                        <p>
                            <strong>NEVER pay any money upfront</strong> for jobs, loans, or to receive a delivery.
                            Freepo.in is a free platform and does not verify every advertiser.
                            Meet sellers in person in public places for transactions.
                        </p>
                    </div>
                )}

                {/* Location Section */}
                <div className="bg-gray-50 border-t border-b border-gray-200 py-6 px-4 md:px-8 mt-6">
                    <h3 className="font-sans font-bold uppercase text-sm mb-4 tracking-wider flex items-center gap-2">
                        <MapPin size={16} /> Posted Location
                    </h3>
                    <div className="mb-4">
                        <p className="text-gray-700 font-medium">
                            <span className="font-bold text-ink">{post.city}</span>
                            {post.locality && (
                                <span className="text-gray-600">, {post.locality}</span>
                            )}
                        </p>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border border-gray-200 mb-3">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                                post.locality ? `${post.locality}, ${post.city}, India` : `${post.city}, India`
                            )}&zoom=12`}
                            title={`Map showing ${post.city}${post.locality ? `, ${post.locality}` : ''}`}
                        ></iframe>
                    </div>

                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            post.locality ? `${post.locality}, ${post.city}, India` : `${post.city}, India`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <MapPin size={14} /> Open in Google Maps
                    </a>
                </div>

                {/* CTA Banners */}
                <div className="mt-8 bg-black text-white p-6 rounded-lg text-center">
                    <h3 className="font-serif text-xl font-bold mb-2">Have something to sell?</h3>
                    <p className="text-sm text-gray-300 mb-4">Post your free ad on Freepo.in in 30 seconds.</p>
                    <Link
                        href="/post-ad"
                        className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-sm uppercase hover:bg-gray-100 transition shadow-lg"
                    >
                        + Post Free Ad
                    </Link>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-12 pt-8 border-t-4 border-black">
                        <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                            Related in {post.city}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            {relatedPosts.map(related => (
                                <div key={related.id} className="h-full">
                                    <GridPostCard post={related} />
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <Link
                                href={`/${post.category.toLowerCase()}/${post.city.toLowerCase()}`}
                                className="text-sm font-bold underline hover:text-blue-600"
                            >
                                View More {post.category} in {post.city}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-12 text-center pb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 font-bold uppercase text-sm hover:text-black border border-gray-300 px-6 py-3 rounded hover:border-black transition"
                    >
                        Go to Home
                    </Link>
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
                                datePosted: new Date(post.created_at).toISOString(),
                                validThrough: new Date(new Date(post.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
                                employmentType: (post.job_type || "FULL_TIME").toUpperCase().replace(" ", "_"),
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
                                        addressCountry: "IN"
                                    },
                                    ...(post.latitude && post.longitude ? {
                                        geo: {
                                            "@type": "GeoCoordinates",
                                            latitude: post.latitude,
                                            longitude: post.longitude
                                        }
                                    } : {})
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
                                jobLocationType: undefined, // Default to physical unless specified otherwise
                            }),
                        }}
                    />
                )}

                {/* JSON-LD for Products (Cars, Bikes, Electronics, etc.) */}
                {["Cars", "Bikes", "Electronics", "Buy/Sell", "Properties", "Rentals"].includes(post.category) && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org/",
                                "@type": "Product",
                                name: post.title,
                                description: post.description,
                                image: [
                                    post.image1,
                                    post.image2,
                                    post.image3
                                ].filter(Boolean),
                                offers: {
                                    "@type": "Offer",
                                    url: `https://freepo.in/item/${params.slug}`,
                                    priceCurrency: "INR",
                                    price: parseFloat(post.price?.replace(/[^0-9.]/g, '') || "0") || 0,
                                    priceValidUntil: new Date(new Date(post.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                                    itemCondition: "https://schema.org/UsedCondition", // Default assumption for classifieds
                                    availability: "https://schema.org/InStock",
                                    availableAtOrFrom: {
                                        "@type": "Place",
                                        address: {
                                            "@type": "PostalAddress",
                                            addressLocality: post.locality ? `${post.locality}, ${post.city}` : post.city,
                                            addressRegion: post.city,
                                            addressCountry: "IN"
                                        },
                                        ...(post.latitude && post.longitude ? {
                                            geo: {
                                                "@type": "GeoCoordinates",
                                                latitude: post.latitude,
                                                longitude: post.longitude
                                            }
                                        } : {})
                                    }
                                }
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
                                "name": post.category,
                                "item": `https://freepo.in/${post.category.toLowerCase()}`
                            }, {
                                "@type": "ListItem",
                                "position": 3,
                                "name": `${post.category} in ${post.city}`,
                                "item": `https://freepo.in/${post.category.toLowerCase()}/${post.city.toLowerCase().replace(/ /g, '-')}`
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
        </div >
    );
}
