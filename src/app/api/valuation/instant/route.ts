
import { adminDb } from '@/lib/firebase/admin'
import { estimateNigerianPropertyValue } from '@/lib/valuation/nigeria-firebase'

function mapPropertyTypeToHomeType(propertyType: string): string {
  const mapping: { [key: string]: string } = {
    'apartment': 'Apartment (Flat)',
    'penthouse': 'Apartment (Flat)',
    'terraced house': 'Terrace',
    'detached house': 'House',
    'semi-detached': 'Duplex', // Approximation
  };
  const lowerCaseType = propertyType.toLowerCase();
  // Return the mapped value, or the original value if no mapping exists (for cases like 'Duplex', 'Bungalow')
  return mapping[lowerCaseType] || propertyType;
}

function capitalize(str: string): string {
    if (!str) return '';
    // Capitalize the first letter and make the rest lowercase.
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

    // Validate required fields
    if (!address || !city || !state || !propertyType) {
      return Response.json(
        { error: 'Address, city, state, and property type are required' },
        { status: 400 }
      )
    }
    
    const home_type_for_query = mapPropertyTypeToHomeType(propertyType);
    const capitalizedCity = capitalize(city);
    const capitalizedState = capitalize(state);


    // Step 1: Get comparable properties from Firebase
    const comparablesSnapshot = await adminDb
      .collection('properties')
      .where('city', '==', capitalizedCity)
      .where('state', '==', capitalizedState)
      .where('home_type', '==', home_type_for_query)
      .orderBy('createdAt', 'desc')
      .limit(50) // Fetch more to filter in-memory
      .get()

    const allComparables = comparablesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // In-memory filtering for bedrooms
    const comparables = allComparables.filter(comp => 
        (comp.beds >= Math.max(1, (bedrooms || 2) - 1)) &&
        (comp.beds <= (bedrooms || 2) + 1)
    ).slice(0, 20); // Limit to 20 after filtering


    // Step 2: Calculate value using Nigerian-specific algorithm
    const valuation = await estimateNigerianPropertyValue({
      address,
      city,
      state,
      propertyType: propertyType,
      bedrooms: bedrooms || 2,
      bathrooms: bathrooms || 2,
      size: size || 100, // expecting size in sqm
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
      { error: 'Failed to estimate property value' },
      { status: 500 }
    )
  }
}
