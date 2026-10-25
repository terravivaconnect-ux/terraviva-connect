'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';

export default function Login() {
  const router = useRouter();
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
      <img className="logo" src="/logo.png" alt="Terraviva" />
      <h2>Terraviva Connect</h2>
      <p className="tag">Connect. Share Knowledge. Empower Communities. Protect Nature.</p>
      {err && <div className="err">{err}</div>}
      <form onSubmit={submit}>
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <PasswordInput value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
        <div style={{ textAlign: 'right', marginBottom: '.8rem' }}><Link href="/forgot-password">Forgot password?</Link></div>
        <button style={{ width: '100%' }} disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
      </form>
      <p className="muted">New here? <Link href="/register">Create an account</Link></p>
      <small className="muted">Protecting Nature, Empowering Communities.</small>
    </div></div>
  );
}
