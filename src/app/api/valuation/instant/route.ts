
import { adminDb } from '@/lib/firebase/admin'
import { getRentCastValuation } from '@/lib/valuation/rentcast';

function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      address, 
      city, 
      state, 
      propertyType,
      bedrooms,
      bathrooms,
      size,
      yearBuilt,
      amenities = [] 
    } = body

    if (!address || !city || !state || !propertyType) {
      return Response.json(
        { error: 'Address, city, state, and property type are required' },
        { status: 400 }
      )
    }

    const valuation = await getRentCastValuation({
      address: `${address}, ${city}, ${state}, Nigeria`,
      propertyType,
      bedrooms: bedrooms || 2,
      bathrooms: bathrooms || 2,
      size: size || 100, // expecting size in sqm
    });

    // Store valuation in Firebase for analytics
    await adminDb.collection('propertyValuations').add({
      address,
      city,
      state,
      estimatedValue: valuation.estimatedValue,
      inputData: body,
      valuationData: valuation,
      reportId: valuation.reportId,
      ipAddress: request.headers.get('x-forwarded-for'),
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    })

    return Response.json(valuation)

  } catch (error: any) {
    console.error('Valuation error:', error)
    
    if (error.code === 'failed-precondition') {
      return Response.json(
        { error: 'A database index is required for this query. Please create the necessary composite indexes in the Firebase Console.' },
        { status: 500 }
      )
    }
    
    return Response.json(
      { error: error.message || 'Failed to estimate property value' },
      { status: 500 }
    )
  }
}
