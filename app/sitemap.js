import { SITE_URL } from '@/lib/site';

export default function sitemap() {
  const now = new Date();
  return ['', '/login', '/register', '/terms', '/privacy'].map((p) => ({
    url: SITE_URL + p, lastModified: now, changeFrequency: p === '' ? 'weekly' : 'monthly', priority: p === '' ? 1 : 0.5
  }));
}
