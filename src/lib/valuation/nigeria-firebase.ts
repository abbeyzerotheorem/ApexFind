
// A simplified valuation model for Nigerian properties.
// In a real-world scenario, this would be a much more complex model,
// likely involving machine learning, but this serves as a good example.

interface ValuationInput {
  city: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // in square meters
  amenities: string[];
  comparables: any[]; // Array of comparable property documents from Firestore
}

interface ValuationOutput {
  estimatedValue: number;
  confidence: 'High' | 'Medium' | 'Low';
  comparablesSummary: string;
  valueRange: [number, number];
}

const NIGERIA_CITY_TIERS: Record<string, 'Tier 1' | 'Tier 2' | 'Tier 3'> = {
  // Tier 1: Highest Value
  'lagos': 'Tier 1',
  'abuja': 'Tier 1',
  // Tier 2: High Value
  'port harcourt': 'Tier 2',
  'ibadan': 'Tier 2',
  'kano': 'Tier 2',
  // Tier 3: Standard Value
  'enugu': 'Tier 3',
  'kaduna': 'Tier 3',
  'benin city': 'Tier 3',
  'owerri': 'Tier 3'
};

const TIER_MULTIPLIERS = {
  'Tier 1': 1.5,
  'Tier 2': 1.1,
  'Tier 3': 0.9
};

const PROPERTY_TYPE_MULTIPLIERS: Record<string, number> = {
  'duplex': 1.4,
  'house': 1.2,
  'terrace': 1.1,
  'apartment (flat)': 1.0,
  'bungalow': 0.9,
  'commercial': 1.3,
};


export async function estimateNigerianPropertyValue(input: ValuationInput): Promise<ValuationOutput> {
  const { city, propertyType, bedrooms, bathrooms, size, comparables } = input;

  if (comparables.length < 3) {
    return {
      estimatedValue: 0,
      confidence: 'Low',
      comparablesSummary: 'Not enough comparable properties found in your area to provide a reliable estimate. A manual appraisal is recommended.',
      valueRange: [0, 0]
    };
  }

  // 1. Calculate average price per square meter from comparables
  const totalSqft = comparables.reduce((acc, p) => acc + (p.sqft || 0), 0);
  const totalPrice = comparables.reduce((acc, p) => acc + (p.price || 0), 0);
  
  // Convert sqft to sqm for calculation if needed (1 sqm = 10.764 sqft)
  const averagePricePerSqm = totalPrice / (totalSqft / 10.764);

  if (!averagePricePerSqm || isNaN(averagePricePerSqm)) {
    return {
        estimatedValue: 0,
        confidence: 'Low',
        comparablesSummary: 'Could not determine a valid price from local comparables.',
        valueRange: [0, 0]
    };
  }

  // 2. Get a base value from the average price and property size
  let estimatedValue = averagePricePerSqm * size;
  
  // 3. Apply adjustments based on property features
  const cityTier = NIGERIA_CITY_TIERS[city.toLowerCase()] || 'Tier 3';
  estimatedValue *= TIER_MULTIPLIERS[cityTier];
  
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIERS[propertyType.toLowerCase()] || 1.0;
  estimatedValue *= typeMultiplier;
  
  // Adjust for bedrooms (using average as baseline)
  const avgBedrooms = comparables.reduce((acc, p) => acc + (p.beds || 0), 0) / comparables.length;
  if (bedrooms > avgBedrooms) {
      estimatedValue *= (1 + (bedrooms - avgBedrooms) * 0.05); // +5% per extra bedroom
  } else {
      estimatedValue *= (1 - (avgBedrooms - bedrooms) * 0.04); // -4% per less bedroom
  }

  // 4. Set confidence and summary
  const confidence = comparables.length > 10 ? 'High' : 'Medium';
  const comparablesSummary = `Based on ${comparables.length} similar properties recently sold or listed in ${city}.`;

  // 5. Create a value range (e.g., +/- 10%)
  const lowerBound = Math.round(estimatedValue * 0.9 / 1000) * 1000;
  const upperBound = Math.round(estimatedValue * 1.1 / 1000) * 1000;

  return {
    estimatedValue: Math.round(estimatedValue / 1000) * 1000, // Round to nearest 1000
    confidence,
    comparablesSummary,
    valueRange: [lowerBound, upperBound]
  };
}
