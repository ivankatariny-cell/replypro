import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://replypro.hr', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://replypro.hr/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://replypro.hr/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://replypro.hr/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://replypro.hr/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
