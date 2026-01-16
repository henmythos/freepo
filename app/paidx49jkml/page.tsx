import { redirect } from 'next/navigation';

export const metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    redirect('/post-ad?plan=featured_30&paid=1');
}
