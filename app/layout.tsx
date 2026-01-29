import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Freepo.in | Free Classifieds India - Jobs, Rentals, Properties, Cars",
    description: "Post free classified ads in India. Find jobs near me, rentals, properties, cars, bikes & more in Mumbai, Delhi, Bangalore, Hyderabad, Chennai. No login required, 100% free forever.",
    keywords: "classifieds India, free classifieds India, jobs near me India, rentals India, Hyderabad classifieds, city listings India, post free ad India, Mumbai jobs, Delhi rentals, Bangalore classifieds, Chennai properties, buy sell India, used cars India, property India, local classifieds India, free ads India, jobs in Hyderabad, flats for rent India, second hand India, olx alternative India",
    openGraph: {
        title: "Freepo.in | India's #1 Free Classifieds - Jobs, Rentals, Cars",
        description: "Post free classified ads in India. Find jobs, rentals, properties, cars & more. No login required.",
        url: 'https://freepo.in',
        siteName: 'Freepo.in',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Freepo.in | Free Classifieds India",
        description: "Post free classified ads in India. Jobs, rentals, cars & more.",
    },
    robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://freepo.in',
        types: {
            'application/rss+xml': '/api/feed',
        },
    },
    // Google verification done via DNS - no meta tag needed
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

// JSON-LD Structured Data
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': 'https://freepo.in/#website',
            url: 'https://freepo.in',
            name: 'Freepo.in',
            description: 'Free Classifieds India - Post free ads for jobs, rentals, properties, cars & more',
            inLanguage: 'en-IN',
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://freepo.in/?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': 'Organization',
            '@id': 'https://freepo.in/#organization',
            name: 'Freepo.in',
            url: 'https://freepo.in',
            logo: {
                '@type': 'ImageObject',
                url: 'https://freepo.in/apple-touch-icon.png',
            },
            sameAs: [],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
                areaServed: 'IN',
            },
        },
        {
            '@type': 'ItemList',
            '@id': 'https://freepo.in/#categories',
            name: 'Classifieds Categories',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Jobs', url: 'https://freepo.in/?category=Jobs' },
                { '@type': 'ListItem', position: 2, name: 'Properties', url: 'https://freepo.in/?category=Properties' },
                { '@type': 'ListItem', position: 3, name: 'Rentals', url: 'https://freepo.in/?category=Rentals' },
                { '@type': 'ListItem', position: 4, name: 'Cars', url: 'https://freepo.in/?category=Cars' },
                { '@type': 'ListItem', position: 5, name: 'Bikes', url: 'https://freepo.in/?category=Bikes' },
                { '@type': 'ListItem', position: 6, name: 'Electronics', url: 'https://freepo.in/?category=Electronics' },
            ],
        },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                <meta name="apple-mobile-web-app-title" content="Freepo" />
                <meta name="google-adsense-account" content="ca-pub-4084810519453125" />
                <link rel="preconnect" href="https://pub-6a3dc798d365491ab799eb3f5e146591.r2.dev" />
                <link rel="dns-prefetch" href="https://pub-6a3dc798d365491ab799eb3f5e146591.r2.dev" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="font-sans bg-paper text-ink">
                {children}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-RMCXY21ZJ3"
                    strategy="lazyOnload"
                />
                <Script id="google-analytics" strategy="lazyOnload">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-RMCXY21ZJ3');
                    `}
                </Script>
                <Script
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4084810519453125"
                    crossOrigin="anonymous"
                    strategy="lazyOnload"
                />
            </body>
        </html>
    );
}
