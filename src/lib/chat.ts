'use client';

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    type Firestore,
} from 'firebase/firestore';
import type { Conversation } from '@/types';

/**
 * Sends a message in a conversation.
 */
export async function sendMessage(
    firestore: Firestore,
    conversationId: string,
    senderId: string,
    text: string
) {
    if (!text.trim()) return;

    const messagesCol = collection(firestore, 'conversations', conversationId, 'messages');
    const conversationRef = doc(firestore, 'conversations', conversationId);

    await addDoc(messagesCol, {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });

    await updateDoc(conversationRef, {
        lastMessageText: text,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
    });
}

/**
 * Finds an existing conversation between two users or creates a new one.
 * Uses a deterministic ID to avoid query lookups.
 */
export async function getOrCreateConversation(
    firestore: Firestore,
    currentUser: { uid: string; displayName: string | null; photoURL: string | null },
    otherUser: { uid: string; displayName: string | null; photoURL: string | null }
): Promise<string> {
    if (currentUser.uid === otherUser.uid) {
        throw new Error("Cannot create a conversation with oneself.");
    }
    
    const participants = [currentUser.uid, otherUser.uid];
    // Create a consistent ID regardless of who initiates
    const conversationId = participants.sort().join('_');
    const conversationRef = doc(firestore, 'conversations', conversationId);

    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
        return docSnap.id;
    }

    // No existing conversation, so create a new one
    await setDoc(conversationRef, {
        participants: participants,
        participantDetails: [
            { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL },
            { uid: otherUser.uid, displayName: otherUser.displayName, photoURL: otherUser.photoURL }
        ],
        createdAt: serverTimestamp(),
    });

    return conversationId;
}
