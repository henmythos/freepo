"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "Is Freepo.in really free to use?",
        answer: "Yes! Freepo.in is 100% free forever. You can post unlimited classified ads for jobs, rentals, properties, cars, and more without any charges. We also offer optional premium plans for faster visibility."
    },
    {
        question: "How do I post a free classified ad?",
        answer: "Click 'Post Ad' on the homepage, select a category (Jobs, Rentals, Buy/Sell, etc.), fill in the details, add photos if needed, and submit. Your ad will be live within seconds. No login or registration required!"
    },
    {
        question: "Which cities does Freepo.in cover?",
        answer: "Freepo.in covers all major Indian cities including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, and 500+ more cities across India."
    },
    {
        question: "How long does my ad stay live?",
        answer: "Free ads stay live for 30 days. Premium ads (₹49 Verified or ₹99 Featured Plus) can stay live for 30-60 days with additional benefits like verified badges and top placement."
    },
    {
        question: "Is it safe to post on Freepo.in?",
        answer: "We take safety seriously. We block spam, display safety alerts on listings, and provide a 'Report Spam' option. However, always meet buyers/sellers in public places and never pay money upfront for jobs or deliveries."
    },
    {
        question: "How do I contact an advertiser?",
        answer: "Each listing shows the advertiser's contact preferences - Call, WhatsApp, or both. Click the respective button to connect directly. We recommend mentioning 'Freepo' when calling for better response."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // FAQ Schema for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="py-8 border-t-4 border-black">
            {/* FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <h2 className="font-serif text-2xl font-bold mb-6 text-center">
                Frequently Asked Questions
            </h2>

            <div className="space-y-3 max-w-2xl mx-auto">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 bg-white"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                            aria-expanded={openIndex === index}
                        >
                            <span className="font-bold text-sm pr-4">{faq.question}</span>
                            <ChevronDown
                                size={18}
                                className={`flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {openIndex === index && (
                            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                                <p className="pt-3">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
