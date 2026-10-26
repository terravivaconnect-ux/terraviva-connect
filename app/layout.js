import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terraviva Connect',
  description: 'Connect. Share Knowledge. Empower Communities. Protect Nature.',
  icons: { icon: '/logo.png' }
};
export const viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
