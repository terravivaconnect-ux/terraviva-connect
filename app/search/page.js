'use client';
import { useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import { supabase, fullName } from '@/lib/supabase';
function Inner({ me }) {
  const [q, setQ] = useState(''); const [country, setCountry] = useState(''); const [r, setR] = useState(null);
  const go = async (e) => {
    e.preventDefault(); const t = q.trim().replace(/[%,()]/g, ''); if (!t) return;
    let pq = supabase.from('profiles').select('id,username,first_name,last_name,headline,avatar_url,country,is_beneficiary_verified,is_professional_verified,is_org_verified').or(`username.ilike.%${t}%,first_name.ilike.%${t}%,last_name.ilike.%${t}%,headline.ilike.%${t}%`).eq('status', 'active').limit(15);
    if (country) pq = pq.ilike('country', `%${country}%`);
    const [p, c, po] = await Promise.all([pq,
      supabase.from('communities').select('*').or(`name.ilike.%${t}%,description.ilike.%${t}%`).limit(10),
      supabase.from('posts').select('id,body,created_at,author:profiles!posts_author_id_fkey(username,first_name,last_name)').ilike('body', `%${t}%`).eq('is_removed', false).order('created_at', { ascending: false }).limit(15)]);
    setR({ p: p.data || [], c: c.data || [], po: po.data || [] });
  };
  return (<div><h2>Search</h2>
    <form onSubmit={go} className="row"><input placeholder="Members, communities, posts…" value={q} onChange={e => setQ(e.target.value)} /><input placeholder="Country (filter)" value={country} onChange={e => setCountry(e.target.value)} style={{ flex: '0 0 160px' }} /><button style={{ flex: '0 0 auto', height: 44 }}>Search</button></form>
    {r && <>
      <h3>Members ({r.p.length})</h3>{r.p.map(p => <div className="card" key={p.id}><div className="post-h"><Avatar p={p} /><div className="meta"><Link href={`/profile/${p.username}`}><b>{fullName(p)}<Badges p={p} /></b></Link><small>{p.headline} {p.country && '· ' + p.country}</small></div></div></div>)}
      <h3>Communities ({r.c.length})</h3>{r.c.map(c => <Link key={c.id} href="/communities"><div className="card"><b>{c.name}</b><div className="muted">{c.description}</div></div></Link>)}
      <h3>Posts ({r.po.length})</h3>{r.po.map(p => <div className="card" key={p.id}><b>{fullName(p.author)}</b><div className="post-body">{p.body.slice(0, 240)}</div></div>)}</>}
  </div>);
}
export default function Search() { return <Shell>{me => <Inner me={me} />}</Shell>; }
