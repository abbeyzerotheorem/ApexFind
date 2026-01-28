
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return Response.json({ error: 'Address parameter is required' }, { status: 400 })
  }
  
  // OpenStreetMap Nominatim (Free)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Nigeria')}&format=json&limit=1`,
    {
      headers: { 'User-Agent': 'NigerianRealEstate/1.0' }
    }
  )
  
  const data = await response.json()

  if (!response.ok || !data) {
      return Response.json({ error: 'Failed to fetch geocoding data' }, { status: 500 })
  }
  
  return Response.json({
    coordinates: data[0] ? {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name
    } : null,
    source: 'OpenStreetMap'
  })
}
