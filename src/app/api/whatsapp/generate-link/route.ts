'use server';

import { formatNaira } from "@/lib/naira-formatter";
import type { Property } from "@/types";

export async function POST(request: Request) {
  const { property }: { property: Property } = await request.json()

  if (!property) {
    return Response.json({ error: 'Property data is required' }, { status: 400 });
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apexfind.ng';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ApexFind';

  // Nigerian WhatsApp message format
  const message = `🏡 *${property.address}*\n\n` +
                 `💰 *Price:* ${formatNaira(property.price)}\n` +
                 `📍 *Location:* ${property.city}, ${property.state}\n` +
                 `🛏️ *Bedrooms:* ${property.beds || 'N/A'}\n` +
                 `🚿 *Bathrooms:* ${property.baths || 'N/A'}\n` +
                 `📏 *Size:* ${property.sqft || 'N/A'} sqft\n\n` +
                 `🔗 *View Online:* ${siteUrl}/property/${property.id}\n\n` +
                 `_I saw this property on ${siteName}_`
  
  const encodedMessage = encodeURIComponent(message)
  const whatsappLink = `https://wa.me/?text=${encodedMessage}`
  
  return Response.json({
    link: whatsappLink,
    message: message,
    instructions: 'Click the link to open WhatsApp with pre-filled message'
  })
}
