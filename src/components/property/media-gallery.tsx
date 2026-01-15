
'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function MediaGallery({ images, propertyAddress }: { images: string[], propertyAddress: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const mainImage = images[currentIndex];
    const visibleThumbnails = images.slice(1, 5);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, [images.length]);
    
    const openGalleryAtIndex = (index: number) => {
        setCurrentIndex(index);
    }

    return (
        <div>
            <Dialog>
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg md:h-[500px]">
                     <DialogTrigger asChild>
                        <Image
                            src={mainImage}
                            alt={`Main image of ${propertyAddress}`}
                            fill
                            className="cursor-pointer object-cover"
                            priority
                            onClick={() => openGalleryAtIndex(currentIndex)}
                        />
                     </DialogTrigger>
                    <DialogTrigger asChild>
                         <Button variant="secondary" className="absolute bottom-4 right-4">See all {images.length} photos</Button>
                    </DialogTrigger>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                    {images.slice(1, 5).map((image, index) => (
                         <DialogTrigger asChild key={index}>
                            <div
                                className={cn(
                                    "relative h-24 w-full cursor-pointer overflow-hidden rounded-lg transition-all",
                                    currentIndex === (index + 1) ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                                )}
                                onClick={() => setCurrentIndex(index + 1)}
                            >
                                <Image
                                    src={image}
                                    alt={`Property thumbnail ${index + 2} for ${propertyAddress}`}
                                    fill
                                    className="object-cover"
                                />
                                {index === 3 && images.length > 5 && (
                                    <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50" onClick={() => openGalleryAtIndex(4)}>
                                        <span className="text-lg font-bold text-white">+{images.length - 5}</span>
                                    </div>
                                )}
                            </div>
                        </DialogTrigger>
                    ))}
                </div>

                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogTitle>Image gallery for {propertyAddress}</DialogTitle>
                    <div className="relative h-full w-full">
                         <Image
                            src={images[currentIndex]}
                            alt={`Property image ${currentIndex + 1} of ${propertyAddress}`}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Previous Image</span>
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                        <span className="sr-only">Next Image</span>
                    </Button>
                </DialogContent>
             </Dialog>
        </div>
    );
}
