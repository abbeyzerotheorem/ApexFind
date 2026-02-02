
import type { User as FirebaseUser } from 'firebase/auth';

export type Property = {
    id: string;
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
    imageUrls: string[];
    description?: string;
    lotSize?: number;
    agent?: string;
    status?: string;
    home_type: string;
    is_furnished?: boolean;
    has_pool?: boolean;
    parking_spaces?: number;
    yearBuilt?: number;
    power_supply?: string;
    water_supply?: string;
    security_type?: string[];
    createdAt?: any;
    updatedAt?: any;
};

export type Agency = {
    id: string;
    name: string;
    licenseNumber: string;
    yearsInOperation: number;
    location: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    photoURL?: string;
    about?: string;
    email: string;
    phoneNumber: string;
    verificationBadges: string[];
    createdAt: any;
};

export type Agent = {
    id: string;
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
    agencyId?: string;
};

export type User = FirebaseUser;

export type Message = {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
};

export type ConversationParticipant = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
};

export type Conversation = {
    id:string;
    participants: string[];
    participantDetails: ConversationParticipant[];
    lastMessageText?: string;
    lastMessageAt?: any;
    lastMessageSenderId?: string;
    unreadCounts?: { [key: string]: number };
    readStatus?: { [key: string]: { lastReadAt: any } };
};

export type SavedSearch = {
    id: string;
    name: string;
    description: string;
    searchParams: string;
    alertFrequency: 'daily' | 'weekly' | 'instant' | 'never';
    newMatchCount: number;
    createdAt: any;
    lastSentAt?: any;
};

export interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  currency: string;
  range: {
    low: number;
    high: number;
  };
  breakdown: {
    basePrice: number;
    locationMultiplier: number;
    sizeValue: number;
    bedroomValue: number;
    ageAdjustment: number;
    amenityValue: number;
    marketTrendValue: number;
  };
  comparablesCount: number;
  marketTrend: string;
  nextSteps: string[];
  reportId: string;
}
