'use server';

import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

// This should be a more secure, admin-only secret in a real app
const ADMIN_SECRET = process.env.CRON_SECRET || 'supersecret';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Protect this endpoint with a secret key
    if (secret !== ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get events for popular locations from searches
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
        console.error('Error in analytics stats route:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
