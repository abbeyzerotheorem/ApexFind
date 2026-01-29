
import { adminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Protect this endpoint with a secret key
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const auth = getAuth();
        let deletedListingsCount = 0;

        // 1. Get all unique agentIds from the properties collection
        const propertiesSnapshot = await adminDb.collection('properties').select('agentId').get();
        if (propertiesSnapshot.empty) {
            return NextResponse.json({ message: 'No properties to check.', deletedCount: 0 });
        }
        
        const agentIdsInListings = [...new Set(propertiesSnapshot.docs.map(doc => doc.data().agentId).filter(Boolean))];
        
        // 2. Identify agent IDs that no longer exist in Firebase Auth
        const orphanedAgentIds = new Set<string>();
        const checkPromises = agentIdsInListings.map(async (uid) => {
            try {
                await auth.getUser(uid);
                // User exists, do nothing.
            } catch (error: any) {
                // If the error code is 'user-not-found', the user has been deleted.
                if (error.code === 'auth/user-not-found') {
                    orphanedAgentIds.add(uid);
                } else {
                    // Log other errors but don't halt the process, might be transient.
                    console.error(`Error checking agent UID ${uid}:`, error.message);
                }
            }
        });
        
        // Wait for all checks to complete
        await Promise.all(checkPromises);

        const orphanedIdsArray = Array.from(orphanedAgentIds);

        // 3. If there are orphaned listings, delete them
        if (orphanedIdsArray.length > 0) {
            // Firestore 'in' query can handle up to 30 values.
            const chunkSize = 30; 
            for (let i = 0; i < orphanedIdsArray.length; i += chunkSize) {
                const chunk = orphanedIdsArray.slice(i, i + chunkSize);
                
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
            message: 'Orphaned listings cleanup completed.',
            checkedAgentIds: agentIdsInListings.length,
            orphanedAgentCount: orphanedIdsArray.length,
            deletedListingsCount,
        });

    } catch (error: any) {
        console.error('Error in listings cleanup cron job:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
