import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import type { Property, SavedSearch } from '@/types';

// This is the filtering logic replicated from the search page
function propertyMatchesFilters(property: Property, params: URLSearchParams): boolean {
    let matches = true;

    const listingType = params.get('type');
    const searchQuery = params.get('q') || "";
    const minPrice = params.get('minPrice') ? parseInt(params.get('minPrice')!) : 0;
    const maxPrice = params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : 500000000;
    const beds = params.get('beds');
    const baths = params.get('baths');
    const homeTypes = params.get('homeTypes') ? params.get('homeTypes')!.split(',') : [];
    const features = params.get('features') ? params.get('features')!.split(',') : [];
    const minSqft = params.get('minSqft') ? parseInt(params.get('minSqft')!) : 0;
    const maxSqft = params.get('maxSqft') ? parseInt(params.get('maxSqft')!) : 0;
    const keywords = params.get('keywords');

    if (listingType) {
        if (listingType === 'buy') {
            matches = matches && property.listing_type === 'sale';
        } else { // for 'rent'
            matches = matches && property.listing_type === 'rent';
        }
    }

    if (searchQuery) {
        matches = matches && (property.address.toLowerCase().includes(searchQuery.toLowerCase()) || property.city.toLowerCase().includes(searchQuery.toLowerCase()) || property.state.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (minPrice) {
        matches = matches && property.price >= minPrice;
    }
    if (maxPrice < 500000000) {
        matches = matches && property.price <= maxPrice;
    }
    if (beds && beds !== 'any') {
        const minBeds = parseInt(beds.replace('+', ''));
        matches = matches && property.beds >= minBeds;
    }
    if (baths && baths !== 'any') {
        const minBaths = parseInt(baths.replace('+', ''));
        matches = matches && property.baths >= minBaths;
    }
    if (homeTypes.length > 0) {
        matches = matches && homeTypes.includes(property.home_type);
    }
    if (features.length > 0) {
        if (features.includes('furnished') && !property.is_furnished) matches = false;
        if (features.includes('generator') && !property.power_supply?.toLowerCase().includes('generator')) matches = false;
        if (features.includes('borehole') && !property.water_supply?.toLowerCase().includes('borehole')) matches = false;
        if (features.includes('gated') && !property.security_type?.includes('Gated Estate')) matches = false;
    }
    if (minSqft) {
        matches = matches && property.sqft >= minSqft;
    }
    if (maxSqft) {
        matches = matches && property.sqft <= maxSqft;
    }
    if (keywords) {
        matches = matches && (property.description?.toLowerCase().includes(keywords.toLowerCase()) || property.address.toLowerCase().includes(keywords.toLowerCase()));
    }
    return matches;
}

// Placeholder for a real email sending function
async function sendAlertEmail(email: string, searchName: string, properties: Property[]) {
    console.log(`--- SIMULATING EMAIL ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: New properties for your '${searchName}' search!`);
    console.log(`Found ${properties.length} new properties.`);
    properties.forEach(p => {
        console.log(`- ${p.address} | ${p.price}`);
    });
    console.log(`------------------------`);
    return Promise.resolve();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Protect this endpoint with a secret key
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Fetch all properties created in the last 24 hours
        const newPropertiesSnapshot = await adminDb.collection('properties')
            .where('createdAt', '>=', twentyFourHoursAgo)
            .get();
        const newProperties = newPropertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));

        if (newProperties.length === 0) {
            return NextResponse.json({ message: 'No new properties to check.', processedSearches: 0 });
        }

        // 2. Fetch all saved searches
        const savedSearchesSnapshot = await adminDb.collectionGroup('saved_searches').get();
        const savedSearches = savedSearchesSnapshot.docs;

        let emailsSent = 0;
        const batch = adminDb.batch();

        // 3. Process each saved search
        for (const searchDoc of savedSearches) {
            const search = searchDoc.data() as SavedSearch;
            const searchParams = new URLSearchParams(search.searchParams);
            
            // This is a simplified check. A real app might check frequency ('daily', 'weekly') here.
            
            const matchingProperties = newProperties.filter(prop => propertyMatchesFilters(prop, searchParams));

            if (matchingProperties.length > 0) {
                // Find the user's email
                const userId = searchDoc.ref.parent.parent!.id;
                const userDoc = await adminDb.collection('users').doc(userId).get();
                const userEmail = userDoc.data()?.email;

                if (userEmail) {
                    await sendAlertEmail(userEmail, search.name, matchingProperties);
                    emailsSent++;
                }

                // Update the search document
                batch.update(searchDoc.ref, {
                    newMatchCount: adminDb.FieldValue.increment(matchingProperties.length),
                    lastSentAt: adminDb.FieldValue.serverTimestamp()
                });
            }
        }
        
        await batch.commit();

        return NextResponse.json({
            message: 'Alert check completed.',
            processedSearches: savedSearches.length,
            newPropertiesFound: newProperties.length,
            emailsSent,
        });

    } catch (error: any) {
        console.error('Error in alert check cron job:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
