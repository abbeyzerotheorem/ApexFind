import { MetadataRoute } from 'next';
import { PlaceHolderProperties } from '@/lib/placeholder-properties';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apexfind.ng';

  const staticRoutes = [
    '/',
    '/search',
    '/sell',
    '/rentals',
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

  const propertyUrls = PlaceHolderProperties.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...propertyUrls];
}
