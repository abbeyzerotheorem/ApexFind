
export type Property = {
    id: string; // Firestore ID is a string
    agentId: string;
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
    imageHint?: string;
    description?: string;
    lotSize?: number;
    agent?: string; // This might be redundant if we fetch agent info separately via agentId
    status?: string;
    home_type: string;
    is_furnished?: boolean;
    power_supply?: string;
    water_supply?: string;
    security_type?: string[];
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
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
