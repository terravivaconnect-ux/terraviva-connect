'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import Badges from '@/components/Badges';
import { supabase, fullName } from '@/lib/supabase';

function Inner({ me }) {
  const [conns, setConns] = useState([]); const [people, setPeople] = useState([]); const [fol, setFol] = useState(new Set());
  const P = 'id,username,first_name,last_name,headline,avatar_url,is_beneficiary_verified,is_professional_verified,is_org_verified';
  const load = async () => {
    const { data: c } = await supabase.from('connections').select(`*, req:profiles!connections_requester_id_fkey(${P}), addr:profiles!connections_addressee_id_fkey(${P})`).or(`requester_id.eq.${me.id},addressee_id.eq.${me.id}`);
    setConns(c || []);
    const { data: f } = await supabase.from('follows').select('following_id').eq('follower_id', me.id); setFol(new Set((f || []).map(x => x.following_id)));
    const { data: p } = await supabase.from('profiles').select(P).neq('id', me.id).eq('status', 'active').order('created_at', { ascending: false }).limit(30); setPeople(p || []);
  };
  useEffect(() => { load(); }, []);
  const related = new Set(conns.map(c => c.requester_id === me.id ? c.addressee_id : c.requester_id));
  const incoming = conns.filter(c => c.status === 'pending' && c.addressee_id === me.id);
  const mine = conns.filter(c => c.status === 'accepted');
  const connect = async (id) => { const { error } = await supabase.from('connections').insert({ requester_id: me.id, addressee_id: id }); if (error) alert(error.message); load(); };
  const respond = async (c, status) => { await supabase.from('connections').update({ status }).eq('id', c.id); load(); };
  const remove = async (c) => { await supabase.from('connections').delete().eq('id', c.id); load(); };
  const follow = async (id) => { fol.has(id) ? await supabase.from('follows').delete().match({ follower_id: me.id, following_id: id }) : await supabase.from('follows').insert({ follower_id: me.id, following_id: id }); load(); };
  const Row = ({ p, children }) => (<div className="card"><div className="post-h"><Avatar p={p} /><div className="meta"><Link href={`/profile/${p.username}`}><b>{fullName(p)}<Badges p={p} /></b></Link><small>{p.headline}</small></div></div>{children}</div>);
  return (<div>
    <h2>My Network</h2>
    {incoming.length > 0 && <><h3>Connection requests</h3>{incoming.map(c => <Row key={c.id} p={c.req}><button onClick={() => respond(c, 'accepted')}>Accept</button> <button className="sec" onClick={() => respond(c, 'declined')}>Decline</button></Row>)}</>}
    <h3>Connections ({mine.length})</h3>
    <div className="grid">{mine.map(c => { const p = c.requester_id === me.id ? c.addr : c.req; return <Row key={c.id} p={p}><Link className="btn sec" href={`/messages?to=${p.id}`}>Message</Link> <button className="link" onClick={() => remove(c)}>Remove</button></Row>; })}</div>
    {!mine.length && <p className="muted">No connections yet.</p>}
    <h3>People you may know</h3>
    <div className="grid">{people.map(p => <Row key={p.id} p={p}>
      {related.has(p.id) ? <small className="muted">Request sent / connected</small> : <button onClick={() => connect(p.id)}>Connect</button>} <button className="sec" onClick={() => follow(p.id)}>{fol.has(p.id) ? 'Following' : 'Follow'}</button></Row>)}</div>
  </div>);
}
export default function Network() { return <Shell>{me => <Inner me={me} />}</Shell>; }
