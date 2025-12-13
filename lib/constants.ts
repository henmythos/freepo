import { Category } from "./types";

export const CATEGORIES: Category[] = [
    "Jobs",
    "Properties",
    "Rentals",
    "Cars",
    "Bikes",
    "Electronics",
    "Services",
    "Buy/Sell",
    "Education",
    "Events",
    "Community",
    "Lost & Found",
];

export const TOP_CITIES = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Surat",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
];

export const JOB_TYPES = [
    "Full Time",
    "Part Time",
    "Remote",
    "Internship",
    "Contract",
];

// Curated Unsplash images (1200x630 approx) for Google Discover / SEO
export const CATEGORY_IMAGES: Record<Category, string> = {
    Jobs: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
    Properties:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    Rentals:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    Cars: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
    Bikes:
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80",
    Electronics:
        "https://images.unsplash.com/photo-1498049381145-06f6907dea24?w=1200&q=80",
    Services:
        "https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=1200&q=80",
    "Buy/Sell":
        "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1200&q=80",
    Education:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
    Events:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    Community:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
    "Lost & Found":
        "https://images.unsplash.com/photo-1580130601275-54f375cd70eb?w=1200&q=80",
};

export const SEO_CATEGORIES = [
    "jobs",
    "cars",
    "rentals",
    "classifieds",
    "electronics",
    "services",
];

export const SEO_CITIES = [
    "hyderabad",
    "delhi",
    "bangalore",
    "chennai",
    "mumbai",
    "pune",
];
