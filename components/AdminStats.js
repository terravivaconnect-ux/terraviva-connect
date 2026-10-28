'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
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
  const cards = [['Members', s.users], ['New (7 days)', s.users_7d], ['Beneficiaries', s.beneficiaries], ['Posts', s.posts], ['Posts (7 days)', s.posts_7d], ['Comments', s.comments], ['Messages (7 days)', s.messages_7d], ['Communities', s.communities], ['Open reports', s.open_reports]];
  const max = Math.max(1, ...s.signups.map(x => x.n));
  return (<div>
    {pending.length > 0 && <div className="card"><h3>{L('Waiting for email confirmation', 'Wanaosubiri kuthibitisha barua pepe')} ({pending.length})</h3>
      <p className="muted">{L('These people signed up but have not confirmed their email, so they cannot log in. If their confirmation email did not arrive, you can confirm them here.', 'Hawa wamejisajili lakini hawajathibitisha barua pepe, kwa hiyo hawawezi kuingia. Barua yao ya uthibitisho isipofika, unaweza kuwathibitisha hapa.')}</p>
      {pending.map(u => <div className="item" key={u.u_id}><div><b>{u.u_email}</b><br /><small className="muted">{new Date(u.u_created).toLocaleString()}</small></div>
        <button className="sec" onClick={() => confirmNow(u.u_id, u.u_email)}>{L('Confirm now', 'Thibitisha sasa')}</button></div>)}</div>}
    <div className="stat-grid">{cards.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><small className="muted">{t(l)}</small></div>)}</div>
    <div className="card"><h3>{t("Sign-ups, last 14 days")}</h3><div className="bars">{s.signups.map(x => <div key={x.day} title={`${x.day}: ${x.n}`} style={{ height: (x.n / max * 100) + '%' }} />)}</div></div>
    <div className="card"><h3>{t("Largest communities")}</h3>{s.top_communities.map(c => <div className="item" key={c.name}><span>{c.name}</span><b>{c.members}</b></div>)}</div>
  </div>);
}
