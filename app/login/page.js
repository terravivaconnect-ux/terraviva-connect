'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';
import LangSwitch from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';
import { safeNext, takeNext } from '@/lib/redirect';

export default function Login() {
  const router = useRouter(); const sp = useSearchParams(); const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false); const [wait, setWait] = useState(0); const [info, setInfo] = useState('');
  const [maint, setMaint] = useState(null);
  useEffect(() => { supabase.rpc('get_app_status').then(({ data }) => { const s = Array.isArray(data) ? data[0] : data; if (s?.maintenance) setMaint(s); }); }, []);
  useEffect(() => { if (wait <= 0) return; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id); }, [wait]);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setInfo(''); setUnconfirmed(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) {
      if (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) { setUnconfirmed(true); return; }
      return setErr(error.message);
    }
    const stored = takeNext();
    router.replace(safeNext(sp.get('next')) || stored || '/');
  };
  const resend = async () => {
    setErr(''); setInfo('');
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin + '/login' } });
    if (error) setErr(error.message); else { setInfo(L('Confirmation email sent again. Check your inbox and the Spam folder.', 'Barua ya uthibitisho imetumwa tena. Angalia Inbox na folda ya Spam.')); setWait(60); }
  };
  return (
    <div className="auth"><div className="auth-card">
      <div style={{ textAlign: 'right' }}><LangSwitch /></div>
      <img className="logo" src="/logo.png" alt="Terraviva" />
      <h2>Terraviva Connect</h2>
      <p className="tag">{t('Connect. Share Knowledge. Empower Communities. Protect Nature.')}</p>
      {maint && <div className="ok" style={{ background: '#fff3d6', color: '#a16a00', textAlign: 'left' }}>🛠 {lang === 'sw' ? maint.message_sw : maint.message_en}
        {maint.eta && <div><b>{L('Expected back', 'Tunatarajia kurudi')}:</b> {maint.eta}</div>}
        <div><small>{L('Only administrators and moderators can log in right now.', 'Kwa sasa wasimamizi pekee ndio wanaweza kuingia.')}</small></div></div>}
      {err && <div className="err">{err}</div>}
      {info && <div className="ok">{info}</div>}
      {unconfirmed && <div className="err">
        {L('Your email is not confirmed yet. Open the confirmation email we sent you (also check Spam).', 'Barua pepe yako bado haijathibitishwa. Fungua barua ya uthibitisho tuliyokutumia (angalia pia Spam).')}
        <div style={{ marginTop: '.5rem' }}><button type="button" className="sec" disabled={wait > 0 || !email} onClick={resend}>{wait > 0 ? `${L('Resend in', 'Tuma tena baada ya')} ${wait}s` : L('Resend confirmation email', 'Tuma tena barua ya uthibitisho')}</button></div>
      </div>}
      <form onSubmit={submit}>
        <input type="email" placeholder={t('Email address')} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder={t('Password')} autoComplete="current-password" />
        <div style={{ textAlign: 'right', marginBottom: '.8rem' }}><Link href="/forgot-password">{t('Forgot password?')}</Link></div>
        <button style={{ width: '100%' }} disabled={busy}>{busy ? '…' : t('Log in')}</button>
      </form>
      <p className="muted">{t('New here?')} <Link href="/register">{t('Create an account')}</Link></p>
      <small className="muted"><Link href="/terms">{t('Terms of Service')}</Link> · <Link href="/privacy">{t('Privacy Policy')}</Link></small>
    </div></div>
  );
}
