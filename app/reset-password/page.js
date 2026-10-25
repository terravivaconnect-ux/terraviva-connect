'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';
export default function Reset() {
  const router = useRouter(); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [ok, setOk] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setErr(error.message);
    setOk(true); setTimeout(() => router.replace('/'), 1200);
  };
  return (<div className="auth"><div className="auth-card">
    <img className="logo" src="/logo.png" alt="Terraviva" /><h2>Set a new password</h2>
    {err && <div className="err">{err}</div>}{ok && <div className="ok">Password updated.</div>}
    <form onSubmit={submit}><PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder="New password (min 8 characters)" autoComplete="new-password" />
      <button style={{ width: '100%' }}>Update password</button></form></div></div>);
}
