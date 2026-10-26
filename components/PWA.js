'use client';
import { useEffect, useState } from 'react';
export default function PWA() {
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (!evt) return null;
  return (<button className="install" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}>⬇ Install app</button>);
}
