'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import PostCard from '@/components/PostCard';
import { POST_SELECT } from '@/components/Feed';
import { supabase, fullName } from '@/lib/supabase';

const KINDS = [['experience', 'Experience'], ['education', 'Education'], ['certification', 'Certifications'], ['skill', 'Skills']];

function Inner({ me }) {
  const { username } = useParams(); const [p, setP] = useState(null); const [posts, setPosts] = useState([]); const [rel, setRel] = useState({}); const [nf, setNf] = useState(false);
  const [items, setItems] = useState([]); const [views, setViews] = useState(0); const [adding, setAdding] = useState(false);
  const [it, setIt] = useState({ kind: 'experience', title: '', organization: '', description: '', start_year: '', end_year: '' });

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!data) { setNf(true); return; } setP(data);
    const { data: ps } = await supabase.from('posts').select(POST_SELECT).eq('author_id', data.id).eq('is_removed', false).order('created_at', { ascending: false }).limit(20); setPosts(ps || []);
    const { data: its } = await supabase.from('profile_items').select('*').eq('user_id', data.id).order('start_year', { ascending: false }); setItems(its || []);
    const [f, c, b, fc, fg] = await Promise.all([
      supabase.from('follows').select('follower_id').match({ follower_id: me.id, following_id: data.id }),
      supabase.from('connections').select('*').or(`and(requester_id.eq.${me.id},addressee_id.eq.${data.id}),and(requester_id.eq.${data.id},addressee_id.eq.${me.id})`),
      supabase.from('blocks').select('blocked_id').match({ blocker_id: me.id, blocked_id: data.id }),
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', data.id),
      supabase.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${data.id},addressee_id.eq.${data.id}`)]);
    setRel({ following: !!f.data?.length, conn: c.data?.[0], blocked: !!b.data?.length, followers: fc.count || 0, connections: fg.count || 0 });
    if (data.id === me.id) {
      const { count } = await supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_id', me.id).gte('viewed_at', new Date(Date.now() - 30 * 864e5).toISOString());
      setViews(count || 0);
    } else {
      const { count } = await supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('viewer_id', me.id).eq('profile_id', data.id).gte('viewed_at', new Date(Date.now() - 864e5).toISOString());
      if (!count) await supabase.from('profile_views').insert({ viewer_id: me.id, profile_id: data.id });
    }
  };
  useEffect(() => { load(); }, [username]);
  if (nf) return <div className="card">Profile not found or not visible to you.</div>;
  if (!p) return <p className="muted">Loading…</p>;
  const mine = p.id === me.id;
  const follow = async () => { rel.following ? await supabase.from('follows').delete().match({ follower_id: me.id, following_id: p.id }) : await supabase.from('follows').insert({ follower_id: me.id, following_id: p.id }); load(); };
  const connect = async () => { await supabase.from('connections').insert({ requester_id: me.id, addressee_id: p.id }); load(); };
  const block = async () => { if (!confirm('Block this user?')) return; rel.blocked ? await supabase.from('blocks').delete().match({ blocker_id: me.id, blocked_id: p.id }) : await supabase.from('blocks').insert({ blocker_id: me.id, blocked_id: p.id }); load(); };
  const report = async () => { const reason = prompt('Reason for report?'); if (reason) { await supabase.from('reports').insert({ reporter_id: me.id, target_type: 'user', target_id: p.id, reason }); alert('Reported.'); } };
  const setK = k => e => setIt({ ...it, [k]: e.target.value });
  const addItem = async (e) => { e.preventDefault();
    const row = { user_id: me.id, kind: it.kind, title: it.title.trim(), organization: it.organization || null, description: it.description || null, start_year: it.start_year ? +it.start_year : null, end_year: it.end_year ? +it.end_year : null };
    const { error } = await supabase.from('profile_items').insert(row); if (error) return alert(error.message);
    setIt({ ...it, title: '', organization: '', description: '', start_year: '', end_year: '' }); setAdding(false); load(); };
  const delItem = async (id) => { await supabase.from('profile_items').delete().eq('id', id); load(); };

  return (<div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="cover" style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : {}} />
      <div style={{ padding: '1rem' }}>
        <div style={{ marginTop: -50 }}><Avatar p={p} size={90} /></div>
        <h2 style={{ marginTop: '.5rem' }}>{fullName(p)} <Badges p={p} /></h2>
        <div>{p.headline}</div><small className="muted">@{p.username} · {[p.district, p.region, p.country].filter(Boolean).join(', ')}</small>
        <div className="muted" style={{ margin: '.4rem 0' }}>{rel.followers} followers · {rel.connections} connections{mine && ` · 👁 ${views} profile views (30 days)`}</div>
        {p.bio && <p>{p.bio}</p>}{p.interest && <span className="badge b-pro" style={{ marginLeft: 0 }}>{p.interest}</span>}
        {mine ? <div style={{ marginTop: '.8rem' }}><Link className="btn" href="/settings">Edit profile</Link></div> :
          <div style={{ marginTop: '.8rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {!rel.conn && <button onClick={connect}>Connect</button>}{rel.conn?.status === 'pending' && <button className="sec" disabled>Request pending</button>}
            <button className="sec" onClick={follow}>{rel.following ? 'Following' : 'Follow'}</button>
            <Link className="btn sec" href={`/messages?to=${p.id}`}>Message</Link>
            <button className="link" onClick={block}>{rel.blocked ? 'Unblock' : 'Block'}</button><button className="link" onClick={report}>Report</button></div>}
      </div></div>

    {(items.length > 0 || mine) && <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Background</h3>{mine && <button className="sec" onClick={() => setAdding(!adding)}>{adding ? 'Close' : '+ Add'}</button>}</div>
      {adding && <form onSubmit={addItem} style={{ marginBottom: '.8rem' }}>
        <select value={it.kind} onChange={setK('kind')}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l.replace(/s$/, '')}</option>)}</select>
        <input placeholder={it.kind === 'skill' ? 'Skill (e.g. Agroforestry)' : 'Title / Degree / Certificate'} value={it.title} onChange={setK('title')} required />
        {it.kind !== 'skill' && <><input placeholder="Organization / School" value={it.organization} onChange={setK('organization')} />
          <div className="row"><input type="number" placeholder="Start year" value={it.start_year} onChange={setK('start_year')} /><input type="number" placeholder="End year (blank = present)" value={it.end_year} onChange={setK('end_year')} /></div>
          <textarea rows={2} placeholder="Description" value={it.description} onChange={setK('description')} /></>}
        <button>Save</button></form>}
      {KINDS.map(([k, label]) => { const list = items.filter(x => x.kind === k); if (!list.length) return null;
        return (<div className="sect" key={k}><h4>{label}</h4>
          {k === 'skill' ? <div>{list.map(x => <span className="skill" key={x.id}>{x.title}{mine && <button className="link" style={{ padding: '0 .3rem' }} onClick={() => delItem(x.id)}>✕</button>}</span>)}</div>
            : list.map(x => <div className="item" key={x.id}><div><b>{x.title}</b><div className="muted">{x.organization} {(x.start_year || x.end_year) && `· ${x.start_year || ''} – ${x.end_year || 'Present'}`}</div>{x.description && <div>{x.description}</div>}</div>
              {mine && <button className="link" onClick={() => delItem(x.id)}>🗑</button>}</div>)}</div>); })}
      {!items.length && <p className="muted">Add your experience, education and skills.</p>}
    </div>}

    <h3>Posts</h3>{!posts.length && <p className="muted">No posts yet.</p>}{posts.map(x => <PostCard key={x.id} post={x} me={me} onChange={load} />)}
  </div>);
}
export default function Profile() { return <Shell>{me => <Inner me={me} />}</Shell>; }
