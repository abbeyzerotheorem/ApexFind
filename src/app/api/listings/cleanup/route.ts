
import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Protect this endpoint with a secret key
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let deletedListingsCount = 0;

        // 1. Get all unique agentIds from the properties collection
        const propertiesSnapshot = await adminDb.collection('properties').select('agentId').get();
        if (propertiesSnapshot.empty) {
            return NextResponse.json({ message: 'No properties to check.', deletedCount: 0 });
        }
        
        const agentIdsInListings = [...new Set(propertiesSnapshot.docs.map(doc => doc.data().agentId).filter(Boolean))];
        
        // 2. Identify agent IDs that no longer have a corresponding document in the 'users' collection.
        // This assumes that when an agent's Auth account is deleted, their document in the 'users' collection is also removed.
        const orphanedAgentIds = new Set<string>();

        const userRefs = agentIdsInListings.map(id => adminDb.collection('users').doc(id));

        // Firestore's getAll can take up to 30 document references at a time.
        const chunkSize = 30;
        for (let i = 0; i < userRefs.length; i += chunkSize) {
            const chunk = userRefs.slice(i, i + chunkSize);
            const userDocs = await adminDb.getAll(...chunk);
            
            // The order of docs in getAll response matches the order of refs in the input array.
            userDocs.forEach((userDoc, index) => {
                if (!userDoc.exists) {
                    const originalRef = chunk[index];
                    orphanedAgentIds.add(originalRef.id);
                }
            });
        }

        const orphanedIdsArray = Array.from(orphanedAgentIds);

        // 3. If there are orphaned listings, delete them
        if (orphanedIdsArray.length > 0) {
            // Firestore 'in' query can handle up to 30 values at a time.
            const queryChunkSize = 30; 
            for (let i = 0; i < orphanedIdsArray.length; i += queryChunkSize) {
                const chunk = orphanedIdsArray.slice(i, i + queryChunkSize);
                
                const orphanedPropertiesQuery = adminDb.collection('properties').where('agentId', 'in', chunk);
                const snapshot = await orphanedPropertiesQuery.get();

                if (!snapshot.empty) {
                    const batch = adminDb.batch();
                    snapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    deletedListingsCount += snapshot.size;
                }
            }
        }
        
        return NextResponse.json({
            message: 'Orphaned listings cleanup completed using Firestore user documents.',
            checkedAgentIds: agentIdsInListings.length,
            orphanedAgentCount: orphanedIdsArray.length,
            deletedListingsCount,
        });

    } catch (error: any) {
        console.error('Error in listings cleanup cron job:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
