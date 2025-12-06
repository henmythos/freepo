import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Freepo.online",
    description: "Contact Freepo.online for support, feedback, or business inquiries.",
};

export default function ContactPage() {
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
                        <Mail size={32} />
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Contact Us</h1>
                    </div>

                    <div className="prose prose-lg text-gray-800 font-serif mt-6">
                        <p>
                            Have questions, feedback, or need help? Reach out to us:
                        </p>

                        <div className="bg-gray-50 p-6 border border-gray-200 mt-6 text-center">
                            <Mail size={48} className="mx-auto mb-4 text-gray-400" />
                            <h3 className="font-sans font-bold uppercase mb-2">Email Support</h3>
                            <a href="mailto:supthenexte@gmail.com" className="text-lg sm:text-xl font-bold underline hover:text-blue-600 break-all">
                                supthenexte@gmail.com
                            </a>
                            <p className="text-sm text-gray-500 mt-2">We typically respond within 24-48 hours</p>
                        </div>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">What We Can Help With</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                            <li><strong>Report a scam:</strong> Help us keep the platform safe</li>
                            <li><strong>Remove your listing:</strong> Request early removal</li>
                            <li><strong>Technical issues:</strong> Report bugs</li>
                            <li><strong>Privacy concerns:</strong> Questions about your data</li>
                            <li><strong>Feedback:</strong> Suggest improvements</li>
                        </ul>

                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 text-sm">
                            <strong>Emergency?</strong> If you&apos;ve been scammed, call Cyber Crime Helpline: <strong>1930</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
