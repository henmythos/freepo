import { Suspense } from "react";
import HomeClient from "./HomeClient";
import { Metadata } from "next";

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const city = typeof searchParams.city === "string" ? searchParams.city : undefined;
    const category = typeof searchParams.category === "string" ? searchParams.category : undefined;

    let title = "Post Free Ads in India - Buy, Sell, Rent & Jobs | Freepo.in";
    let description = "Post free classified ads in India. Find jobs, rentals, properties, cars & more. No login required.";

    if (city && city !== "All") {
        if (category && category !== "All") {
            // E.g. "Post Free Jobs Ads in Hyderabad"
            title = `Post Free ${category} Ads in ${city} | Freepo.in`;
            description = `Find the best ${category} ads in ${city}. Post free classifieds for ${category} in ${city} on Freepo.in.`;
        } else {
            // E.g. "Post Free Ads in Hyderabad"
            title = `Post Free Ads in ${city} - Buy & Sell Near You | Freepo.in`;
            description = `Looking for free classifieds in ${city}? Buy, sell, rent, and find jobs in ${city} on Freepo.in.`;
        }
    } else if (category && category !== "All") {
        // E.g. "Post Free Jobs Ads in India"
        title = `Post Free ${category} Ads in India | Freepo.in`;
        description = `Find the latest ${category} ads in India. Post free ${category} classifieds online on Freepo.in.`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        },
    };
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <HomeClient />
        </Suspense>
    );
}
