'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
export default function Forgot() {
  const { t } = useT();
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
    error ? setErr(error.message) : setMsg('If that email exists, a reset link has been sent.');
  };
  return (<div className="auth"><div className="auth-card">
    <img className="logo" src="/logo.png" alt="Terraviva" /><h2>{t("Forgot password")}</h2>
    <p className="tag">Enter your email and we will send you a reset link.</p>
    {err && <div className="err">{err}</div>}{msg && <div className="ok">{msg}</div>}
    <form onSubmit={submit}><input type="email" placeholder={t("Email address")} value={email} onChange={e => setEmail(e.target.value)} required />
      <button style={{ width: '100%' }}>{t("Send reset link")}</button></form>
    <p><Link href="/login">{t("Back to login")}</Link></p></div></div>);
}
