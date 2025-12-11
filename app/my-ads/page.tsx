"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, ArrowRight } from "lucide-react";
import { Post } from "@/lib/types";

export default function MyAdsPage() {
    const [phone, setPhone] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/posts?phone=${phone}`);
            const data = await res.json();
            setPosts(data);
            setHasSearched(true);
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Failed to fetch ads. Please try again.");
        }
        setIsLoading(false);
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this ad? This cannot be undone.")) {
            return;
        }

        setIsDeleting(postId);
        try {
            const res = await fetch(`/api/posts?id=${postId}&phone=${phone}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
                alert("Ad deleted successfully.");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete ad.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete ad.");
        }
        setIsDeleting(null);
    };

    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-2xl mx-auto py-8 px-4">
                <Link
                    href="/"
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline text-gray-500"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>

                <h1 className="font-serif text-3xl font-bold mb-6">Manage Your Ads</h1>

                <div className="bg-white p-6 border border-gray-200 shadow-lg mb-8">
                    <form onSubmit={handleSearch} className="flex gap-2 items-end">
                        <div className="flex-grow">
                            <label className="block font-bold text-sm uppercase mb-2">
                                Registered Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your mobile number"
                                className="w-full border-2 border-black p-3 font-sans text-lg"
                                maxLength={10}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-black text-white px-6 py-3.5 font-bold uppercase text-sm hover:bg-gray-800 disabled:opacity-50 h-[54px]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Find Ads"}
                        </button>
                    </form>
                </div>

                {hasSearched && (
                    <div className="space-y-4">
                        <h2 className="font-bold border-b-2 border-gray-200 pb-2 mb-4">
                            Your Active Ads ({posts.length})
                        </h2>

                        {posts.length === 0 ? (
                            <div className="text-gray-500 italic text-center py-8">
                                No active ads found for this number.
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white border border-gray-200 p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                                    <div className="flex-grow">
                                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">
                                            {post.category}
                                        </div>
                                        <h3 className="font-serif font-bold text-lg mb-1 line-clamp-1">
                                            {post.title}
                                        </h3>
                                        <div className="text-xs text-gray-500">
                                            Posted: {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <Link href={`/post/${post.id}`} target="_blank" className="text-gray-400 hover:text-black">
                                            <ArrowRight size={20} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            disabled={isDeleting === post.id}
                                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                                            title="Delete Ad"
                                        >
                                            {isDeleting === post.id ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <Trash2 size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
