'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import { supabase, fullName } from '@/lib/supabase';
import PostCard from '@/components/PostCard';

function Inner({ me }) {
  const { username } = useParams(); const [p, setP] = useState(null); const [posts, setPosts] = useState([]); const [rel, setRel] = useState({}); const [nf, setNf] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!data) { setNf(true); return; } setP(data);
    const { data: ps } = await supabase.from('posts').select('*, author:profiles!posts_author_id_fkey(id,username,first_name,last_name,headline,avatar_url,is_beneficiary_verified,is_professional_verified,is_org_verified), reactions(user_id), comments(count), community:communities(name,slug)').eq('author_id', data.id).eq('is_removed', false).order('created_at', { ascending: false }).limit(20); setPosts(ps || []);
    const [f, c, b, fc, fg] = await Promise.all([
      supabase.from('follows').select('follower_id').match({ follower_id: me.id, following_id: data.id }),
      supabase.from('connections').select('*').or(`and(requester_id.eq.${me.id},addressee_id.eq.${data.id}),and(requester_id.eq.${data.id},addressee_id.eq.${me.id})`),
      supabase.from('blocks').select('blocked_id').match({ blocker_id: me.id, blocked_id: data.id }),
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', data.id),
      supabase.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${data.id},addressee_id.eq.${data.id}`)]);
    setRel({ following: !!f.data?.length, conn: c.data?.[0], blocked: !!b.data?.length, followers: fc.count || 0, connections: fg.count || 0 });
  };
  useEffect(() => { load(); }, [username]);
  if (nf) return <div className="card">Profile not found or not visible to you.</div>;
  if (!p) return <p className="muted">Loading…</p>;
  const mine = p.id === me.id;
  const follow = async () => { rel.following ? await supabase.from('follows').delete().match({ follower_id: me.id, following_id: p.id }) : await supabase.from('follows').insert({ follower_id: me.id, following_id: p.id }); load(); };
  const connect = async () => { await supabase.from('connections').insert({ requester_id: me.id, addressee_id: p.id }); load(); };
  const block = async () => { if (!confirm('Block this user?')) return; rel.blocked ? await supabase.from('blocks').delete().match({ blocker_id: me.id, blocked_id: p.id }) : await supabase.from('blocks').insert({ blocker_id: me.id, blocked_id: p.id }); load(); };
  const report = async () => { const reason = prompt('Reason for report?'); if (reason) { await supabase.from('reports').insert({ reporter_id: me.id, target_type: 'user', target_id: p.id, reason }); alert('Reported.'); } };
  return (<div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="cover" style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : {}} />
      <div style={{ padding: '1rem' }}>
        <div style={{ marginTop: -50 }}><Avatar p={p} size={90} /></div>
        <h2 style={{ marginTop: '.5rem' }}>{fullName(p)} <Badges p={p} /></h2>
        <div>{p.headline}</div><small className="muted">@{p.username} · {[p.district, p.region, p.country].filter(Boolean).join(', ')}</small>
        <div className="muted" style={{ margin: '.4rem 0' }}>{rel.followers} followers · {rel.connections} connections</div>
        {p.bio && <p>{p.bio}</p>}{p.interest && <span className="badge b-pro">{p.interest}</span>}
        {mine ? <div style={{ marginTop: '.8rem' }}><Link className="btn" href="/settings">Edit profile</Link></div> :
          <div style={{ marginTop: '.8rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {!rel.conn && <button onClick={connect}>Connect</button>}{rel.conn?.status === 'pending' && <button className="sec" disabled>Request pending</button>}
            <button className="sec" onClick={follow}>{rel.following ? 'Following' : 'Follow'}</button>
            <Link className="btn sec" href={`/messages?to=${p.id}`}>Message</Link>
            <button className="link" onClick={block}>{rel.blocked ? 'Unblock' : 'Block'}</button><button className="link" onClick={report}>Report</button></div>}
      </div></div>
    <h3>Posts</h3>{!posts.length && <p className="muted">No posts yet.</p>}{posts.map(x => <PostCard key={x.id} post={x} me={me} onChange={load} />)}
  </div>);
}
export default function Profile() { return <Shell>{me => <Inner me={me} />}</Shell>; }
