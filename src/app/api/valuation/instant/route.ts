
import { adminDb } from '@/lib/firebase/admin';
import type { ValuationResult } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, city, state, propertyType, bedrooms, bathrooms, size } = body;

    if (!address || !city || !state || !propertyType || !size || !bedrooms || !bathrooms) {
      return Response.json(
        { error: 'Address, city, state, property type, size, bedrooms, and bathrooms are required' },
        { status: 400 }
      );
    }
    
    // User-provided valuation logic
    const basePrices: Record<string, number> = {
      'lekki': 350000, // Naira per square meter
      'ikeja': 280000,
      'maitama': 420000,
      'victoria island': 500000,
      'ajah': 200000,
      'surulere': 250000,
      'gbagada': 180000
    };

    const location = `${address} ${city}`.toLowerCase();
    
    const locationKey = Object.keys(basePrices).find(key => 
      location.includes(key)
    ) || 'lekki';
    
    const basePrice = basePrices[locationKey];
    
    let estimatedValue = basePrice * size;
    
    const bedroomMultiplier = bedrooms > 3 ? 1.2 : 1.0;
    estimatedValue *= bedroomMultiplier;

    const bathroomMultiplier = bathrooms > 2 ? 1.1 : 1.0;
    estimatedValue *= bathroomMultiplier;

    const typeMultipliers: Record<string, number> = {
      'duplex': 1.5,
      'penthouse': 2.0,
      'apartment': 1.0,
      'bungalow': 1.3,
      'terraced house': 1.1,
      'semi-detached': 1.2,
      'detached house': 1.4,
      'commercial': 1.0
    };
    
    const propertyTypeKey = propertyType.toLowerCase();
    const typeMultiplier = typeMultipliers[propertyTypeKey] || 1.0;
    estimatedValue *= typeMultiplier;
    
    estimatedValue = Math.round(estimatedValue);

    const reportId = `NG-VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const valuation: ValuationResult = {
      estimatedValue,
      confidence: 0.75,
      currency: 'NGN',
      range: {
        low: Math.round(estimatedValue * 0.85),
        high: Math.round(estimatedValue * 1.15),
      },
      breakdown: {
        basePrice: basePrice,
        sizeValue: Math.round(basePrice * size),
        bedroomValue: Math.round((basePrice * size) * (bedroomMultiplier - 1)),
        amenityValue: Math.round((basePrice * size) * (bathroomMultiplier - 1)),
        ageAdjustment: 0,
        locationMultiplier: typeMultiplier,
        marketTrendValue: 0,
      },
      comparablesCount: 0,
      marketTrend: "Market is stable. Valuation based on property attributes.",
      nextSteps: [
        'Get a professional valuation for a more precise price.',
        'Compare with recently sold properties in your area.',
        'Consult a local real estate agent for market insights.',
      ],
      reportId: reportId,
    };

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
      timestamp: Date.now(),
    });

    return Response.json(valuation);

  } catch (error: any) {
    console.error('Valuation error:', error);
    return Response.json(
      { error: error.message || 'Failed to estimate property value' },
      { status: 500 }
    );
  }
}
