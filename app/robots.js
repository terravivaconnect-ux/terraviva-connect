import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/terms', '/privacy'],
        disallow: ['/api/', '/admin', '/settings', '/messages', '/notifications', '/network', '/saved', '/search', '/post/', '/profile/', '/communities', '/events', '/opportunities', '/projects', '/resources', '/reset-password', '/forgot-password', '/s/']
      },
      {
        // Programu za preview za mitandao ya kijamii zinaruhusiwa kusoma link zilizoshirikiwa tu.
        userAgent: ['facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'TelegramBot', 'Slackbot', 'Discordbot'],
        allow: ['/s/', '/profile/', '/login', '/register', '/terms', '/privacy'],
        disallow: ['/api/', '/admin', '/settings', '/messages', '/notifications', '/network', '/saved', '/search']
      }
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL
  };
}
