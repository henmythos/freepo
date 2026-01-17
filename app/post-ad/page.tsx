"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import UniversalForm from "@/components/UniversalForm";
import { CreatePostRequest } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function PostAdContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract Plan Context
    const planParam = searchParams.get("plan");
    const paidParam = searchParams.get("paid");

    // Validate Plan (simple check, backend does strict check)
    const initialPlan = (planParam === "featured_30" || planParam === "featured_60") ? planParam : "free";
    const isPaid = paidParam === "1";

    const handleSubmit = async (data: CreatePostRequest) => {
        try {
            // Inject plan data if not present (UniversalForm handles this, but safety double-check)
            const finalData = {
                ...data,
                listing_plan: initialPlan,
                paid_verified: isPaid
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
            if (finalData.listing_plan === "featured_30") {
                window.location.href = "https://rzp.io/rzp/freepo49";
            } else if (finalData.listing_plan === "featured_60") {
                window.location.href = "https://rzp.io/rzp/freepo99";
            } else {
                alert("Ad Published Successfully!");
                router.push("/");
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to publish ad. Please try again.");
        }
    };

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
