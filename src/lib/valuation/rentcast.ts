import type { ValuationResult } from '@/types';

interface RentCastValuationInput {
    address: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    size: number; // in square meters
}

const propertyTypeMapping: { [key: string]: string } = {
    'apartment': 'Condo',
    'penthouse': 'Condo',
    'condo': 'Condo',
    'detached house': 'Single Family',
    'house': 'Single Family',
    'bungalow': 'Single Family',
    'terraced house': 'Townhouse',
    'terrace': 'Townhouse',
    'semi-detached': 'Townhouse',
    'duplex': 'Multi-Family',
    'commercial': 'Multi-Family'
};

export async function getRentCastValuation(input: RentCastValuationInput): Promise<ValuationResult> {
    const apiKey = process.env.RENTCAST_API_KEY;
    if (!apiKey) {
        throw new Error('RentCast API key is not configured.');
    }

    const squareFootage = Math.round(input.size * 10.764); // Convert sq meters to sq feet
    const rentcastPropertyType = propertyTypeMapping[input.propertyType.toLowerCase()] || 'Single Family';

    const queryParams = new URLSearchParams({
        address: input.address,
        propertyType: rentcastPropertyType,
        bedrooms: String(input.bedrooms),
        bathrooms: String(input.bathrooms),
        squareFootage: String(squareFootage),
    });

    const response = await fetch(`https://api.rentcast.io/v1/avm/value?${queryParams.toString()}`, {
        headers: {
            'X-Api-Key': apiKey,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('RentCast API Error:', errorData);
        throw new Error(errorData.message || 'Failed to retrieve valuation from RentCast.');
    }

    const data = await response.json();

    // Transform RentCast data to our app's ValuationResult structure
    return {
        estimatedValue: data.value,
        confidence: data.confidenceScore,
        currency: 'USD',
        range: {
            low: data.valueRange.lowerBound,
            high: data.valueRange.upperBound,
        },
        breakdown: {
            basePrice: 0,
            locationMultiplier: 0,
            sizeValue: 0,
            bedroomValue: 0,
            ageAdjustment: 0,
            amenityValue: 0,
            marketTrendValue: data.value,
        },
        comparablesCount: data.comps?.length || 0,
        marketTrend: 'Data provided by RentCast.io. Market trends may vary for Nigerian properties.',
        nextSteps: [
            'Review comparable properties for your area.',
            'Consult a local agent for a detailed market analysis.',
            'Consider property condition for final pricing.',
        ],
        reportId: data.id,
    };
}
