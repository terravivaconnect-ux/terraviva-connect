'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Feed from '@/components/Feed';
import { supabase } from '@/lib/supabase';

function Inner({ me }) {
  const [list, setList] = useState([]); const [mem, setMem] = useState({}); const [sel, setSel] = useState(null);
  const load = async () => {
    const { data } = await supabase.from('communities').select('*').eq('is_active', true).order('name'); setList(data || []);
    const { data: m } = await supabase.from('community_members').select('community_id,status').eq('user_id', me.id);
    setMem(Object.fromEntries((m || []).map(x => [x.community_id, x.status])));
  };
  useEffect(() => { load(); }, []);
  const join = async (c) => { const { error } = await supabase.from('community_members').insert({ community_id: c.id, user_id: me.id, status: c.privacy === 'public' ? 'approved' : 'pending' }); if (error) alert(error.message); load(); };
  const leave = async (c) => { await supabase.from('community_members').delete().match({ community_id: c.id, user_id: me.id }); setSel(null); load(); };
  if (sel) {
    const ok = mem[sel.id] === 'approved';
    return (<div><button className="sec" onClick={() => setSel(null)}>← All communities</button>
      <div className="hero" style={{ marginTop: '.8rem' }}><h2>{sel.name}</h2><div>{sel.description}</div></div>
      {sel.privacy !== 'public' && !ok && mem[sel.id] !== 'pending' && <div className="card">This is a {sel.privacy} community. <button onClick={() => join(sel)}>Request to join</button></div>}
      {mem[sel.id] === 'pending' && <div className="card muted">Your request is awaiting approval.</div>}
      {(sel.privacy === 'public' || ok) && <>
        {sel.privacy === 'public' && !ok && <div className="card"><button onClick={() => join(sel)}>Join to post</button></div>}
        <Feed me={me} communityId={sel.id} canPost={ok} />
        {ok && <button className="link" onClick={() => leave(sel)}>Leave community</button>}</>}
    </div>);
  }
  return (<div><h2>Communities</h2><div className="grid">{list.map(c => (
    <div className="card" key={c.id}><h3>{c.name}</h3><p className="muted">{c.description}</p><small className="badge b-pro">{c.privacy}</small>
      <div style={{ marginTop: '.7rem', display: 'flex', gap: '.5rem' }}><button onClick={() => setSel(c)}>Open</button>
        {!mem[c.id] ? <button className="sec" onClick={() => join(c)}>{c.privacy === 'public' ? 'Join' : 'Request'}</button> : <small className="muted" style={{ alignSelf: 'center' }}>{mem[c.id] === 'approved' ? '✓ Member' : 'Pending'}</small>}</div></div>))}</div></div>);
}
export default function Communities() { return <Shell>{me => <Inner me={me} />}</Shell>; }
