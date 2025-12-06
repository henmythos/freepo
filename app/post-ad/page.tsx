"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import UniversalForm from "@/components/UniversalForm";
import { CreatePostRequest } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function PostAdPage() {
    const router = useRouter();

    const handleSubmit = async (data: CreatePostRequest) => {
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

            alert("Ad Published Successfully!");
            router.push("/");
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

                <UniversalForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
