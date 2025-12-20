"use client";

import { useState } from "react";
import Image from "next/image";
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
            <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-[#f2f2f2]">
                <img
                    src={fallback.src}
                    alt={fallback.alt}
                    className="w-full h-full object-contain opacity-90"
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
            <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-white">
                {/* Clean Image Display */}
                <Image
                    src={validImages[0].src}
                    alt={validImages[0].alt}
                    fill
                    className="object-contain z-10"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
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

    // Touch swipe handling
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        }
        if (isRightSwipe) {
            goToPrevious();
        }
    };

    return (
        <div className="relative h-64 md:h-80 overflow-hidden border border-gray-200 bg-white group">
            {/* Main Image - with touch handlers */}
            <div
                className="relative w-full h-full"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {validImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        {/* Foreground Layer Only - Clean & Uncropped */}
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-contain z-10"
                            sizes="(max-width: 768px) 100vw, 800px"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows - visible on mobile, hover on desktop */}
            <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
