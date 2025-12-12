import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Freepo.in",
    description: "Terms of service for Freepo.in - India's free classifieds platform.",
};

export default function TermsPage() {
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
                        <FileText size={32} />
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="prose prose-lg text-gray-800 font-serif mt-6">
                        <p className="text-sm text-gray-500">Effective Date: December 2024</p>

                        <p className="mt-4">
                            By using Freepo.in, you agree to these Terms of Service.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} /> 1. Acceptance of Terms
                        </h3>
                        <p className="text-sm sm:text-base">
                            By accessing Freepo.in, you agree to be bound by these terms.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">2. User Eligibility</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li>You must be at least 18 years old</li>
                            <li>You must provide accurate contact information</li>
                            <li>You are responsible for your listings</li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> 3. Prohibited Content
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li>Illegal items (drugs, weapons, stolen goods)</li>
                            <li>Adult content or escort services</li>
                            <li>Fraudulent or misleading listings</li>
                            <li>Spam, duplicate posts</li>
                            <li>Hate speech or harassment</li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">4. Posting Rules</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li><strong>One post per 30 days</strong> per phone number</li>
                            <li>All listings expire after 30 days</li>
                            <li>Posts must be in appropriate category</li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">5. Disclaimer</h3>
                        <p className="text-sm sm:text-base">
                            Freepo.in does NOT verify users or listings. All transactions are at your own risk.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">6. Governing Law</h3>
                        <p className="text-sm sm:text-base">
                            These terms are governed by the laws of India.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
