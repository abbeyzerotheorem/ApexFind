
import { PlaceHolderImages } from './placeholder-images';

const fallbackImages: Record<string, string> = {
    'apartment (flat)': PlaceHolderImages.find(i => i.id === 'property-1')?.imageUrl ?? '',
    'duplex': PlaceHolderImages.find(i => i.id === 'property-5')?.imageUrl ?? '',
    'house': PlaceHolderImages.find(i => i.id === 'property-4')?.imageUrl ?? '',
    'terrace': PlaceHolderImages.find(i => i.id === 'property-2')?.imageUrl ?? '',
    'bungalow': PlaceHolderImages.find(i => i.id === 'property-4')?.imageUrl ?? '',
    'commercial': PlaceHolderImages.find(i => i.id === 'property-6')?.imageUrl ?? '',
    'default': PlaceHolderImages.find(i => i.id === 'property-4')?.imageUrl ?? '',
};

/**
 * Gets a fallback image URL based on the property type.
 * @param propertyType - The type of the property (e.g., "Duplex", "Apartment (Flat)").
 * @returns A URL for a fallback image.
 */
export const getFallbackImage = (propertyType: string): string => {
    const type = propertyType.toLowerCase();
    const fallbackUrl = fallbackImages[type] || fallbackImages.default;
    return fallbackUrl || 'https://placehold.co/600x400/EEE/31343C?text=Image+Not+Available';
};
