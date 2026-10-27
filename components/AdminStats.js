'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
export default function AdminStats() {
  const { t } = useT();
  const [s, setS] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { supabase.rpc('admin_stats').then(({ data, error }) => error ? setErr(error.message) : setS(data)); }, []);
  if (err) return <div className="err">{err}</div>;
  if (!s) return <p className="muted">{t("Loading…")}</p>;
  const cards = [['Members', s.users], ['New (7 days)', s.users_7d], ['Beneficiaries', s.beneficiaries], ['Posts', s.posts], ['Posts (7 days)', s.posts_7d], ['Comments', s.comments], ['Messages (7 days)', s.messages_7d], ['Communities', s.communities], ['Open reports', s.open_reports]];
  const max = Math.max(1, ...s.signups.map(x => x.n));
  return (<div>
    <div className="stat-grid">{cards.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><small className="muted">{t(l)}</small></div>)}</div>
    <div className="card"><h3>{t("Sign-ups, last 14 days")}</h3><div className="bars">{s.signups.map(x => <div key={x.day} title={`${x.day}: ${x.n}`} style={{ height: (x.n / max * 100) + '%' }} />)}</div></div>
    <div className="card"><h3>{t("Largest communities")}</h3>{s.top_communities.map(c => <div className="item" key={c.name}><span>{c.name}</span><b>{c.members}</b></div>)}</div>
  </div>);
}
