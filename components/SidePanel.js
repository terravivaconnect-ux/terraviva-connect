'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import { supabase, fullName } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

export default function SidePanel({ me }) {
  const { t } = useT(); const [tags, setTags] = useState([]); const [people, setPeople] = useState([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.rpc('trending_tags', { days: 14 }); setTags(data || []);
    const { data: c } = await supabase.from('connections').select('requester_id,addressee_id').or(`requester_id.eq.${me.id},addressee_id.eq.${me.id}`);
    const skip = new Set([me.id, ...(c || []).flatMap(x => [x.requester_id, x.addressee_id])]);
    const { data: p } = await supabase.from('profiles').select('id,username,first_name,last_name,headline,avatar_url').eq('status', 'active').order('created_at', { ascending: false }).limit(20);
    setPeople((p || []).filter(x => !skip.has(x.id)).slice(0, 5));
  })(); }, []);
  return (<aside className="panel">
    <div className="card"><h3>{t('Trending topics')}</h3>
      {!tags.length && <small className="muted">{t('No hashtags yet')}</small>}
      {tags.map(x => <Link className="tag" key={x.tag} href={`/search?q=${encodeURIComponent('#' + x.tag)}`}>#{x.tag} <small className="muted">· {x.uses}</small></Link>)}</div>
    {people.length > 0 && <div className="card"><h3>{t('Suggested for you')}</h3>
      {people.map(p => <div className="post-h" key={p.id}><Avatar p={p} size={34} /><div className="meta"><Link href={`/profile/${p.username}`}><b>{fullName(p)}</b></Link><small>{p.headline}</small></div></div>)}
      <Link href="/network">{t('My Network')} →</Link></div>}
  </aside>);
}
