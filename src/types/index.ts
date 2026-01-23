
import type { User as FirebaseUser } from 'firebase/auth';

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

export type User = FirebaseUser;

export type Message = {
    id: string;
    senderId: string;
    text: string;
    createdAt: any; // Firestore Timestamp
};

export type ConversationParticipant = {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
};

export type Conversation = {
    id: string;
    participants: string[];
    participantDetails: ConversationParticipant[];
    lastMessageText?: string;
    lastMessageAt?: any; // Firestore Timestamp
    lastMessageSenderId?: string;
    unreadCounts?: { [key: string]: number };
};
