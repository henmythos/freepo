export const metadata = {
    title: "Refund & Payment Policy - Freepo.in",
    description: "Refund rules and payment details for Freepo.in classifieds.",
};

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-paper font-serif text-ink">
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-black mb-8 border-b-4 border-black pb-4 text-center uppercase tracking-tighter">
                    Refund & Payment Policy
                </h1>

                <div className="prose prose-lg mx-auto text-justify">
                    <p className="lead font-bold">
                        At Freepo.in, our goal is to provide a simple, transparent, and trustworthy classifieds platform. Currently, users can post listings for free. In the future, we may introduce optional paid listing features to enhance visibility and trust.
                    </p>

                    <p>
                        This policy explains how payments and refunds will be handled when paid listings are enabled.
                    </p>

                    <h3>Free Listings</h3>
                    <ul>
                        <li>Posting ads on Freepo.in is currently <strong>free of cost</strong>.</li>
                        <li>Free listings may have standard visibility and duration limits.</li>
                    </ul>

                    <h3>Paid Listing Options (Future)</h3>
                    <p>In the future, users may choose optional paid plans to increase listing visibility and trust:</p>

                    <div className="bg-gray-100 p-6 border-l-4 border-black my-6">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h4 className="mt-0">₹49 – Verified Listing</h4>
                                <ul className="mb-0">
                                    <li>Listing active for 60 days</li>
                                    <li>Includes a <strong>Verified Tick</strong></li>
                                    <li>Improves credibility and trust for buyers</li>
                                </ul>
                            </div>
                            <a href="https://rzp.io/rzp/freepo49" className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-gray-800 transition text-sm">
                                Buy Now
                            </a>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-6 border-l-4 border-black my-6">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h4 className="mt-0">₹99 – Featured & Verified Listing</h4>
                                <ul className="mb-0">
                                    <li>Listing active for 90 days</li>
                                    <li>Includes Verified Tick</li>
                                    <li><strong>Featured placement</strong> for higher visibility across the platform</li>
                                </ul>
                            </div>
                            <a href="https://rzp.io/rzp/freepo99" className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-gray-800 transition text-sm">
                                Buy Now
                            </a>
                        </div>
                    </div>

                    <p>Paid options are completely optional and will be clearly displayed before payment.</p>

                    <h3>Refund Policy</h3>
                    <p><strong>Payments made for paid listings are generally non-refundable.</strong></p>
                    <p>Refunds will not be provided in the following cases:</p>
                    <ul>
                        <li>Illegal listings</li>
                        <li>Spam or misleading content</li>
                        <li>Fraudulent, deceptive, or false information</li>
                        <li>Duplicate or repeated ads</li>
                        <li>Listings violating local laws or platform guidelines</li>
                    </ul>
                    <p>
                        Such listings may be removed by Freepo.in operators without prior notice, even if payment was made. Once a post is live there is no refund.
                    </p>

                    <h3>Listing Moderation</h3>
                    <ul>
                        <li>All listings are subject to manual or automated review.</li>
                        <li>Freepo.in reserves the right to approve, reject, suspend, or remove any listing to maintain platform quality and legal compliance.</li>
                        <li>Decisions made by moderation teams are final.</li>
                    </ul>

                    <h3>Payment Confirmation</h3>
                    <ul>
                        <li>Payments (when enabled) will be processed through secure payment gateways.</li>
                        <li>Once a paid listing is published, it will remain active for the selected duration unless removed due to policy violations.</li>
                    </ul>

                    <h3>Changes to This Policy</h3>
                    <p>
                        Freepo.in may update this policy from time to time. Any changes will be reflected on this page with immediate effect.
                    </p>

                    <h3>Contact</h3>
                    <p>
                        For questions related to payments, listings, or policy clarifications, please contact us via the support details provided on the website.
                    </p>
                </div>
            </main>
        </div>
    );
}
