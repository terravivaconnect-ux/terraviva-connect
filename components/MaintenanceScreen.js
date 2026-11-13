'use client';
import { useT } from '@/lib/i18n';

// Ukurasa ambao wanachama wa kawaida wanauona wakati wa matengenezo.
export default function MaintenanceScreen({ status, onRetry, onLogout }) {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  return (
    <div className="auth">
      <div className="auth-card">
        <img className="logo" src="/logo.png" alt="Terraviva Connect" />
        <div style={{ fontSize: '2.4rem' }}>🛠️</div>
        <h2>{L('We will be back soon', 'Tutarejea hivi karibuni')}</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{lang === 'sw' ? status.message_sw : status.message_en}</p>
        {status.eta && <p><b>{L('Expected back', 'Tunatarajia kurudi')}:</b> {status.eta}</p>}
        <p className="muted">{L('This page refreshes automatically.', 'Ukurasa huu hujisasisha wenyewe.')}</p>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRetry}>{L('Try again', 'Jaribu tena')}</button>
          <button className="sec" onClick={onLogout}>{L('Log out', 'Toka')}</button>
        </div>
      </div>
    </div>
  );
}
