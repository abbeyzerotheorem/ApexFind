
export type Property = {
    id: number;
    price: number;
    listing_type: 'sale' | 'rent';
    price_period?: string;
    address: string;
    city: string;
    state: string;
    estate_name?: string;
    beds: number;
    baths: number;
    sqft: number;
    imageUrl: string;
    imageHint: string;
    lotSize?: number;
    agent?: string;
    status?: string;
    home_type: string;
    is_furnished?: boolean;
    power_supply?: string;
    water_supply?: string;
    security_type?: string[];
};

export type Agent = {
    id: number;
    name: string;
    title: string;
    company: string;
    imageUrl: string;
    imageHint: string;
    experience: number;
    sales: number;
    rating: number;
    reviewCount: number;
    location: string;
    languages: string[];
    specialties: string[];
};
