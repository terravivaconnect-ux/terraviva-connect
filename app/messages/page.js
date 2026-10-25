'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import { supabase, fullName, uploadFile } from '@/lib/supabase';

function Inner({ me }) {
  const sp = useSearchParams(); const [convs, setConvs] = useState([]); const [cur, setCur] = useState(null);
  const [msgs, setMsgs] = useState([]); const [txt, setTxt] = useState(''); const end = useRef(null); const [err, setErr] = useState('');
  const loadConvs = async () => {
    const { data } = await supabase.from('conversation_participants').select('last_read_at, conversation:conversations(id,last_message_at, parts:conversation_participants(user:profiles(id,username,first_name,last_name,avatar_url)))').eq('user_id', me.id).eq('archived', false);
    const list = (data || []).map(r => ({ id: r.conversation.id, at: r.conversation.last_message_at, unread: new Date(r.conversation.last_message_at) > new Date(r.last_read_at), other: r.conversation.parts.map(x => x.user).find(u => u.id !== me.id) })).sort((a, b) => new Date(b.at) - new Date(a.at));
    setConvs(list); return list;
  };
  useEffect(() => { (async () => {
    const to = sp.get('to');
    if (to) { const { data, error } = await supabase.rpc('start_conversation', { other: to }); if (error) setErr(error.message); else setCur(data); }
    const l = await loadConvs(); if (!to && l[0]) setCur(l[0].id);
  })(); }, []);
  useEffect(() => {
    if (!cur) return;
    const load = async () => { const { data } = await supabase.from('messages').select('*').eq('conversation_id', cur).order('created_at').limit(200); setMsgs(data || []);
      await supabase.from('conversation_participants').update({ last_read_at: new Date().toISOString() }).match({ conversation_id: cur, user_id: me.id }); };
    load();
    const ch = supabase.channel('conv-' + cur).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${cur}` }, load).subscribe();
    return () => supabase.removeChannel(ch);
  }, [cur]);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs]);
  const send = async (e, attachment) => {
    e?.preventDefault(); if (!txt.trim() && !attachment) return;
    const { error } = await supabase.from('messages').insert({ conversation_id: cur, sender_id: me.id, body: txt.trim() || '📎 Attachment', attachment_url: attachment || null });
    if (error) setErr(error.message); else { setTxt(''); setErr(''); loadConvs(); }
  };
  const attach = async (e) => { const f = e.target.files[0]; if (f) { try { send(null, await uploadFile('post-media', me.id, f)); } catch (x) { setErr(x.message); } } };
  const other = convs.find(c => c.id === cur)?.other;
  return (<div className="chat">
    <div className="card list"><h3>Messages</h3>{convs.map(c => <div key={c.id} className={'conv' + (c.id === cur ? ' on' : '')} onClick={() => setCur(c.id)}><Avatar p={c.other} /><b>{fullName(c.other)}</b>{c.unread && <span className="cnt">•</span>}</div>)}
      {!convs.length && <p className="muted">No conversations yet. Visit a profile and press Message.</p>}</div>
    <div className="card thread">
      {cur ? <><h3>{fullName(other)}</h3>{err && <div className="err">{err}</div>}
        <div className="msgs">{msgs.map(m => <div key={m.id} className={'m' + (m.sender_id === me.id ? ' me' : '')}>{m.body}{m.attachment_url && <div><a style={{ color: 'inherit', textDecoration: 'underline' }} href={m.attachment_url} target="_blank" rel="noreferrer">Open attachment</a></div>}</div>)}<div ref={end} /></div>
        <form onSubmit={send} style={{ display: 'flex', gap: '.5rem' }}><input style={{ margin: 0 }} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Type a message…" maxLength={4000} />
          <label className="btn sec" style={{ margin: 0 }}>📎<input type="file" hidden onChange={attach} /></label><button>Send</button></form></> : <p className="muted">Select a conversation.</p>}
    </div></div>);
}
export default function Messages() { return <Shell>{me => <Suspense><Inner me={me} /></Suspense>}</Shell>; }
