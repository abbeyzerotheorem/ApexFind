
export async function GET(
  request: Request,
  { params }: { params: { location: string } }
) {
  const location = params.location.toLowerCase()
  
  // Nigerian area database
  const areaData = {
    'lekki': {
      description: 'Upscale waterfront area in Lagos with luxury apartments and estates',
      avgPrice: 85000000,
      popularEstates: ['Lekki Phase 1', 'Chevron', 'Ikota', 'VGC'],
      amenities: ['Shopping malls', 'Beaches', 'International schools', 'Hospitals'],
      traffic: 'Heavy during rush hours',
      safety: 'Moderate to High',
      floodRisk: 'Medium (some areas)'
    },
    'ikeja': {
      description: 'Capital of Lagos State, commercial and government hub',
      avgPrice: 65000000,
      popularEstates: ['Alausa', 'Opebi', 'Allen Avenue'],
      amenities: ['MMA2 Airport', 'Government offices', 'Shopping centers'],
      traffic: 'Very heavy',
      safety: 'Moderate',
      floodRisk: 'Low'
    },
    'maitama': {
      description: 'Prestigious diplomatic area in Abuja',
      avgPrice: 150000000,
      popularEstates: ['Maitama Hills', 'Diplomatic Zone'],
      amenities: ['Embassies', 'Luxury hotels', 'High-end restaurants'],
      traffic: 'Light',
      safety: 'Very High',
      floodRisk: 'Low'
    }
  }
  
  const data = (areaData as any)[location] || {
    description: 'Information not available for this area',
    avgPrice: 0,
    popularEstates: [],
    amenities: [],
    traffic: 'Unknown',
    safety: 'Unknown',
    floodRisk: 'Unknown'
  }
  
  return Response.json(data)
}
