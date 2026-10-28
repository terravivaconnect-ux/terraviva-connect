'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PasswordInput from '@/components/PasswordInput';
import { useT } from '@/lib/i18n';

const INTERESTS = ['Sustainable Agriculture', 'Youth and Women Empowerment', 'Environmental Conservation', 'Reproductive Health Education', 'Climate Change', 'Biodiversity Conservation', 'Research and Innovation', 'Funding and Partnerships'];
export default function Register() {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [f, setF] = useState({ first_name: '', middle_name: '', last_name: '', username: '', email: '', phone: '', country: 'Tanzania', region: '', district: '', headline: '', interest: INTERESTS[0], account_type: 'general', password: '', agree: false });
  const [err, setErr] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0); const [info, setInfo] = useState('');
  useEffect(() => { if (wait <= 0) return; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id); }, [wait]);
  const resend = async () => {
    setInfo(''); setErr('');
    const { error } = await supabase.auth.resend({ type: 'signup', email: f.email, options: { emailRedirectTo: window.location.origin + '/login' } });
    if (error) setErr(error.message); else { setInfo(L('Email sent again.', 'Barua imetumwa tena.')); setWait(60); }
  };
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
  if (done) return (<div className="auth"><div className="auth-card"><img className="logo" src="/logo.png" alt="" /><h2>{t("Check your email")}</h2>
    <p className="muted">We sent a verification link to <b>{f.email}</b>. Verify your account, then log in.</p>
    <p className="muted">{L('Not in your inbox? Check the Spam or Promotions folder. It can take a few minutes.', 'Huoni barua? Angalia folda ya Spam au Promotions. Inaweza kuchukua dakika chache.')}</p>
    {err && <div className="err">{err}</div>}{info && <div className="ok">{info}</div>}
    <p><button type="button" className="sec" disabled={wait > 0} onClick={resend}>{wait > 0 ? `${L('Resend in', 'Tuma tena baada ya')} ${wait}s` : L('Resend email', 'Tuma barua tena')}</button></p>
    <Link className="btn" href="/login">{t("Go to login")}</Link></div></div>);
  return (
    <div className="auth"><div className="auth-card" style={{ maxWidth: 560 }}>
      <img className="logo" src="/logo.png" alt="Terraviva" /><h2>{t("Create your account")}</h2>
      <p className="tag">{t("Open to everyone — beneficiaries and non-beneficiaries.")}</p>
      {err && <div className="err">{err}</div>}
      <form onSubmit={submit}>
        <div className="row"><input placeholder={t("First name")} value={f.first_name} onChange={set('first_name')} required /><input placeholder={t("Middle name (optional)")} value={f.middle_name} onChange={set('middle_name')} /></div>
        <div className="row"><input placeholder={t("Last name")} value={f.last_name} onChange={set('last_name')} required /><input placeholder={t("Username")} value={f.username} onChange={set('username')} required /></div>
        <input type="email" placeholder={t("Email address")} value={f.email} onChange={set('email')} required />
        <input placeholder={t("Telephone (optional)")} value={f.phone} onChange={set('phone')} />
        <div className="row"><input placeholder={t("Country")} value={f.country} onChange={set('country')} required /><input placeholder={t("Region / State")} value={f.region} onChange={set('region')} /></div>
        <input placeholder={t("District (optional)")} value={f.district} onChange={set('district')} />
        <input placeholder={t("Headline, e.g. Agronomist | Farmer | Student")} value={f.headline} onChange={set('headline')} />
        <select value={f.interest} onChange={set('interest')}>{INTERESTS.map(i => <option key={i}>{i}</option>)}</select>
        <select value={f.account_type} onChange={set('account_type')}>
          <option value="general">{t("General member")}</option><option value="professional">{t("Professional")}</option>
          <option value="organization">{t("Organization (verification required)")}</option><option value="donor">{t("Donor / Development partner (verification required)")}</option></select>
        <PasswordInput value={f.password} onChange={set('password')} placeholder={t("Password (min 8 characters)")} autoComplete="new-password" />
        <label style={{ display: 'flex', gap: '.5rem', fontSize: '.9rem', margin: '.3rem 0 1rem' }}>
          <input type="checkbox" style={{ width: 'auto', margin: 0 }} checked={f.agree} onChange={set('agree')} />
          <span>I accept the <Link href="/terms" target="_blank">{t("Terms of Service")}</Link> and <Link href="/privacy" target="_blank">{t("Privacy Policy")}</Link>.</span></label>
        <button style={{ width: '100%' }} disabled={busy}>{busy ? t("Creating…") : t("Create account")}</button>
      </form>
      <p className="muted">Already a member? <Link href="/login">{t("Log in")}</Link></p>
    </div></div>
  );
}
