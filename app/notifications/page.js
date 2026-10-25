'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import { supabase, fullName, timeAgo } from '@/lib/supabase';
const TXT = { comment: 'commented on your post', reaction: 'reacted to your post', follow: 'started following you', connection_request: 'sent you a connection request', connection_accepted: 'accepted your connection request', message: 'sent you a message' };
const HREF = { follow: '/network', connection_request: '/network', connection_accepted: '/network', message: '/messages' };
function Inner({ me }) {
  const [list, setList] = useState([]);
  const load = async () => { const { data } = await supabase.from('notifications').select('*, actor:profiles!notifications_actor_id_fkey(id,username,first_name,last_name,avatar_url)').eq('user_id', me.id).order('created_at', { ascending: false }).limit(50); setList(data || []); };
  useEffect(() => { load(); }, []);
  const readAll = async () => { await supabase.from('notifications').update({ is_read: true }).eq('user_id', me.id).eq('is_read', false); load(); };
  return (<div><div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>Notifications</h2><button className="sec" onClick={readAll}>Mark all read</button></div>
    {!list.length && <div className="card muted">You're all caught up.</div>}
    {list.map(n => <Link key={n.id} href={HREF[n.kind] || '/'} onClick={() => supabase.from('notifications').update({ is_read: true }).eq('id', n.id)}>
      <div className="card" style={n.is_read ? {} : { borderColor: 'var(--teal)' }}><div className="post-h"><Avatar p={n.actor} /><div className="meta"><b>{fullName(n.actor)}</b> {TXT[n.kind] || n.kind}<br /><small>{timeAgo(n.created_at)}</small></div></div></div></Link>)}</div>);
}
export default function Notifications() { return <Shell>{me => <Inner me={me} />}</Shell>; }
