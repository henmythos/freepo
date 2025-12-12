import Link from "next/link";
import { ArrowLeft, Info, Globe, CheckCircle, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Freepo.in",
    description: "Learn about Freepo.in - India's fastest, simplest, and free classifieds platform.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-paper">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Link
                    href="/"
                    className="mb-6 flex items-center text-sm font-bold uppercase hover:underline"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>

                <div className="bg-white p-4 sm:p-6 md:p-10 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                        <Info size={32} />
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold">About Freepo</h1>
                    </div>

                    <div className="prose prose-lg text-gray-800 font-serif mt-6">
                        <p className="text-lg sm:text-xl font-medium leading-relaxed">
                            Freepo.in is India&apos;s fastest, simplest, and completely free classified ads platform —
                            designed with the look and feel of a classic newspaper.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Globe size={16} /> Our Mission
                        </h3>
                        <p className="text-sm sm:text-base">
                            We believe buying and selling locally should be simple, fast, and free. No sign-ups, no fees.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} /> Why Freepo?
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex gap-3 items-start">
                                <span className="bg-black text-white px-2 py-1 text-xs font-bold">FREE</span>
                                <span><strong>100% Free Forever:</strong> No hidden charges.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-black text-white px-2 py-1 text-xs font-bold">FAST</span>
                                <span><strong>Instant Publishing:</strong> Post in seconds.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="bg-black text-white px-2 py-1 text-xs font-bold">SIMPLE</span>
                                <span><strong>No Login Required:</strong> Just fill and post.</span>
                            </li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Users size={16} /> Categories
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                            <span className="bg-gray-100 px-3 py-2 text-center">Jobs</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Properties</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Rentals</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Cars</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Bikes</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Electronics</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Services</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Buy/Sell</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Education</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Events</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Community</span>
                            <span className="bg-gray-100 px-3 py-2 text-center">Lost & Found</span>
                        </div>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">How It Works</h3>
                        <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
                            <li><strong>Post Your Ad:</strong> Fill out a simple form.</li>
                            <li><strong>Get Calls:</strong> Buyers contact you directly.</li>
                            <li><strong>Meet & Sell:</strong> Complete the transaction.</li>
                            <li><strong>Auto-Expire:</strong> Ads expire after 30 days.</li>
                        </ol>

                        <div className="bg-gray-100 p-6 mt-8 text-center border border-gray-300">
                            <p className="font-bold text-lg">Made with ❤️ in India 🇮🇳</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Freepo.in — Connecting buyers and sellers since 2024
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
