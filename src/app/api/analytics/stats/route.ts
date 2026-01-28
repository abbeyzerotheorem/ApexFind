
'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check user role
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'agent') {
             return NextResponse.json({ error: 'Forbidden: User is not an agent' }, { status: 403 });
        }

        // --- Analytics Logic ---
        const searchEventsSnapshot = await adminDb.collection('analytics_events')
            .where('event_type', '==', 'search_performed')
            .get();
        
        const locationCounts: Record<string, number> = {};
        
        searchEventsSnapshot.forEach(doc => {
            const data = doc.data();
            // The search query is usually in event_data.q or a similar field
            const location = data.event_data?.q?.toLowerCase().trim();
            if (location) {
                locationCounts[location] = (locationCounts[location] || 0) + 1;
            }
        });

        const topLocations = Object.entries(locationCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([location, count]) => ({ location, count }));

        return NextResponse.json({
            processedEvents: searchEventsSnapshot.size,
            topLocations,
            timeframe: 'All time',
            marketInsights: topLocations.map(loc => 
                `${loc.location} is trending with ${loc.count} searches.`
            )
        });

    } catch (error: any) {
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        console.error('Error in analytics stats route:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
