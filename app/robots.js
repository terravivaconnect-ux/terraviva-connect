import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: ['/', '/login', '/register', '/terms', '/privacy'],
      disallow: ['/api/', '/admin', '/settings', '/messages', '/notifications', '/network', '/saved', '/search', '/post/', '/profile/', '/communities', '/events', '/opportunities', '/projects', '/resources', '/reset-password', '/forgot-password']
    }],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL
  };
}
