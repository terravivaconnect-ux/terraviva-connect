'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';
import LangSwitch from '@/components/LangSwitch';
import { useT } from '@/lib/i18n';

export default function Login() {
  const router = useRouter(); const { t } = useT();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    router.replace('/');
  };
  return (
    <div className="auth"><div className="auth-card">
      <div style={{ textAlign: 'right' }}><LangSwitch /></div>
      <img className="logo" src="/logo.png" alt="Terraviva" />
      <h2>Terraviva Connect</h2>
      <p className="tag">{t('Connect. Share Knowledge. Empower Communities. Protect Nature.')}</p>
      {err && <div className="err">{err}</div>}
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
