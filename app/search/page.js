'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import PostCard from '@/components/PostCard';
import { POST_SELECT } from '@/components/Feed';
import { supabase, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
function Inner({ me }) {
  const { t } = useT();
  const sp = useSearchParams(); const [q, setQ] = useState(sp.get('q') || ''); const [country, setCountry] = useState(''); const [r, setR] = useState(null);
  const run = async (query) => {
    const t = query.trim().replace(/[%,()]/g, ''); if (!t) return;
    const plain = t.replace(/^#/, '');
    let pq = supabase.from('profiles').select('id,username,first_name,last_name,headline,avatar_url,country,is_beneficiary_verified,is_professional_verified,is_org_verified').or(`username.ilike.%${plain}%,first_name.ilike.%${plain}%,last_name.ilike.%${plain}%,headline.ilike.%${plain}%`).eq('status', 'active').limit(15);
    if (country) pq = pq.ilike('country', `%${country}%`);
    const [p, c, po] = await Promise.all([pq,
      supabase.from('communities').select('*').or(`name.ilike.%${plain}%,description.ilike.%${plain}%`).limit(10),
      supabase.from('posts').select(POST_SELECT).ilike('body', `%${t}%`).eq('is_removed', false).order('created_at', { ascending: false }).limit(15)]);
    setR({ p: p.data || [], c: c.data || [], po: po.data || [] });
  };
  useEffect(() => { if (sp.get('q')) { setQ(sp.get('q')); run(sp.get('q')); } }, [sp]);
  return (<div><h2>{t("Search")}</h2>
    <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="row"><input placeholder={t("Members, communities, posts, #hashtags…")} value={q} onChange={e => setQ(e.target.value)} /><input placeholder="Country (filter)" value={country} onChange={e => setCountry(e.target.value)} style={{ flex: '0 0 160px' }} /><button style={{ flex: '0 0 auto', height: 44 }}>{t("Search")}</button></form>
    {r && <>
      <h3>Members ({r.p.length})</h3>{r.p.map(p => <div className="card" key={p.id}><div className="post-h"><Avatar p={p} /><div className="meta"><Link href={`/profile/${p.username}`}><b>{fullName(p)}<Badges p={p} /></b></Link><small>{p.headline} {p.country && '· ' + p.country}</small></div></div></div>)}
      <h3>Communities ({r.c.length})</h3>{r.c.map(c => <Link key={c.id} href="/communities"><div className="card"><b>{c.name}</b><div className="muted">{c.description}</div></div></Link>)}
      <h3>Posts ({r.po.length})</h3>{r.po.map(p => <PostCard key={p.id} post={p} me={me} />)}</>}
  </div>);
}
export default function Search() { return <Shell>{me => <Suspense><Inner me={me} /></Suspense>}</Shell>; }
