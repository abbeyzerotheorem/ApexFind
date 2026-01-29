
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

        // Get all unique agentIds from the properties collection
        const propertiesSnapshot = await adminDb.collection('properties').select('agentId').get();
        if (propertiesSnapshot.empty) {
            return NextResponse.json({ message: 'No properties to check.', deletedCount: 0 });
        }
        const agentIdsInListings = [...new Set(propertiesSnapshot.docs.map(doc => doc.data().agentId))];

        // Verify which agents still exist in Firebase Auth
        const checkPromises = agentIdsInListings.map(uid => 
            auth.getUser(uid).then(() => uid).catch(() => null)
        );
        
        const results = await Promise.all(checkPromises);
        const existingAgentIds = new Set(results.filter(uid => uid !== null));

        const orphanedAgentIds = agentIdsInListings.filter(uid => !existingAgentIds.has(uid));
        
        // If there are orphaned listings, delete them
        if (orphanedAgentIds.length > 0) {
            // We have to do this in chunks because 'in' query has a limit of 30
            const chunkSize = 30;
            for (let i = 0; i < orphanedAgentIds.length; i += chunkSize) {
                const chunk = orphanedAgentIds.slice(i, i + chunkSize);
                
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
            orphanedAgentCount: orphanedAgentIds.length,
            deletedListingsCount,
        });

    } catch (error: any) {
        console.error('Error in listings cleanup cron job:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
