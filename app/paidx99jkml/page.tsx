"use client";

import UniversalForm from "@/components/UniversalForm";
import { CreatePostRequest } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function PaidFeaturedPage() {
    const router = useRouter();
    // This page is HIDDEN from navigation.
    // Users only arrive here after successful payment on Razorpay.
    // The Token MUST match the API server secret.
    const SECRET_TOKEN = "freepo_secure_7734_hash";

    const handlePostSubmit = async (data: CreatePostRequest) => {
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Failed to publish ad");
                return;
            }

            alert("Premium Ad Published Successfully! Featured & Verified Badges Active.");
            router.push("/");
        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to publish ad. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-2xl mx-auto py-8 px-4">
                <UniversalForm
                    initialPlan="featured_60"  // ₹99 Plan
                    isPaid={true}              // Unlocks UI
                    securityToken={SECRET_TOKEN} // Authorizes API
                    onSubmit={handlePostSubmit}
                />
            </div>
        </div>
    );
}
