
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function MediaGallery({ images }: { images: string[] }) {
    const [mainImage, setMainImage] = useState(images[0]);
    const [showAll, setShowAll] = useState(false);
    const visibleThumbnails = images.slice(1, 5);

    return (
        <div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg md:h-[500px]">
                <Image
                    src={mainImage}
                    alt="Main property image"
                    fill
                    className="object-cover"
                    priority
                />
                 <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="secondary" className="absolute bottom-4 right-4">See all {images.length} photos</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh]">
                        <div className="relative h-full w-full">
                             <Image
                                src={mainImage}
                                alt="Main property image in modal"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </DialogContent>
                 </Dialog>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
                {visibleThumbnails.map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative h-24 w-full cursor-pointer overflow-hidden rounded-lg transition-all",
                            mainImage === image ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                        )}
                        onClick={() => setMainImage(image)}
                    >
                        <Image
                            src={image}
                            alt={`Property thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                         {index === 3 && images.length > 5 && (
                             <Dialog>
                                <DialogTrigger asChild>
                                    <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50">
                                        <span className="text-lg font-bold text-white">+{images.length - 5}</span>
                                    </div>
                                </DialogTrigger>
                                 <DialogContent className="max-w-4xl h-[90vh]">
                                    <p>Gallery Here</p>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

