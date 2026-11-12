'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';

// Mgeni wa link iliyoshirikiwa anapelekwa moja kwa moja kwenye kipengele ndani ya app.
// (Crawlers za WhatsApp/Facebook husoma preview kutoka kwenye ukurasa huu bila kuendesha JavaScript.)
export default function ShareRedirect({ to, title }) {
  const router = useRouter();
  const { lang } = useT();
  useEffect(() => { router.replace(to); }, [router, to]);
  return (
    <div className="auth">
      <div className="auth-card">
        <img className="logo" src="/logo.png" alt="Terraviva Connect" />
        {title && <h3>{title}</h3>}
        <p className="muted">{lang === 'sw' ? 'Inafungua Terraviva Connect…' : 'Opening Terraviva Connect…'}</p>
        <a className="btn" href={to}>{lang === 'sw' ? 'Fungua' : 'Open'}</a>
      </div>
    </div>
  );
}
