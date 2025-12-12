import Link from "next/link";
import { ArrowLeft, Lock, Eye, Shield, Globe, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Freepo.in",
    description: "Privacy policy for Freepo.in - India's free classifieds platform.",
};

export default function PrivacyPage() {
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
                        <Lock size={32} />
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-lg text-gray-800 font-serif mt-6">
                        <p className="text-sm text-gray-500">Last Updated: December 2024</p>

                        <p className="mt-4">
                            At Freepo.in, your privacy is our priority. We operate as a &quot;no-login&quot; classified ads platform,
                            meaning we collect minimal personal data while providing maximum functionality.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Eye size={16} /> 1. Information We Collect
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li><strong>Post Data:</strong> Information you voluntarily provide when creating a listing.</li>
                            <li><strong>Contact Information:</strong> Phone numbers you provide are displayed publicly.</li>
                            <li><strong>Technical Data:</strong> IP addresses for security and fraud prevention.</li>
                            <li><strong>Usage Data:</strong> Anonymous page views to improve our service.</li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Shield size={16} /> 2. How We Use Your Information
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li>Display your classified ads to potential buyers/sellers</li>
                            <li>Prevent spam, fraud, and abuse</li>
                            <li>Enforce our one-post-per-30-days policy</li>
                            <li>Improve website performance</li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Globe size={16} /> 3. Data Sharing
                        </h3>
                        <p className="text-sm sm:text-base">
                            We do <strong>not</strong> sell or share your personal information with third parties for marketing.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <Clock size={16} /> 4. Data Retention
                        </h3>
                        <p className="text-sm sm:text-base">
                            All listings automatically expire after <strong>30 days</strong> and are permanently deleted.
                        </p>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">5. Contact Us</h3>
                        <p className="text-sm sm:text-base">
                            For privacy concerns: <a href="mailto:supthenexte@gmail.com" className="underline font-bold">supthenexte@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
