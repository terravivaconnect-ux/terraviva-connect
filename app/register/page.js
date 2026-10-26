'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';

const INTERESTS = ['Sustainable Agriculture', 'Youth and Women Empowerment', 'Environmental Conservation', 'Reproductive Health Education', 'Climate Change', 'Biodiversity Conservation', 'Research and Innovation', 'Funding and Partnerships'];
export default function Register() {
  const [f, setF] = useState({ first_name: '', middle_name: '', last_name: '', username: '', email: '', phone: '', country: 'Tanzania', region: '', district: '', headline: '', interest: INTERESTS[0], account_type: 'general', password: '', agree: false });
  const [err, setErr] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.agree) return setErr('Please accept the Terms of Service and Privacy Policy.');
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(f.username)) return setErr('Username: 3-30 letters, numbers, dot or underscore.');
    setBusy(true);
    const { email, password, agree, ...meta } = f;
    const { error } = await supabase.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: window.location.origin + '/login' } });
    setBusy(false);
    error ? setErr(error.message) : setDone(true);
  };
  if (done) return (<div className="auth"><div className="auth-card"><img className="logo" src="/logo.png" alt="" /><h2>Check your email</h2>
    <p className="muted">We sent a verification link to <b>{f.email}</b>. Verify your account, then log in.</p><Link className="btn" href="/login">Go to login</Link></div></div>);
  return (
    <div className="auth"><div className="auth-card" style={{ maxWidth: 560 }}>
      <img className="logo" src="/logo.png" alt="Terraviva" /><h2>Create your account</h2>
      <p className="tag">Open to everyone — beneficiaries and non-beneficiaries.</p>
      {err && <div className="err">{err}</div>}
      <form onSubmit={submit}>
        <div className="row"><input placeholder="First name" value={f.first_name} onChange={set('first_name')} required /><input placeholder="Middle name (optional)" value={f.middle_name} onChange={set('middle_name')} /></div>
        <div className="row"><input placeholder="Last name" value={f.last_name} onChange={set('last_name')} required /><input placeholder="Username" value={f.username} onChange={set('username')} required /></div>
        <input type="email" placeholder="Email address" value={f.email} onChange={set('email')} required />
        <input placeholder="Telephone (optional)" value={f.phone} onChange={set('phone')} />
        <div className="row"><input placeholder="Country" value={f.country} onChange={set('country')} required /><input placeholder="Region / State" value={f.region} onChange={set('region')} /></div>
        <input placeholder="District (optional)" value={f.district} onChange={set('district')} />
        <input placeholder="Headline, e.g. Agronomist | Farmer | Student" value={f.headline} onChange={set('headline')} />
        <select value={f.interest} onChange={set('interest')}>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select>
        <select value={f.account_type} onChange={set('account_type')}>
          <option value="general">General member</option><option value="professional">Professional</option>
          <option value="organization">Organization (verification required)</option><option value="donor">Donor / Development partner (verification required)</option></select>
        <PasswordInput value={f.password} onChange={set('password')} placeholder="Password (min 8 characters)" autoComplete="new-password" />
        <label style={{ display: 'flex', gap: '.5rem', fontSize: '.9rem', margin: '.3rem 0 1rem' }}>
          <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={f.agree} onChange={set('agree')} />
          <span>I accept the Terms of Service and Privacy Policy.</span></label>
        <button style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already a member? <Link href="/login">Log in</Link></p>
    </div></div>
  );
}
