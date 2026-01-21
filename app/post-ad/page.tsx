"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import UniversalForm from "@/components/UniversalForm";
import { CreatePostRequest } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { generateSlug } from "@/lib/slugUtils";

function PostAdContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract Plan Context
    const planParam = searchParams.get("plan");
    const paidParam = searchParams.get("paid");
    const securityToken = searchParams.get("security_token") || undefined;

    // Validate Plan (simple check, backend does strict check)
    // Map existing/new params to strictly supported plans
    let initialPlan = "free";
    if (planParam === "featured_plus_60") initialPlan = "featured_plus_60";
    else if (planParam === "verified_30") initialPlan = "verified_30";
    else if (planParam === "featured_30") initialPlan = "verified_30"; // Backward compat
    else if (planParam === "featured_60") initialPlan = "featured_plus_60"; // Backward compat

    const isPaid = paidParam === "1" && !!securityToken;

    const [successData, setSuccessData] = useState<{ id: string, public_ad_id: string } | null>(null);
    const [countdown, setCountdown] = useState(6);

    // Success Countdown Effect
    useEffect(() => {
        if (!successData) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [successData, router]);

    const handleShare = async () => {
        if (!successData) return;
        const url = `${window.location.origin}/item/${generateSlug("My Ad", successData.public_ad_id, "Listing")}-iid-${successData.id}`; // Construct a simplified valid URL or better, use the post structure if available, but here we might lack slug details. Ideally we trust the user finding it or use a generic link. 
        // Better: Just share the home link or waiting for redirect. 
        // ACTUALLY: The user wants to share the specific ad. 
        // We lack the slug here easily without reconstructing it or getting it from API. 
        // Let's use a generic copy text like "Check out my ad ID: [ID] on Freepo.in"
        const text = `Check out my ad on Freepo.in! Ad ID: ${successData.public_ad_id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Freepo Ad',
                    text: text,
                    url: window.location.origin
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert("Ad ID copied to clipboard!");
            } catch (err) {
                alert("Failed to copy");
            }
        }
    };

    const handleSubmit = async (data: CreatePostRequest) => {
        try {
            // Inject plan data if not present (UniversalForm handles this, but safety double-check)
            const finalData = {
                ...data,
                listing_plan: data.listing_plan || initialPlan,
                paid_verified: isPaid,
                security_token: securityToken
            };

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Failed to publish ad");
                return;
            }

            // Redirection Logic
            // For Paid flows (Verified/Featured), we are ALREADY PAID, so we show success immediately.
            // Only if "free" and somehow we want to upsell (not in this flow), we would redirect.

            // SUCCESS STATE
            setSuccessData({ id: result.id, public_ad_id: result.public_ad_id });
            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to publish ad. Please try again.");
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border-t-4 border-green-500">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ad Published Successfully!</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        {initialPlan === "featured_plus_60" ? "Your Featured Plus ad is live!" :
                            initialPlan === "verified_30" ? "Your Verified ad is live!" :
                                "Your ad is now active."}
                    </p>

                    <div className="bg-gray-100 p-4 rounded-md mb-6 border border-gray-200">
                        <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-1">Ad Reference ID</p>
                        <p className="text-3xl font-mono font-bold text-black tracking-widest">{successData.public_ad_id}</p>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Share Ad ID
                    </button>

                    <p className="text-sm text-gray-500">
                        Redirecting to home in <span className="font-bold text-black">{countdown}</span> seconds...
                    </p>

                    <Link href="/" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 underline">
                        Go to Home Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-2xl mx-auto py-8 px-4">
                <Link
                    href="/"
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>

                <UniversalForm
                    onSubmit={handleSubmit}
                    initialPlan={initialPlan}
                    isPaid={isPaid}
                    securityToken={securityToken}
                />
            </div>
        </div>
    );
}

export default function PostAdPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PostAdContent />
        </Suspense>
    );
}
