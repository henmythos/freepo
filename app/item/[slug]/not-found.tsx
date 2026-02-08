import Link from "next/link";
import { FileQuestion, Home, Plus } from "lucide-react";

/**
 * Custom 410 Gone page for deleted/expired classified ads.
 * This tells Google the page was removed permanently and should be de-indexed,
 * rather than 404 which Google may keep rechecking.
 */
export default function ItemNotFound() {
    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <FileQuestion size={64} className="mx-auto mb-6 text-gray-400" />

                <h1 className="font-serif text-4xl font-black uppercase mb-2 tracking-tighter">
                    Ad Removed
                </h1>

                <div className="h-1 w-20 bg-black mx-auto mb-6"></div>

                <h2 className="font-bold text-xl mb-4">
                    This Ad is No Longer Available
                </h2>

                <p className="text-gray-600 mb-8 font-serif leading-relaxed">
                    This classified ad has expired or been removed by the seller.
                    Check out similar listings on our homepage.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
                    >
                        <Home size={16} /> Browse Active Listings
                    </Link>

                    <Link
                        href="/post-ad"
                        className="flex items-center justify-center gap-2 w-full border-2 border-black text-black py-3 font-bold uppercase text-sm hover:bg-gray-100 transition-colors"
                    >
                        <Plus size={16} /> Post Free Ad
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-xs font-mono text-gray-400">
                Status: 410 Gone - Ad Expired/Removed
            </div>
        </div>
    );
}
