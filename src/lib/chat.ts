
'use client';

import {
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    type Firestore,
    increment,
} from 'firebase/firestore';

/**
 * Sends a message in a conversation and updates the unread count for the recipient.
 */
export async function sendMessage(
    firestore: Firestore,
    conversationId: string,
    senderId: string,
    text: string
) {
    if (!text.trim()) return;

    const conversationRef = doc(firestore, 'conversations', conversationId);
    const messagesCol = collection(conversationRef, 'messages');

    // Get recipient to increment their unread count
    const convoSnap = await getDoc(conversationRef);
    if (!convoSnap.exists()) {
        throw new Error("Conversation does not exist.");
    }
    const conversation = convoSnap.data();
    const recipientId = conversation.participants.find((p: string) => p !== senderId);

    if (!recipientId) {
        // This can happen in a group chat, but for 1-on-1 it's an error.
        throw new Error("Could not find recipient in conversation.");
    }
    
    // Path for the unread count field to update
    const unreadCountPath = `unreadCounts.${recipientId}`;

    // Add the new message
    await addDoc(messagesCol, {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });

    // Update conversation metadata
    await updateDoc(conversationRef, {
        lastMessageText: text,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        [unreadCountPath]: increment(1) // Atomically increment the recipient's count
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
    
    // Create a consistent ID regardless of who initiates
    const participants = [currentUser.uid, otherUser.uid];
    const conversationId = participants.sort().join('_');
    const conversationRef = doc(firestore, 'conversations', conversationId);

    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
        return docSnap.id;
    }

    // No existing conversation, so create a new one
    const now = serverTimestamp();
    await setDoc(conversationRef, {
        participants: participants,
        participantDetails: [
            { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL },
            { uid: otherUser.uid, displayName: otherUser.displayName, photoURL: otherUser.photoURL }
        ],
        createdAt: now,
        lastMessageAt: now,
        unreadCounts: {
            [currentUser.uid]: 0,
            [otherUser.uid]: 0,
        },
    });

    return conversationId;
}

/**
 * Sets a user's unread count for a specific conversation to 0.
 */
export async function markConversationAsRead(
    firestore: Firestore,
    conversationId: string,
    userId: string
) {
    if (!firestore || !conversationId || !userId) return;

    const conversationRef = doc(firestore, 'conversations', conversationId);
    const updatePath = `unreadCounts.${userId}`;

    try {
        await updateDoc(conversationRef, {
            [updatePath]: 0
        });
    } catch (error) {
        console.error("Failed to mark conversation as read:", error);
        // This might fail if the document or field doesn't exist, but it's handled gracefully.
    }
}
