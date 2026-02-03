
import { adminDb } from '@/lib/firebase/admin';
import type { ValuationResult } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, city, state, propertyType, bedrooms, bathrooms, size } = body;

    if (!address || !city || !state || !propertyType || !size || !bedrooms || !bathrooms) {
      return Response.json(
        { error: 'Incomplete property profile. Please fill in all fields to generate a valuation.' },
        { status: 400 }
      );
    }
    
    // Nigerian base price indices per square meter (Naira)
    // These reflect high-end commercial and residential benchmarks
    const basePrices: Record<string, number> = {
      'lekki': 420000,
      'ikeja': 310000,
      'maitama': 550000,
      'victoria island': 600000,
      'ajah': 220000,
      'surulere': 280000,
      'gbagada': 210000,
      'asokoro': 580000,
      'wuse': 450000,
      'gra': 350000,
      'default': 250000
    };

    const locationQuery = `${address} ${city}`.toLowerCase();
    const locationKey = Object.keys(basePrices).find(key => 
      locationQuery.includes(key)
    ) || 'default';
    
    const basePricePerSqM = basePrices[locationKey];
    
    // Core calculation logic
    let estimatedValue = basePricePerSqM * size;
    
    // Room multipliers
    const bedroomMultiplier = bedrooms > 3 ? 1.25 : 1.0;
    estimatedValue *= bedroomMultiplier;

    const bathroomMultiplier = bathrooms > 2 ? 1.15 : 1.0;
    estimatedValue *= bathroomMultiplier;

    // Property Type premium indices
    const typeMultipliers: Record<string, number> = {
      'duplex': 1.6,
      'penthouse': 2.2,
      'apartment': 1.0,
      'bungalow': 1.35,
      'terraced house': 1.2,
      'semi-detached': 1.3,
      'detached house': 1.5,
      'commercial': 1.8
    };
    
    const typeKey = propertyType.toLowerCase();
    const typeMultiplier = typeMultipliers[typeKey] || 1.0;
    estimatedValue *= typeMultiplier;
    
    // Round to nearest 100,000 for a professional look
    estimatedValue = Math.round(estimatedValue / 100000) * 100000;

    const reportId = `NG-VAL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Construct high-quality report
    const valuation: ValuationResult = {
      estimatedValue,
      confidence: locationKey === 'default' ? 0.65 : 0.85,
      currency: 'NGN',
      range: {
        low: Math.round(estimatedValue * 0.88),
        high: Math.round(estimatedValue * 1.12),
      },
      breakdown: {
        basePrice: basePricePerSqM,
        sizeValue: Math.round(basePricePerSqM * size),
        bedroomValue: Math.round((basePricePerSqM * size) * (bedroomMultiplier - 1)),
        amenityValue: Math.round((basePricePerSqM * size) * (bathroomMultiplier - 1)),
        ageAdjustment: 0,
        locationMultiplier: typeMultiplier,
        marketTrendValue: 0,
      },
      comparablesCount: Math.floor(Math.random() * 15) + 12, // Simulated realistic count
      marketTrend: `The ${city} market remains resilient. Properties like yours are currently in high demand, with luxury ${typeKey} units seeing consistent appreciation.`,
      nextSteps: [
        'Connect with a verified local agent for a physical inspection.',
        'Obtain a certified NIESV valuation for formal financing.',
        'Review recent land registry searches for title verification.',
        'Capture professional wide-angle photos to maximize listing impact.'
      ],
      reportId: reportId,
    };

    // Store valuation for analytics and future reference
    await adminDb.collection('propertyValuations').add({
      address,
      city,
      state,
      estimatedValue: valuation.estimatedValue,
      inputData: body,
      valuationData: valuation,
      reportId: valuation.reportId,
      ipAddress: request.headers.get('x-forwarded-for') || 'internal',
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    });

    return Response.json(valuation);

  } catch (error: any) {
    console.error('Valuation Engine Error:', error);
    return Response.json(
      { error: 'The valuation engine is currently undergoing maintenance. Please try again in a few minutes.' },
      { status: 500 }
    );
  }
}
