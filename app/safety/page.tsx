import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, CreditCard, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Safety Guidelines | Freepo.online",
    description: "Stay safe when buying and selling on Freepo.online. Read our safety tips.",
};

export default function SafetyPage() {
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
                        <Shield size={32} />
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Safety Guidelines</h1>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 font-sans text-sm">
                        <strong className="text-red-700">⚠️ CRITICAL WARNING:</strong> Freepo.online <strong>NEVER</strong> asks for OTPs,
                        UPI PINs, or payments. If someone claims to be from Freepo and asks for money, it&apos;s a SCAM!
                    </div>

                    <div className="prose prose-lg text-gray-800 font-serif">
                        <h3 className="font-sans font-bold uppercase text-sm mt-6 mb-3 flex items-center gap-2">
                            <CreditCard size={16} /> Payment Safety
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex gap-3 items-start">
                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Never pay in advance:</strong> Don&apos;t transfer money before seeing the item.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Never share OTP or PIN:</strong> No seller needs your bank credentials.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Beware of &quot;too good to be true&quot; deals.</strong></span>
                            </li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3 flex items-center gap-2">
                            <MapPin size={16} /> Meeting Safety
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex gap-3 items-start">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Meet in public places</strong> like malls or police stations.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Bring someone along</strong> for high-value items.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                                <span><strong>Meet during daylight hours.</strong></span>
                            </li>
                        </ul>

                        <h3 className="font-sans font-bold uppercase text-sm mt-8 mb-3">Common Scams</h3>
                        <ul className="space-y-2 text-sm sm:text-base list-disc pl-5">
                            <li><strong>Advance payment scam:</strong> Seller asks for token amount.</li>
                            <li><strong>Fake army seller:</strong> Claims to be posted far away.</li>
                            <li><strong>QR code scam:</strong> Asks you to scan to &quot;receive&quot; money.</li>
                            <li><strong>Job scam:</strong> Asks for registration fee.</li>
                        </ul>

                        <div className="bg-gray-100 p-4 mt-8 border border-gray-300 rounded">
                            <h4 className="font-bold text-sm uppercase mb-2 flex items-center gap-2">
                                <Phone size={16} /> Report Scams
                            </h4>
                            <ul className="text-sm space-y-1">
                                <li>Cyber Crime Helpline: <strong>1930</strong></li>
                                <li>Police Emergency: <strong>100</strong> or <strong>112</strong></li>
                                <li>Email: <a href="mailto:supthenexte@gmail.com" className="underline">supthenexte@gmail.com</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
