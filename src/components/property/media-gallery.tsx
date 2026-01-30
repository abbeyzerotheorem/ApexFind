'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MediaGallery({ images, propertyAddress }: { images: string[], propertyAddress: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, [images.length]);

    const mainImage = images[currentIndex];
    const thumbnailImages = images.slice(0, 4);

    return (
        <div>
            {/* Main image with navigation arrows */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg md:h-[500px] group bg-black/5">
                <Image
                    src={mainImage}
                    alt={`Main image of ${propertyAddress}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                    sizes="(max-width: 767px) 100vw, 66vw"
                />
                
                {/* Previous Button */}
                {images.length > 1 && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Previous Image</span>
                    </Button>
                )}

                {/* Next Button */}
                {images.length > 1 && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                        <span className="sr-only">Next Image</span>
                    </Button>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                    {thumbnailImages.map((image, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative h-24 w-full cursor-pointer overflow-hidden rounded-lg transition-all",
                                currentIndex === index ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                            )}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <Image
                                src={image}
                                alt={`Property thumbnail ${index + 1} for ${propertyAddress}`}
                                fill
                                className="object-cover"
                                sizes="25vw"
                            />
                            {index === 3 && images.length > 4 && (
                                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50" onClick={() => setCurrentIndex(4)}>
                                    <span className="text-lg font-bold text-white">+{images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
