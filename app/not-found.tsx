import Link from "next/link";
import { FileQuestion, Home, Plus } from "lucide-react";

export const metadata = {
    title: "Page Not Found - Freepo.in",
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <FileQuestion size={64} className="mx-auto mb-6 text-gray-400" />

                <h1 className="font-serif text-4xl font-black uppercase mb-2 tracking-tighter">
                    404 Error
                </h1>

                <div className="h-1 w-20 bg-black mx-auto mb-6"></div>

                <h2 className="font-bold text-xl mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 mb-8 font-serif leading-relaxed">
                    The classified ad or page you are looking for might have been removed, sold, or simply doesn&apos;t exist.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
                    >
                        <Home size={16} /> Go to Homepage
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
                Error Code: 404_NOT_FOUND
            </div>
        </div>
    );
}
