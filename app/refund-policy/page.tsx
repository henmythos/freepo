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
                        At Freepo.in, our goal is to provide a simple, transparent, and trustworthy classifieds platform. We operate primarily as a free-to-use service.
                    </p>

                    <p>
                        However, we offer strictly <strong>optional paid upgrades</strong> for users who want better visibility or enhanced trust for their listings. These paid plans are <strong>NOT mandatory</strong> to use the platform.
                    </p>

                    <h3>1. Free Posting Is Core</h3>
                    <ul>
                        <li>Posting ads on Freepo.in is <strong>FREE</strong> for all users.</li>
                        <li>You are never forced to pay to post a standard ad.</li>
                        <li>Paid plans are purely for "Visibility Enhancement" and "Trust Badges".</li>
                    </ul>

                    <h3>2. Optional Paid Plans</h3>
                    <p>We offer the following optional upgrades:</p>

                    <div className="bg-gray-100 p-6 border-l-4 border-black my-6">
                        <h4 className="mt-0">Verified Listing (₹49)</h4>
                        <p className="text-sm mb-2">Optional upgrade for individuals/small businesses.</p>
                        <ul className="text-sm mb-0">
                            <li><strong>Benefits:</strong> Verified Tick, 30-day validity.</li>
                            <li><strong>Purpose:</strong> Improves buyer trust.</li>
                        </ul>
                    </div>

                    <div className="bg-gray-100 p-6 border-l-4 border-black my-6">
                        <h4 className="mt-0">Featured Plus Listing (₹99)</h4>
                        <p className="text-sm mb-2">Optional upgrade for businesses/urgent sales.</p>
                        <ul className="text-sm mb-0">
                            <li><strong>Benefits:</strong> Featured placement, Gold Highlight, 60-day validity.</li>
                            <li><strong>Purpose:</strong> Maximum visibility.</li>
                        </ul>
                    </div>

                    <h3>3. Refund Policy</h3>
                    <p><strong>General Rule:</strong> Payments for optional listing upgrades are generally non-refundable once the service is delivered (i.e., the ad is live with the badge).</p>

                    <h4>Refund Eligibility (Valid Cases)</h4>
                    <p>We WILL provide a full refund within <strong>5-7 working days</strong> in the following specific cases:</p>
                    <ul>
                        <li><strong>Technical Failure:</strong> Money was deducted, but the ad was not upgraded or posted due to a server error.</li>
                        <li><strong>Duplicate Payment:</strong> You were charged twice for the same listing ID due to a gateway error.</li>
                    </ul>

                    <h4>Non-Refundable Cases</h4>
                    <p>Refunds will NOT be provided for:</p>
                    <ul>
                        <li><strong>Live Ads:</strong> Once your ad is live with the paid benefits (Verified/Featured), the service is considered delivered.</li>
                        <li><strong>Policy Violations:</strong> If your ad is removed for containing illegal content, spam, fraud, or violating our Terms of Service.</li>
                        <li><strong>Change of Mind:</strong> If you decide to delete your ad after paying and posting.</li>
                    </ul>

                    <h3>4. Contact for Support</h3>
                    <p>
                        For any payment-related issues or to request a refund for a failed transaction, please contact us immediately:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded font-bold text-center">
                        Email: <a href="mailto:supthenexte@gmail.com" className="underline text-blue-800">supthenexte@gmail.com</a>
                    </div>
                </div>
            </main>
        </div>
    );
}
