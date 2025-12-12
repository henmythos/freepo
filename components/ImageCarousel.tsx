"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
    images: { src: string; alt: string }[];
    fallback?: { src: string; alt: string };
}

export default function ImageCarousel({ images, fallback }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter out empty images
    const validImages = images.filter((img) => img.src);

    // If no valid images, show fallback
    if (validImages.length === 0 && fallback) {
        return (
            <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-gray-100">
                <img
                    src={fallback.src}
                    alt={fallback.alt}
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-0 left-0 bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest">
                    {fallback.alt}
                </div>
            </div>
        );
    }

    // Single image - no carousel needed
    if (validImages.length === 1) {
        return (
            <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-gray-100">
                <img
                    src={validImages[0].src}
                    alt={validImages[0].alt}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-gray-100 group">
            {/* Main Image */}
            <div className="relative w-full h-full">
                {validImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
            >
                <ChevronRight size={20} />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {validImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                                ? "bg-white scale-110"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-bold">
                {currentIndex + 1} / {validImages.length}
            </div>
        </div>
    );
}
