"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaidX49Redirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to posting page with SECRET CONTEXT
        // Plan: verified_30 (₹49)
        // Token: matches backend check
        router.replace("/post-ad?paid=1&plan=verified_30&security_token=freepo_secure_7734_hash");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
                <p className="text-gray-500">Redirecting to Premium Posting Form</p>
            </div>
        </div>
    );
}
