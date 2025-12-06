import type { Metadata } from 'next';
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
    title: "Freepo.online | India's Free Newspaper Classifieds",
    description: "Post free classified ads in India. Jobs, Properties, Cars, Bikes, Electronics and more. No login required, 100% free forever.",
    keywords: "classifieds, free ads, India, jobs, properties, cars, bikes, buy sell",
    openGraph: {
        title: "Freepo.online | India's Free Newspaper Classifieds",
        description: "Post free classified ads in India. No login required.",
        url: 'https://freepo.online',
        siteName: 'Freepo.online',
        locale: 'en_IN',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
    },
    alternates: {
        types: {
            'application/rss+xml': '/api/feed',
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans bg-paper text-ink">
                {children}
            </body>
        </html>
    );
}
