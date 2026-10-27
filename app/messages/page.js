'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import Avatar from '@/components/Avatar';
import MediaGallery from '@/components/MediaGallery';
import RichText from '@/components/RichText';
import AutoTextarea from '@/components/AutoTextarea';
import { supabase, fullName, uploadFile, checkFile } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

// Works for new messages (kind/name saved) and for older ones (kind guessed from the file address).
const mediaOf = (m) => {
  if (!m.attachment_url) return [];
  const u = m.attachment_url;
  const ext = ((m.attachment_name || u).split('?')[0].split('.').pop() || '').toLowerCase();
  let kind = m.attachment_kind;
  if (!kind) kind = u.includes('/video/upload/') ? 'video' : (u.includes('/image/upload/') && ext !== 'pdf') ? 'image' : 'document';
  return [{ id: m.id, url: u, kind, name: m.attachment_name || ('file.' + ext), poster_url: m.attachment_poster || null }];
};
const hideText = (m) => m.attachment_url && (m.body === '📎' || m.body === '📎 Attachment');

function Inner({ me }) {
  const { t } = useT();
  const sp = useSearchParams(); const [convs, setConvs] = useState([]); const [cur, setCur] = useState(null);
  const [msgs, setMsgs] = useState([]); const [txt, setTxt] = useState(''); const end = useRef(null); const [err, setErr] = useState(''); const [up, setUp] = useState(false);
  const loadConvs = async () => {
    const { data } = await supabase.from('conversation_participants').select('last_read_at, conversation:conversations(id,last_message_at, parts:conversation_participants(user:profiles(id,username,first_name,last_name,avatar_url)))').eq('user_id', me.id).eq('archived', false);
    const list = (data || []).filter(r => r.conversation).map(r => ({ id: r.conversation.id, at: r.conversation.last_message_at, unread: new Date(r.conversation.last_message_at) > new Date(r.last_read_at), other: r.conversation.parts.map(x => x.user).find(u => u && u.id !== me.id) })).filter(c => c.other).sort((a, b) => new Date(b.at) - new Date(a.at));
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

  const send = async (extra) => {
    const text = txt.trim();
    if (!text && !extra) return;
    const { error } = await supabase.from('messages').insert({ conversation_id: cur, sender_id: me.id, body: text || '📎', ...(extra || {}) });
    if (error) setErr(error.message); else { setTxt(''); setErr(''); loadConvs(); }
  };
  const attach = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    const bad = checkFile(f); if (bad) return setErr(bad);
    setUp(true); setErr('');
    try {
      const url = await uploadFile('messages', me.id, f);
      const kind = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';
      await send({ attachment_url: url, attachment_kind: kind, attachment_name: f.name });
    } catch (x) { setErr(x.message); } finally { setUp(false); }
  };
  const other = convs.find(c => c.id === cur)?.other;
  return (<div className="chat">
    <div className="card list"><h3>{t("Messages")}</h3>{convs.map(c => <div key={c.id} className={'conv' + (c.id === cur ? ' on' : '')} onClick={() => setCur(c.id)}><Avatar p={c.other} /><b>{fullName(c.other)}</b>{c.unread && <span className="cnt">•</span>}</div>)}
      {!convs.length && <p className="muted">{t("No conversations yet. Visit a profile and press Message.")}</p>}</div>
    <div className="card thread">
      {cur ? <><h3>{fullName(other)}</h3>{err && <div className="err">{err}</div>}
        <div className="msgs">{msgs.map(m => { const media = mediaOf(m); return (
          <div key={m.id} className={'m' + (m.sender_id === me.id ? ' me' : '') + (media.length ? ' wide' : '')}>
            {!hideText(m) && <div><RichText text={m.body} /></div>}
            <MediaGallery media={media} compact />
          </div>); })}<div ref={end} /></div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-end' }}>
          <AutoTextarea value={txt} onChange={setTxt} onSubmit={() => send()} placeholder={t("Type a message…")} maxLength={4000} style={{ flex: 1 }} />
          <label className="btn sec" style={{ margin: 0 }}>{up ? '…' : '📎'}<input type="file" hidden accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={attach} disabled={up} /></label>
          <button disabled={up}>{t("Send")}</button></form></> : <p className="muted">{t("Select a conversation.")}</p>}
    </div></div>);
}
export default function Messages() { return <Shell>{me => <Suspense><Inner me={me} /></Suspense>}</Shell>; }
