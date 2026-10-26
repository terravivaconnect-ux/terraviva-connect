import './globals.css';
import { LangProvider } from '@/lib/i18n';
import PWA from '@/components/PWA';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terraviva Connect',
  description: 'Connect. Share Knowledge. Empower Communities. Protect Nature.',
  icons: { icon: '/logo.png', apple: '/icon-192.png' },
  manifest: '/manifest.json'
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0e7c7b' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body><LangProvider>{children}<PWA /></LangProvider></body></html>);
}
