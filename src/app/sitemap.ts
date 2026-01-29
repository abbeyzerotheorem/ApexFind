
import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase/admin';
import type { Property } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apexfind.ng';

  const staticRoutes = [
    '/',
    '/search',
    '/sell',
    '/mortgage',
    '/agents',
    '/insights',
    '/auth',
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly' as 'daily' | 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
  
  // Add Nigerian location pages
  const nigerianCities = [
    'lagos', 'abuja', 'port-harcourt', 'ibadan', 'kano',
    'benin-city', 'owerri', 'enugu', 'aba', 'ilorin'
  ];
  
  const cityUrls = nigerianCities.map(city => ({
    url: `${baseUrl}/search?q=${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8
  }));

  let propertyUrls: MetadataRoute.Sitemap = [];

  try {
    // Fetch properties from Firestore
    const propertiesSnapshot = await adminDb.collection('properties').get();
    const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));

    propertyUrls = properties.map((property) => ({
      url: `${baseUrl}/property/${property.id}`,
      lastModified: property.updatedAt ? property.updatedAt.toDate() : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn(`
      Could not generate dynamic property URLs for sitemap.xml.
      This is likely because the FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set in the build environment.
      The sitemap will be generated with static routes only.
      Error: ${(error as Error).message}
    `);
  }

  return [...staticUrls, ...propertyUrls, ...cityUrls];
}
