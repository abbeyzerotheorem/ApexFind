
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

    let docSnap;
    try {
        docSnap = await getDoc(conversationRef);
    } catch (error: any) {
        // If rules prevent reading a non-existent doc, a permission error might be thrown.
        // We can treat this as the document not existing and proceed to create it.
        if (error.code === 'permission-denied') {
            docSnap = null;
        } else {
            // For other errors, we should re-throw.
            console.error("Error getting conversation doc:", error);
            throw error;
        }
    }


    if (docSnap && docSnap.exists()) {
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
        readStatus: {
            [currentUser.uid]: { lastReadAt: now },
            [otherUser.uid]: { lastReadAt: now },
        }
    });

    return conversationId;
}

/**
 * Sets a user's unread count for a specific conversation to 0 and updates their read timestamp.
 */
export async function markConversationAsRead(
    firestore: Firestore,
    conversationId: string,
    userId: string
) {
    if (!firestore || !conversationId || !userId) return;

    const conversationRef = doc(firestore, 'conversations', conversationId);
    
    const updatePayload: { [key: string]: any } = {};
    updatePayload[`unreadCounts.${userId}`] = 0;
    updatePayload[`readStatus.${userId}.lastReadAt`] = serverTimestamp();

    try {
        await updateDoc(conversationRef, updatePayload);
    } catch (error) {
        console.error("Failed to mark conversation as read:", error);
    }
}
