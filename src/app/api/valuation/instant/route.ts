
import { adminDb } from '@/lib/firebase/admin'
import { estimateNigerianPropertyValue } from '@/lib/valuation/nigeria-firebase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      address, 
      city, 
      state, 
      home_type, 
      beds, 
      baths, 
      sqft, 
      yearBuilt,
      amenities = [] 
    } = body

    // Validate required fields
    if (!address || !city || !state || !home_type) {
      return Response.json(
        { error: 'Address, city, state, and home type are required' },
        { status: 400 }
      )
    }
    
    // Step 1: Get comparable properties from Firebase
    const comparablesSnapshot = await adminDb
      .collection('properties') // Changed from 'listings'
      .where('city', '==', city)
      .where('state', '==', state)
      .where('home_type', '==', home_type)
      .where('beds', '>=', Math.max(1, (beds || 2) - 1))
      .where('beds', '<=', (beds || 2) + 1)
      .limit(20)
      .get()

    const comparables = comparablesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Step 2: Calculate value using Nigerian-specific algorithm
    const valuation = await estimateNigerianPropertyValue({
      address,
      city,
      state,
      propertyType: home_type,
      bedrooms: beds || 2,
      bathrooms: baths || 2,
      size: (sqft || 1000) / 10.764, // Convert sqft to sqm for the function
      yearBuilt: yearBuilt || 2000,
      amenities,
      comparables
    })

    // Step 3: Store valuation in Firebase for analytics
    await adminDb.collection('propertyValuations').add({
      address,
      city,
      state,
      estimatedValue: valuation.estimatedValue,
      inputData: body,
      valuationData: valuation,
      ipAddress: request.headers.get('x-forwarded-for'),
      createdAt: new Date().toISOString(),
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
      { error: 'Failed to estimate property value' },
      { status: 500 }
    )
  }
}
