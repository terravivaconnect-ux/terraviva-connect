'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

// Orodha yenye pau (bars): jina, idadi na asilimia.
function Dist({ rows, total, label }) {
  if (!rows || !rows.length) return <p className="muted">—</p>;
  const sum = total || rows.reduce((n, r) => n + Number(r.n), 0) || 1;
  return rows.map((r) => {
    const pct = Math.round((Number(r.n) * 100) / sum);
    return (
      <div className="bar" key={r.name}>
        <div className="fill" style={{ width: Math.max(pct, 2) + '%' }} />
        <span>{label ? label(r.name) : r.name}</span><b>{r.n} · {pct}%</b>
      </div>
    );
  });
}

export default function AdminStats() {
  const { t, lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [s, setS] = useState(null); const [err, setErr] = useState(''); const [pending, setPending] = useState([]);
  const loadPending = async () => { const { data } = await supabase.rpc('admin_unconfirmed_users'); setPending(data || []); };
  useEffect(() => { supabase.rpc('admin_stats').then(({ data, error }) => error ? setErr(error.message) : setS(data)); loadPending(); }, []);
  const confirmNow = async (id, email) => {
    if (!confirm(L(`Confirm ${email} without the email link? Do this only for people you know.`, `Thibitisha ${email} bila kiungo cha barua pepe? Fanya hivi kwa watu unaowajua tu.`))) return;
    const { error } = await supabase.rpc('admin_confirm_user', { uid: id });
    if (error) alert(error.message); else loadPending();
  };
  if (err) return <div className="err">{err}</div>;
  if (!s) return <p className="muted">{t("Loading…")}</p>;

  const overview = [
    [L('Members', 'Wanachama'), s.users], [L('New (7 days)', 'Wapya (siku 7)'), s.users_7d], [L('New (30 days)', 'Wapya (siku 30)'), s.users_30d],
    [L('Active (7 days)', 'Walio hai (siku 7)'), s.active_7d], [L('With badges', 'Wenye beji'), s.verified_members], [L('Beneficiaries', 'Wanufaika'), s.beneficiaries],
    [L('Badge requests waiting', 'Maombi ya beji yanayosubiri'), s.pending_badges], [L('Open reports', 'Ripoti zilizo wazi'), s.open_reports],
  ];
  const content = [
    [L('Posts', 'Machapisho'), s.posts], [L('Posts (7 days)', 'Machapisho (siku 7)'), s.posts_7d], [L('Comments', 'Maoni'), s.comments],
    [L('Messages (7 days)', 'Ujumbe (siku 7)'), s.messages_7d], [L('Profile views (7 days)', 'Walioangalia wasifu (siku 7)'), s.profile_views_7d],
    [L('Communities', 'Jumuiya'), s.communities], [L('Upcoming events', 'Matukio yajayo'), s.events_upcoming],
    [L('Open opportunities', 'Fursa zilizo wazi'), s.opportunities_active], [L('Projects', 'Miradi'), s.projects], [L('Resources', 'Rasilimali'), s.resources],
  ];
  const max = Math.max(1, ...s.signups.map(x => x.n));
  const g = s.gender || {};
  const genderRows = [
    { name: L('Male', 'Wanaume'), n: g.male || 0 }, { name: L('Female', 'Wanawake'), n: g.female || 0 },
    { name: L('Other', 'Nyingine'), n: g.other || 0 }, { name: L('Not stated', 'Hawajataja'), n: g.unspecified || 0 },
  ];
  const typeLabel = (n) => ({ general: L('General member', 'Mwanachama wa kawaida'), professional: L('Professional', 'Mtaalamu'), organization: L('Organization', 'Shirika'), donor: L('Donor / partner', 'Mfadhili / mdau') }[n] || n);
  const card = (title, body, hint) => (<div className="card"><h3>{title}</h3>{body}{hint && <small className="muted">{hint}</small>}</div>);

  return (<div>
    {pending.length > 0 && <div className="card"><h3>{L('Waiting for email confirmation', 'Wanaosubiri kuthibitisha barua pepe')} ({pending.length})</h3>
      <p className="muted">{L('These people signed up but have not confirmed their email, so they cannot log in. If their confirmation email did not arrive, you can confirm them here.', 'Hawa wamejisajili lakini hawajathibitisha barua pepe, kwa hiyo hawawezi kuingia. Barua yao ya uthibitisho isipofika, unaweza kuwathibitisha hapa.')}</p>
      {pending.map(u => <div className="item" key={u.u_id}><div><b>{u.u_email}</b><br /><small className="muted">{new Date(u.u_created).toLocaleString()}</small></div>
        <button className="sec" onClick={() => confirmNow(u.u_id, u.u_email)}>{L('Confirm now', 'Thibitisha sasa')}</button></div>)}</div>}

    <h3>{L('Members', 'Wanachama')}</h3>
    <div className="stat-grid">{overview.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><small className="muted">{l}</small></div>)}</div>
    <h3>{L('Activity and content', 'Shughuli na maudhui')}</h3>
    <div className="stat-grid">{content.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><small className="muted">{l}</small></div>)}</div>

    {card(t("Sign-ups, last 14 days"), <div className="bars">{s.signups.map(x => <div key={x.day} title={`${x.day}: ${x.n}`} style={{ height: (x.n / max * 100) + '%' }} />)}</div>)}

    <div className="grid">
      {card(L('Gender', 'Jinsia'), <Dist rows={genderRows} total={s.users} />,
        L('Gender is optional and private. Members can add it in Settings.', 'Jinsia ni hiari na ni siri. Wanachama wanaweza kuiongeza kwenye Mipangilio.'))}
      {card(L('Members by country', 'Wanachama kwa nchi'), <Dist rows={s.countries} total={s.users} />,
        L('Countries are typed by members, so spellings can differ.', 'Nchi zinaandikwa na wanachama wenyewe, kwa hiyo herufi zinaweza kutofautiana.'))}
      {card(L('Tanzania by region', 'Tanzania kwa mkoa'), <Dist rows={s.regions} total={s.users} />)}
      {card(L('Account types', 'Aina za akaunti'), <Dist rows={s.account_types} total={s.users} label={typeLabel} />)}
      {card(L('Main interests', 'Mapendeleo makuu'), <Dist rows={s.interests} total={s.users} />)}
      {card(L('Most held badges', 'Beji zilizoshikiliwa zaidi'), <Dist rows={s.top_badges} />)}
    </div>

    {card(t("Largest communities"), s.top_communities.map(c => <div className="item" key={c.name}><span>{c.name}</span><b>{c.members}</b></div>))}
  </div>);
}
