import './globals.css';
import { LangProvider } from '@/lib/i18n';
import PWA from '@/components/PWA';
import { SITE_URL, SITE_NAME, SITE_DESC } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Terraviva Connect', template: '%s | Terraviva Connect' },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: ['Terraviva', 'Terraviva Connect', 'sustainable agriculture', 'environmental conservation', 'climate change', 'youth empowerment', 'women empowerment', 'reproductive health education', 'Tanzania', 'kilimo endelevu', 'uhifadhi wa mazingira'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: SITE_URL, siteName: SITE_NAME, title: 'Terraviva Connect', description: SITE_DESC, images: [{ url: '/logo.png', width: 679, height: 720, alt: 'Terraviva' }], locale: 'en_US', alternateLocale: ['sw_TZ'] },
  twitter: { card: 'summary', title: 'Terraviva Connect', description: SITE_DESC, images: ['/logo.png'] },
  robots: { index: true, follow: true },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
  icons: { icon: '/logo.png', apple: '/icon-192.png' },
  manifest: '/manifest.json'
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0e7c7b' };

// Hides the public landing page before it paints when a member is already signed in.
const SESSION_HINT = "try{if(localStorage.getItem('sb-dripgfmuekjmocwnrczz-auth-token'))document.documentElement.classList.add('has-session')}catch(e){}";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><script dangerouslySetInnerHTML={{ __html: SESSION_HINT }} /></head>
      <body><LangProvider>{children}<PWA /></LangProvider></body>
    </html>
  );
}
