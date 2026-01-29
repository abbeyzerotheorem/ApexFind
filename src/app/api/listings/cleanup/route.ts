
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

        // 1. Get all user IDs from Firebase Auth
        const allAuthUserIds = new Set<string>();
        let pageToken;
        do {
            const listUsersResult = await auth.listUsers(1000, pageToken);
            listUsersResult.users.forEach(userRecord => {
                allAuthUserIds.add(userRecord.uid);
            });
            pageToken = listUsersResult.pageToken;
        } while (pageToken);
        
        // 2. Get all unique agentIds from the properties collection
        const propertiesSnapshot = await adminDb.collection('properties').select('agentId').get();
        if (propertiesSnapshot.empty) {
            return NextResponse.json({ message: 'No properties to check.', deletedCount: 0 });
        }
        const agentIdsInListings = [...new Set(propertiesSnapshot.docs.map(doc => doc.data().agentId))];
        
        // 3. Find agent IDs that are in listings but not in Auth
        const orphanedAgentIds = agentIdsInListings.filter(uid => !allAuthUserIds.has(uid));

        // 4. If there are orphaned listings, delete them
        if (orphanedAgentIds.length > 0) {
            const chunkSize = 30; // Firestore 'in' query limit
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
