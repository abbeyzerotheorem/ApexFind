
// A more detailed valuation model for Nigerian properties.

interface NigerianPropertyValuationInput {
  address: string;
  city: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // in square meters
  yearBuilt: number;
  amenities: string[];
  comparables?: any[];
}

interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  currency: string;
  range: {
    low: number;
    high: number;
  };
  breakdown: {
    basePrice: number;
    locationMultiplier: number;
    sizeValue: number;
    bedroomValue: number;
    ageAdjustment: number;
    amenityValue: number;
    marketTrendValue: number;
  };
  comparablesCount: number;
  marketTrend: string;
  nextSteps: string[];
  reportId: string;
}

// Nigerian location-based pricing (per square meter)
const NIGERIAN_LOCATION_PRICES: Record<string, number> = {
  // Lagos
  'lekki': 350000,
  'victoria island': 500000,
  'ikoyi': 450000,
  'ikeja': 280000,
  'surulere': 250000,
  'ajah': 200000,
  'yaba': 220000,
  'gbagada': 180000,
  
  // Abuja
  'maitama': 420000,
  'asokoro': 450000,
  'wuse': 300000,
  'garki': 250000,
  'jabi': 200000,
  
  // Port Harcourt
  'port harcourt gra': 280000,
  'g.r.a': 280000,
  'diobu': 150000,
  
  // Other major cities
  'ibadan': 150000,
  'kano': 120000,
  'benin': 130000,
  'owerri': 140000,
  'enugu': 130000,
  'aba': 110000,
};

export async function estimateNigerianPropertyValue(
  input: NigerianPropertyValuationInput
): Promise<ValuationResult> {
  
  const comparables = input.comparables || [];

  // 1. Base price from location
  const locationKey = Object.keys(NIGERIAN_LOCATION_PRICES).find(key => 
    input.address.toLowerCase().includes(key) || 
    input.city.toLowerCase().includes(key)
  ) || 'lekki'; // Default to Lekki
  
  const basePricePerSqm = NIGERIAN_LOCATION_PRICES[locationKey];

  // 2. Size value
  const sizeValue = basePricePerSqm * input.size;

  // 3. Bedroom adjustment
  const bedroomValue = calculateBedroomValue(input.bedrooms, sizeValue);

  // 4. Age adjustment
  const age = new Date().getFullYear() - input.yearBuilt;
  const ageAdjustment = calculateAgeAdjustment(age, sizeValue);

  // 5. Amenity value
  const amenityValue = calculateAmenityValue(input.amenities);

  // 6. Market trend from comparables
  const { marketValue, confidence } = calculateFromComparables(comparables, input);

  // 7. Calculate final value
  const estimatedValue = Math.round(
    sizeValue + 
    bedroomValue + 
    ageAdjustment + 
    amenityValue + 
    marketValue
  );

  // 8. Calculate range (±15%)
  const range = {
    low: Math.round(estimatedValue * 0.85),
    high: Math.round(estimatedValue * 1.15)
  };

  // 9. Generate report ID
  const reportId = `NG-VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    estimatedValue,
    confidence: Math.min(confidence + (comparables.length > 5 ? 0.2 : 0), 0.95),
    currency: 'NGN',
    range,
    breakdown: {
      basePrice: basePricePerSqm,
      locationMultiplier: 1.0,
      sizeValue: Math.round(sizeValue),
      bedroomValue: Math.round(bedroomValue),
      ageAdjustment: Math.round(ageAdjustment),
      amenityValue: Math.round(amenityValue),
      marketTrendValue: Math.round(marketValue)
    },
    comparablesCount: comparables.length,
    marketTrend: getMarketTrend(comparables),
    nextSteps: [
      'Get professional valuation',
      'Compare with recent sales',
      'Consult local realtor',
      'Check property documents'
    ],
    reportId
  };
}

// Helper functions
function calculateBedroomValue(bedrooms: number, baseValue: number): number {
  if (bedrooms <= 2) return baseValue * 0.1;
  if (bedrooms === 3) return baseValue * 0.15;
  if (bedrooms === 4) return baseValue * 0.2;
  return baseValue * 0.25; // 5+ bedrooms
}

function calculateAgeAdjustment(age: number, baseValue: number): number {
  if (age < 5) return baseValue * 0.1; // New properties premium
  if (age < 10) return 0;
  if (age < 20) return baseValue * -0.1; // 10-20% depreciation
  if (age < 30) return baseValue * -0.2;
  return baseValue * -0.3; // Old properties
}

function calculateAmenityValue(amenities: string[]): number {
  const values: Record<string, number> = {
    '24/7 Power Supply': 5000000,
    'Borehole Water': 3000000,
    'Swimming Pool': 8000000,
    'Security Guards': 2000000,
    'CCTV': 1500000,
    'Electric Fence': 2500000,
    'Garden': 2000000,
    'Parking Space': 1000000,
    'Maid Quarters': 3000000,
    'Fully Furnished': 10000000,
    'Smart Home': 5000000,
    'Gym': 5000000
  };
  
  return amenities.reduce((total, amenity) => {
    return total + (values[amenity] || 0);
  }, 0);
}

function calculateFromComparables(comparables: any[], input: NigerianPropertyValuationInput) {
  if (comparables.length === 0) {
    return { marketValue: 0, confidence: 0.6 };
  }

  // Calculate average price per square meter from comparables
  const validComparables = comparables.filter(c => c.price && c.sqft);
  
  if (validComparables.length === 0) {
    return { marketValue: 0, confidence: 0.6 };
  }

  const totalValue = validComparables.reduce((sum, comp) => {
    const pricePerSqm = comp.price / ((comp.sqft / 10.764) || 1);
    return sum + pricePerSqm;
  }, 0);

  const avgPricePerSqm = totalValue / validComparables.length;
  const marketValue = avgPricePerSqm * input.size;
  
  // Confidence based on number and similarity of comparables
  let confidence = 0.7;
  if (validComparables.length >= 5) confidence = 0.85;
  if (validComparables.length >= 10) confidence = 0.9;

  return { marketValue, confidence };
}

function getMarketTrend(comparables: any[]): string {
  if (comparables.length < 3) return 'Insufficient data';
  
  // Simple trend analysis based on listing dates and prices
  const recent = comparables.slice(0, 3);
  const older = comparables.slice(-3);
  
  const recentAvg = recent.reduce((sum, c) => sum + (c.price || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, c) => sum + (c.price || 0), 0) / older.length;
  
  if (olderAvg === 0) return 'Insufficient data';

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 5) return `Market is rising (+${change.toFixed(1)}%)`;
  if (change < -5) return `Market is cooling (${change.toFixed(1)}%)`;
  return 'Market is stable';
}
