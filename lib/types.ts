export type Category =
    | "Jobs"
    | "Properties"
    | "Rentals"
    | "Cars"
    | "Bikes"
    | "Electronics"
    | "Services"
    | "Buy/Sell"
    | "Education"
    | "Events"
    | "Community"
    | "Lost & Found";

export interface Post {
    id: string;
    title: string;
    description: string;
    category: Category;
    city: string;
    contact_phone: string;
    contact_name?: string;
    whatsapp?: string;
    price?: string;
    salary?: string;
    job_type?: string;
    experience?: string;
    education?: string;
    company_name?: string;
    form_link?: string;
    created_at: string;
    expires_at: string;
    views: number;
    hash_value?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    image1_alt?: string;
    image2_alt?: string;
    image3_alt?: string;
    image4_alt?: string;
    image5_alt?: string;
    locality?: string;
    contact_preference?: "call" | "whatsapp" | "both";
    latitude?: number;
    longitude?: number;
    listing_plan?: string;
    is_featured?: boolean;
}

export interface CreatePostRequest {
    title: string;
    description: string;
    category: Category;
    city: string;
    locality?: string;
    latitude?: number;
    longitude?: number;
    contact_phone: string;
    contact_name?: string;
    whatsapp?: string;
    price?: string;
    salary?: string;
    job_type?: string;
    experience?: string;
    education?: string;
    company_name?: string;
    form_link?: string;
    _honey?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    image1_alt?: string;
    image2_alt?: string;
    image3_alt?: string;
    image4_alt?: string;
    image5_alt?: string;
    contact_preference?: "call" | "whatsapp" | "both";
    listing_plan?: string;
    paid_verified?: boolean;
}

export interface CityStats {
    city: string;
    posts_count: number;
    views_count: number;
    score?: number;
}
